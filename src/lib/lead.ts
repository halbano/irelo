// Shared lead shape + validation. Used by the React island (field hints) and
// enforced authoritatively server-side in src/pages/api/lead.ts.

export const VEHICLE_TYPES = ["car", "suv", "truck", "boat"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export type LeadInput = {
  originZip: string;
  destinationZip: string;
  vehicleType: VehicleType;
  shipDate: string; // YYYY-MM-DD
  fullName: string;
  email: string;
  phone: string;
};

export type FieldErrors = Partial<Record<keyof LeadInput, string>>;

const ZIP = /^\d{5}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate a full lead. Returns field-keyed messages; empty object = valid. */
export function validateLead(input: Partial<LeadInput>): FieldErrors {
  const e: FieldErrors = {};

  if (!ZIP.test(input.originZip ?? "")) e.originZip = "Enter a 5-digit ZIP";
  if (!ZIP.test(input.destinationZip ?? "")) e.destinationZip = "Enter a 5-digit ZIP";
  if (!VEHICLE_TYPES.includes(input.vehicleType as VehicleType))
    e.vehicleType = "Choose a vehicle type";
  // shipDate is optional — Variant A omits the field; Variant B collects it.

  if (!input.fullName || input.fullName.trim().length < 2)
    e.fullName = "Enter your full name";
  if (!EMAIL.test(input.email ?? "")) e.email = "Enter a valid email";
  if ((input.phone ?? "").replace(/\D/g, "").length < 10)
    e.phone = "Enter a valid phone number";

  return e;
}
