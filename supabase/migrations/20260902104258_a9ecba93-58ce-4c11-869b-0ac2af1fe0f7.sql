create policy "crm media read" on storage.objects for select to authenticated using (bucket_id = 'crm-media');
create policy "crm media admin write" on storage.objects for insert to authenticated with check (bucket_id = 'crm-media' and public.is_admin());
create policy "crm media admin update" on storage.objects for update to authenticated using (bucket_id = 'crm-media' and public.is_admin());
create policy "crm media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'crm-media' and public.is_admin());