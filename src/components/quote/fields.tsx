import { useId, useState, type ReactNode } from "react";
import { HelpCircle, Lock, ShieldCheck, Star, CheckCircle2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VEHICLE_TYPES, type LeadInput } from "@/lib/lead";
import { suggestZips } from "@/lib/zips";

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
  const [open, setOpen] = useState(false);
  // Simulated lookup: suggestions appear once 3+ digits are typed.
  const suggestions = suggestZips(value);
  const showList = open && suggestions.length > 0 && value.length < 5;

  return (
    <Field id={id} label={label} error={error}>
      <div className="relative">
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          placeholder={placeholder}
          maxLength={5}
          value={value}
          onChange={(e) => {
            onChange(e.target.value.replace(/\D/g, ""));
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-12"
        />
        {showList && (
          <ul
            id={`${id}-list`}
            role="listbox"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md"
          >
            {suggestions.map((s) => (
              <li key={s.zip} role="option" aria-selected={value === s.zip}>
                <button
                  type="button"
                  // mousedown fires before blur — keep the list alive for the click
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(s.zip);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent"
                >
                  <span className="font-semibold text-foreground">{s.zip}</span>
                  <span className="text-muted-foreground">
                    {s.city}, {s.state}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
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
  // Native <select>: bulletproof + accessible on every device. (Radix's portal
  // was unreliable inside the deferred-hydration island for a simple enum.)
  return (
    <Field id={id} label="Vehicle type" error={error}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 w-full appearance-none rounded-lg border border-input bg-transparent bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat px-3 pr-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 ${value ? "text-foreground" : "text-muted-foreground/55"} bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23475569%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')]`}
      >
        <option value="" disabled>
          Select a vehicle
        </option>
        {VEHICLE_TYPES.map((v) => (
          <option key={v} value={v} className="text-foreground">
            {VEHICLE_LABELS[v]}
          </option>
        ))}
      </select>
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
  const tipId = useId();
  // Tooltip, not an expander — the tip is absolutely positioned so it overlays
  // rather than pushing the rest of the form down. Hover + focus + tap all work.
  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-describedby={tipId}
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex items-center gap-1 text-sm font-medium text-navy"
      >
        <HelpCircle className="size-4" aria-hidden />
        Why do we need your ZIP?
      </button>
      <span
        id={tipId}
        role="tooltip"
        className={`absolute top-full left-0 z-20 mt-2 w-64 rounded-lg border border-border bg-popover p-3 text-left text-sm text-muted-foreground shadow-md transition-opacity duration-150 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        Carrier pricing is route-based. Your ZIPs let us pull real quotes for your exact lane instead
        of a national average.
      </span>
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
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300 sm:p-8">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="size-7 text-emerald-600" aria-hidden />
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

export function ProgressPips({ step, onBack }: { step: 1 | 2; onBack?: () => void }) {
  const label = step === 1 ? "Step 1 of 2 · Route & vehicle" : "Step 2 of 2 · Contact";
  const pips = (
    <div className="mt-1.5 flex gap-1.5" aria-hidden>
      <span className="h-1.5 w-8 rounded-full bg-navy" />
      <span className={`h-1.5 w-8 rounded-full ${step === 2 ? "bg-navy" : "bg-border"}`} />
    </div>
  );

  // On step 2 the stepper itself is a "back" control.
  if (step === 2 && onBack) {
    return (
      <button type="button" onClick={onBack} className="group text-left" aria-label="Back to step 1">
        <p className="flex items-center gap-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase group-hover:text-navy">
          <ArrowLeft className="size-3.5" aria-hidden /> {label}
        </p>
        {pips}
      </button>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      {pips}
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
