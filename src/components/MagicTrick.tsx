import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";
import { SectionHeader } from "./shared/SectionHeader";

type Suit = "♠" | "♥" | "♦" | "♣";
type Card = { rank: string; suit: Suit; color: "red" | "dark" };

type Phase =
  | "idle" //        hidden
  | "intro" //       card settles face-down, briefly waiting
  | "shuffling" //   card face-up, rank/suit cycles rapidly, STOP button visible
  | "revealing" //   STOP tapped, card locks to the forced value with a dramatic flourish
  | "done"; //       result shown, offer replay

/* Rotating forced reveal — a different card each play so repeat players
 * can't call the pattern. The user is told "we stopped where you did",
 * but we actually always land on whichever card is next in this list. */
const FORCED: Card[] = [
  { rank: "7", suit: "♥", color: "red" },
  { rank: "A", suit: "♠", color: "dark" },
  { rank: "Q", suit: "♦", color: "red" },
  { rank: "K", suit: "♣", color: "dark" },
  { rank: "10", suit: "♠", color: "dark" },
];

/* Pool used only for the rapid flicker during the shuffle phase */
const ALL_SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const ALL_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function randomCard(): Card {
  const suit = ALL_SUITS[Math.floor(Math.random() * ALL_SUITS.length)];
  const rank = ALL_RANKS[Math.floor(Math.random() * ALL_RANKS.length)];
  const color: "red" | "dark" = suit === "♥" || suit === "♦" ? "red" : "dark";
  return { rank, suit, color };
}

export function MagicTrick() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.25 });
  const [phase, setPhase] = useState<Phase>("idle");
  const [card, setCard] = useState<Card>(() => randomCard());
  const [round, setRound] = useState(0);
  const startedRef = useRef(false);
  const timers = useRef<number[]>([]);
  const shuffleIntervalRef = useRef<number | null>(null);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);
  const stopShuffle = useCallback(() => {
    if (shuffleIntervalRef.current !== null) {
      window.clearInterval(shuffleIntervalRef.current);
      shuffleIntervalRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearTimers();
      stopShuffle();
    },
    [clearTimers, stopShuffle],
  );

  // Kick off: idle → intro → shuffling once the section is on screen
  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;
    schedule(() => setPhase("intro"), 400);
    schedule(() => setPhase("shuffling"), 1400);
  }, [inView, schedule]);

  // Rapid card flicker during shuffle (~11 updates/second)
  useEffect(() => {
    if (phase !== "shuffling") return;
    shuffleIntervalRef.current = window.setInterval(() => {
      setCard(randomCard());
    }, 90);
    return stopShuffle;
  }, [phase, stopShuffle]);

  const handleStop = () => {
    if (phase !== "shuffling") return;
    stopShuffle();
    // Lock in the forced card for this round
    const forced = FORCED[round % FORCED.length];
    setCard(forced);
    setPhase("revealing");
    schedule(() => setPhase("done"), 1500);
  };

  const reset = () => {
    clearTimers();
    stopShuffle();
    setRound((n) => n + 1);
    setCard(randomCard());
    setPhase("shuffling");
  };

  return (
    <section
      ref={ref}
      id="magic-trick"
      className={`stopper-reveal relative overflow-hidden bg-ink-950 pt-6 pb-12 sm:pt-8 sm:pb-14 md:pt-10 md:pb-16 lg:pt-12 lg:pb-20 ${
        inView ? "in-view" : ""
      }`}
    >
      {/* Stage lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 45% at 50% 55%, rgba(60,100,200,0.2) 0%, rgba(30,55,130,0.08) 42%, rgba(10,16,34,0) 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, transparent 55%, rgba(5,7,12,0.55) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1680px] px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        <SectionHeader
          align="center"
          maxWidth="xl"
          eyebrow="A Small Illusion"
          headline={
            <>
              Say when.{" "}
              <span className="italic text-silver-dim">We'll stop there.</span>
            </>
          }
          sub="Watch the deck shuffle. Tap stop whenever you like — we'll land right where you did."
        />

        {/* Stage */}
        <div className="relative mx-auto mt-10 flex min-h-80 w-full max-w-sm flex-col items-center sm:mt-12 md:min-h-90">
          {/* Floor glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 bottom-0 h-20 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 100%, rgba(138,160,255,0.22) 0%, transparent 70%)",
            }}
          />

          {/* Card */}
          <div
            className={`stopper-card-wrap relative mb-8 ${
              phase === "shuffling" ? "is-shuffling" : ""
            } ${phase === "revealing" || phase === "done" ? "is-revealed" : ""}`}
            aria-live="polite"
            aria-atomic
          >
            <SingleCard card={card} />
            {(phase === "revealing" || phase === "done") && <SparkleBurst />}
          </div>

          {/* Action area — fixed slot so page doesn't jump */}
          <div className="relative flex min-h-28 w-full flex-col items-center justify-start gap-3 text-center">
            {phase === "intro" && (
              <p className="stopper-prompt font-display text-base italic text-silver-dim sm:text-lg">
                Watch the deck
                <Dots />
              </p>
            )}

            {phase === "shuffling" && (
              <button
                type="button"
                onClick={handleStop}
                className="stopper-stop group relative inline-flex items-center gap-2 rounded-full border border-accent/60 bg-[rgba(138,160,255,0.12)] px-8 py-3 text-[12px] font-medium tracking-[0.3em] text-silver uppercase shadow-[0_12px_30px_rgba(138,160,255,0.3)] backdrop-blur-md transition-all duration-300 hover:border-accent hover:bg-[rgba(138,160,255,0.2)] hover:shadow-[0_16px_38px_rgba(138,160,255,0.4)] sm:text-[13px]"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow:
                      "0 0 0 0 rgba(138,160,255,0.4)",
                    animation:
                      "stopper-pulse 2s cubic-bezier(0.22, 1, 0.36, 1) infinite",
                  }}
                />
                <span className="relative flex h-2 w-2 shrink-0 rounded-full bg-accent">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                </span>
                Stop
              </button>
            )}

            {phase === "revealing" && (
              <p className="stopper-prompt text-[12px] tracking-[0.3em] text-muted uppercase sm:text-[13px]">
                Locked in
              </p>
            )}

            {phase === "done" && (
              <>
                <p className="stopper-result font-display text-xl leading-tight text-silver sm:text-2xl md:text-3xl">
                  Your card:{" "}
                  <span
                    className="font-serif font-bold"
                    style={{
                      color: card.color === "red" ? "#ff6b6b" : undefined,
                    }}
                  >
                    {card.rank} {card.suit}
                  </span>
                </p>
                <p className="text-[11px] tracking-[0.24em] text-muted uppercase sm:text-[12px]">
                  Stopped exactly where we needed you to.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="stopper-replay group mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-ink-900/70 px-5 py-2.5 text-[11px] font-medium tracking-[0.22em] text-silver-dim uppercase backdrop-blur-md transition-all duration-300 hover:border-accent/50 hover:text-silver sm:text-[12px]"
                >
                  <RefreshIcon />
                  Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* === Single card === */
function SingleCard({ card }: { card: Card }) {
  return (
    <div className="stopper-card relative aspect-7/10 w-36 overflow-hidden rounded-xl border border-silver/40 bg-linear-to-br from-white to-[#f3f3ee] shadow-[0_18px_40px_rgba(138,160,255,0.3)] sm:w-40 md:w-44 lg:w-48">
      <CardFace card={card} />
    </div>
  );
}

function CardFace({ card }: { card: Card }) {
  const color = card.color === "red" ? "#c22" : "#0a0e1a";
  return (
    <svg viewBox="0 0 140 200" className="absolute inset-0 h-full w-full" aria-hidden>
      {/* Top-left corner */}
      <g fill={color}>
        <text
          x="12"
          y="26"
          fontFamily="'Playfair Display', serif"
          fontSize="22"
          fontWeight="700"
        >
          {card.rank}
        </text>
        <text x="12" y="42" fontSize="14">
          {card.suit}
        </text>
      </g>
      {/* Big centered suit */}
      <g transform="translate(70 100)" fill={color}>
        <text textAnchor="middle" dominantBaseline="central" fontSize="76">
          {card.suit}
        </text>
      </g>
      {/* Bottom-right corner (rotated) */}
      <g fill={color} transform="rotate(180 70 100)">
        <text
          x="12"
          y="26"
          fontFamily="'Playfair Display', serif"
          fontSize="22"
          fontWeight="700"
        >
          {card.rank}
        </text>
        <text x="12" y="42" fontSize="14">
          {card.suit}
        </text>
      </g>
      {/* AZAM wordmark */}
      <text
        x="70"
        y="188"
        textAnchor="middle"
        fontFamily="'Playfair Display', serif"
        fontSize="6"
        letterSpacing="2.2"
        fill="rgba(10,14,26,0.4)"
      >
        AZAM
      </text>
    </svg>
  );
}

/* === Sparkle burst on reveal === */
function SparkleBurst() {
  const stars = [
    { x: "-15%", y: "15%", size: 10, delay: 60 },
    { x: "108%", y: "20%", size: 14, delay: 180 },
    { x: "-10%", y: "60%", size: 8, delay: 320 },
    { x: "110%", y: "65%", size: 11, delay: 90 },
    { x: "40%", y: "-10%", size: 7, delay: 250 },
    { x: "60%", y: "100%", size: 9, delay: 380 },
    { x: "-5%", y: "40%", size: 6, delay: 420 },
    { x: "105%", y: "45%", size: 8, delay: 150 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="stopper-sparkle absolute block"
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

function Dots() {
  return (
    <span className="ml-1 inline-flex gap-0.5">
      <span className="thinking-dot">.</span>
      <span className="thinking-dot">.</span>
      <span className="thinking-dot">.</span>
    </span>
  );
}

function RefreshIcon() {
  return (
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
  );
}
