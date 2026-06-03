import SteppedQuoteForm from "./quote/SteppedQuoteForm";
import SingleQuoteForm from "./quote/SingleQuoteForm";

/**
 * The single hydrated island. Renders the A/B variant chosen server-side, so
 * there's no client-side variant flip / layout shift — the right form is in the
 * SSR'd HTML from the first paint.
 */
export default function QuoteForm({ variant }: { variant: string }) {
  return variant === "b" ? (
    <SingleQuoteForm variant={variant} />
  ) : (
    <SteppedQuoteForm variant={variant} />
  );
}
