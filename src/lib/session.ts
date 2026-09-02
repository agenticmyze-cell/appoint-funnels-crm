import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SessionInfo = {
  userId: string;
  email: string;
  fullName: string;
  role: "admin" | "client";
  clientId: string | null;
};

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    staleTime: 60_000,
    queryFn: async (): Promise<SessionInfo | null> => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return null;

      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("full_name, client_id, email").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);

      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      return {
        userId: user.id,
        email: profile?.email ?? user.email ?? "",
        fullName: profile?.full_name ?? user.email?.split("@")[0] ?? "User",
        role: isAdmin ? "admin" : "client",
        clientId: profile?.client_id ?? null,
      };
    },
  });
}

export function useIsAdmin() {
  const { data } = useSession();
  return data?.role === "admin";
}
