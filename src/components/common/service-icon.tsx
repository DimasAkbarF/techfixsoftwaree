import React from "react";
import {
  IconBrandAndroid,
  IconCpu,
  IconRefreshAlert,
  IconShieldCheck,
  IconTool,
  IconDeviceMobile,
  IconTerminal,
  IconBug,
  IconFlame,
  IconFileCode,
  IconHistory,
  IconArrowBackUp,
} from "@tabler/icons-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  IconBrandAndroid,
  IconCpu,
  IconRefreshAlert,
  IconShieldCheck,
  IconTool,
  IconDeviceMobile,
  IconTerminal,
  IconBug,
  IconFlame,
  IconFileCode,
  IconHistory,
  IconArrowBackUp,
};

export function ServiceIcon({
  name,
  className = "w-5 h-5",
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const IconComponent = (name && ICON_MAP[name]) || IconTool;
  return <IconComponent className={className} />;
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
