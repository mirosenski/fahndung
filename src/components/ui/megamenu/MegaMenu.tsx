"use client";

import { memo } from "react";
import { DesktopMegaMenu } from "./DesktopMegaMenu";
import { MobileMegaMenu } from "./MobileMegaMenu";
import type { MegaMenuProps } from "./types";

export const MegaMenu = memo(function MegaMenu({
  menuItems,
  logo,
  className,
}: MegaMenuProps) {
  return (
    <div className={className}>
      <DesktopMegaMenu menuItems={menuItems} logo={logo} />
      <MobileMegaMenu menuItems={menuItems} />
    </div>
  );
});
