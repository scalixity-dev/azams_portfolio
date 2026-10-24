import { lazy, Suspense } from "react";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { SectionDivider } from "./components/shared/SectionDivider";

// Only Hero + About load eagerly (above the fold). Everything else is
// code-split so initial JS payload stays small and main-thread work is
// reduced for faster TBT / FCP / LCP.
const Proof = lazy(() => import("./components/Proof").then((m) => ({ default: m.Proof })));
const Social = lazy(() => import("./components/Social").then((m) => ({ default: m.Social })));
const Reels = lazy(() => import("./components/Reels").then((m) => ({ default: m.Reels })));
const Industries = lazy(() => import("./components/Industries").then((m) => ({ default: m.Industries })));
const WhyBrands = lazy(() => import("./components/WhyBrands").then((m) => ({ default: m.WhyBrands })));
const Creates = lazy(() => import("./components/Creates").then((m) => ({ default: m.Creates })));
const Formats = lazy(() => import("./components/Formats").then((m) => ({ default: m.Formats })));
const Process = lazy(() => import("./components/Process").then((m) => ({ default: m.Process })));
const MagicTrick = lazy(() => import("./components/MagicTrick").then((m) => ({ default: m.MagicTrick })));
const Contact = lazy(() => import("./components/Contact").then((m) => ({ default: m.Contact })));
const ScrollToTop = lazy(() => import("./components/ScrollToTop").then((m) => ({ default: m.ScrollToTop })));

// Minimal placeholder — matches section background so there's no visible flash
// while the chunk streams in.
const SectionFallback = () => <div className="h-[60vh] bg-ink-950" aria-hidden />;

function App() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-ink-950 text-silver">
      <Hero />
      <About />
      <SectionDivider />
      <Suspense fallback={<SectionFallback />}>
        <Proof />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionFallback />}>
        <Social />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionFallback />}>
        <Reels />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionFallback />}>
        <Industries />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionFallback />}>
        <WhyBrands />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionFallback />}>
        <Creates />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionFallback />}>
        <Formats />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionFallback />}>
        <Process />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionFallback />}>
        <MagicTrick />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionFallback />}>
        <Contact />
      </Suspense>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
    </main>
  );
}

export default App;
