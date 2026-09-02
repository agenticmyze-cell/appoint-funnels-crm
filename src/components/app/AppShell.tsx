import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Bell,
  Check,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  PanelsTopLeft,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listClients, listNotifications, markNotificationRead } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { initials, relative } from "@/lib/format";
import { NAV_ITEMS } from "./nav";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalSearch } from "./GlobalSearch";

/* ---------------------------- client scope ---------------------------- */

type ScopeCtx = {
  clientId: string | null;
  setClientId: (id: string | null) => void;
  isAdmin: boolean;
  ready: boolean;
};

const ScopeContext = createContext<ScopeCtx>({
  clientId: null,
  setClientId: () => {},
  isAdmin: false,
  ready: false,
});

export function useScope() {
  return useContext(ScopeContext);
}

/* ---------------------------- sidebar ---------------------------- */

function Sidebar({
  collapsed,
  onToggle,
  isAdmin,
}: {
  collapsed: boolean;
  onToggle: () => void;
  isAdmin: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = NAV_ITEMS.filter((i) => !i.adminOnly || isAdmin);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-150",
        collapsed ? "w-[60px]" : "w-[212px]",
      )}
    >
      <div className="flex h-12 items-center gap-2 border-b border-border px-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary">
          <PanelsTopLeft className="size-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[12px] font-bold tracking-tight text-foreground">
              APPOINT FUNNELS
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              CRM
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-[7px] text-[13px] font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <item.icon className="size-[17px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        className="flex h-10 items-center gap-2 border-t border-border px-3 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        {!collapsed && "Collapse"}
      </button>
    </aside>
  );
}

/* ---------------------------- notifications ---------------------------- */

function NotificationsBell() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });
  const read = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const unread = data.filter((n) => !n.is_read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.06em]">
            Notifications
          </span>
          <span className="text-[11px] text-muted-foreground">{unread} unread</span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {data.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
              Nothing new right now.
            </p>
          ) : (
            data.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "border-b border-border px-3 py-2.5 last:border-b-0",
                  !n.is_read && "bg-primary-soft/40",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-foreground">{n.title}</p>
                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => read.mutate(n.id)}
                      className="text-muted-foreground hover:text-primary"
                      title="Mark read"
                    >
                      <Check className="size-3.5" />
                    </button>
                  )}
                </div>
                {n.body && <p className="mt-0.5 text-[12px] text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-[11px] text-muted-foreground/70">{relative(n.created_at)}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ---------------------------- topbar ---------------------------- */

function Topbar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { data: session } = useSession();
  const { isAdmin, clientId, setClientId } = useScope();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: listClients,
    enabled: isAdmin,
  });

  const current = clients.find((c) => c.id === clientId);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex h-8 w-full max-w-sm items-center gap-2 rounded-md border border-border bg-card px-2.5 text-[13px] text-muted-foreground hover:border-border-strong"
      >
        <Search className="size-3.5" />
        Search campaigns, leads, clients…
        <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-[12px] font-medium">
                {current ? current.name : "All clients"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.06em]">
                Client scope
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setClientId(null)}>All clients</DropdownMenuItem>
              <DropdownMenuSeparator />
              {clients.map((c) => (
                <DropdownMenuItem key={c.id} onClick={() => setClientId(c.id)}>
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <NotificationsBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 items-center gap-2 rounded-md border border-border bg-card pl-1 pr-2"
            >
              <span className="flex size-6 items-center justify-center rounded bg-primary-soft text-[11px] font-bold text-primary">
                {initials(session?.fullName)}
              </span>
              <span className="hidden text-[12px] font-medium text-foreground sm:inline">
                {session?.fullName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-[13px] font-semibold">{session?.fullName}</div>
              <div className="text-[11px] font-normal text-muted-foreground">{session?.email}</div>
              <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.06em] text-primary">
                {session?.role}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="size-3.5" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

/* ---------------------------- shell ---------------------------- */

export function AppShell({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const isAdmin = session?.role === "admin";
  const [collapsed, setCollapsed] = useState(false);
  const [scopeId, setScopeId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("af-sidebar") === "1");
    const saved = localStorage.getItem("af-scope");
    if (saved) setScopeId(saved);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      localStorage.setItem("af-sidebar", c ? "0" : "1");
      return !c;
    });
  }, []);

  const setClientId = useCallback((id: string | null) => {
    setScopeId(id);
    if (id) localStorage.setItem("af-scope", id);
    else localStorage.removeItem("af-scope");
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scope = useMemo<ScopeCtx>(
    () => ({
      isAdmin: !!isAdmin,
      clientId: isAdmin ? scopeId : (session?.clientId ?? null),
      setClientId,
      ready: !!session,
    }),
    [isAdmin, scopeId, session, setClientId],
  );

  return (
    <ScopeContext.Provider value={scope}>
      <div className="flex min-h-screen w-full bg-surface">
        <Sidebar collapsed={collapsed} onToggle={toggle} isAdmin={!!isAdmin} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenSearch={() => setSearchOpen(true)} />
          <main className="min-w-0 flex-1 p-4">{children}</main>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </ScopeContext.Provider>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[19px] font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
