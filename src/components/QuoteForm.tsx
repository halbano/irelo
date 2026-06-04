import SteppedQuoteForm from "./quote/SteppedQuoteForm";
import EmailFirstQuoteForm from "./quote/EmailFirstQuoteForm";

/**
 * The single hydrated island. Renders the A/B variant chosen server-side, so
 * there's no client-side variant flip / layout shift — the right form is in the
 * SSR'd HTML from the first paint.
 *   A = SteppedQuoteForm (spec: Route+vehicle → Contact)
 *   B = EmailFirstQuoteForm (Route+vehicle+email → date+name+phone) + different hero copy
 */
export default function QuoteForm({ variant }: { variant: string }) {
  return variant === "b" ? (
    <EmailFirstQuoteForm variant={variant} />
  ) : (
    <SteppedQuoteForm variant={variant} />
  );
}
