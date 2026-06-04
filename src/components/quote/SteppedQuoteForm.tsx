import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FORM_EXPERIMENT } from "@/lib/experiment";
import { useLeadForm } from "./useLeadForm";
import {
  ZipPair,
  VehicleField,
  TextField,
  PhoneField,
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
  const { values, errors, status, submitError, result, set, setErrors, validateFields, submit, submitting } =
    useLeadForm();
  const [step, setStep] = useState<1 | 2>(1);

  if (result) return <QuoteResult price={result.price} leadId={result.leadId} route={values} />;

  const next = () => {
    if (validateFields(["originZip", "destinationZip", "vehicleType"])) setStep(2);
  };

  const goBack = () => {
    setErrors({});
    setStep(1);
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
      className="rounded-2xl border border-border bg-card p-5 text-foreground shadow-sm sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <ProgressPips step={step} onBack={goBack} />
        <CallLink />
      </div>

      {step === 1 ? (
        <div className="space-y-4">
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

          <PhoneField
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
            className="h-12 w-full bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
          >
            Get my quote
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={submitting}
              aria-label="Back to step 1"
              className="h-12 px-4"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-12 flex-1 bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
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
