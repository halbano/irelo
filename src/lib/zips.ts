// Simulated ZIP lookup for the autocomplete. NOT a real ZIP database — a small
// sample so suggestions feel real in the demo. Filtered by prefix once the user
// has typed 3+ digits. In production this would hit a geocoding/ZIP API server-side.

export type ZipEntry = { zip: string; city: string; state: string };

export const ZIP_SAMPLE: ZipEntry[] = [
  { zip: "10001", city: "New York", state: "NY" },
  { zip: "10005", city: "New York", state: "NY" },
  { zip: "10301", city: "Staten Island", state: "NY" },
  { zip: "20001", city: "Washington", state: "DC" },
  { zip: "20009", city: "Washington", state: "DC" },
  { zip: "30301", city: "Atlanta", state: "GA" },
  { zip: "30318", city: "Atlanta", state: "GA" },
  { zip: "33101", city: "Miami", state: "FL" },
  { zip: "33139", city: "Miami Beach", state: "FL" },
  { zip: "33602", city: "Tampa", state: "FL" },
  { zip: "37201", city: "Nashville", state: "TN" },
  { zip: "44101", city: "Cleveland", state: "OH" },
  { zip: "48201", city: "Detroit", state: "MI" },
  { zip: "53202", city: "Milwaukee", state: "WI" },
  { zip: "60601", city: "Chicago", state: "IL" },
  { zip: "60614", city: "Chicago", state: "IL" },
  { zip: "63101", city: "St. Louis", state: "MO" },
  { zip: "70112", city: "New Orleans", state: "LA" },
  { zip: "73101", city: "Oklahoma City", state: "OK" },
  { zip: "75201", city: "Dallas", state: "TX" },
  { zip: "77002", city: "Houston", state: "TX" },
  { zip: "78701", city: "Austin", state: "TX" },
  { zip: "80202", city: "Denver", state: "CO" },
  { zip: "85001", city: "Phoenix", state: "AZ" },
  { zip: "85281", city: "Tempe", state: "AZ" },
  { zip: "89101", city: "Las Vegas", state: "NV" },
  { zip: "90001", city: "Los Angeles", state: "CA" },
  { zip: "90012", city: "Los Angeles", state: "CA" },
  { zip: "90210", city: "Beverly Hills", state: "CA" },
  { zip: "94102", city: "San Francisco", state: "CA" },
  { zip: "94301", city: "Palo Alto", state: "CA" },
  { zip: "97201", city: "Portland", state: "OR" },
  { zip: "98101", city: "Seattle", state: "WA" },
  { zip: "98404", city: "Tacoma", state: "WA" },
];

/** Prefix-match ZIPs once 3+ digits are entered. Capped for a tidy dropdown. */
export function suggestZips(input: string, limit = 6): ZipEntry[] {
  const q = input.replace(/\D/g, "");
  if (q.length < 3) return [];
  return ZIP_SAMPLE.filter((z) => z.zip.startsWith(q)).slice(0, limit);
}
