/**
 * A whisper-thin gradient divider placed between major sections.
 * Fades in and out at the edges so it reads as "a page turn" rather than a
 * hard rule. Used in App.tsx between consecutive sections.
 */
export function SectionDivider() {
  return (
    <div
      aria-hidden
      className="pointer-events-none mx-auto h-px w-full max-w-[1680px] bg-gradient-to-r from-transparent via-line/70 to-transparent"
    />
  );
}
