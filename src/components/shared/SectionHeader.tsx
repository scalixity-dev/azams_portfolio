import type { ReactNode } from "react";

type Props = {
  /** The tiny uppercase label at the top (e.g. "REELS", "A PREDICTION") */
  eyebrow: string;
  /** The large serif headline — can contain an <em> span for italic emphasis */
  headline?: ReactNode;
  /** Short descriptive line under the headline */
  sub?: ReactNode;
  /** Horizontal alignment of the whole block. Defaults to left (editorial). */
  align?: "left" | "center";
  /** Constrain the headline + sub to a max width so lines don't run on */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Extra class names on the outer wrapper */
  className?: string;
};

const MAX_WIDTH: Record<NonNullable<Props["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

/**
 * Single source of truth for the top-of-section header pattern.
 * Every section should use this so the eye reads one consistent rhythm:
 *
 *   EYEBROW LABEL
 *   ─────            ← rail
 *   Headline (serif, italic emphasis optional)
 *   Short sub.
 *
 * The child elements carry `section-header-*` classes that hook into a
 * shared reveal cascade — any ancestor with `.in-view` triggers the fade
 * (see index.css). Each site section's reveal wrapper (useInView) already
 * applies `.in-view`, so no per-section wiring is needed.
 */
export function SectionHeader({
  eyebrow,
  headline,
  sub,
  align = "left",
  maxWidth = "xl",
  className = "",
}: Props) {
  const alignClass = align === "center" ? "text-center" : "";
  const widthClass = headline || sub ? MAX_WIDTH[maxWidth] : "";
  const widthWrapper = align === "center" ? "mx-auto" : "";

  return (
    <div className={`section-header ${alignClass} ${className}`}>
      <p className="section-header-eyebrow text-[13px] font-medium tracking-[0.24em] text-muted uppercase sm:text-[14px] md:text-[15px] lg:text-[16px]">
        {eyebrow}
      </p>
      <div
        className={`section-header-rail mt-3 h-px w-24 bg-line sm:w-32 ${
          align === "center" ? "mx-auto" : ""
        }`}
      />
      {headline && (
        <h3
          className={`section-header-headline ${widthClass} ${widthWrapper} mt-6 font-display text-3xl leading-[1.1] font-normal text-silver sm:text-4xl md:text-5xl`}
        >
          {headline}
        </h3>
      )}
      {sub && (
        <p
          className={`section-header-sub ${widthClass} ${widthWrapper} mt-4 text-[13px] leading-relaxed text-silver-dim sm:text-sm`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
