import { brandGroups, type BrandItem, type BrandCategoryFolder } from "../data/brands";
import { getLogo } from "../data/logos";
import { useInView } from "../hooks/useInView";

type ResolvedLogo = BrandItem & { folder: BrandCategoryFolder; src?: string };

const allLogos: ResolvedLogo[] = brandGroups.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    folder: group.folder,
    src: getLogo(group.folder, item.slug),
  })),
);

// Split across 4 rows (interleaved) so each row shows a mix of categories.
// Varying speeds/directions per row make the whole set feel alive, not mechanical.
const row1 = allLogos.filter((_, i) => i % 4 === 0);
const row2 = allLogos.filter((_, i) => i % 4 === 1);
const row3 = allLogos.filter((_, i) => i % 4 === 2);
const row4 = allLogos.filter((_, i) => i % 4 === 3);

export function BrandMarquee() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.08 });

  return (
    <section
      ref={ref}
      id="brands"
      className={`brand-marquee-reveal relative overflow-hidden bg-ink-950 py-12 sm:py-14 md:py-16 lg:py-20 ${
        inView ? "in-view" : ""
      }`}
    >
      <div className="mx-auto mb-10 w-full max-w-[1680px] px-4 sm:px-5 md:mb-14 md:px-6 lg:mb-16 lg:px-8 xl:px-10">
        <p className="brand-marquee-label text-[13px] font-medium tracking-[0.24em] text-muted uppercase sm:text-[14px] md:text-[15px] lg:text-[16px]">
          Trusted by the World
        </p>
        <div className="brand-marquee-rail mt-3 h-px w-24 bg-line sm:w-32" />
        <h3 className="brand-marquee-headline mt-6 font-display text-2xl leading-[1.15] font-normal text-silver sm:text-3xl md:text-4xl lg:text-5xl">
          Global brands,{" "}
          <span className="italic text-silver-dim">one stage.</span>
        </h3>
        <p className="brand-marquee-sub mt-4 max-w-xl text-[13px] leading-relaxed text-silver-dim sm:text-sm">
          Luxury hospitality, government, real-estate, media and global
          consumer brands — all have hosted Azam on their rooms, screens and
          stages.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
        <MarqueeRow logos={row1} direction="left" speed={55} />
        <MarqueeRow logos={row2} direction="right" speed={65} />
        <MarqueeRow logos={row3} direction="left" speed={60} />
        <MarqueeRow logos={row4} direction="right" speed={70} />
      </div>

    </section>
  );
}

function MarqueeRow({
  logos,
  direction,
  speed,
}: {
  logos: ResolvedLogo[];
  direction: "left" | "right";
  speed: number;
}) {
  const sequence = [...logos, ...logos];

  return (
    <div className="brand-marquee-row group relative w-full">
      <div
        className="brand-marquee-track flex w-max gap-2 sm:gap-2.5 md:gap-3 lg:gap-4"
        style={{
          animationName:
            direction === "left" ? "brand-scroll-left" : "brand-scroll-right",
          animationDuration: `${speed}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {sequence.map((logo, i) => (
          <LogoChip key={`${direction}-${logo.slug}-${i}`} logo={logo} />
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-16 md:w-24 lg:w-32"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(5,7,12,1) 0%, rgba(5,7,12,0.85) 55%, rgba(5,7,12,0) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-16 md:w-24 lg:w-32"
        style={{
          backgroundImage:
            "linear-gradient(to left, rgba(5,7,12,1) 0%, rgba(5,7,12,0.85) 55%, rgba(5,7,12,0) 100%)",
        }}
      />
    </div>
  );
}

function LogoChip({ logo }: { logo: ResolvedLogo }) {
  return (
    <div className="brand-marquee-chip group/chip flex aspect-[16/10] w-18 shrink-0 items-center justify-center rounded-md bg-white px-1.5 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-[1.05] sm:w-22.5 sm:px-2 sm:py-1.5 md:w-27.5 md:px-2.5 md:py-2 lg:w-32.5 lg:px-3 xl:w-37.5">
      {logo.src ? (
        <img
          src={logo.src}
          alt={logo.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="text-center text-[9px] leading-tight font-semibold tracking-wide text-neutral-800 sm:text-[10px]">
          {logo.name}
        </span>
      )}
    </div>
  );
}
