import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { reelsRowOne, reelsRowTwo, type Reel } from "../data/reels";
import { useInView } from "../hooks/useInView";
import { SectionHeader } from "./shared/SectionHeader";

export function Reels() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [unmutedKey, setUnmutedKey] = useState<string | null>(null);
  const hasRowTwo = reelsRowTwo.length > 0;
  const isLocked = unmutedKey !== null;

  const handleToggleMute = (key: string) => {
    setUnmutedKey((prev) => (prev === key ? null : key));
  };

  return (
    <div
      ref={ref}
      className={`reels-reveal relative overflow-hidden bg-ink-950 py-12 sm:py-14 md:py-16 lg:py-20 ${
        inView ? "in-view" : ""
      }`}
    >
      <div className="mx-auto mb-8 w-full max-w-[1680px] px-4 sm:px-5 md:mb-10 md:px-6 lg:mb-12 lg:px-8 xl:px-10">
        <SectionHeader
          eyebrow="Reels"
          headline={
            <>
              Moments{" "}
              <span className="italic text-silver-dim">worth filming.</span>
            </>
          }
          sub="Drag to scroll. Tap any reel to unmute."
        />
      </div>

      {/* Row 1 — auto-scrolls right → left, user can drag/scroll freely */}
      <MarqueeRow
        reels={reelsRowOne}
        reverse={false}
        pxPerSecond={38}
        fadeSide="left"
        isLocked={isLocked}
        unmutedKey={unmutedKey}
        onToggleMute={handleToggleMute}
        keyPrefix="r1"
      />

      {hasRowTwo && (
        <div className="mt-3 sm:mt-4 md:mt-5 lg:mt-6">
          <MarqueeRow
            reels={reelsRowTwo}
            reverse
            pxPerSecond={32}
            fadeSide="right"
            isLocked={isLocked}
            unmutedKey={unmutedKey}
            onToggleMute={handleToggleMute}
            keyPrefix="r2"
          />
        </div>
      )}

    </div>
  );
}

function MarqueeRow({
  reels,
  reverse,
  pxPerSecond,
  fadeSide,
  isLocked,
  unmutedKey,
  onToggleMute,
  keyPrefix,
}: {
  reels: Reel[];
  reverse: boolean;
  pxPerSecond: number;
  fadeSide: "left" | "right";
  isLocked: boolean;
  unmutedKey: string | null;
  onToggleMute: (key: string) => void;
  keyPrefix: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isUserActive, setIsUserActive] = useState(false);
  const resumeTimerRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  const isPaused = isLocked || isUserActive;

  const bumpActivity = useCallback((idleMs = 1800) => {
    setIsUserActive(true);
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      setIsUserActive(false);
      resumeTimerRef.current = null;
    }, idleMs);
  }, []);

  // Set initial scroll to the midpoint so manual scroll has room in both directions.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || initializedRef.current) return;
    const setInitial = () => {
      if (el.scrollWidth > el.clientWidth) {
        el.scrollLeft = el.scrollWidth / 4;
        initializedRef.current = true;
      } else {
        requestAnimationFrame(setInitial);
      }
    };
    requestAnimationFrame(setInitial);
  }, []);

  // RAF loop advancing scrollLeft; pause when paused.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let rafId = 0;
    lastTimeRef.current = null;

    const tick = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (!isPaused && el.scrollWidth > el.clientWidth) {
        const halfWidth = el.scrollWidth / 2;
        const delta = (pxPerSecond / 1000) * dt * (reverse ? -1 : 1);
        let newLeft = el.scrollLeft + delta;

        if (newLeft >= halfWidth) newLeft -= halfWidth;
        if (newLeft < 0) newLeft += halfWidth;

        el.scrollLeft = newLeft;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isPaused, pxPerSecond, reverse]);

  // Keep user-scrolled position within the loopable range so it doesn't hit a wall.
  const normalizeScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const halfWidth = el.scrollWidth / 2;
    if (halfWidth <= 0) return;
    if (el.scrollLeft >= halfWidth) {
      el.scrollLeft -= halfWidth;
    } else if (el.scrollLeft < 0) {
      el.scrollLeft += halfWidth;
    }
  }, []);

  return (
    <div className="reels-row relative w-full">
      <div
        ref={scrollerRef}
        className="reels-scroller flex w-full gap-3 overflow-x-auto overscroll-x-contain sm:gap-4 md:gap-5 lg:gap-6"
        onMouseEnter={() => setIsUserActive(true)}
        onMouseLeave={() => bumpActivity(400)}
        onTouchStart={() => bumpActivity(2500)}
        onTouchMove={() => bumpActivity(2500)}
        onTouchEnd={() => bumpActivity(2500)}
        onWheel={() => bumpActivity(1200)}
        onPointerDown={() => bumpActivity(2500)}
        onScrollCapture={normalizeScroll}
      >
        {reels.map((reel, i) => {
          const cardKey = `${keyPrefix}-a-${reel.id}-${i}`;
          return (
            <ReelCard
              key={cardKey}
              cardKey={cardKey}
              reel={reel}
              unmutedKey={unmutedKey}
              onToggleMute={onToggleMute}
            />
          );
        })}
        {reels.map((reel, i) => {
          const cardKey = `${keyPrefix}-b-${reel.id}-${i}`;
          return (
            <ReelCard
              key={cardKey}
              cardKey={cardKey}
              reel={reel}
              unmutedKey={unmutedKey}
              onToggleMute={onToggleMute}
              aria-hidden
            />
          );
        })}
      </div>

      <div
        className={`pointer-events-none absolute inset-y-0 z-10 ${
          fadeSide === "left" ? "left-0" : "right-0"
        }`}
        aria-hidden
        style={{
          width: "var(--section-left-gap, 1.25rem)",
          backgroundImage:
            fadeSide === "left"
              ? "linear-gradient(to right, rgba(5,7,12,1) 0%, rgba(5,7,12,1) 55%, rgba(5,7,12,0) 100%)"
              : "linear-gradient(to left, rgba(5,7,12,1) 0%, rgba(5,7,12,1) 55%, rgba(5,7,12,0) 100%)",
        }}
      />
    </div>
  );
}

function ReelCard({
  reel,
  cardKey,
  unmutedKey,
  onToggleMute,
  "aria-hidden": ariaHidden,
}: {
  reel: Reel;
  cardKey: string;
  unmutedKey: string | null;
  onToggleMute: (key: string) => void;
  "aria-hidden"?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const isUnmuted = unmutedKey === cardKey;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isUnmuted;

    if (isUnmuted || inView) {
      video.play().catch(() => {
        /* autoplay rejected */
      });
    } else {
      video.pause();
    }
  }, [inView, isUnmuted]);

  const handleCardClick = () => {
    // Duplicate cards (ariaHidden) are also clickable — the marquee loop
    // frequently puts them in the viewport, so every visible card must respond.
    onToggleMute(cardKey);
  };

  const handleIgClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={ariaHidden ? -1 : 0}
      aria-hidden={ariaHidden}
      aria-label={
        isUnmuted ? `Mute ${reel.caption}` : `Unmute ${reel.caption}`
      }
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`reel-card group/card relative block flex-shrink-0 cursor-pointer snap-start overflow-hidden rounded-lg border bg-ink-900 shadow-[0_18px_42px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out hover:scale-[1.015] ${
        isUnmuted
          ? "border-accent/70 ring-2 ring-accent/40 shadow-[0_18px_52px_rgba(138,160,255,0.3)]"
          : "border-line/70 ring-1 ring-silver-dim/0 hover:ring-silver-dim/40"
      }`}
    >
      <div className="relative aspect-[9/16] w-[140px] sm:w-[165px] md:w-[190px] lg:w-[215px] xl:w-[235px]">
        <video
          ref={videoRef}
          src={reel.video}
          poster={reel.poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(5,7,12,0.4) 0%, rgba(5,7,12,0) 22%, rgba(5,7,12,0) 55%, rgba(5,7,12,0.9) 100%)",
          }}
        />

        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full border border-silver-dim/15 bg-ink-950/70 px-1.5 py-0.5 backdrop-blur-md sm:top-3 sm:left-3 sm:gap-1.5 sm:px-2 sm:py-1 md:top-3.5 md:left-3.5 md:px-2.5">
          <span className="relative flex h-1 w-1 sm:h-1.5 sm:w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-1 w-1 rounded-full bg-accent sm:h-1.5 sm:w-1.5" />
          </span>
          <span className="text-[8px] font-medium tracking-[0.2em] text-silver uppercase sm:text-[9px] sm:tracking-[0.24em]">
            Reel
          </span>
        </div>

        <div
          className={`pointer-events-none absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 sm:top-3 sm:right-3 sm:h-7 sm:w-7 md:top-3.5 md:right-3.5 md:h-8 md:w-8 ${
            isUnmuted
              ? "border-accent/60 bg-accent/20 text-silver"
              : "border-silver-dim/15 bg-ink-950/70 text-silver-dim"
          }`}
        >
          {isUnmuted ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
        </div>

        <div className="absolute right-2 bottom-2 left-2 flex items-end justify-between gap-2 sm:right-3 sm:bottom-3 sm:left-3 md:right-3.5 md:bottom-3.5 md:left-3.5">
          <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
            <span className="hidden text-[8px] tracking-[0.26em] text-silver-dim uppercase sm:inline sm:text-[9px] sm:tracking-[0.3em]">
              @azam.magic
            </span>
            <span className="truncate text-[9px] font-medium tracking-[0.1em] text-silver uppercase drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:text-[10px] sm:tracking-[0.14em] md:text-[11px] lg:text-[12px]">
              {reel.caption}
            </span>
          </div>
          <a
            href={reel.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleIgClick}
            aria-label={ariaHidden ? undefined : "Open on Instagram"}
            tabIndex={ariaHidden ? -1 : 0}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-silver-dim/25 bg-ink-950/70 text-silver backdrop-blur-md transition-all duration-300 hover:border-silver-dim/60 hover:bg-ink-900/90 hover:translate-x-0.5 hover:-translate-y-0.5 sm:h-7 sm:w-7 md:h-8 md:w-8"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4"
            >
              <path d="M7 17L17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function SpeakerOnIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4"
      aria-hidden
    >
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 010 7.07" />
      <path d="M19.07 4.93a10 10 0 010 14.14" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4"
      aria-hidden
    >
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
