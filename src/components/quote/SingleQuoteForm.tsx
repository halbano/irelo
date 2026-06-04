import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FORM_EXPERIMENT } from "@/lib/experiment";
import { useLeadForm } from "./useLeadForm";
import {
  CallLink,
  ContactReassurance,
  EmailHint,
  FormError,
  PhoneField,
  QuoteResult,
  TextField,
  TrustLine,
  VehicleField,
  WhyZipExpander,
  ZipPair,
} from "./fields";

/**
 * Variant B of the quote-form A/B test: a single-step form with every field on
 * one card and one CTA — the "lowest possible friction, one screen" hypothesis.
 * All behaviour lives in the shared useLeadForm hook and field components; this
 * file is only the single-page composition.
 */
export default function SingleQuoteForm({ variant = "b" }: { variant?: string }) {
  const { values, errors, status, submitError, result, set, submit, submitting } = useLeadForm();

  if (result) {
    return <QuoteResult price={result.price} leadId={result.leadId} route={values} />;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit({ experiment: FORM_EXPERIMENT, variant });
  };

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-busy={submitting}
      className="rounded-2xl border border-border bg-card p-5 text-foreground shadow-sm sm:p-6"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Get your quote · ~2 min
          </p>
          <CallLink />
        </div>

        <ZipPair
          originZip={values.originZip}
          destinationZip={values.destinationZip}
          originError={errors.originZip}
          destinationError={errors.destinationZip}
          onOriginChange={(v) => set("originZip", v)}
          onDestinationChange={(v) => set("destinationZip", v)}
        />

        <WhyZipExpander />

        <VehicleField
          value={values.vehicleType}
          error={errors.vehicleType}
          onChange={(v) => set("vehicleType", v)}
        />

        <TextField
          label="Full name"
          autoComplete="name"
          placeholder="Alex Carter"
          value={values.fullName}
          error={errors.fullName}
          onChange={(v) => set("fullName", v)}
        />

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="alex@email.com"
          hint={<EmailHint />}
          value={values.email}
          error={errors.email}
          onChange={(v) => set("email", v)}
        />

        <PhoneField
          value={values.phone}
          error={errors.phone}
          onChange={(v) => set("phone", v)}
        />

        <ContactReassurance />

        {status === "error" && <FormError message={submitError} />}

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Matching carriers…
            </>
          ) : (
            "Get my quote"
          )}
        </Button>
      </div>

      <TrustLine />
    </form>
  );
}
