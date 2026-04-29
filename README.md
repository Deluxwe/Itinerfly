# Itinerfly

**Flight Itinerary Management System for John F. Kennedy International Airport (JFK)**

Itinerfly is a full-stack web application for tracking, managing, and visualizing real-time flight information at JFK Airport. It is built on a **Service-Oriented Architecture (SOA)** and integrates with the FlightAware AeroAPI to provide live data on departures, arrivals, airlines, and routes, with a fallback mock-data mode for development and academic use.

---

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Testing](#testing)
- [Authors](#authors)
- [License](#license)

---

## Architecture

Itinerfly follows a **Service-Oriented Architecture (SOA)**, where business capabilities are exposed as independent, loosely coupled services that communicate over standard HTTP/JSON contracts.

### Architectural Principles

- **Loose coupling** — The frontend never talks directly to external providers. It consumes the backend's REST contract, which can swap its underlying data source (FlightAware live data or mock data) without any client-side change.
- **Service abstraction** — Each domain (flights, airlines, routes, authentication) is exposed as an autonomous service with its own controller, route, and responsibility boundary.
- **Reusability** — Services such as `flightAwareService` are consumed by multiple controllers (flights, airlines, routes) without duplicating logic.
- **Standard contracts** — All services expose REST endpoints under `/api/*` and exchange data in JSON, allowing any client (web, mobile, third-party) to integrate.
- **Statelessness** — Authentication is handled with stateless JWT tokens, so any service instance can serve any request, enabling horizontal scaling.
- **Discoverability** — A `/health` endpoint advertises service status, mode (MOCK / LIVE), and configured airport.

### Identified Services

| Service         | Endpoint base   | Responsibility                                                  |
|-----------------|-----------------|-----------------------------------------------------------------|
| Flight Service  | `/api/flights`  | Departures, arrivals, search by location, and flight detail     |
| Airline Service | `/api/airlines` | Airline catalog operating at JFK                                |
| Route Service   | `/api/routes`   | Route catalog between origins and destinations                  |
| Auth Service    | `/api/auth`     | Login, logout, and identity for the AMW role (JWT)              |

### High-Level Data Flow

```
[ React Frontend ]
        |
        v   (HTTPS / JSON, Bearer JWT)
[ API Gateway Layer ] -- Helmet, CORS, Rate Limiting, Auth Middleware
        |
        v
[ Service Layer ] -- Flights | Airlines | Routes | Auth
        |
        v
[ Integration Layer ] -- flightAwareService (toggle: MOCK <-> LIVE)
        |
        +--> Mock data store (in-memory, for academic / dev mode)
        +--> FlightAware AeroAPI (live external provider)
```

This separation between **presentation**, **service**, and **integration** layers is what allows the same frontend to operate against simulated data during development and against the live provider in production by flipping a single environment flag.

---

## Features

- **Real-time flight tracking** — Live departures and arrivals at JFK powered by the FlightAware AeroAPI.
- **Mock-data mode** — Switch to simulated data with a single environment variable, no API key required.
- **Advanced filtering** — Filter flights by date, flight type (domestic / international), airline, and free-text search.
- **Detailed flight view** — Inspect individual flight details by flight code.
- **Airline and route catalog** — Browse the airlines operating at JFK and the routes they cover.
- **Baggage information** — Modal with baggage policies and requirements.
- **AMW role authentication** — Secure JWT-based login for Airport Management Workers.
- **Production-grade security** — Helmet, CORS, rate limiting, and request size limits.
- **High test coverage** — Unit and integration tests for both backend and frontend.

---

## Tech Stack

### Backend
- **Node.js** + **Express 4**
- **Axios** — HTTP client for the FlightAware API
- **JWT** (`jsonwebtoken`) + **bcryptjs** — Authentication and password hashing
- **Helmet**, **CORS**, **express-rate-limit** — Security middleware
- **Morgan** — HTTP request logging
- **dotenv** — Environment variable management
- **Vitest** + **Supertest** — Testing and coverage
- **SonarQube** — Static code analysis

### Frontend
- **React 18**
- **Vite** — Build tool and dev server
- **React Router DOM**
- **Lucide React** — Icon library
- **date-fns** — Date utilities
- **Vitest** + **Testing Library** — Component and unit testing

---

## Project Structure

```
Itinerfly/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment-variable loader
│   │   ├── controllers/    # Business logic (flights, airlines, auth)
│   │   ├── routes/         # Express routers
│   │   ├── middleware/     # Auth, rate limiter, error handlers
│   │   ├── services/       # FlightAware API integration
│   │   ├── mock/           # Mock flight data
│   │   ├── utils/          # Helpers (dates, responses)
│   │   └── tests/          # Backend tests
│   ├── server.js           # App entry point
│   └── package.json
│
├── fronted/                # (sic) Frontend
│   ├── src/
│   │   ├── components/     # UI components (flights, layout, widgets, baggage)
│   │   ├── Pages/          # Homepage, WidgetsPage
│   │   ├── hooks/          # Custom React hooks (useFlights)
│   │   ├── services/       # API client
│   │   ├── data/           # Mock data
│   │   └── tests/          # Frontend tests
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or yarn / pnpm)
- A **FlightAware AeroAPI key** *(optional — only needed for live data; mock mode works without it)*

---

## Installation

Clone the repository and install dependencies for both apps:

```bash
git clone <repository-url>
cd Itinerfly

# Backend
cd backend
npm install

# Frontend
cd ../fronted
npm install
```

---

## Configuration

### Backend (`backend/.env`)

Create a `.env` file inside the `backend/` folder:

```env
# Server
PORT=4000
NODE_ENV=development

# Mock / Live switch
USE_MOCK_DATA=true

# FlightAware (only required when USE_MOCK_DATA=false)
FLIGHTAWARE_API_KEY=your_api_key_here
FLIGHTAWARE_BASE_URL=https://aeroapi.flightaware.com/aeroapi

# Airport (defaults to JFK)
AIRPORT_ICAO=KJFK
AIRPORT_IATA=JFK

# JWT
JWT_SECRET=change_this_in_production
JWT_EXPIRES_IN=8h

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Frontend (`fronted/.env`)

Optional — defaults to `http://localhost:4000/api` if omitted.

```env
VITE_API_URL=http://localhost:4000/api
```

---

## Running the Application

### Backend

```bash
cd backend
npm run dev      # Development with auto-reload (nodemon)
# or
npm start        # Production mode
```

The API will be available at `http://localhost:4000`.

### Frontend

```bash
cd fronted
npm start        # Vite dev server
# or
npm run build    # Production build
npm run preview  # Preview the production build
```

The web app will be available at the URL Vite reports (typically `http://localhost:5173`).

---

## API Endpoints

### Health
| Method | Endpoint  | Description |
|--------|-----------|-------------|
| GET    | `/health` | Service status, mode (MOCK / LIVE), and configured airport |

### Flights — `/api/flights`
| Method | Endpoint                | Description |
|--------|-------------------------|-------------|
| GET    | `/departures`           | List of departing flights (filters: `date`, `type`, `airline`, `search`) |
| GET    | `/arrivals`             | List of arriving flights (same filters as above) |
| GET    | `/search?q=&mode=`      | Search flights by origin/destination location |
| GET    | `/:flightCode`          | Detailed information for a specific flight |

### Airlines — `/api/airlines`
| Method | Endpoint   | Description |
|--------|------------|-------------|
| GET    | `/`        | List of airlines operating at JFK |
| GET    | `/routes`  | List of available routes |

### Routes — `/api/routes`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/`      | Direct access to the routes catalog |

### Authentication — `/api/auth`
| Method | Endpoint  | Description                                   |
|--------|-----------|-----------------------------------------------|
| POST   | `/login`  | Authenticate an AMW user, returns a JWT token |
| POST   | `/logout` | Invalidate session *(requires auth)*          |
| GET    | `/me`     | Current user info *(requires auth)*           |

---

## Authentication

Itinerfly implements a JWT-based authentication system for the **AMW** (Airport Management Worker) role.

- Tokens are signed with **HS256** and include `issuer` and `audience` claims.
- Default token lifetime: **8 hours** (configurable via `JWT_EXPIRES_IN`).
- Passwords are hashed with **bcrypt**.
- Login attempts are protected by a dedicated rate limiter to mitigate brute-force attacks.
- Constant-time password comparison is used to prevent timing attacks.

Default development credentials are seeded in `authController.js` for academic testing purposes — **these must be replaced before any non-academic deployment**.

---

## Testing

Both modules ship with extensive automated tests.

### Backend
```bash
cd backend
npm test                # Run the test suite
npm run test:coverage   # Run tests + generate coverage report
```

### Frontend
```bash
cd fronted
npm test                # Run the test suite
npm run test:coverage   # Run tests + generate coverage report
```

Coverage reports are generated under each project's `coverage/` directory.

---

## Authors

- **Nicolás Martínez Betancourt**
- **Juan Sebastián Gómez Franco**

---

## License

This project is distributed under an **Academic License**.

It was developed for academic and educational purposes only. Redistribution, commercial use, or deployment in production environments is not permitted without the express written consent of the authors.

Copyright (c) 2026 — Nicolás Martínez Betancourt and Juan Sebastián Gómez Franco. All rights reserved.
