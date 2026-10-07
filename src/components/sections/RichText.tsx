import type { SectionData } from "@/lib/schema";
import { Shell } from "./Shell";
import { Reveal } from "../motion/Reveal";

type Props = { section: Extract<SectionData, { type: "richText" }> };

export function RichText({ section: s }: Props) {
  return (
    <Shell id={s.id} background={s.background}>
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <Reveal kind={s.motion.reveal} className="lg:col-span-5">
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold">{s.heading}</h2>
        </Reveal>
        <div className="space-y-6 lg:col-span-7">
          {s.paragraphs.map((p, i) => (
            <Reveal key={i} kind="fade-up" delay={i * 0.08}>
              <p className={`max-w-[62ch] ${i === 0 ? "text-xl leading-relaxed text-ink" : "text-[1.08rem] leading-relaxed text-ink-muted"}`}>{p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Shell>
  );
}
