import { useEffect, useState } from "react";
import thirdSectionImg from "../assets/third-section.webp";
import { useInView } from "../hooks/useInView";

type Item = {
  numeric?: number;
  suffix?: string;
  text?: string;
  tail?: string;
  label: string;
};

const items: Item[] = [
  { numeric: 130, suffix: "+", label: "Brands & Partners" },
  { numeric: 7, suffix: "M+", tail: "Followers", label: "Audience Reach" },
  { text: "UAE", tail: "Golden Visa", label: "Official Recognition" },
];

export function Proof() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`proof-reveal relative overflow-hidden bg-ink-950 ${
        inView ? "in-view" : ""
      }`}
    >
      <ProofBackdrop />

      <section
        id="proof"
        className="relative z-10 mx-auto grid w-full max-w-[1680px] grid-rows-[auto_1fr_auto] px-4 py-12 sm:px-5 sm:py-14 md:px-6 md:py-16 lg:px-8 lg:py-20 xl:px-10"
      >
        <div className="mb-12 md:mb-16 lg:mb-20">
          <p className="proof-section-label text-[13px] font-medium tracking-[0.24em] text-muted uppercase sm:text-[14px] md:text-[15px] lg:text-[16px]">
            Proof at a Glance
          </p>
          <div className="proof-rail mt-3 h-px w-24 bg-line sm:w-32" />
        </div>

        <div className="flex min-h-0 flex-col justify-center">
          <div className="grid grid-cols-1 divide-y divide-line/60 md:grid-cols-3 md:divide-x md:divide-y-0">
            {items.map((it, i) => (
              <ProofItem key={it.label} item={it} index={i} inView={inView} />
            ))}
          </div>
        </div>

        <p className="proof-description relative mt-14 max-w-md text-sm leading-relaxed text-silver-dim lg:mt-20">
          Built over a decade of live work across the UAE and beyond — for brands,
          stages and private hosts.
        </p>

      </section>
    </div>
  );
}

function ProofItem({
  item,
  index,
  inView,
}: {
  item: Item;
  index: number;
  inView: boolean;
}) {
  const pad =
    index === 0 ? "md:pr-8 lg:pr-10" : "py-10 md:py-0 md:px-8 lg:px-10";
  return (
    <div className={`proof-item flex flex-col gap-5 ${pad}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="proof-value font-numeric text-5xl leading-none font-medium text-silver sm:text-6xl md:text-5xl lg:text-6xl xl:text-[88px]">
          {item.numeric !== undefined ? (
            <CounterValue
              target={item.numeric}
              suffix={item.suffix ?? ""}
              inView={inView}
              startDelayMs={750 + index * 200}
            />
          ) : (
            <TextValue
              text={item.text ?? ""}
              inView={inView}
              startDelay={0.75 + index * 0.2}
            />
          )}
        </span>
        {item.tail ? (
          <span className="proof-tail font-display text-xl leading-none font-normal text-silver-dim sm:text-2xl md:text-xl lg:text-2xl xl:text-4xl">
            {item.tail}
          </span>
        ) : null}
      </div>
      <div className="proof-underline h-px w-full max-w-[220px] bg-silver/30" />
      <span className="proof-stat-label text-[12px] tracking-[0.24em] text-muted uppercase sm:text-[13px] md:text-sm">
        {item.label}
      </span>
    </div>
  );
}

function CounterValue({
  target,
  suffix,
  inView,
  startDelayMs,
}: {
  target: number;
  suffix: string;
  inView: boolean;
  startDelayMs: number;
}) {
  const value = useCountUp(target, 1400, inView, startDelayMs);
  return (
    <>
      {value}
      {suffix}
    </>
  );
}

function TextValue({
  text,
  inView,
  startDelay,
}: {
  text: string;
  inView: boolean;
  startDelay: number;
}) {
  const chars = text.split("");
  return (
    <>
      {chars.map((char, i) => (
        <span
          key={i}
          className="proof-char"
          style={{
            animation: inView
              ? `proof-char-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${
                  startDelay + i * 0.09
                }s both`
              : "none",
          }}
        >
          {char}
        </span>
      ))}
    </>
  );
}

function useCountUp(
  target: number,
  durationMs: number,
  active: boolean,
  delayMs: number,
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    let frameId = 0;
    let startedAt: number | null = null;

    const tick = (now: number) => {
      if (startedAt === null) startedAt = now;
      const elapsed = now - startedAt - delayMs;

      if (elapsed < 0) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(elapsed / durationMs, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs, active, delayMs]);

  return value;
}

function ProofBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <img
        src={thirdSectionImg}
        alt=""
        loading="lazy"
        decoding="async"
        className="proof-backdrop absolute inset-0 h-full w-full object-cover object-center"
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(5,7,12,0.72) 0%, rgba(5,7,12,0.2) 30%, rgba(5,7,12,0.15) 55%, rgba(5,7,12,0.5) 88%, rgba(5,7,12,0.92) 100%)",
        }}
      />

      <div
        className="absolute inset-y-0 left-0 w-[18%]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(5,7,12,0.6) 0%, rgba(5,7,12,0) 100%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-[18%]"
        style={{
          backgroundImage:
            "linear-gradient(270deg, rgba(5,7,12,0.6) 0%, rgba(5,7,12,0) 100%)",
        }}
      />
    </div>
  );
}
