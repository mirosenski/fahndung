export interface MenuItem {
  label: string;
  href?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  subItems?: MenuItem[];
}

export interface MegaMenuProps {
  menuItems?: MenuItem[];
  logo?: React.ReactNode;
  className?: string;
}

export interface DesktopMegaMenuProps {
  menuItems?: MenuItem[];
  logo?: React.ReactNode;
}

export interface MobileMegaMenuProps {
  menuItems?: MenuItem[];
}
