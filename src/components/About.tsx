import secondSectionImg from "../assets/second-section.webp";
import { StatBlock } from "./shared/StatBlock";
import { useInView } from "../hooks/useInView";

const headlineLine1 = ["You", "don't", "just", "watch", "Azam."];
const headlineLine2 = ["You", "experience", "him."];

export function About() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      id="about"
      className={`about-reveal relative w-full overflow-hidden bg-ink-950 pt-10 pb-12 sm:pt-12 sm:pb-14 md:pt-14 md:pb-16 lg:pt-16 lg:pb-20 ${
        inView ? "in-view" : ""
      }`}
    >
      <div className="relative mx-auto w-full max-w-[1680px] px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:min-h-[100svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="relative flex flex-col justify-center pt-6 pb-10 md:pt-10 lg:order-first lg:py-24">
            <div className="mb-10 md:mb-12">
              <p className="about-label text-[13px] font-medium tracking-[0.24em] text-muted uppercase sm:text-[14px] md:text-[15px] lg:text-[16px]">
                Who is Azam?
              </p>
              <div className="about-rail mt-3 h-px w-24 bg-line sm:w-32" />
            </div>

            <h2 className="font-display text-[clamp(2rem,4.2vw,3.75rem)] leading-[1.05] font-normal text-silver">
              {headlineLine1.map((word, i) => (
                <span key={`l1-${i}`} className="about-word-mask">
                  <span className="about-word">
                    {word}
                    {i < headlineLine1.length - 1 ? " " : ""}
                  </span>
                </span>
              ))}
              <br />
              <span className="italic">
                {headlineLine2.map((word, i) => (
                  <span key={`l2-${i}`} className="about-word-mask">
                    <span className="about-word">
                      {word}
                      {i < headlineLine2.length - 1 ? " " : ""}
                    </span>
                  </span>
                ))}
              </span>
            </h2>

            <div className="about-body mt-10 flex max-w-[520px] flex-col gap-5 text-[15px] leading-[1.75] text-silver-dim">
              <p>
                Azam is an illusionist and experience creator who turns impossible
                moments into powerful human reactions. His performances combine
                illusion, mentalism and audience psychology to create experiences
                that feel personal, unexpected and impossible to forget.
              </p>
              <p>
                From global brands and major events to VIP audiences, Azam doesn't
                simply perform for the room — he connects with it, surprises it
                and leaves it talking.
              </p>
            </div>

            <div className="about-divider mt-12 h-px w-full max-w-[520px] bg-line" />

            <p className="about-quote mt-6 max-w-[520px] font-display text-base leading-snug italic text-silver-dim md:text-lg">
              Meet Azam once — and you'll understand why people remember the
              experience.
            </p>

            <div className="mt-14 grid max-w-[640px] grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:gap-x-10 md:mt-20">
              <div className="about-stat">
                <StatBlock value="99+" label="Magic Shows Worldwide" />
              </div>
              <div className="about-stat">
                <StatBlock value="30+" label="TV Episodes" />
              </div>
              <div className="about-stat">
                <StatBlock value="7M+" label="Social Media Followers" />
              </div>
              <div className="about-stat">
                <StatBlock value="5B+" label="Views" />
              </div>
            </div>
          </div>

          <div
            className="relative order-first h-[55vh] w-full sm:h-[65vh] md:h-[75vh] lg:order-last lg:h-auto lg:min-h-full"
            style={{
              marginRight: "var(--about-image-bleed, 0px)",
            }}
          >
            <img
              src={secondSectionImg}
              alt="Azam holding an Ace of Spades"
              loading="lazy"
              decoding="async"
              className="about-img absolute inset-0 h-full w-full object-cover object-center"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse 55% 72% at 52% 48%, #000 0%, #000 28%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.12) 85%, transparent 100%)",
                maskImage:
                  "radial-gradient(ellipse 55% 72% at 52% 48%, #000 0%, #000 28%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.12) 85%, transparent 100%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-[45%]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(5,7,12,1) 0%, rgba(5,7,12,0.7) 40%, rgba(5,7,12,0.2) 75%, rgba(5,7,12,0) 100%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-[32%]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(5,7,12,0) 0%, rgba(5,7,12,0.25) 40%, rgba(5,7,12,0.75) 75%, rgba(5,7,12,1) 100%)",
              }}
            />
          </div>
        </div>
      </div>

    </section>
  );
}
