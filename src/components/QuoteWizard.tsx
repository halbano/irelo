import { useId, useState } from "react";
import { Loader2, Lock, ShieldCheck, Star, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateLead, VEHICLE_TYPES, type FieldErrors, type LeadInput } from "@/lib/lead";

const EMPTY: LeadInput = {
  originZip: "",
  destinationZip: "",
  vehicleType: "" as LeadInput["vehicleType"],
  shipDate: "",
  fullName: "",
  email: "",
  phone: "",
};

const STEP1_FIELDS: (keyof LeadInput)[] = ["originZip", "destinationZip", "vehicleType", "shipDate"];

const VEHICLE_LABELS: Record<string, string> = {
  car: "Car",
  suv: "SUV",
  truck: "Truck",
  boat: "Boat",
};

type Status = "idle" | "submitting" | "error";

export default function QuoteWizard() {
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<LeadInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string>("");
  const [result, setResult] = useState<{ price: number; leadId: string } | null>(null);

  const set = (key: keyof LeadInput, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const goToContact = () => {
    const all = validateLead(values);
    const stepErrors: FieldErrors = {};
    for (const f of STEP1_FIELDS) if (all[f]) stepErrors[f] = all[f];
    if (Object.keys(stepErrors).length) return setErrors(stepErrors);
    setErrors({});
    setStep(2);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const all = validateLead(values);
    if (Object.keys(all).length) return setErrors(all);

    setStatus("submitting");
    setSubmitError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message ?? "Something went wrong. Please try again.");
      }
      setResult({ price: data.price, leadId: data.leadId });
    } catch (err) {
      setStatus("error");
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      return;
    }
    setStatus("idle");
  };

  if (result) return <QuoteResult price={result.price} leadId={result.leadId} route={values} />;

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-busy={submitting}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <ProgressPips step={step} />
        <a
          href="tel:+18885550142"
          className="text-sm font-semibold text-navy whitespace-nowrap hover:underline"
        >
          or call (888) 555-0142
        </a>
      </div>

      {step === 1 ? (
        <Step1 values={values} errors={errors} set={set} />
      ) : (
        <Step2 values={values} errors={errors} set={set} />
      )}

      {status === "error" && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {submitError}
        </p>
      )}

      <div className="mt-5">
        {step === 1 ? (
          <Button
            type="button"
            onClick={goToContact}
            className="h-12 w-full bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover"
          >
            Get my quote
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={submitting}
              className="h-12 px-5"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-12 flex-1 bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden /> Matching carriers…
                </>
              ) : (
                "See my price"
              )}
            </Button>
          </div>
        )}
      </div>

      <TrustLine />
    </form>
  );
}

function ProgressPips({ step }: { step: 1 | 2 }) {
  const label = step === 1 ? "Step 1 of 2 · Shipment" : "Step 2 of 2 · Contact";
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-1.5 flex gap-1.5" aria-hidden>
        <span className="h-1.5 w-8 rounded-full bg-navy" />
        <span className={`h-1.5 w-8 rounded-full ${step === 2 ? "bg-navy" : "bg-border"}`} />
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-foreground">
        {label}
      </Label>
      {children}
      {hint}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Step1({
  values,
  errors,
  set,
}: {
  values: LeadInput;
  errors: FieldErrors;
  set: (k: keyof LeadInput, v: string) => void;
}) {
  const ids = useFieldIds(["origin", "dest", "vehicle", "date"]);
  const today = new Date().toISOString().slice(0, 10);
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field id={ids.origin} label="From ZIP" error={errors.originZip}>
          <Input
            id={ids.origin}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="90001"
            maxLength={5}
            value={values.originZip}
            onChange={(e) => set("originZip", e.target.value.replace(/\D/g, ""))}
            aria-invalid={!!errors.originZip}
            aria-describedby={errors.originZip ? `${ids.origin}-error` : undefined}
            className="h-12"
          />
        </Field>
        <Field id={ids.dest} label="To ZIP" error={errors.destinationZip}>
          <Input
            id={ids.dest}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="10001"
            maxLength={5}
            value={values.destinationZip}
            onChange={(e) => set("destinationZip", e.target.value.replace(/\D/g, ""))}
            aria-invalid={!!errors.destinationZip}
            aria-describedby={errors.destinationZip ? `${ids.dest}-error` : undefined}
            className="h-12"
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={() => setShowWhy((s) => !s)}
        aria-expanded={showWhy}
        className="flex items-center gap-1 text-sm font-medium text-navy"
      >
        Why do we need your ZIP?
        <ChevronDown className={`size-4 transition-transform ${showWhy ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {showWhy && (
        <p className="-mt-2 text-sm text-muted-foreground">
          Carrier pricing is route-based. Your ZIPs let us pull real quotes for your exact lane
          instead of a national average.
        </p>
      )}

      <Field id={ids.vehicle} label="Vehicle type" error={errors.vehicleType}>
        <Select value={values.vehicleType} onValueChange={(v) => set("vehicleType", v)}>
          <SelectTrigger
            id={ids.vehicle}
            className="!h-12 w-full"
            aria-invalid={!!errors.vehicleType}
            aria-describedby={errors.vehicleType ? `${ids.vehicle}-error` : undefined}
          >
            <SelectValue placeholder="Select a vehicle" />
          </SelectTrigger>
          <SelectContent>
            {VEHICLE_TYPES.map((v) => (
              <SelectItem key={v} value={v}>
                {VEHICLE_LABELS[v]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field id={ids.date} label="Ship date" error={errors.shipDate}>
        <Input
          id={ids.date}
          type="date"
          min={today}
          value={values.shipDate}
          onChange={(e) => set("shipDate", e.target.value)}
          aria-invalid={!!errors.shipDate}
          aria-describedby={errors.shipDate ? `${ids.date}-error` : undefined}
          className="h-12"
        />
      </Field>
    </div>
  );
}

function Step2({
  values,
  errors,
  set,
}: {
  values: LeadInput;
  errors: FieldErrors;
  set: (k: keyof LeadInput, v: string) => void;
}) {
  const ids = useFieldIds(["name", "email", "phone"]);
  return (
    <div className="space-y-4">
      <Field id={ids.name} label="Full name" error={errors.fullName}>
        <Input
          id={ids.name}
          autoComplete="name"
          placeholder="Alex Carter"
          value={values.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? `${ids.name}-error` : undefined}
          className="h-12"
        />
      </Field>

      <Field
        id={ids.email}
        label="Email"
        error={errors.email}
        hint={
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3" aria-hidden /> Used only to send your quote — never sold.
          </p>
        }
      >
        <Input
          id={ids.email}
          type="email"
          autoComplete="email"
          placeholder="alex@email.com"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${ids.email}-error` : undefined}
          className="h-12"
        />
      </Field>

      <Field id={ids.phone} label="Phone" error={errors.phone}>
        <Input
          id={ids.phone}
          type="tel"
          autoComplete="tel"
          placeholder="(555) 123-4567"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? `${ids.phone}-error` : undefined}
          className="h-12"
        />
      </Field>

      <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
        We only use this to match you with verified carriers — no spam, no reselling your details.
      </p>
    </div>
  );
}

function TrustLine() {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <ShieldCheck className="size-4 text-navy" aria-hidden /> Free · No spam · ~2 minutes
      </span>
      <span aria-hidden className="text-border">•</span>
      <span className="flex items-center gap-1">
        <span className="flex" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-cta text-cta" />
          ))}
        </span>
        4.8/5 from 1,900+ shippers
      </span>
    </div>
  );
}

function QuoteResult({
  price,
  leadId,
  route,
}: {
  price: number;
  leadId: string;
  route: LeadInput;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-navy/10">
        <CheckCircle2 className="size-7 text-navy" aria-hidden />
      </div>
      <h2 className="mt-4 font-serif text-2xl font-semibold text-navy">You're matched</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {route.originZip} → {route.destinationZip} · {VEHICLE_LABELS[route.vehicleType] ?? route.vehicleType}
      </p>

      <div className="my-6 rounded-xl bg-muted px-4 py-5">
        <p className="text-sm text-muted-foreground">Your estimated quote</p>
        <p className="mt-1 text-4xl font-bold text-foreground">${price}</p>
      </div>

      <p className="text-sm text-muted-foreground">
        A verified carrier will reach out to confirm pickup. Confirmation{" "}
        <span className="font-mono text-foreground">{leadId}</span> — check your email for details.
      </p>
    </div>
  );
}

/** Stable, SSR-safe unique ids for a set of field keys. */
function useFieldIds<T extends string>(keys: T[]): Record<T, string> {
  const base = useId();
  return Object.fromEntries(keys.map((k) => [k, `${base}-${k}`])) as Record<T, string>;
}
