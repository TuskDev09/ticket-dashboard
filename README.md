# Ticket Dashboard — Frontend

Frontend SPA para el sistema de gestión de tickets de soporte. Construido con React + Vite y conectado a una API REST con autenticación JWT.

## Características

- Autenticación con JWT (access + refresh token automático)
- Rutas protegidas por sesión
- Listado, creación y detalle de tickets
- Dashboard con estadísticas y gráficos (Recharts)
- Estado global con Zustand
- Formularios con React Hook Form
- Estilos con Tailwind CSS v4

## Stack

| Tecnología | Versión |
|---|---|
| React | 19 |
| Vite | 8 |
| Tailwind CSS | 4 |
| Zustand | 5 |
| React Router | 7 |
| Axios | 1 |
| Recharts | 3 |
| React Hook Form | 7 |

## Estructura del proyecto

```
src/
├── pages/
│   ├── LoginPage.jsx
│   ├── TicketsPage.jsx
│   ├── TicketDetailPage.jsx
│   ├── NewTicketPage.jsx
│   └── DashboardPage.jsx
├── services/
│   ├── axiosInstance.js     # Interceptores JWT (refresh automático)
│   ├── authService.js
│   ├── ticketService.js
│   └── commentService.js
├── store/
│   └── authStore.js         # Estado global de sesión (Zustand)
├── hooks/
│   └── useAuth.js
├── app.jsx
└── main.jsx
```

## Requisitos

- Node.js 18+
- Backend corriendo (ver repositorio del backend)

## Instalación

```bash
git clone https://github.com/tu-usuario/ticket-dashboard.git
cd ticket-dashboard
npm install
```

## Configuración

Crea un archivo `.env` en la raíz con la URL base de tu API:

```env
VITE_API_URL=http://localhost:8000
```

Luego actualiza el `baseURL` en [src/services/axiosInstance.js](src/services/axiosInstance.js):

```js
baseURL: import.meta.env.VITE_API_URL,
```

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Vista previa del build
npm run lint      # Linting con ESLint
```

## Autenticación

El cliente maneja tokens JWT automáticamente:

- El access token se adjunta en cada request via `Authorization: Bearer <token>`
- Si el servidor responde `401`, se intenta renovar el token con el refresh token
- Si la renovación falla, la sesión se limpia y se redirige a `/login`

## Proyecto relacionado

Este repositorio es el frontend del sistema. El backend (API REST) está disponible en:
[enlace al repo del backend]
