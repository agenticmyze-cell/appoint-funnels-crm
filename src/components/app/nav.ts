import {
  BarChart3,
  Building2,
  Inbox,
  LayoutGrid,
  MessageSquareQuote,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  Images,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  adminOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/campaigns", label: "Campaigns", icon: Send },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/opportunities", label: "Opportunities", icon: Target },
  { to: "/clients", label: "Clients", icon: Building2, adminOnly: true },
  { to: "/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/results", label: "Results", icon: Trophy },
  { to: "/screenshots", label: "Screenshots", icon: Images },
  { to: "/admin", label: "Admin Console", icon: ShieldCheck, adminOnly: true },
  { to: "/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export const BRAND_ICON = Sparkles;
