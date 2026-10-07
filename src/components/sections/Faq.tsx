import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import type { SectionData } from "@/lib/schema";
import { Shell } from "./Shell";
import { Reveal } from "../motion/Reveal";

type Props = { section: Extract<SectionData, { type: "faq" }> };

/** <details> nativo: accesible, sin JS y con todo el texto en el HTML (FAQPage en JSON-LD). */
export function Faq({ section: s }: Props) {
  return (
    <Shell id={s.id} background={s.background}>
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <Reveal kind={s.motion.reveal} className="lg:col-span-4">
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold">{s.heading}</h2>
        </Reveal>
        <div className="lg:col-span-8">
          {s.items.map((f) => (
            <details key={f.q} className="group border-b border-line [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left">
                <h3 className="font-sans text-[1.15rem] font-semibold leading-snug tracking-normal md:text-xl">{f.q}</h3>
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-line transition-[transform,background-color] duration-300 group-open:rotate-45 group-open:bg-accent group-open:text-accent-ink">
                  <PlusIcon size={16} weight="bold" aria-hidden />
                </span>
              </summary>
              <p className="max-w-[65ch] pb-7 pr-12 text-[1.02rem] leading-relaxed text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Shell>
  );
}
