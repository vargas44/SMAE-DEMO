import type { ReactNode } from "react";

/** Iconos didácticos por grupo SMAE. Trazo simple, 24×24. */

type IconProps = { color?: string };

function Svg({ color = "currentColor", children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function IconWheat(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21V8" />
      <path d="M12 8c2-2 4.5-2.5 6-1-1.5 2-4 3-6 3" />
      <path d="M12 8c-2-2-4.5-2.5-6-1 1.5 2 4 3 6 3" />
      <path d="M12 12c2-1.6 4.2-1.8 5.5-.6-1.2 1.8-3.4 2.6-5.5 2.6" />
      <path d="M12 12c-2-1.6-4.2-1.8-5.5-.6 1.2 1.8 3.4 2.6 5.5 2.6" />
      <path d="M12 16c1.8-1.2 3.6-1.3 4.8-.4-1 1.4-2.8 2-4.8 2" />
      <path d="M12 16c-1.8-1.2-3.6-1.3-4.8-.4 1 1.4 2.8 2 4.8 2" />
    </Svg>
  );
}

function IconMeat(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 14c0-4 3-8 8-8 4 0 6 3 6 6 0 4-3 7-8 7-3 0-6-2-6-5z" />
      <path d="M10 10c1.2-.4 2.5-.3 3.5.4" />
    </Svg>
  );
}

function IconLeaf(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 19c8-1 12-6 14-14-8 2-13 6-14 14z" />
      <path d="M8 16c2-2 5-4 9-5" />
    </Svg>
  );
}

function IconFruit(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21c4.4 0 7-3.2 7-7.2 0-5-3.4-8.8-7-8.8S5 8.8 5 13.8C5 17.8 7.6 21 12 21z" />
      <path d="M12 5c1-2 3-3 4.5-3-1 2-2.2 3-4.5 3z" />
    </Svg>
  );
}

function IconMilk(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 8h8l1 12H7L8 8z" />
      <path d="M9 8V5h6v3" />
      <path d="M9 5h6l-.8-2H9.8L9 5z" />
    </Svg>
  );
}

function IconOil(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4c0 3 4 6.5 4 10a4 4 0 11-8 0c0-3.5 4-7 4-10z" />
    </Svg>
  );
}

function IconSugar(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 20h8l2-10H6l2 10z" />
      <path d="M12 6V4" />
      <path d="M9 7.5c1-2 5-2 6 0" />
    </Svg>
  );
}

function IconBeans(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 8c-2 2-2.5 6 0 8 2.2 1.8 5 .8 6-1.5" />
      <path d="M16 7c2 2 2.2 6-.2 8-2 1.6-4.5.6-5.5-1.4" />
      <path d="M9.2 10.2c.4-.6 1-.8 1.6-.6" />
      <path d="M13.5 9.5c.5-.5 1.1-.6 1.7-.3" />
    </Svg>
  );
}

const BY_CODE: Record<string, (props: IconProps) => ReactNode> = {
  CER: IconWheat,
  AOA_B: IconMeat,
  AOA_M: IconMeat,
  VEG: IconLeaf,
  FRU: IconFruit,
  LAC_D: IconMilk,
  LAC_S: IconMilk,
  GRA: IconOil,
  AZU: IconSugar,
  LEG: IconBeans,
};

export function GroupFoodIcon({ code, color }: { code: string; color?: string }) {
  const Icon = BY_CODE[code] ?? IconLeaf;
  return <Icon color={color} />;
}
