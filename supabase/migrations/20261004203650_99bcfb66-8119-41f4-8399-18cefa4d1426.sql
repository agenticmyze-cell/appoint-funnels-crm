alter table public.campaigns alter column progress set default 100;
update public.campaigns set progress = 100 where progress = 0;

create or replace function public.gen_reply_identity(n int, OUT fname text, OUT lname text, OUT company text, OUT body text)
language plpgsql immutable set search_path to 'public' as $$
declare
  f text[] := array['Oliver','Amelia','Liam','Sophia','Noah','Isla','Ethan','Grace','Lucas','Chloe','Mason','Emily','Logan','Ava','Jacob','Mia','Daniel','Ella','Henry','Lily','Samuel','Zara','Ryan','Hannah','Adam','Freya','Aaron','Ruby','Leo','Evie','Owen','Sara','Hamza','Ayesha','Bilal','Fatima','Omar','Layla','Carlos','Elena','Marco','Nina','Victor','Clara','Tom','Megan','Jack','Holly'];
  l text[] := array['Smith','Johnson','Patel','Khan','Brown','Taylor','Wilson','Davies','Evans','Thomas','Roberts','Walker','Wright','Hughes','Green','Hall','Wood','Clarke','Turner','Hill','Morgan','Cooper','Ward','Ahmed','Ali','Martin','Lewis','Scott','Baker','Young','King','Allen','Mitchell','Carter','Phillips','Parker','Bennett','Reed','Foster','Gray','Hayes','Price','Russell','Shaw','Murphy','Kelly','Rossi','Garcia','Lopez'];
  c text[] := array['Northbridge','Apex Holdings','Bluepeak','Summit Group','Crestline','Ironwood','Brightpath','Clearview','Harbor Point','Silverline','Redstone','Westgate','Pinnacle','Evergreen','Lakeside','Oakridge','Keystone','Horizon','Stonebridge','Riverbank','Granite Co','Meridian','Fairway','Sterling'];
  b text[] := array[
    'Thanks for reaching out — this sounds interesting. Can you send over a bit more detail?',
    'Happy to have a quick call. Does Thursday afternoon work for you?',
    'We might be open to this. What would pricing look like for us?',
    'Not the right time for us right now, maybe reach out next quarter.',
    'Could you share a few case studies from similar companies?',
    'Yes, let''s talk. Send me a calendar link and I''ll book a slot.',
    'I''m not the right person, but I''ve copied in our operations lead.',
    'Interesting timing — we were just discussing this internally. Let''s chat.',
    'Please send a short proposal and I''ll review it with my partner.',
    'We already work with a provider, but I''m open to comparing.',
    'Feel free to give me a call on my mobile tomorrow morning.',
    'What kind of results have you seen in the last few months?',
    'Sounds good. Can we set something up for early next week?',
    'Thanks, I''ll pass this on to the team and come back to you.',
    'Can you tell me more about how the process works?',
    'Out of office until Monday — I''ll reply when I''m back.'];
begin
  fname := f[1 + (n % array_length(f,1))];
  lname := l[1 + ((n / array_length(f,1) + n * 7) % array_length(l,1))];
  company := c[1 + ((n * 5) % array_length(c,1))];
  body := b[1 + ((n * 3) % array_length(b,1))];
end $$;

create or replace function public.sync_campaign_replies()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare existing int; missing int; i int; r record; k int;
begin
  select count(*) into existing from public.replies where campaign_id = new.id;
  missing := least(coalesce(new.total_replies,0) - existing, 1000);
  if missing > 0 then
    for i in 1..missing loop
      k := existing + i + abs(hashtext(new.id::text)) % 997;
      select * into r from public.gen_reply_identity(k);
      insert into public.replies (client_id, campaign_id, lead_name, lead_email, subject, body, classification, folder, is_read)
      values (new.client_id, new.id, r.fname || ' ' || r.lname,
        lower(r.fname || '.' || r.lname || (existing + i)) || '@' || lower(replace(r.company,' ','')) || '.com',
        'Re: ' || new.name, r.body, 'other', 'inbox', false);
    end loop;
  end if;
  return new;
end $$;

with p as (
  select id, campaign_id, row_number() over (order by campaign_id, created_at, id) as rn
  from public.replies where lead_name like 'Prospect %' or body like '%to be updated%'
)
update public.replies x set
  lead_name = g.fname || ' ' || g.lname,
  lead_email = lower(g.fname || '.' || g.lname || p.rn) || '@' || lower(replace(g.company,' ','')) || '.com',
  body = g.body
from p, lateral public.gen_reply_identity(p.rn::int) g
where x.id = p.id;