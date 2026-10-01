-- =====================================================================
-- VESSDI · SCRIPT 2 · DEJAR AL ADMINISTRADOR
-- ANTES: en Supabase > Authentication > Users > Add user, crea tu usuario
--        con correo y contraseña (marca "Auto Confirm User").
-- LUEGO: cambia el correo de abajo por el MISMO correo y pulsa Run.
-- =====================================================================
do $$
declare v_email text := 'CAMBIA-ESTE-CORREO@ejemplo.com';  -- <== escribe aquí tu correo
begin
  if not exists (select 1 from auth.users where lower(email) = lower(v_email)) then
    raise exception 'No existe un usuario con el correo %. Créalo primero en Authentication > Users.', v_email;
  end if;
  insert into public.profiles (id, email, role)
  select id, email, 'admin' from auth.users where lower(email) = lower(v_email)
  on conflict (id) do update set role = 'admin';
end $$;
