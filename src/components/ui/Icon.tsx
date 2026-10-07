import {
  CodeIcon, GlobeIcon, StackIcon, PlugsIcon, ChartBarIcon, GaugeIcon, UsersIcon, ChatsCircleIcon, RobotIcon,
  MagnifyingGlassIcon, CalculatorIcon, HouseIcon, BellIcon, LockIcon, ClockIcon, FileTextIcon, FlowArrowIcon,
  WhatsappLogoIcon, SparkleIcon, BuildingsIcon, WrenchIcon, EnvelopeSimpleIcon, MapTrifoldIcon, VideoCameraIcon,
  ShieldCheckIcon, LightningIcon, HeartIcon, TargetIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { IconName } from "@/lib/schema";

const map = {
  code: CodeIcon, globe: GlobeIcon, stack: StackIcon, plugs: PlugsIcon, chart: ChartBarIcon, gauge: GaugeIcon,
  users: UsersIcon, chat: ChatsCircleIcon, robot: RobotIcon, magnifier: MagnifyingGlassIcon, calculator: CalculatorIcon,
  house: HouseIcon, bell: BellIcon, lock: LockIcon, clock: ClockIcon, file: FileTextIcon, flow: FlowArrowIcon,
  whatsapp: WhatsappLogoIcon, spark: SparkleIcon, buildings: BuildingsIcon,
  wrench: WrenchIcon, envelope: EnvelopeSimpleIcon, map: MapTrifoldIcon, video: VideoCameraIcon,
  shield: ShieldCheckIcon, lightning: LightningIcon, heart: HeartIcon, target: TargetIcon,
} satisfies Record<IconName, unknown>;

export function Icon({ name, size = 22, className }: { name: IconName; size?: number; className?: string }) {
  const C = map[name];
  return <C size={size} weight="duotone" className={className} aria-hidden />;
}
