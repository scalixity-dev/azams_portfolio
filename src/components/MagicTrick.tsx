import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";
import { SectionHeader } from "./shared/SectionHeader";

type Suit = "♠" | "♥" | "♦" | "♣";
type Card = { rank: string; suit: Suit; color: "red" | "dark" };

type Phase =
  | "idle"
  | "ready" // sealed card + 5 options, waiting for pick
  | "merging" // user picked; chosen card slides to meet the prediction
  | "revealing" // both cards flip in unison
  | "done";

/* Rotating prediction cards — each replay uses the next card so repeat
 * players can't deduce "it's always Ace of Spades". After 5 tries the
 * cycle restarts. Each card is dramatic/photogenic. */
const PREDICTIONS: Card[] = [
  { rank: "A", suit: "♠", color: "dark" },
  { rank: "Q", suit: "♥", color: "red" },
  { rank: "J", suit: "♦", color: "red" },
  { rank: "K", suit: "♣", color: "dark" },
  { rank: "10", suit: "♥", color: "red" },
];

export function MagicTrick() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.25 });
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const startedRef = useRef(false);
  const timers = useRef<number[]>([]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;
    schedule(() => setPhase("ready"), 500);
  }, [inView, schedule]);

  const prediction = PREDICTIONS[round % PREDICTIONS.length];

  const handlePick = (idx: number) => {
    if (phase !== "ready") return;
    setPickedIndex(idx);
    setPhase("merging");
    schedule(() => setPhase("revealing"), 650);
    schedule(() => setPhase("done"), 1800);
  };

  const reset = () => {
    clearTimers();
    setPickedIndex(null);
    setRound((r) => r + 1);
    setPhase("ready");
  };

  return (
    <section
      ref={ref}
      id="magic-trick"
      className={`predict-reveal relative overflow-hidden bg-ink-950 pt-6 pb-12 sm:pt-8 sm:pb-14 md:pt-10 md:pb-16 lg:pt-12 lg:pb-20 ${
        inView ? "in-view" : ""
      }`}
    >
      {/* Portfolio-matched backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(60,100,200,0.18) 0%, rgba(30,55,130,0.08) 40%, rgba(10,16,34,0) 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1680px] px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        {/* Section header */}
        <SectionHeader
          align="center"
          maxWidth="2xl"
          eyebrow="A Prediction"
          headline={
            <>
              One card is sealed.{" "}
              <span className="italic text-silver-dim">Pick yours.</span>
            </>
          }
          sub="The card above was chosen before you arrived."
        />

        {/* Stage — compact, horizontal composition */}
        <div className="relative mx-auto mt-12 flex max-w-md flex-col items-center gap-10 sm:mt-14 sm:gap-12">
          {/* Prediction card */}
          <div className="relative flex flex-col items-center gap-3">
            <span className="predict-tag text-[10px] font-medium tracking-[0.32em] text-muted uppercase sm:text-[11px]">
              Sealed Prediction
            </span>
            <PredictionCard
              card={prediction}
              revealed={phase === "revealing" || phase === "done"}
              merging={phase === "merging"}
            />
            {/* Sparkles on match */}
            {(phase === "revealing" || phase === "done") && <SparkleRing />}
          </div>

          {/* 5 face-down options */}
          <div className="relative w-full">
            <div className="flex justify-center gap-2 sm:gap-3 md:gap-4">
              {[0, 1, 2, 3, 4].map((idx) => {
                const isPicked = pickedIndex === idx;
                const otherPicked = pickedIndex !== null && !isPicked;
                return (
                  <button
                    key={`${round}-${idx}`}
                    type="button"
                    onClick={() => handlePick(idx)}
                    disabled={phase !== "ready"}
                    aria-label={`Pick card ${idx + 1}`}
                    className={`option-card group relative aspect-7/10 w-14 overflow-hidden rounded-md border transition-all duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-16 md:w-20 ${
                      phase === "ready"
                        ? "cursor-pointer border-line/80 hover:-translate-y-2 hover:border-accent/60 hover:shadow-[0_12px_30px_rgba(138,160,255,0.3)]"
                        : "cursor-default border-line"
                    } ${
                      isPicked
                        ? "z-10 scale-110 -translate-y-6 border-accent shadow-[0_18px_40px_rgba(138,160,255,0.5)]"
                        : otherPicked
                          ? "opacity-30 scale-90"
                          : ""
                    }`}
                    style={{
                      transitionDelay:
                        phase === "ready"
                          ? `${idx * 60}ms`
                          : "0ms",
                    }}
                  >
                    <CardBack revealed={isPicked && (phase === "revealing" || phase === "done")} card={prediction} />
                  </button>
                );
              })}
            </div>

            {/* Prompt below options */}
            <p className="predict-prompt mt-6 text-center text-[12px] tracking-[0.22em] text-muted uppercase sm:text-[13px]">
              {phase === "ready" && "Tap any card"}
              {phase === "merging" && "Watching your choice…"}
              {(phase === "revealing" || phase === "done") &&
                `${prediction.rank} ${prediction.suit} — exactly as predicted.`}
            </p>
          </div>

          {/* Replay */}
          {phase === "done" && (
            <button
              type="button"
              onClick={reset}
              className="predict-replay group inline-flex items-center gap-2 rounded-full border border-line bg-ink-900/70 px-5 py-2.5 text-[11px] font-medium tracking-[0.22em] text-silver-dim uppercase backdrop-blur-md transition-all duration-300 hover:border-accent/50 hover:text-silver sm:text-[12px]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180"
                aria-hidden
              >
                <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Try another
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* === The sealed prediction card at top === */
function PredictionCard({
  card,
  revealed,
  merging,
}: {
  card: Card;
  revealed: boolean;
  merging: boolean;
}) {
  return (
    <div
      className={`relative aspect-7/10 w-24 overflow-visible transition-transform duration-500 sm:w-28 md:w-32 ${
        merging ? "scale-105" : ""
      } ${revealed ? "shadow-[0_30px_60px_rgba(138,160,255,0.4)]" : ""}`}
    >
      <div
        className={`relative h-full w-full rounded-lg transition-transform duration-700 transform-3d ${
          revealed ? "transform-[rotateY(180deg)]" : ""
        }`}
      >
        {/* Back */}
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-silver-dim/25 bg-linear-to-br from-ink-800 via-ink-900 to-[#0b1030] backface-hidden">
          <CardBackPattern />
        </div>
        {/* Face */}
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-silver/50 bg-linear-to-br from-white to-[#f3f3ee] transform-[rotateY(180deg)] backface-hidden">
          <CardFace card={card} large />
        </div>
      </div>
    </div>
  );
}

/* === The 5 face-down option cards === */
function CardBack({ revealed, card }: { revealed: boolean; card: Card }) {
  return (
    <div
      className={`relative h-full w-full rounded-md transition-transform duration-700 transform-3d ${
        revealed ? "transform-[rotateY(180deg)]" : ""
      }`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-md bg-linear-to-br from-ink-800 via-ink-900 to-[#0b1030] backface-hidden">
        <CardBackPattern />
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-md border border-silver/50 bg-linear-to-br from-white to-[#f3f3ee] transform-[rotateY(180deg)] backface-hidden">
        <CardFace card={card} />
      </div>
    </div>
  );
}

function CardBackPattern() {
  return (
    <svg viewBox="0 0 100 140" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id="pb" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="0.4" fill="rgba(138,160,255,0.4)" />
        </pattern>
      </defs>
      <rect width="100" height="140" fill="url(#pb)" />
      <rect x="5" y="5" width="90" height="130" fill="none" stroke="rgba(184,186,196,0.3)" strokeWidth="0.5" rx="3" />
      <g transform="translate(50 70)">
        <path d="M0 -28 L20 0 L0 28 L-20 0 Z" fill="none" stroke="rgba(138,160,255,0.55)" strokeWidth="0.6" />
        <path d="M0 -18 L13 0 L0 18 L-13 0 Z" fill="none" stroke="rgba(184,186,196,0.5)" strokeWidth="0.4" />
        <circle cx="0" cy="0" r="3" fill="rgba(138,160,255,0.3)" />
      </g>
    </svg>
  );
}

function CardFace({ card, large = false }: { card: Card; large?: boolean }) {
  const color = card.color === "red" ? "#c22" : "#0a0e1a";
  return (
    <div
      className={`flex h-full w-full flex-col justify-between font-serif leading-none ${
        large ? "p-2 sm:p-2.5 md:p-3" : "p-1 sm:p-1.5"
      }`}
      style={{ color }}
    >
      <div className="flex flex-col items-start">
        <span
          className={`font-bold ${
            large
              ? "text-[14px] sm:text-[16px] md:text-[18px]"
              : "text-[9px] sm:text-[10px] md:text-[12px]"
          }`}
        >
          {card.rank}
        </span>
        <span
          className={
            large
              ? "text-[12px] sm:text-[14px] md:text-[16px]"
              : "text-[8px] sm:text-[9px] md:text-[11px]"
          }
        >
          {card.suit}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <span
          className={`drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] ${
            large
              ? "text-[32px] sm:text-[42px] md:text-[52px]"
              : "text-[18px] sm:text-[22px] md:text-[28px]"
          }`}
        >
          {card.suit}
        </span>
      </div>
      <div className="flex flex-col items-end" style={{ transform: "rotate(180deg)" }}>
        <span
          className={`font-bold ${
            large
              ? "text-[14px] sm:text-[16px] md:text-[18px]"
              : "text-[9px] sm:text-[10px] md:text-[12px]"
          }`}
        >
          {card.rank}
        </span>
        <span
          className={
            large
              ? "text-[12px] sm:text-[14px] md:text-[16px]"
              : "text-[8px] sm:text-[9px] md:text-[11px]"
          }
        >
          {card.suit}
        </span>
      </div>
    </div>
  );
}

/* === Sparkle ring around the prediction card on reveal === */
function SparkleRing() {
  const stars = [
    { x: "-20%", y: "15%", size: 10, delay: 60 },
    { x: "115%", y: "20%", size: 14, delay: 180 },
    { x: "-15%", y: "65%", size: 8, delay: 320 },
    { x: "118%", y: "70%", size: 11, delay: 90 },
    { x: "45%", y: "-15%", size: 7, delay: 250 },
    { x: "55%", y: "108%", size: 9, delay: 380 },
    { x: "-10%", y: "40%", size: 6, delay: 420 },
    { x: "110%", y: "45%", size: 8, delay: 150 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="predict-sparkle absolute block"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}ms`,
          }}
        >
          <svg viewBox="0 0 20 20" className="h-full w-full">
            <path
              d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z"
              fill="rgba(220,225,240,0.95)"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
