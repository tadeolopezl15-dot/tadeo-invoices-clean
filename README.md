# Tadeo Billing & Invoices

Aplicación full stack con:

- Landing page estilo invoice
- Registro e inicio de sesión con Supabase
- Dashboard privado
- Crear facturas
- Enlace público por token
- Descarga PDF
- Página de membresías
- Checkout con Stripe
- Webhook para actualizar el plan del usuario

## 1) Instalar

```bash
npm install
```

## 2) Variables de entorno

Copia `.env.example` a `.env.local` y completa tus datos.

## 3) Base de datos en Supabase

Ejecuta el archivo:

```sql
sql/schema.sql
```

en el SQL Editor de Supabase.

## 4) Ejecutar en desarrollo

```bash
npm run dev
```

## 5) Stripe

En Stripe crea 3 precios y pega sus IDs en:

- `STRIPE_PRICE_ID_STARTER`
- `STRIPE_PRICE_ID_PRO`
- `STRIPE_PRICE_ID_BUSINESS`

Configura el webhook apuntando a:

```bash
http://localhost:3000/api/stripe/webhook
```

## 6) Qué falta configurar por tu lado

Para que funcione 100% necesitas:

- Tu proyecto real de Supabase
- Tus claves reales
- Tus precios reales de Stripe
- El dominio final en `NEXT_PUBLIC_SITE_URL`

## Rutas principales

- `/` landing
- `/login`
- `/signup`
- `/pricing`
- `/dashboard`
- `/invoice/new`
- `/invoice/[token]` factura pública

## Nota

La app ya queda preparada con backend real, pero sin tus claves no puede conectarse todavía.
