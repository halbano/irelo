import { useState } from "react";
import { validateLead, type FieldErrors, type LeadInput } from "@/lib/lead";

const EMPTY: LeadInput = {
  originZip: "",
  destinationZip: "",
  vehicleType: "" as LeadInput["vehicleType"],
  shipDate: "",
  fullName: "",
  email: "",
  phone: "",
};

export type SubmitMeta = { experiment: string; variant: string };

type Status = "idle" | "submitting" | "error";

/**
 * Shared form state for both A/B quote variants — values, validation, the
 * submit lifecycle, and the result. Variants differ only in layout; this is
 * the single source of truth for behaviour so the two can't drift apart.
 */
export function useLeadForm() {
  const [values, setValues] = useState<LeadInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<{ price: number; leadId: string } | null>(null);

  const set = (key: keyof LeadInput, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /** Validate a subset of fields (a wizard step). Returns true if that subset is clean. */
  const validateFields = (keys: (keyof LeadInput)[]) => {
    const all = validateLead(values);
    const subset: FieldErrors = {};
    for (const k of keys) if (all[k]) subset[k] = all[k];
    setErrors(subset);
    return Object.keys(subset).length === 0;
  };

  /** Validate everything and POST the lead. Tracks the variant for attribution. */
  const submit = async (meta: SubmitMeta) => {
    const all = validateLead(values);
    if (Object.keys(all).length) {
      setErrors(all);
      return;
    }

    setStatus("submitting");
    setSubmitError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, ...meta }),
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

  return {
    values,
    errors,
    status,
    submitError,
    result,
    set,
    setErrors,
    validateFields,
    submit,
    submitting: status === "submitting",
  };
}
