import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { SectionData } from "@/lib/schema";
import { SectionHeading, Shell } from "./Shell";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { Spotlight } from "../motion/Spotlight";
import { Icon } from "../ui/Icon";
import { Ambient } from "../motion/Ambient";

type Props = { section: Extract<SectionData, { type: "bento" }> };

const span = {
  lg: "lg:col-span-7 lg:row-span-2 min-h-[22rem]",
  wide: "lg:col-span-5",
  md: "lg:col-span-5",
  sm: "lg:col-span-7",
} as const;

const tone = {
  accent: "bg-accent text-accent-ink border-transparent",
  inverse: "bg-ink text-bg border-transparent",
  base: "bg-bg text-ink border-line",
  surface: "bg-surface-2 text-ink border-line",
} as const;

export function Bento({ section: s }: Props) {
  return (
    <Shell id={s.id} background={s.background}>
      <div className="container-x">
        <Reveal kind={s.motion.reveal}>
          <SectionHeading heading={s.heading} intro={s.intro} />
        </Reveal>
        <Stagger className="mt-14 grid auto-rows-[minmax(13rem,auto)] gap-4 md:grid-cols-2 lg:grid-cols-12">
          {s.cells.map((c) => {
            const strong = c.tone === "accent" || c.tone === "inverse";
            const muted = c.tone === "accent" ? "text-accent-ink/80" : c.tone === "inverse" ? "text-bg/75" : "text-ink-muted";
            const body = (
              <Spotlight className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-lg border p-7 md:p-8 ${tone[c.tone]}`}>
                {c.size !== "lg" && <Ambient icon={c.icon} className={strong ? "" : "text-accent"} />}
                <span className={`relative grid size-12 place-items-center rounded-sm ${strong ? "bg-black/10" : "bg-surface"}`}>
                  <Icon name={c.icon} size={24} className={strong ? "" : "text-accent"} />
                </span>
                <div className="relative mt-10">
                  <h3 className={`${c.size === "lg" ? "text-[clamp(2rem,3.6vw,3rem)]" : "text-2xl"} font-bold`}>{c.title}</h3>
                  <p className={`mt-3 max-w-[44ch] text-[1rem] leading-relaxed ${muted}`}>{c.body}</p>
                  {c.href && (
                    <span className="mt-6 inline-flex items-center gap-1.5 font-semibold">
                      Ver más
                      <ArrowUpRightIcon size={16} weight="bold" aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  )}
                </div>
              </Spotlight>
            );
            return (
              <StaggerItem key={c.title} className={`${span[c.size]} ${c.size === "lg" ? "md:col-span-2" : ""}`}>
                {c.href ? (
                  <Link href={c.href} className="block h-full rounded-lg" aria-label={`${c.title}: ver más`}>
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </Shell>
  );
}
