import { useMemo, useState } from "react";
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
  // activeId can be null — represents "all collapsed" (mobile accordion only).
  // Desktop sidebar always has one selected initially; a null just means the
  // user collapsed the open mobile row.
  const [activeId, setActiveId] = useState<IndustryKey | null>(
    brandGroups[0].id,
  );

  // Desktop panel always needs something to render — fall back to first group
  // when activeId is null (shouldn't happen on desktop in practice, but safe).
  const active = useMemo(
    () => brandGroups.find((g) => g.id === activeId) ?? brandGroups[0],
    [activeId],
  );

  // Desktop sidebar: standard tab behaviour (replace active).
  const handleDesktopPick = (id: IndustryKey) => setActiveId(id);

  // Mobile accordion: toggle — clicking the open row collapses it.
  const handleMobileToggle = (id: IndustryKey) =>
    setActiveId((prev) => (prev === id ? null : id));

  return (
    <section
      ref={ref}
      id="industries"
      className={`industries-reveal relative overflow-hidden bg-ink-950 py-12 sm:py-14 md:py-16 lg:py-20 ${
        inView ? "in-view" : ""
      }`}
    >
      {/* Themed radial backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 50% at 30% 40%, rgba(40,60,120,0.18) 0%, rgba(25,40,95,0.06) 42%, rgba(10,16,34,0) 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1680px] px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        <SectionHeader
          className="mb-10 md:mb-12 lg:mb-14"
          eyebrow="Trusted by the World"
          headline={
            <>
              A roster,{" "}
              <span className="italic text-silver-dim">by industry.</span>
            </>
          }
          sub="Luxury hospitality to Dubai Police. Pick a category to see the full list."
        />

        {/* Desktop layout: sidebar + panel */}
        <div className="hidden gap-12 lg:grid lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] xl:gap-16">
          <aside>
            <DesktopSidebar activeId={activeId} onPick={handleDesktopPick} />
          </aside>
          <div className="min-w-0" key={active.id}>
            <PanelHeader group={active} />
            <LogoGrid group={active} />
          </div>
        </div>

        {/* Mobile / tablet layout: accordion */}
        <MobileAccordion
          activeId={activeId}
          onToggle={handleMobileToggle}
        />
      </div>
    </section>
  );
}

/* === Desktop sidebar (lg+) === */
function DesktopSidebar({
  activeId,
  onPick,
}: {
  activeId: IndustryKey | null;
  onPick: (id: IndustryKey) => void;
}) {
  return (
    <nav
      role="tablist"
      aria-label="Industries"
      className="flex flex-col gap-1"
    >
      {brandGroups.map((group, i) => {
        const isActive = group.id === activeId;
        return (
          <button
            key={group.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`industry-panel-${group.id}`}
            onClick={() => onPick(group.id as IndustryKey)}
            style={{ animationDelay: `${0.9 + i * 0.08}s` }}
            className={`industry-sidebar-item group relative flex items-center gap-4 overflow-hidden rounded-md border py-4 pr-4 pl-5 text-left transition-all duration-300 ${
              isActive
                ? "border-accent/30 bg-[rgba(138,160,255,0.07)]"
                : "border-transparent hover:border-line hover:bg-ink-900/50"
            }`}
          >
            <span
              aria-hidden
              className={`absolute inset-y-3 left-0 w-[2px] rounded-r-full transition-all duration-300 ${
                isActive ? "bg-accent" : "bg-transparent"
              }`}
            />
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                isActive
                  ? "border-accent/60 bg-accent/15 text-silver"
                  : "border-line text-silver-dim group-hover:border-silver-dim/60 group-hover:text-silver"
              }`}
            >
              {ICONS[group.id as IndustryKey]}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className={`truncate text-[13px] font-medium tracking-[0.06em] uppercase transition-colors duration-300 ${
                  isActive ? "text-silver" : "text-silver-dim"
                }`}
              >
                {SHORT_LABEL[group.id as IndustryKey]}
              </span>
              <span
                className={`font-numeric text-[11px] tracking-wide transition-colors duration-300 ${
                  isActive ? "text-accent" : "text-muted"
                }`}
              >
                {group.items.length} partners
              </span>
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                isActive
                  ? "translate-x-0 text-accent opacity-100"
                  : "-translate-x-1 text-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
              }`}
              aria-hidden
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        );
      })}
    </nav>
  );
}

/* === Mobile / tablet accordion (hidden on lg+) === */
function MobileAccordion({
  activeId,
  onToggle,
}: {
  activeId: IndustryKey | null;
  onToggle: (id: IndustryKey) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Industries"
      className="industry-accordion lg:hidden"
    >
      {brandGroups.map((group) => {
        const isActive = group.id === activeId;
        return (
          <div
            key={group.id}
            className={`industry-accordion-item relative overflow-hidden border-b border-line/50 first:border-t ${
              isActive ? "is-active" : ""
            }`}
          >
            {/* Active left-bar accent */}
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-y-0 left-0 w-[2px] transition-colors duration-300 ${
                isActive ? "bg-accent" : "bg-transparent"
              }`}
            />

            {/* Header row — tap to expand, tap again (while open) to collapse */}
            <button
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-expanded={isActive}
              aria-controls={`industry-accordion-panel-${group.id}`}
              id={`industry-accordion-tab-${group.id}`}
              onClick={() => onToggle(group.id as IndustryKey)}
              className={`group relative flex w-full items-center gap-3 py-4 pr-4 pl-5 text-left transition-colors duration-300 sm:gap-4 sm:py-5 ${
                isActive
                  ? "bg-[rgba(138,160,255,0.06)]"
                  : "hover:bg-ink-900/40"
              }`}
            >
              {/* Icon chip */}
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 sm:h-11 sm:w-11 ${
                  isActive
                    ? "border-accent/60 bg-accent/15 text-silver"
                    : "border-line text-silver-dim"
                }`}
              >
                {ICONS[group.id as IndustryKey]}
              </span>

              {/* Label */}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span
                  className={`truncate text-[14px] font-medium tracking-[0.06em] uppercase transition-colors duration-300 sm:text-[15px] ${
                    isActive ? "text-silver" : "text-silver-dim"
                  }`}
                >
                  {SHORT_LABEL[group.id as IndustryKey]}
                </span>
                <span
                  className={`font-numeric text-[11px] tracking-wide transition-colors duration-300 sm:text-[12px] ${
                    isActive ? "text-accent" : "text-muted"
                  }`}
                >
                  {group.items.length} partners
                </span>
              </span>

              {/* Chevron that rotates 180° when active */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 shrink-0 transition-all duration-500 sm:h-5 sm:w-5 ${
                  isActive
                    ? "rotate-180 text-accent"
                    : "text-silver-dim"
                }`}
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Expandable logo grid — animates via CSS grid-template-rows trick */}
            <div
              id={`industry-accordion-panel-${group.id}`}
              role="tabpanel"
              aria-labelledby={`industry-accordion-tab-${group.id}`}
              className={`industry-accordion-panel grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                isActive
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="px-5 pt-1 pb-5 sm:pb-6">
                  <AccordionLogoGrid group={group} active={isActive} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* === Logo grid inside the mobile accordion panel === */
function AccordionLogoGrid({ group, active }: { group: BrandGroup; active: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
      {group.items.map((item, i) => {
        const src = getLogo(group.folder, item.slug);
        return (
          <div
            key={item.slug}
            className={`industry-accordion-logo group/logo relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-white px-2 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(138,160,255,0.3)] sm:aspect-[16/10] sm:rounded-lg sm:px-3 sm:py-2 ${
              active ? "is-visible" : ""
            }`}
            style={{ "--logo-delay": `${i * 28}ms` } as React.CSSProperties}
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
  );
}

/* === Desktop panel header (industry title + partner count) === */
function PanelHeader({ group }: { group: BrandGroup }) {
  return (
    <div className="industry-panel-header">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h4 className="font-display text-xl font-normal text-silver sm:text-2xl md:text-3xl lg:text-[32px]">
          {group.label}
        </h4>
        <div className="flex items-baseline gap-2">
          <span className="font-numeric text-2xl font-medium text-silver sm:text-3xl">
            {group.items.length}
          </span>
          <span className="text-[11px] font-medium tracking-[0.24em] text-muted uppercase sm:text-[12px]">
            Partners
          </span>
        </div>
      </div>
      <div className="industry-panel-rail mt-4 h-px w-full bg-line/70" />
    </div>
  );
}

/* === Desktop logo grid === */
function LogoGrid({ group }: { group: BrandGroup }) {
  return (
    <div
      id={`industry-panel-${group.id}`}
      role="tabpanel"
      className="industry-panel mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 md:gap-4 lg:grid-cols-5"
    >
      {group.items.map((item, i) => {
        const src = getLogo(group.folder, item.slug);
        return (
          <div
            key={item.slug}
            className="industry-logo-cell group/logo relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-white px-2 py-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(138,160,255,0.25)] sm:aspect-[16/10] sm:rounded-lg sm:px-3 sm:py-2"
            style={{ "--logo-delay": `${i * 32}ms` } as React.CSSProperties}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-md ring-0 ring-accent/0 transition-all duration-300 group-hover/logo:ring-2 group-hover/logo:ring-accent/40 sm:rounded-lg"
            />
            {src ? (
              <img
                src={src}
                alt={item.name}
                loading="lazy"
                decoding="async"
                className="relative h-full w-full object-contain"
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
      className="h-[18px] w-[18px] sm:h-5 sm:w-5"
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
      className="h-[18px] w-[18px] sm:h-5 sm:w-5"
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
      className="h-[18px] w-[18px] sm:h-5 sm:w-5"
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
      className="h-[18px] w-[18px] sm:h-5 sm:w-5"
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
      className="h-[18px] w-[18px] sm:h-5 sm:w-5"
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
