import type { ReactNode } from "react";

type Props = {
  id?: string;
  label: string;
  page?: string;
  children: ReactNode;
  className?: string;
};

export function SectionShell({ id, label, children, className = "" }: Props) {
  return (
    <section
      id={id}
      className={`relative mx-auto grid w-full max-w-[1680px] grid-rows-[auto_1fr] px-4 py-12 sm:px-5 sm:py-14 md:px-6 md:py-16 lg:px-8 lg:py-20 xl:px-10 ${className}`}
    >
      <div className="mb-8 md:mb-10 lg:mb-12">
        <p className="text-[13px] font-medium tracking-[0.24em] text-muted uppercase sm:text-[14px] md:text-[15px] lg:text-[16px]">
          {label}
        </p>
        <div className="mt-3 h-px w-24 bg-line sm:w-32" />
      </div>

      <div className="flex min-h-0 flex-col justify-center">{children}</div>
    </section>
  );
}
