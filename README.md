# Tenpo Challenge - Frontend

Aplicación React con TypeScript para el desafío técnico de Tenpo.

## 🚀 Tech Stack

- **React 19** con TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Zustand** - State management
- **React Router v7** - Routing
- **Axios** - HTTP client
- **TanStack Virtual** - Virtualización de listas

## 📋 Requisitos Previos

- Node.js >= 22.x
- npm >= 9.x

## 🛠️ Instalación

```bash
bash
```

# Clonar repositorio

```
git clone https://github.com/FrontEdd/tenpo-challenge.git
cd tenpo-challenge
```

# Instalar dependencias

```bash
npm install
```

# Ejecutar en desarrollo

```bash
npm run dev
```

## 📦 Scripts Disponibles

```bash
npm run dev # Ejecutar en modo desarrollo
npm run build # Build de producción
npm run preview # Preview del build
npm run lint # Ejecutar ESLint
npm run lint:fix # Fix automático de ESLint
npm run format # Formatear código con Prettier
```

## 🏗️ Arquitectura

```
src/
├── config/ # Configuraciones (axios, constants)
├── contexts/ # React Contexts
├── hooks/ # Custom hooks
├── layouts/ # Layouts (Public/Private)
├── pages/ # Páginas de la aplicación
├── routes/ # Configuración de rutas
├── services/ # Servicios y API calls
├── types/ # Type definitions
└── utils/ # Utilidades y helpers
```

## 🔄 Estado del Proyecto

- [x] Setup inicial
- [ ] Configuración de autenticación
- [ ] Página de login
- [ ] Página home con lista virtualizada
- [ ] Sistema de logout

## 👨‍💻 Autor

@FrontEdd - [GitHub](https://github.com/FrontEdd)
