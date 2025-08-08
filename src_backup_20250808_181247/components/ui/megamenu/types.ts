export interface MenuItem {
  label: string;
  href?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  subItems?: MenuItem[];
}

export interface DesktopMegaMenuProps {
  logo?: React.ReactNode;
}
