import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Client = Tables<"clients">;
export type Campaign = Tables<"campaigns">;
export type Lead = Tables<"leads">;
export type Reply = Tables<"replies">;
export type Opportunity = Tables<"opportunities">;
export type Testimonial = Tables<"testimonials">;
export type Screenshot = Tables<"screenshots">;
export type Step = Tables<"campaign_steps">;
export type DailyStat = Tables<"campaign_daily_stats">;
export type Activity = Tables<"lead_activities">;
export type AuditLog = Tables<"admin_activity_logs">;
export type Notification = Tables<"notifications">;

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/* ------------------------------ reads ------------------------------ */

export const listClients = async (): Promise<Client[]> =>
  unwrap(await supabase.from("clients").select("*").order("name"));

export const getClient = async (id: string): Promise<Client> =>
  unwrap(await supabase.from("clients").select("*").eq("id", id).single());

export const listCampaigns = async (clientId?: string | undefined): Promise<Campaign[]> => {
  let q = supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  if (clientId) q = q.eq("client_id", clientId);
  return unwrap(await q);
};

export const getCampaign = async (id: string): Promise<Campaign> =>
  unwrap(await supabase.from("campaigns").select("*").eq("id", id).single());

export const listSteps = async (campaignId: string): Promise<Step[]> =>
  unwrap(
    await supabase
      .from("campaign_steps")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("step_number"),
  );

export const listDailyStats = async (campaignIds?: string[], sinceDays = 30): Promise<DailyStat[]> => {
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString().slice(0, 10);
  let q = supabase.from("campaign_daily_stats").select("*").gte("day", since).order("day");
  if (campaignIds?.length) q = q.in("campaign_id", campaignIds);
  return unwrap(await q);
};

export const listLeads = async (opts: { clientId?: string | undefined; campaignId?: string | undefined; limit?: number } = {}): Promise<Lead[]> => {
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (opts.clientId) q = q.eq("client_id", opts.clientId);
  if (opts.campaignId) q = q.eq("campaign_id", opts.campaignId);
  return unwrap(await q.limit(opts.limit ?? 500));
};

export const getLead = async (id: string): Promise<Lead> =>
  unwrap(await supabase.from("leads").select("*").eq("id", id).single());

export const listReplies = async (opts: { clientId?: string | undefined; campaignId?: string } = {}): Promise<Reply[]> => {
  let q = supabase.from("replies").select("*").order("received_at", { ascending: false });
  if (opts.clientId) q = q.eq("client_id", opts.clientId);
  if (opts.campaignId) q = q.eq("campaign_id", opts.campaignId);
  return unwrap(await q.limit(300));
};

export const listReplyMessages = async (replyId: string): Promise<Tables<"reply_messages">[]> =>
  unwrap(
    await supabase.from("reply_messages").select("*").eq("reply_id", replyId).order("sent_at"),
  );

export const listOpportunities = async (clientId?: string | undefined): Promise<Opportunity[]> => {
  let q = supabase.from("opportunities").select("*").order("created_at", { ascending: false });
  if (clientId) q = q.eq("client_id", clientId);
  return unwrap(await q);
};

export const listTestimonials = async (clientId?: string | undefined): Promise<Testimonial[]> => {
  let q = supabase.from("testimonials").select("*").order("created_at", { ascending: false });
  if (clientId) q = q.eq("client_id", clientId);
  return unwrap(await q);
};

export const listScreenshots = async (clientId?: string | undefined): Promise<Screenshot[]> => {
  let q = supabase
    .from("screenshots")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (clientId) q = q.eq("client_id", clientId);
  return unwrap(await q);
};

export const listActivities = async (opts: { campaignId?: string | undefined; clientId?: string } = {}): Promise<Activity[]> => {
  let q = supabase.from("lead_activities").select("*").order("created_at", { ascending: false });
  if (opts.campaignId) q = q.eq("campaign_id", opts.campaignId);
  if (opts.clientId) q = q.eq("client_id", opts.clientId);
  return unwrap(await q.limit(200));
};

export const listAuditLogs = async (): Promise<AuditLog[]> =>
  unwrap(
    await supabase
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
  );

export const listNotifications = async (): Promise<Notification[]> =>
  unwrap(
    await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50),
  );

export const listMeetings = async (clientId?: string | undefined) => {
  let q = supabase.from("meetings").select("*").order("scheduled_at", { ascending: false });
  if (clientId) q = q.eq("client_id", clientId);
  return unwrap(await q);
};

export const getSetting = async (key: string): Promise<Tables<"settings"> | null> =>
  unwrap(await supabase.from("settings").select("*").eq("key", key).maybeSingle());

/* ------------------------------ writes ------------------------------ */

export const upsertClient = async (row: TablesInsert<"clients">) =>
  unwrap(await supabase.from("clients").upsert(row).select().single());

export const updateClient = async (id: string, patch: TablesUpdate<"clients">) =>
  unwrap(await supabase.from("clients").update(patch).eq("id", id).select().single());

export const deleteClient = async (id: string) => {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const upsertCampaign = async (row: TablesInsert<"campaigns">): Promise<Campaign> =>
  unwrap(await supabase.from("campaigns").upsert(row).select().single());

export const updateCampaign = async (id: string, patch: TablesUpdate<"campaigns">): Promise<Campaign> =>
  unwrap(await supabase.from("campaigns").update(patch).eq("id", id).select().single());

export const deleteCampaign = async (id: string) => {
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const upsertStep = async (row: TablesInsert<"campaign_steps">) =>
  unwrap(await supabase.from("campaign_steps").upsert(row, { onConflict: "campaign_id,step_number" }).select().single());

export const deleteStep = async (id: string) => {
  const { error } = await supabase.from("campaign_steps").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const insertLeads = async (rows: TablesInsert<"leads">[]) =>
  unwrap(await supabase.from("leads").insert(rows).select());

export const updateLead = async (id: string, patch: TablesUpdate<"leads">) =>
  unwrap(await supabase.from("leads").update(patch).eq("id", id).select().single());

export const deleteLead = async (id: string) => {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const insertReply = async (row: TablesInsert<"replies">) =>
  unwrap(await supabase.from("replies").insert(row).select().single());

export const updateReply = async (id: string, patch: TablesUpdate<"replies">) =>
  unwrap(await supabase.from("replies").update(patch).eq("id", id).select().single());

export const deleteReply = async (id: string) => {
  const { error } = await supabase.from("replies").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const insertReplyMessage = async (row: TablesInsert<"reply_messages">) =>
  unwrap(await supabase.from("reply_messages").insert(row).select().single());

export const upsertOpportunity = async (row: TablesInsert<"opportunities">) =>
  unwrap(await supabase.from("opportunities").upsert(row).select().single());

export const deleteOpportunity = async (id: string) => {
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const upsertTestimonial = async (row: TablesInsert<"testimonials">) =>
  unwrap(await supabase.from("testimonials").upsert(row).select().single());

export const deleteTestimonial = async (id: string) => {
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const upsertScreenshot = async (row: TablesInsert<"screenshots">) =>
  unwrap(await supabase.from("screenshots").upsert(row).select().single());

export const deleteScreenshot = async (id: string) => {
  const { error } = await supabase.from("screenshots").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const insertMeeting = async (row: TablesInsert<"meetings">) =>
  unwrap(await supabase.from("meetings").insert(row).select().single());

export const insertActivity = async (row: TablesInsert<"lead_activities">) => {
  const { error } = await supabase.from("lead_activities").insert(row);
  if (error) throw new Error(error.message);
};

export const insertNotification = async (row: TablesInsert<"notifications">) => {
  const { error } = await supabase.from("notifications").insert(row);
  if (error) throw new Error(error.message);
};

export const markNotificationRead = async (id: string) => {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) throw new Error(error.message);
};

export const saveSetting = async (key: string, value: Record<string, unknown>) => {
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value: value as never, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
};

export const logAudit = async (rows: TablesInsert<"admin_activity_logs">[]) => {
  if (!rows.length) return;
  const { data } = await supabase.auth.getUser();
  const enriched = rows.map((r) => ({
    ...r,
    actor_id: data.user?.id ?? null,
    actor_email: data.user?.email ?? null,
  }));
  const { error } = await supabase.from("admin_activity_logs").insert(enriched);
  if (error) throw new Error(error.message);
};

/* ------------------------------ storage ------------------------------ */

export async function uploadMedia(file: File, folder = "uploads"): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("crm-media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function signedUrl(path: string): Promise<string> {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const { data, error } = await supabase.storage.from("crm-media").createSignedUrl(path, 3600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
