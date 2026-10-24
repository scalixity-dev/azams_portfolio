import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { brandGroups, type BrandGroup } from "../data/brands";
import { getLogo } from "../data/logos";
import { useInView } from "../hooks/useInView";
import { SectionHeader } from "./shared/SectionHeader";

type IndustryKey = BrandGroup["id"];

const ICONS: Record<IndustryKey, ReactNode> = {
  "global-brands": <GlobeIcon />,
  hospitality: <HotelIcon />,
  "real-estate": <BuildingIcon />,
  events: <FlagIcon />,
  media: <BroadcastIcon />,
};

const SHORT_LABEL: Record<IndustryKey, string> = {
  "global-brands": "Global Brands",
  hospitality: "Hospitality",
  "real-estate": "Real Estate",
  events: "Govt & Events",
  media: "Media",
};

export function Industries() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [activeId, setActiveId] = useState<IndustryKey>(brandGroups[0].id);

  const active = useMemo(
    () => brandGroups.find((g) => g.id === activeId) ?? brandGroups[0],
    [activeId],
  );

  // Horizontal scroll rail for the industry tiles — arrows appear only when
  // more content is reachable in that direction.
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateScrollAbility = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 4;
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
    setCanLeft(!atStart);
    setCanRight(!atEnd && el.scrollWidth > el.clientWidth + 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollAbility();
    el.addEventListener("scroll", updateScrollAbility, { passive: true });
    const ro = new ResizeObserver(updateScrollAbility);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollAbility);
      ro.disconnect();
    };
  }, [updateScrollAbility]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector(
      "[data-industry-card]",
    ) as HTMLElement | null;
    const gap = 12; // matches gap-3 on the scroller
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.7;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  // When user picks an industry, horizontally centre that tile within the
  // scroller — only on *user-driven* changes, never on initial mount. We use
  // `scrollTo` on the scroller element directly (not `scrollIntoView`, which
  // would also scroll the page vertically down to the Industries section on
  // reload).
  const industryMountRef = useRef(false);
  useEffect(() => {
    if (!industryMountRef.current) {
      industryMountRef.current = true;
      return;
    }
    const el = scrollerRef.current;
    if (!el) return;
    const tile = el.querySelector<HTMLElement>(
      `[data-industry-card="${activeId}"]`,
    );
    if (!tile) return;
    const targetLeft =
      tile.offsetLeft - (el.clientWidth - tile.offsetWidth) / 2;
    el.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [activeId]);

  return (
    <section
      ref={ref}
      id="industries"
      className={`industries-reveal relative overflow-hidden bg-ink-950 py-12 sm:py-14 md:py-16 lg:py-20 ${
        inView ? "in-view" : ""
      }`}
    >
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        {/* Header */}
        <SectionHeader
          className="mb-8 md:mb-10 lg:mb-12"
          eyebrow="Trusted by the World"
          headline={
            <>
              A roster,{" "}
              <span className="italic text-silver-dim">by industry.</span>
            </>
          }
          sub="Luxury hospitality to Dubai Police. Tap any tile to see the full list."
        />

        {/* Horizontal industry rail */}
        <div className="industries-rail-wrap group/rail relative">
          <div
            ref={scrollerRef}
            role="tablist"
            aria-label="Industries"
            className="industries-scroller flex gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4"
          >
            {brandGroups.map((group) => {
              const isActive = group.id === activeId;
              return (
                <button
                  key={group.id}
                  data-industry-card={group.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`industry-panel-${group.id}`}
                  id={`industry-tab-${group.id}`}
                  onClick={() => setActiveId(group.id)}
                  className={`industry-card group relative flex w-[128px] shrink-0 snap-start flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 py-4 text-center transition-all duration-300 ease-out sm:w-[150px] sm:gap-3 sm:px-4 sm:py-5 md:w-[170px] lg:w-[200px] ${
                    isActive
                      ? "border-accent/60 bg-[rgba(138,160,255,0.08)] shadow-[0_10px_30px_rgba(138,160,255,0.15)]"
                      : "border-line bg-ink-900/60 hover:border-silver-dim/50 hover:bg-ink-800/70"
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-80"
                      style={{
                        backgroundImage:
                          "radial-gradient(ellipse at center top, rgba(138,160,255,0.2) 0%, transparent 65%)",
                      }}
                    />
                  )}

                  <span
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 sm:h-11 sm:w-11 md:h-12 md:w-12 ${
                      isActive
                        ? "border-accent/60 bg-accent/15 text-silver"
                        : "border-line text-silver-dim group-hover:border-silver-dim group-hover:text-silver"
                    }`}
                  >
                    {ICONS[group.id as IndustryKey]}
                  </span>

                  <span
                    className={`relative text-[11px] font-medium tracking-[0.08em] uppercase whitespace-nowrap sm:text-[12px] md:text-[13px] ${
                      isActive ? "text-silver" : "text-silver-dim"
                    }`}
                  >
                    {SHORT_LABEL[group.id as IndustryKey]}
                  </span>

                  <span
                    className={`relative font-numeric text-[11px] font-medium transition-colors duration-300 sm:text-[12px] ${
                      isActive ? "text-accent" : "text-muted"
                    }`}
                  >
                    {group.items.length} brand
                    {group.items.length === 1 ? "" : "s"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Edge fades — subtle hint that content continues */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-8 transition-opacity duration-300 sm:w-12 ${
              canLeft ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(5,7,12,0.95) 0%, rgba(5,7,12,0) 100%)",
            }}
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-8 transition-opacity duration-300 sm:w-12 ${
              canRight ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage:
                "linear-gradient(to left, rgba(5,7,12,0.95) 0%, rgba(5,7,12,0) 100%)",
            }}
          />

          {/* Arrow buttons */}
          <ArrowButton
            direction="left"
            visible={canLeft}
            onClick={() => scrollByCard(-1)}
          />
          <ArrowButton
            direction="right"
            visible={canRight}
            onClick={() => scrollByCard(1)}
          />
        </div>

        {/* Divider */}
        <div className="industries-divider mt-10 h-px w-full bg-line/70 md:mt-14" />

        {/* Panel */}
        <div
          key={active.id}
          role="tabpanel"
          id={`industry-panel-${active.id}`}
          aria-labelledby={`industry-tab-${active.id}`}
          className="industries-panel mt-8 md:mt-12"
        >
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 md:mb-8">
            <h4 className="industries-panel-title font-display text-xl font-normal text-silver sm:text-2xl md:text-3xl">
              {active.label}
            </h4>
            <span className="text-[11px] tracking-[0.22em] text-muted uppercase sm:text-[12px]">
              <span className="font-numeric text-silver-dim">
                {active.items.length}
              </span>{" "}
              partners
            </span>
          </div>

          <div className="industries-logo-grid grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 md:gap-3 lg:grid-cols-6 lg:gap-4 xl:grid-cols-7">
            {active.items.map((item, i) => {
              const src = getLogo(active.folder, item.slug);
              return (
                <div
                  key={item.slug}
                  className="industries-logo-cell flex aspect-[4/3] items-center justify-center rounded-md bg-white px-2 py-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-[1.04] sm:aspect-[16/10] sm:rounded-lg sm:px-3 sm:py-2"
                  style={{ "--logo-delay": `${i * 32}ms` } as React.CSSProperties}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-center text-[10px] font-semibold tracking-wide text-neutral-800">
                      {item.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
}

function ArrowButton({
  direction,
  visible,
  onClick,
}: {
  direction: "left" | "right";
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Scroll industries left" : "Scroll industries right"}
      tabIndex={visible ? 0 : -1}
      className={`absolute top-1/2 z-20 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-line/80 bg-ink-900/85 text-silver-dim shadow-[0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 hover:border-silver-dim hover:bg-ink-800 hover:text-silver sm:flex md:h-7 md:w-7 ${
        direction === "left" ? "left-0 md:-left-2" : "right-0 md:-right-2"
      } ${visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3 md:h-3.5 md:w-3.5"
        aria-hidden
      >
        {direction === "left" ? (
          <path d="M15 18l-6-6 6-6" />
        ) : (
          <path d="M9 6l6 6-6 6" />
        )}
      </svg>
    </button>
  );
}

/* === Minimal line icons (currentColor so they inherit active/inactive state) === */

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] sm:h-5 sm:w-5 md:h-[22px] md:w-[22px]"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13 13 0 010 18M12 3a13 13 0 000 18" />
    </svg>
  );
}

function HotelIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] sm:h-5 sm:w-5 md:h-[22px] md:w-[22px]"
      aria-hidden
    >
      <path d="M3 20h18" />
      <path d="M5 20V7l7-4 7 4v13" />
      <path d="M9 10h2M13 10h2M9 14h2M13 14h2" />
      <path d="M11 20v-3h2v3" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] sm:h-5 sm:w-5 md:h-[22px] md:w-[22px]"
      aria-hidden
    >
      <path d="M3 20h18" />
      <path d="M5 20V5h8v15" />
      <path d="M13 20V9h6v11" />
      <path d="M7 8h2M7 11h2M7 14h2M15 12h2M15 15h2" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] sm:h-5 sm:w-5 md:h-[22px] md:w-[22px]"
      aria-hidden
    >
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" />
      <circle cx="18" cy="18" r="1.5" />
    </svg>
  );
}

function BroadcastIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] sm:h-5 sm:w-5 md:h-[22px] md:w-[22px]"
      aria-hidden
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M8.5 8.5a5 5 0 000 7" />
      <path d="M15.5 8.5a5 5 0 010 7" />
      <path d="M5.5 5.5a9 9 0 000 13" />
      <path d="M18.5 5.5a9 9 0 010 13" />
    </svg>
  );
}
