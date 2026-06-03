import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FORM_EXPERIMENT } from "@/lib/experiment";
import { useLeadForm } from "./useLeadForm";
import {
  ZipField,
  VehicleField,
  DateField,
  TextField,
  EmailHint,
  ContactReassurance,
  WhyZipExpander,
  TrustLine,
  QuoteResult,
  FormError,
  CallLink,
  ProgressPips,
} from "./fields";

/**
 * Variant A of the quote-form A/B test: a 2-step wizard (the lower-friction
 * commitment ladder). Layout only — all state, validation, and submission live
 * in the shared useLeadForm hook and field parts.
 */
export default function SteppedQuoteForm({ variant = "a" }: { variant?: string }) {
  const { values, errors, status, submitError, result, set, validateFields, submit, submitting } =
    useLeadForm();
  const [step, setStep] = useState<1 | 2>(1);

  if (result) return <QuoteResult price={result.price} leadId={result.leadId} route={values} />;

  const next = () => {
    if (validateFields(["originZip", "destinationZip", "vehicleType", "shipDate"])) setStep(2);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({ experiment: FORM_EXPERIMENT, variant });
  };

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-busy={submitting}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <ProgressPips step={step} />
        <CallLink />
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ZipField
              label="From ZIP"
              value={values.originZip}
              error={errors.originZip}
              placeholder="90001"
              onChange={(v) => set("originZip", v)}
            />
            <ZipField
              label="To ZIP"
              value={values.destinationZip}
              error={errors.destinationZip}
              placeholder="10001"
              onChange={(v) => set("destinationZip", v)}
            />
          </div>

          <WhyZipExpander />

          <VehicleField
            value={values.vehicleType}
            error={errors.vehicleType}
            onChange={(v) => set("vehicleType", v)}
          />

          <DateField
            value={values.shipDate}
            error={errors.shipDate}
            onChange={(v) => set("shipDate", v)}
          />
        </div>
      ) : (
        <div className="space-y-4">
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
            value={values.email}
            error={errors.email}
            hint={<EmailHint />}
            onChange={(v) => set("email", v)}
          />

          <TextField
            label="Phone"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 123-4567"
            value={values.phone}
            error={errors.phone}
            onChange={(v) => set("phone", v)}
          />

          <ContactReassurance />
        </div>
      )}

      {status === "error" && <FormError message={submitError} />}

      <div className="mt-5">
        {step === 1 ? (
          <Button
            type="button"
            onClick={next}
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
