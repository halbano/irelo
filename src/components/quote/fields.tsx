import { useId, useState, type ReactNode } from "react";
import { ChevronDown, Lock, ShieldCheck, Star, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VEHICLE_TYPES, type LeadInput } from "@/lib/lead";

export const VEHICLE_LABELS: Record<string, string> = {
  car: "Car",
  suv: "SUV",
  truck: "Truck",
  boat: "Boat",
};

/** Label + control + accessible error message. Shared by every field below. */
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
  children: ReactNode;
  hint?: ReactNode;
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

export function ZipField({
  label,
  value,
  error,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error}>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder={placeholder}
        maxLength={5}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12"
      />
    </Field>
  );
}

export function VehicleField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <Field id={id} label="Vehicle type" error={error}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="!h-12 w-full"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
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
  );
}

export function DateField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <Field id={id} label="Ship date" error={error}>
      <Input
        id={id}
        type="date"
        min={today}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12"
      />
    </Field>
  );
}

export function TextField({
  label,
  type = "text",
  autoComplete,
  placeholder,
  value,
  error,
  hint,
  onChange,
}: {
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  value: string;
  error?: string;
  hint?: ReactNode;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12"
      />
    </Field>
  );
}

export function EmailHint() {
  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <Lock className="size-3" aria-hidden /> Used only to send your quote — never sold.
    </p>
  );
}

export function ContactReassurance() {
  return (
    <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
      We only use this to match you with verified carriers — no spam, no reselling your details.
    </p>
  );
}

export function WhyZipExpander() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        className="flex items-center gap-1 text-sm font-medium text-navy"
      >
        Why do we need your ZIP?
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <p className="mt-2 text-sm text-muted-foreground">
          Carrier pricing is route-based. Your ZIPs let us pull real quotes for your exact lane
          instead of a national average.
        </p>
      )}
    </div>
  );
}

export function TrustLine() {
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

export function QuoteResult({
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
        {route.originZip} → {route.destinationZip} ·{" "}
        {VEHICLE_LABELS[route.vehicleType] ?? route.vehicleType}
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

export function FormError({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-4 text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

export function ProgressPips({ step }: { step: 1 | 2 }) {
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

export function CallLink() {
  return (
    <a
      href="tel:+18885550142"
      className="text-sm font-semibold whitespace-nowrap text-navy hover:underline"
    >
      or call (888) 555-0142
    </a>
  );
}
