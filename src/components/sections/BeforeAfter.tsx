import { ArrowRightIcon, CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import type { SectionData } from "@/lib/schema";
import { Shell } from "./Shell";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { Spotlight } from "../motion/Spotlight";

type Props = { section: Extract<SectionData, { type: "beforeAfter" }> };

export function BeforeAfter({ section: s }: Props) {
  return (
    <Shell id={s.id} background={s.background}>
      <div className="container-x">
        <Reveal kind={s.motion.reveal}>
          <h2 className="max-w-3xl text-[clamp(2rem,4.4vw,3.4rem)] font-bold">{s.heading}</h2>
        </Reveal>
        <div className="relative mt-12 grid gap-4 md:grid-cols-2 md:gap-10">
          <Reveal kind="fade-up" className="rounded-lg border border-dashed border-line p-7 md:p-9">
            <h3 className="font-sans text-sm font-semibold tracking-normal text-ink-muted">{s.before.title}</h3>
            <Stagger className="mt-6 space-y-4">
              {s.before.items.map((t) => (
                <StaggerItem key={t} className="flex gap-3 text-[1.02rem] text-ink-muted">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line">
                    <XIcon size={12} weight="bold" aria-hidden className="opacity-70" />
                  </span>
                  {t}
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>

          {/* flecha que "empuja" del antes al después */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 z-10 hidden size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_0_0_8px_var(--c-bg)] md:grid"
          >
            <ArrowRightIcon size={20} weight="bold" className="animate-[nudge_1.8s_ease-in-out_infinite]" />
          </span>

          <Reveal kind="fade-up" delay={0.15}>
            <Spotlight className="h-full rounded-lg border border-accent/50 bg-surface p-7 md:p-9">
              <h3 className="font-sans text-sm font-semibold tracking-normal text-accent-text">{s.after.title}</h3>
              <Stagger className="mt-6 space-y-4">
                {s.after.items.map((t) => (
                  <StaggerItem key={t} className="flex gap-3 text-[1.02rem] text-ink">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
                      <CheckIcon size={12} weight="bold" aria-hidden />
                    </span>
                    {t}
                  </StaggerItem>
                ))}
              </Stagger>
            </Spotlight>
          </Reveal>
        </div>
      </div>
    </Shell>
  );
}
