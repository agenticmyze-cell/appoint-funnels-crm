create or replace function public.sync_campaign_replies()
returns trigger language plpgsql security definer set search_path = public as $$
declare existing int; missing int; i int;
begin
  select count(*) into existing from public.replies where campaign_id = new.id;
  missing := least(coalesce(new.total_replies,0) - existing, 1000);
  if missing > 0 then
    for i in 1..missing loop
      insert into public.replies (client_id, campaign_id, lead_name, lead_email, subject, body, classification, folder, is_read)
      values (new.client_id, new.id, 'Prospect ' || (existing + i),
        'prospect' || (existing + i) || '@reply-pending.com',
        'Re: ' || new.name,
        'Thanks for reaching out — happy to learn more. (Reply details to be updated.)',
        'other', 'inbox', false);
    end loop;
  end if;
  return new;
end $$;
drop trigger if exists trg_sync_campaign_replies on public.campaigns;
create trigger trg_sync_campaign_replies after insert or update of total_replies on public.campaigns
for each row execute function public.sync_campaign_replies();
update public.campaigns set total_replies = total_replies;