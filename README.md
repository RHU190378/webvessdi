# VESSDI · Sitio web (React + Vite + Supabase)

## PARTE 1 · SUPABASE (todo desde el panel web)
1. Entra a https://supabase.com, crea un proyecto nuevo y espera a que termine de crearse.
2. (Si ya habías ejecutado el script 1 antes de esta actualización, ejecuta también `sql/03-agregar-servicio-paneles-solares.sql`.)
   Menú izquierdo **SQL Editor** > **New query**. Abre el archivo `sql/01-schema.sql`, copia TODO, pégalo y pulsa **Run**. Debe decir "Success".
3. Menú **Authentication** > **Users** > **Add user** > **Create new user**. Escribe el correo y la contraseña del administrador y marca **Auto Confirm User**.
4. Vuelve a **SQL Editor** > **New query**. Abre `sql/02-crear-administrador.sql`, cambia `CAMBIA-ESTE-CORREO@ejemplo.com` por el correo del paso 3 (el mismo), pega y pulsa **Run**.
5. **Authentication** > **Sign In / Providers** > **Email**: desactiva **Confirm email** y guarda. (Así los usuarios que crees desde el sistema podrán ingresar de inmediato.)
6. Menú **Storage** > **New bucket**. Crea estos 5 con el nombre EXACTO:
   - `product-images` → **Public bucket: activado**
   - `project-images` → **Public bucket: activado**
   - `service-images` → **Public bucket: activado**
   - `site-images` → **Public bucket: activado**
   - `quote-attachments` → **Public bucket: desactivado** (privado)
7. **Project Settings** > **API** (o "Data API / API Keys"): copia **Project URL** y la clave **anon / publishable**.

## PARTE 2 · NETLIFY
1. Sube esta carpeta a un repositorio de GitHub (en github.com: New repository > "uploading an existing file" y arrastra los archivos; NO subas `.env`).
2. En https://netlify.com: **Add new site** > **Import an existing project** > elige tu repositorio.
3. Configuración de build: comando `npm run build`, carpeta `dist` (ya viene en `netlify.toml`).
4. **Site configuration** > **Environment variables** > agrega:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = clave anon/publishable
5. **Deploy**. Cuando termine, entra a tu sitio > `/login` con el correo y contraseña del administrador.
6. Cambia `TU-SITIO.netlify.app` por tu dirección real en `public/sitemap.xml` y `public/robots.txt`.

## Probar en tu computadora (opcional)
Copia `.env.example` a `.env`, completa las dos variables, y ejecuta `npm install` y `npm run dev`.

## Cómo usar el panel (/admin)
Crea categorías → productos (guarda y luego sube fotos) → proyectos reales → testimonios y preguntas frecuentes reales. Más usuarios: **Usuarios > Crear usuario**.

## Excel de productos
En Admin > Productos: **Exportar a Excel**, **Descargar plantilla** e **Importar desde Excel** (el archivo trae una hoja "Instrucciones").

## Notas
- El número de WhatsApp usa el código de Bolivia (591): `src/lib/site.ts`.
- Logo: `public/logo.png` (cabecera, pie y panel) y `public/favicon.png`. Para cambiarlos, reemplaza esos archivos.
- Colores: salen del logo y están al inicio de `src/index.css` (`:root`): azul marino #0A2643, azul acero #537593, azul claro #85A2B5.
- Los textos de servicios son generales; edítalos en Admin > Servicios. Páginas legales: contenido provisional.
- No hay pasarela de pago: los pedidos quedan "pendientes" y se coordinan por WhatsApp.
