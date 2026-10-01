-- =====================================================================
-- VESSDI · SCRIPT 1 · ESQUEMA GENERAL
-- Pega TODO este archivo en Supabase > SQL Editor > New query > Run.
-- Se ejecuta una sola vez. Crea tablas, seguridad y datos iniciales.
-- =====================================================================
create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- PERFILES (usuarios) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, phone text,
  role text not null default 'cliente' check (role in ('admin','cliente')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Nadie puede volverse admin por su cuenta (solo un admin o el SQL Editor)
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_role();

-- ---------- CATÁLOGO ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, description text,
  sort_order int not null default 0, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  sku text unique, name text not null, slug text not null unique,
  description text, features text[] not null default '{}',
  price numeric(12,2) not null default 0 check (price >= 0),
  old_price numeric(12,2),
  stock int not null default 0, min_stock int not null default 0,
  active boolean not null default true, featured boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active, featured);
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null, sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_idx on public.product_images(product_id);

-- ---------- SERVICIOS ----------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, title text not null,
  short_description text, description text, problem text,
  benefits text[] not null default '{}', features text[] not null default '{}',
  applications text[] not null default '{}',
  image_url text, sort_order int not null default 0, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------- PROYECTOS ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, title text not null,
  description text, work_done text, equipment text,
  service_id uuid references public.services(id) on delete set null,
  city text, department text, project_date date,
  published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url text not null, sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_images_idx on public.project_images(project_id);

-- ---------- PEDIDOS ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity,
  user_id uuid references auth.users(id) on delete set null,
  first_name text not null, last_name text, company text,
  phone text not null, whatsapp text, email text,
  department text, city text, address text, notes text,
  subtotal numeric(12,2) not null default 0, total numeric(12,2) not null default 0,
  status text not null default 'pendiente'
    check (status in ('pendiente','confirmado','en_proceso','entregado','cancelado')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null, sku text,
  unit_price numeric(12,2) not null, quantity int not null check (quantity > 0),
  subtotal numeric(12,2) not null
);
create index if not exists order_items_idx on public.order_items(order_id);

-- ---------- COTIZACIONES ----------
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null, company text, phone text, whatsapp text, email text,
  city text, department text, service_name text, products_interest text,
  message text, budget text, attachment_path text,
  accepted_contact boolean not null default false,
  status text not null default 'nueva'
    check (status in ('nueva','en_revision','cotizada','cerrada','descartada')),
  admin_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists quotes_user_idx on public.quotes(user_id);
create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null, quantity int not null default 1 check (quantity > 0)
);

-- ---------- CONTENIDO ----------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text, phone text, message text not null,
  is_read boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null, role_company text, content text not null,
  active boolean not null default true, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null, answer text not null,
  service_slug text, sort_order int not null default 0, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------- updated_at automático ----------
do $$ declare t text; begin
  foreach t in array array['profiles','categories','products','services','projects','orders','quotes','testimonials','faqs'] loop
    execute format('drop trigger if exists %I_updated on public.%I', t, t);
    execute format('create trigger %I_updated before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ---------- SEGURIDAD (RLS) ----------
do $$ declare t text; begin
  foreach t in array array['profiles','categories','products','product_images','services','projects','project_images',
    'orders','order_items','quotes','quote_items','contact_messages','testimonials','faqs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin_all_%s" on public.%I', t, t);
    execute format('create policy "admin_all_%s" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- Lectura pública (solo lo activo/publicado)
create policy "public_read" on public.categories for select using (active);
create policy "public_read" on public.products for select using (active);
create policy "public_read" on public.product_images for select
  using (exists (select 1 from public.products p where p.id = product_id and p.active));
create policy "public_read" on public.services for select using (active);
create policy "public_read" on public.projects for select using (published);
create policy "public_read" on public.project_images for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.published));
create policy "public_read" on public.testimonials for select using (active);
create policy "public_read" on public.faqs for select using (active);

-- Cada usuario ve lo suyo
create policy "own_profile_read" on public.profiles for select using (id = auth.uid());
create policy "own_profile_update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "own_orders_read" on public.orders for select using (user_id = auth.uid());
create policy "own_order_items_read" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "own_quotes_read" on public.quotes for select using (user_id = auth.uid());
create policy "own_quote_items_read" on public.quote_items for select
  using (exists (select 1 from public.quotes q where q.id = quote_id and q.user_id = auth.uid()));

-- Visitantes pueden enviar cotizaciones y mensajes (nunca leer los de otros)
create policy "public_insert" on public.quotes for insert
  with check (status = 'nueva' and admin_notes is null and accepted_contact and (user_id is null or user_id = auth.uid()));
create policy "public_insert" on public.quote_items for insert with check (quantity > 0);
create policy "public_insert" on public.contact_messages for insert with check (length(trim(message)) > 0 and not is_read);

-- ---------- CREAR PEDIDO (precios y stock se calculan aquí, no en el navegador) ----------
create or replace function public.create_order(p_customer jsonb, p_items jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare it jsonb; prod public.products; qty int; v_id uuid := gen_random_uuid();
        v_total numeric(12,2) := 0; v_num bigint;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'carrito_vacio'; end if;
  if coalesce(trim(p_customer->>'first_name'),'') = '' or coalesce(trim(p_customer->>'phone'),'') = '' then
    raise exception 'datos_incompletos'; end if;
  insert into public.orders (id,user_id,first_name,last_name,company,phone,whatsapp,email,department,city,address,notes)
  values (v_id, auth.uid(), p_customer->>'first_name', p_customer->>'last_name', p_customer->>'company',
          p_customer->>'phone', p_customer->>'whatsapp', p_customer->>'email', p_customer->>'department',
          p_customer->>'city', p_customer->>'address', p_customer->>'notes');
  for it in select value from jsonb_array_elements(p_items) loop
    qty := greatest((it->>'quantity')::int, 1);
    select * into prod from public.products where id = (it->>'product_id')::uuid and active for update;
    if not found then raise exception 'producto_no_disponible'; end if;
    if prod.stock < qty then raise exception 'sin_stock:%', prod.name; end if;
    insert into public.order_items (order_id,product_id,product_name,sku,unit_price,quantity,subtotal)
    values (v_id, prod.id, prod.name, prod.sku, prod.price, qty, prod.price * qty);
    update public.products set stock = stock - qty where id = prod.id;
    v_total := v_total + prod.price * qty;
  end loop;
  update public.orders set subtotal = v_total, total = v_total where id = v_id returning order_number into v_num;
  return jsonb_build_object('order_number', v_num);
end $$;
grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;

-- Si un pedido se cancela, el stock vuelve al inventario
create or replace function public.restore_stock() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelado' and old.status <> 'cancelado' then
    update public.products p set stock = p.stock + oi.quantity
    from public.order_items oi where oi.order_id = new.id and oi.product_id = p.id;
  end if;
  return new;
end $$;
drop trigger if exists orders_restore_stock on public.orders;
create trigger orders_restore_stock after update of status on public.orders
  for each row execute function public.restore_stock();

-- ---------- ALMACENAMIENTO (los buckets se crean a mano en el panel) ----------
drop policy if exists "vessdi_admin_files" on storage.objects;
create policy "vessdi_admin_files" on storage.objects for all
  using (bucket_id in ('product-images','project-images','service-images','site-images','quote-attachments') and public.is_admin())
  with check (bucket_id in ('product-images','project-images','service-images','site-images','quote-attachments') and public.is_admin());
drop policy if exists "vessdi_quote_upload" on storage.objects;
create policy "vessdi_quote_upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'quote-attachments');

-- ---------- SERVICIOS INICIALES (textos generales, edítalos desde el panel) ----------
insert into public.services (slug,title,short_description,description,problem,benefits,features,applications,sort_order) values
('video-vigilancia','Video vigilancia / CCTV','Sistemas de cámaras para monitorear y proteger tus instalaciones.',
 'Instalación y configuración de sistemas de videovigilancia CCTV para el monitoreo de hogares, comercios y empresas.',
 'Falta de visibilidad y registro de lo que ocurre en tus instalaciones.',
 array['Monitoreo de tus espacios','Registro de video para consulta','Instalación profesional'],
 array['Cámaras y grabadores','Configuración de acceso remoto','Cableado ordenado'],
 array['Hogares','Comercios','Oficinas e instituciones'],1),
('incendios','Detección y alarma contra incendios','Sistemas para detectar riesgos de incendio y alertar a tiempo.',
 'Instalación de sistemas de detección y alarma contra incendios adaptados a cada espacio.',
 'Riesgo de no detectar a tiempo un incendio en tus instalaciones.',
 array['Alerta temprana','Protección de personas y bienes','Instalación profesional'],
 array['Detectores','Paneles y alarmas','Señalización de alerta'],
 array['Oficinas','Comercios','Edificios e instituciones'],2),
('cableado-estructurado','Cableado estructurado','Infraestructura de red ordenada y preparada para crecer.',
 'Diseño e instalación de cableado estructurado para redes de datos y comunicaciones.',
 'Redes desordenadas, lentas o difíciles de mantener.',
 array['Red ordenada','Facilidad de mantenimiento','Base para ampliaciones'],
 array['Cableado de datos','Puntos de red','Organización y etiquetado'],
 array['Oficinas','Comercios','Instituciones'],3),
('servidores','Configuración e instalación de servidores','Servidores configurados según las necesidades de tu negocio.',
 'Instalación y configuración de servidores para almacenar, compartir y proteger la información de tu organización.',
 'Necesidad de centralizar y proteger información y servicios.',
 array['Información centralizada','Configuración a medida','Soporte en la puesta en marcha'],
 array['Instalación','Configuración','Puesta en marcha'],
 array['Empresas','Oficinas','Instituciones'],4),
('firewall','Firewall y seguridad de red','Protección para la red y la información de tu organización.',
 'Configuración de firewall y soluciones de seguridad de red para controlar y proteger el tráfico de tu infraestructura.',
 'Riesgos de accesos no autorizados y amenazas en la red.',
 array['Mayor control de la red','Protección de la información','Configuración profesional'],
 array['Reglas de acceso','Segmentación de red','Configuración de seguridad'],
 array['Empresas','Oficinas','Instituciones'],5),
('mantenimiento-computacion','Mantenimiento y reparación de equipos','Mantenimiento y reparación de equipos de computación.',
 'Servicio de mantenimiento y reparación para mantener tus equipos de computación en buen funcionamiento.',
 'Equipos lentos, con fallas o sin mantenimiento.',
 array['Equipos en mejor estado','Menos interrupciones','Atención profesional'],
 array['Diagnóstico','Reparación','Mantenimiento preventivo'],
 array['Hogares','Comercios','Oficinas'],6),
('control-acceso','Control de acceso','Control de quién entra y cuándo, en tus instalaciones.',
 'Instalación de sistemas de control de acceso para restringir y registrar el ingreso a tus espacios.',
 'Falta de control sobre el ingreso de personas a tus instalaciones.',
 array['Ingreso controlado','Registro de accesos','Instalación profesional'],
 array['Lectores y controladores','Cerraduras eléctricas','Configuración de permisos'],
 array['Oficinas','Comercios','Instituciones'],7),
('alarmas','Alarmas de seguridad','Sistemas de alarma para proteger tu propiedad.',
 'Instalación de sistemas de alarmas de seguridad para hogares, comercios y empresas.',
 'Vulnerabilidad ante ingresos no autorizados a tu propiedad.',
 array['Aviso ante intrusiones','Disuasión','Instalación profesional'],
 array['Sensores','Sirenas','Panel de control'],
 array['Hogares','Comercios','Oficinas'],8),
('paneles-solares','Dimensionamiento e instalación de paneles solares','Cálculo y montaje de sistemas de paneles solares según tu consumo.',
 'Servicio de dimensionamiento e instalación de paneles solares: evaluamos tu necesidad de energía y dimensionamos e instalamos el sistema adecuado para tu proyecto.',
 'Necesidad de contar con una fuente de energía adecuada a tu consumo y a tu espacio.',
 array['Sistema dimensionado según tu necesidad','Instalación profesional','Alternativa de generación de energía'],
 array['Análisis de consumo','Dimensionamiento del sistema','Instalación y puesta en marcha'],
 array['Hogares','Comercios','Empresas e instituciones'],9)
on conflict (slug) do nothing;
