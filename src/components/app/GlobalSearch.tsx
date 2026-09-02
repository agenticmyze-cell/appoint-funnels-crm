import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { listCampaigns, listClients, listLeads } from "@/lib/api";
import { useScope } from "./AppShell";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const { clientId, isAdmin } = useScope();

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", clientId],
    queryFn: () => listCampaigns(clientId ?? undefined),
    enabled: open,
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: listClients,
    enabled: open && isAdmin,
  });
  const { data: leads = [] } = useQuery({
    queryKey: ["leads", clientId],
    queryFn: () => listLeads({ clientId: clientId ?? undefined, limit: 200 }),
    enabled: open,
  });

  function go(fn: () => void) {
    onOpenChange(false);
    fn();
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search campaigns, clients, leads…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Campaigns">
          {campaigns.slice(0, 8).map((c) => (
            <CommandItem
              key={c.id}
              value={`campaign ${c.name}`}
              onSelect={() =>
                go(() => navigate({ to: "/campaigns/$id", params: { id: c.id } }))
              }
            >
              {c.name}
            </CommandItem>
          ))}
        </CommandGroup>
        {isAdmin && (
          <CommandGroup heading="Clients">
            {clients.slice(0, 8).map((c) => (
              <CommandItem
                key={c.id}
                value={`client ${c.name}`}
                onSelect={() => go(() => navigate({ to: "/clients/$id", params: { id: c.id } }))}
              >
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading="Leads">
          {leads.slice(0, 8).map((l) => (
            <CommandItem
              key={l.id}
              value={`lead ${l.email} ${l.first_name ?? ""} ${l.company ?? ""}`}
              onSelect={() => go(() => navigate({ to: "/leads" }))}
            >
              <span>{l.email}</span>
              <span className="ml-2 text-muted-foreground">{l.company}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
