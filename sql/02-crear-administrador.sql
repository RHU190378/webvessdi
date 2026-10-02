-- =====================================================================
-- VESSDI · SCRIPT 2 · DEJAR AL ADMINISTRADOR
-- ANTES: en Supabase > Authentication > Users > Add user, crea tu usuario
--        con correo y contraseña (marca "Auto Confirm User").
-- LUEGO: cambia SOLO el correo que está entre comillas (aparece 1 vez)
--        por el MISMO correo del usuario y pulsa Run.
-- Si abajo aparece una fila con tu correo y rol "admin", quedó listo.
-- Si no aparece ninguna fila, el correo no coincide con el del usuario creado.
-- =====================================================================
insert into public.profiles (id, email, role)
select u.id, u.email, 'admin'
from auth.users u
where lower(u.email) = lower('CAMBIA-ESTE-CORREO@ejemplo.com')
on conflict (id) do update set role = 'admin';

select id, email, role from public.profiles where role = 'admin';
