import type { ComponentType } from "react";
import type { SectionData, SiteData } from "@/lib/schema";
import { Hero } from "./sections/Hero";
import { Marquee } from "./sections/Marquee";
import { StickyStack } from "./sections/StickyStack";
import { Bento } from "./sections/Bento";
import { Horizontal } from "./sections/Horizontal";
import { Stats } from "./sections/Stats";
import { BeforeAfter } from "./sections/BeforeAfter";
import { Features } from "./sections/Features";
import { Faq } from "./sections/Faq";
import { Related } from "./sections/Related";
import { Cta } from "./sections/Cta";
import { RichText } from "./sections/RichText";
import { Clients } from "./sections/Clients";
import { Pipeline } from "./sections/Pipeline";
import { Portfolio } from "./sections/Portfolio";
import { SolutionIndex } from "./sections/SolutionIndex";
import { Calculator } from "./sections/Calculator";

type Registry = { [K in SectionData["type"]]: ComponentType<{ section: Extract<SectionData, { type: K }>; site: SiteData }> };

/** "type" del JSON → componente. TypeScript avisa si falta un tipo. */
export const registry: Registry = {
  hero: Hero,
  marquee: Marquee,
  stickyStack: StickyStack,
  bento: Bento,
  horizontal: Horizontal,
  stats: Stats,
  beforeAfter: BeforeAfter,
  features: Features,
  faq: Faq,
  related: Related,
  cta: Cta,
  richText: RichText,
  clients: Clients,
  pipeline: Pipeline,
  portfolio: Portfolio,
  solutionIndex: SolutionIndex,
  calculator: Calculator,
};
