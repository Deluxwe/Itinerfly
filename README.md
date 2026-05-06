# Itinerfly

**Sistema de Gestión de Itinerario de Vuelos para el Aeropuerto Internacional John F. Kennedy (JFK)**

Itinerfly es una aplicación web full-stack para rastrear, gestionar y visualizar información de vuelos en tiempo real en el Aeropuerto JFK. Está construida sobre una **Arquitectura Orientada a Servicios (SOA)** e integra la AeroAPI de FlightAware para proveer datos en vivo de salidas, llegadas, aerolíneas y rutas, con un modo de datos simulados para desarrollo y uso académico.

---

## Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Prerrequisitos](#prerrequisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecutar la Aplicación](#ejecutar-la-aplicación)
- [Endpoints de la API](#endpoints-de-la-api)
- [Autenticación](#autenticación)
- [Pruebas](#pruebas)
- [Autores](#autores)
- [Licencia](#licencia)

---

## Arquitectura

Itinerfly sigue una **Arquitectura Orientada a Servicios (SOA)**, donde las capacidades del negocio se exponen como servicios independientes y débilmente acoplados que se comunican mediante contratos estándar HTTP/JSON.

### Principios Arquitectónicos

- **Bajo acoplamiento** — El frontend nunca habla directamente con proveedores externos. Consume el contrato REST del backend, que puede cambiar su fuente de datos (FlightAware en vivo o datos simulados) sin ningún cambio del lado del cliente.
- **Abstracción de servicios** — Cada dominio (vuelos, aerolíneas, rutas, autenticación) se expone como un servicio autónomo con su propio controlador, ruta y límite de responsabilidad.
- **Reutilización** — Servicios como `flightAwareService` son consumidos por múltiples controladores sin duplicar lógica.
- **Contratos estándar** — Todos los servicios exponen endpoints REST bajo `/api/*` e intercambian datos en JSON, permitiendo que cualquier cliente (web, móvil, terceros) se integre.
- **Sin estado** — La autenticación se maneja con tokens JWT sin estado, de modo que cualquier instancia del servicio puede atender cualquier solicitud, habilitando el escalado horizontal.
- **Descubribilidad** — Un endpoint `/health` informa el estado del servicio, el modo (MOCK / LIVE) y el aeropuerto configurado.

### Servicios Identificados

| Servicio          | Base del Endpoint | Responsabilidad                                                      |
|-------------------|-------------------|----------------------------------------------------------------------|
| Servicio de Vuelos | `/api/flights`   | Salidas, llegadas, búsqueda por ubicación y detalle de vuelo         |
| Servicio de Aerolíneas | `/api/airlines` | Catálogo de aerolíneas que operan en JFK                        |
| Servicio de Rutas | `/api/routes`    | Catálogo de rutas entre orígenes y destinos                          |
| Servicio de Auth  | `/api/auth`      | Login, logout e identidad para el rol AMW (JWT)                      |

### Flujo de Datos General

```
[ Frontend React ]
        |
        v   (HTTPS / JSON, Bearer JWT)
[ Capa API Gateway ] -- Helmet, CORS, Rate Limiting, Middleware de Auth
        |
        v
[ Capa de Servicios ] -- Vuelos | Aerolíneas | Rutas | Auth
        |
        v
[ Capa de Integración ] -- flightAwareService (toggle: MOCK <-> LIVE)
        |
        +--> Almacén de datos simulados (en memoria, para modo dev / académico)
        +--> FlightAware AeroAPI (proveedor externo en vivo)
```

Esta separación entre capas de **presentación**, **servicio** e **integración** es lo que permite que el mismo frontend opere con datos simulados durante el desarrollo y con el proveedor en vivo en producción, cambiando una sola variable de entorno.

---

## Funcionalidades

- **Seguimiento de vuelos en tiempo real** — Salidas y llegadas en vivo en JFK mediante la AeroAPI de FlightAware.
- **Modo de datos simulados** — Cambia a datos simulados con una sola variable de entorno, sin necesidad de API key.
- **Filtrado avanzado** — Filtra vuelos por fecha, tipo (doméstico / internacional), aerolínea y búsqueda de texto libre.
- **Vista detallada de vuelo** — Consulta el detalle de un vuelo individual por código de vuelo.
- **Catálogo de aerolíneas y rutas** — Explora las aerolíneas que operan en JFK y las rutas que cubren.
- **Información de equipaje** — Modal con políticas y requisitos de equipaje.
- **Autenticación con rol AMW** — Login seguro basado en JWT para Trabajadores de Gestión Aeroportuaria.
- **Seguridad de nivel productivo** — Helmet, CORS, limitación de tasa y límites de tamaño de solicitudes.
- **Alta cobertura de pruebas** — Pruebas unitarias e integración para backend y frontend.

---

## Stack Tecnológico

### Backend
- **Node.js** + **Express 4**
- **Axios** — Cliente HTTP para la API de FlightAware
- **JWT** (`jsonwebtoken`) + **bcryptjs** — Autenticación y hashing de contraseñas
- **Helmet**, **CORS**, **express-rate-limit** — Middleware de seguridad
- **Morgan** — Registro de solicitudes HTTP
- **dotenv** — Gestión de variables de entorno
- **Vitest** + **Supertest** — Pruebas y cobertura
- **SonarQube** — Análisis estático de código

### Frontend
- **React 18**
- **Vite** — Herramienta de construcción y servidor de desarrollo
- **React Router DOM**
- **Lucide React** — Librería de íconos
- **date-fns** — Utilidades de fechas
- **Vitest** + **Testing Library** — Pruebas de componentes y unitarias

---

## Estructura del Proyecto

```
Itinerfly/
├── backend/
│   ├── src/
│   │   ├── config/         # Cargador de variables de entorno
│   │   ├── controllers/    # Lógica de negocio (vuelos, aerolíneas, auth)
│   │   ├── routes/         # Routers de Express
│   │   ├── middleware/     # Auth, limitador de tasa, manejadores de errores
│   │   ├── services/       # Integración con la API de FlightAware
│   │   ├── mock/           # Datos de vuelos simulados
│   │   ├── utils/          # Helpers (fechas, respuestas)
│   │   └── tests/          # Pruebas del backend
│   ├── server.js           # Punto de entrada de la aplicación
│   └── package.json
│
├── fronted/                # Frontend
│   ├── src/
│   │   ├── components/     # Componentes UI (vuelos, layout, widgets, equipaje)
│   │   ├── Pages/          # Homepage, WidgetsPage
│   │   ├── hooks/          # Hooks personalizados de React (useFlights)
│   │   ├── services/       # Cliente de la API
│   │   ├── data/           # Datos simulados
│   │   └── tests/          # Pruebas del frontend
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## Prerrequisitos

- **Node.js** >= 18.x
- **npm** >= 9.x (o yarn / pnpm)
- Una **API key de FlightAware AeroAPI** *(opcional — solo necesaria para datos en vivo; el modo simulado funciona sin ella)*

---

## Instalación

Clona el repositorio e instala las dependencias para ambas aplicaciones:

```bash
git clone 
cd Itinerfly

# Backend
cd backend
npm install

# Frontend
cd ../fronted
npm install
```

---

## Configuración

### Backend (`backend/.env`)

Crea un archivo `.env` dentro de la carpeta `backend/`:

```env
# Servidor
PORT=4000
NODE_ENV=development

# Alternancia Mock / Live
USE_MOCK_DATA=true

# FlightAware (solo requerido cuando USE_MOCK_DATA=false)
FLIGHTAWARE_API_KEY=tu_api_key_aqui
FLIGHTAWARE_BASE_URL=https://aeroapi.flightaware.com/aeroapi

# Aeropuerto (por defecto JFK)
AIRPORT_ICAO=KJFK
AIRPORT_IATA=JFK

# JWT
JWT_SECRET=cambiar_en_produccion
JWT_EXPIRES_IN=8h

# CORS
CORS_ORIGIN=http://localhost:3000

# Limitación de tasa
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Frontend (`fronted/.env`)

Opcional — por defecto usa `http://localhost:4000/api` si se omite.

```env
VITE_API_URL=http://localhost:4000/api
```

---

## Ejecutar la Aplicación

### Backend

```bash
cd backend
npm run dev      # Desarrollo con recarga automática (nodemon)
# o
npm start        # Modo producción
```

La API estará disponible en `http://localhost:4000`.

### Frontend

```bash
cd fronted
npm start        # Servidor de desarrollo Vite
# o
npm run build    # Construcción para producción
npm run preview  # Vista previa de la construcción
```

La aplicación web estará disponible en la URL que reporte Vite (normalmente `http://localhost:5173`).

---

## Endpoints de la API

### Salud del Sistema
| Método | Endpoint  | Descripción |
|--------|-----------|-------------|
| GET    | `/health` | Estado del servicio, modo (MOCK / LIVE) y aeropuerto configurado |

### Vuelos — `/api/flights`
| Método | Endpoint                | Descripción |
|--------|-------------------------|-------------|
| GET    | `/departures`           | Lista de vuelos de salida (filtros: `date`, `type`, `airlineId`, `search`, `locationSearch`) |
| GET    | `/arrivals`             | Lista de vuelos de llegada (mismos filtros) |
| GET    | `/search?q=&mode=`      | Búsqueda de vuelos por ubicación de origen/destino |
| GET    | `/:flightCode`          | Información detallada de un vuelo específico |

### Aerolíneas — `/api/airlines`
| Método | Endpoint   | Descripción |
|--------|------------|-------------|
| GET    | `/`        | Lista de aerolíneas que operan en JFK |
| GET    | `/routes`  | Lista de rutas disponibles |

### Rutas — `/api/routes`
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET    | `/`      | Acceso directo al catálogo de rutas |

### Autenticación — `/api/auth`
| Método | Endpoint  | Descripción                                          |
|--------|-----------|------------------------------------------------------|
| POST   | `/login`  | Autenticar un usuario AMW, retorna un token JWT      |
| POST   | `/logout` | Invalidar sesión *(requiere autenticación)*          |
| GET    | `/me`     | Información del usuario actual *(requiere auth)*     |

---

## Autenticación

Itinerfly implementa un sistema de autenticación basado en JWT para el rol **AMW** (Trabajador de Gestión Aeroportuaria).

- Los tokens se firman con **HS256** e incluyen claims de `issuer` y `audience`.
- Tiempo de vida por defecto del token: **8 horas** (configurable mediante `JWT_EXPIRES_IN`).
- Las contraseñas se hashean con **bcrypt**.
- Los intentos de login están protegidos por un limitador de tasa dedicado para mitigar ataques de fuerza bruta.
- Se usa comparación de contraseñas en tiempo constante para prevenir ataques de temporización.

Las credenciales de desarrollo por defecto están sembradas en `authController.js` para pruebas académicas — **deben reemplazarse antes de cualquier despliegue no académico**.

---

## Pruebas

Ambos módulos incluyen pruebas automatizadas extensas.

### Backend
```bash
cd backend
npm test                # Ejecutar la suite de pruebas
npm run test:coverage   # Ejecutar pruebas y generar reporte de cobertura
```

### Frontend
```bash
cd fronted
npm test                # Ejecutar la suite de pruebas
npm run test:coverage   # Ejecutar pruebas y generar reporte de cobertura
```

Los reportes de cobertura se generan en el directorio `coverage/` de cada proyecto.

---

## Autores

- **Nicolás Martínez Betancourt**
- **Juan Sebastián Gómez Franco**

---

## Licencia

Este proyecto se distribuye bajo una **Licencia Académica**.

Fue desarrollado únicamente para fines académicos y educativos. La redistribución, el uso comercial o el despliegue en entornos de producción no están permitidos sin el consentimiento expreso y por escrito de los autores.

Copyright (c) 2026 — Nicolás Martínez Betancourt y Juan Sebastián Gómez Franco. Todos los derechos reservados.
