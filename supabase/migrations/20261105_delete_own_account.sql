-- MapleRoute account deletion for hosted accounts.
-- Run this in Supabase Dashboard > SQL Editor > New query after the Phase 1 migration.
-- It lets a signed-in user delete only their own auth user; profiles and
-- crs_snapshots are removed by the existing on-delete-cascade rules.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := (select auth.uid());
begin
  if account_id is null then
    raise exception 'Not signed in';
  end if;

  delete from auth.users where id = account_id;
end;
$$;

revoke all on function public.delete_own_account() from public;
revoke all on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;
