import { whyBrands } from "../data/content";
import { useInView } from "../hooks/useInView";

export function WhyBrands() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`why-reveal relative ${inView ? "in-view" : ""}`}
    >
      <section
        id="why-brands"
        className="relative mx-auto grid w-full max-w-[1680px] grid-rows-[auto_1fr] px-4 py-12 sm:px-5 sm:py-14 md:px-6 md:py-16 lg:px-8 lg:py-20 xl:px-10"
      >
        <div className="mb-12 md:mb-16 lg:mb-20">
          <p className="why-section-label text-[13px] font-medium tracking-[0.24em] text-muted uppercase sm:text-[14px] md:text-[15px] lg:text-[16px]">
            Why Brands Choose Azam
          </p>
          <div className="why-rail mt-3 h-px w-24 bg-line sm:w-32" />
        </div>

        <div className="flex min-h-0 flex-col justify-center">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14">
            {whyBrands.map((item, i) => {
              const cardDelay = 0.35 + i * 0.1;
              return (
                <div key={item.n} className="why-card flex flex-col gap-4">
                  <div
                    className="why-top-line h-px w-full bg-line"
                    style={{ animationDelay: `${cardDelay}s` }}
                  />

                  <div
                    className="why-content flex flex-col gap-4"
                    style={{ animationDelay: `${cardDelay + 0.28}s` }}
                  >
                    <span
                      className="why-number text-[12px] tracking-[0.12em] text-muted sm:text-[13px] sm:tracking-[0.3em]"
                      style={{ animationDelay: `${cardDelay + 0.38}s` }}
                    >
                      {item.n}
                    </span>
                    <h3 className="font-display text-xl leading-[1.15] font-normal tracking-[0.04em] text-silver uppercase sm:text-[22px] lg:text-[26px]">
                      {item.title}
                    </h3>
                    <p className="max-w-sm text-sm leading-relaxed text-silver-dim">
                      {item.body}
                    </p>
                  </div>

                  <style>{`
                    .why-reveal.in-view .why-card:nth-child(${i + 1})::after {
                      animation-delay: ${cardDelay + 0.2}s;
                    }
                  `}</style>
                </div>
              );
            })}
          </div>

          <div className="mt-16 sm:mt-20">
            <div
              className="why-bottom-divider h-px w-full bg-line"
              style={{ animationDelay: "1.36s" }}
            />
            <div className="mt-10 flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10 lg:gap-14">
              <div className="flex items-baseline gap-4 sm:gap-5">
                <span
                  className="why-stat-value font-numeric text-4xl leading-none font-normal text-silver sm:text-5xl lg:text-6xl"
                  style={{ animationDelay: "1.5s" }}
                >
                  7M+
                </span>
                <span
                  className="why-stat-label text-[12px] tracking-[0.22em] text-muted uppercase sm:text-[13px] md:text-sm"
                  style={{ animationDelay: "1.85s" }}
                >
                  Social Media Followers
                </span>
              </div>
              <div
                className="why-vertical-divider hidden h-12 w-px bg-line sm:block lg:h-14"
                style={{ animationDelay: "1.65s" }}
              />
              <div className="flex items-baseline gap-4 sm:gap-5">
                <span
                  className="why-stat-value font-numeric text-4xl leading-none font-normal text-silver sm:text-5xl lg:text-6xl"
                  style={{ animationDelay: "1.68s" }}
                >
                  UAE
                </span>
                <span
                  className="why-stat-label text-[12px] tracking-[0.22em] text-muted uppercase sm:text-[13px] md:text-sm"
                  style={{ animationDelay: "2.03s" }}
                >
                  Golden Visa Holder
                </span>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
