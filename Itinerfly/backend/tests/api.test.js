// ============================================================
// tests/api.test.js
//
// Prueba los endpoints HTTP reales del backend usando Supertest.
// Supertest levanta el servidor en memoria (sin puerto real)
// y hace peticiones HTTP directamente.
//
// Usamos USE_MOCK_DATA=true así no necesitamos API Key.
// ============================================================

process.env.USE_MOCK_DATA  = 'true'
process.env.NODE_ENV       = 'test'
process.env.JWT_SECRET     = 'secreto_de_test'
process.env.PORT           = '4001'
process.env.CORS_ORIGIN    = 'http://localhost:3000'
process.env.AIRPORT_ICAO   = 'KJFK'
process.env.AIRPORT_IATA   = 'JFK'
process.env.JWT_EXPIRES_IN = '1h'

const request = require('supertest')
const app     = require('../server')

// ── Health check ─────────────────────────────────────────────
describe('GET /health', () => {

  it('responde 200', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })

  it('tiene status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.body.status).toBe('ok')
  })

  it('indica modo MOCK', async () => {
    const res = await request(app).get('/health')
    expect(res.body.mode).toContain('MOCK')
  })

  it('incluye el código del aeropuerto', async () => {
    const res = await request(app).get('/health')
    expect(res.body.airport).toBe('JFK')
  })

})

// ── Salidas ───────────────────────────────────────────────────
describe('GET /api/flights/departures', () => {

  it('responde 200', async () => {
    const res = await request(app).get('/api/flights/departures')
    expect(res.status).toBe(200)
  })

  it('success es true', async () => {
    const res = await request(app).get('/api/flights/departures')
    expect(res.body.success).toBe(true)
  })

  it('devuelve un array de vuelos', async () => {
    const res = await request(app).get('/api/flights/departures')
    expect(Array.isArray(res.body.data.flights)).toBe(true)
  })

  it('devuelve el modo departures', async () => {
    const res = await request(app).get('/api/flights/departures')
    expect(res.body.data.mode).toBe('departures')
  })

  it('incluye el count de vuelos', async () => {
    const res = await request(app).get('/api/flights/departures')
    expect(typeof res.body.data.count).toBe('number')
  })

  it('filtra por tipo domestic', async () => {
    const res = await request(app).get('/api/flights/departures?type=domestic')
    expect(res.status).toBe(200)
    res.body.data.flights.forEach(f => {
      expect(f.type).toBe('domestic')
    })
  })

  it('filtra por tipo international', async () => {
    const res = await request(app).get('/api/flights/departures?type=international')
    expect(res.status).toBe(200)
    res.body.data.flights.forEach(f => {
      expect(f.type).toBe('international')
    })
  })

  it('rechaza fecha con formato inválido', async () => {
    const res = await request(app).get('/api/flights/departures?date=15-10-2024')
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('rechaza tipo de vuelo inválido', async () => {
    const res = await request(app).get('/api/flights/departures?type=invalido')
    expect(res.status).toBe(400)
  })

  it('acepta fecha en formato YYYY-MM-DD', async () => {
    const hoy = new Date().toISOString().split('T')[0]
    const res = await request(app).get(`/api/flights/departures?date=${hoy}`)
    expect(res.status).toBe(200)
  })

})

// ── Llegadas ──────────────────────────────────────────────────
describe('GET /api/flights/arrivals', () => {

  it('responde 200', async () => {
    const res = await request(app).get('/api/flights/arrivals')
    expect(res.status).toBe(200)
  })

  it('devuelve el modo arrivals', async () => {
    const res = await request(app).get('/api/flights/arrivals')
    expect(res.body.data.mode).toBe('arrivals')
  })

  it('devuelve array de vuelos', async () => {
    const res = await request(app).get('/api/flights/arrivals')
    expect(Array.isArray(res.body.data.flights)).toBe(true)
  })

  it('rechaza tipo inválido', async () => {
    const res = await request(app).get('/api/flights/arrivals?type=xyz')
    expect(res.status).toBe(400)
  })

})

// ── Búsqueda por ubicación ────────────────────────────────────
describe('GET /api/flights/search', () => {

  it('busca por ciudad y devuelve 200', async () => {
    const res = await request(app).get('/api/flights/search?q=London')
    expect(res.status).toBe(200)
  })

  it('devuelve array de resultados', async () => {
    const res = await request(app).get('/api/flights/search?q=Atlanta')
    expect(Array.isArray(res.body.data.flights)).toBe(true)
  })

  it('rechaza query menor a 2 caracteres', async () => {
    const res = await request(app).get('/api/flights/search?q=A')
    expect(res.status).toBe(400)
  })

  it('rechaza si no hay query', async () => {
    const res = await request(app).get('/api/flights/search')
    expect(res.status).toBe(400)
  })

  it('incluye el query en la respuesta', async () => {
    const res = await request(app).get('/api/flights/search?q=Tokyo')
    expect(res.body.data.query).toBe('Tokyo')
  })

  it('acepta modo arrivals', async () => {
    const res = await request(app).get('/api/flights/search?q=London&mode=arrivals')
    expect(res.status).toBe(200)
    expect(res.body.data.mode).toBe('arrivals')
  })

  it('rechaza modo inválido', async () => {
    const res = await request(app).get('/api/flights/search?q=London&mode=xyz')
    expect(res.status).toBe(400)
  })

})

// ── Detalle de vuelo ──────────────────────────────────────────
describe('GET /api/flights/:flightCode', () => {

  it('devuelve 200 para un vuelo existente', async () => {
    const res = await request(app).get('/api/flights/AA101')
    expect(res.status).toBe(200)
  })

  it('devuelve los datos del vuelo', async () => {
    const res = await request(app).get('/api/flights/AA101')
    expect(res.body.data.flight).toBeDefined()
    expect(res.body.data.flight.flightNumber).toBe('AA101')
  })

  it('devuelve 404 para vuelo inexistente', async () => {
    const res = await request(app).get('/api/flights/XX999')
    expect(res.status).toBe(404)
  })

  it('devuelve 400 para código muy corto', async () => {
    const res = await request(app).get('/api/flights/AB')
    expect(res.status).toBe(400)
  })

  it('sanitiza caracteres especiales en el código', async () => {
    const res = await request(app).get('/api/flights/AA-101')
    expect(res.status).toBe(200)
  })

})

// ── Aerolíneas ────────────────────────────────────────────────
describe('GET /api/airlines', () => {

  it('responde 200', async () => {
    const res = await request(app).get('/api/airlines')
    expect(res.status).toBe(200)
  })

  it('devuelve array de aerolíneas', async () => {
    const res = await request(app).get('/api/airlines')
    expect(Array.isArray(res.body.data.airlines)).toBe(true)
  })

  it('las aerolíneas tienen nombre e iata', async () => {
    const res = await request(app).get('/api/airlines')
    res.body.data.airlines.forEach(a => {
      expect(a).toHaveProperty('name')
      expect(a).toHaveProperty('iata')
    })
  })

})

// ── Rutas ─────────────────────────────────────────────────────
describe('GET /api/routes', () => {

  it('responde 200', async () => {
    const res = await request(app).get('/api/routes')
    expect(res.status).toBe(200)
  })

  it('devuelve array de rutas', async () => {
    const res = await request(app).get('/api/routes')
    expect(Array.isArray(res.body.data.routes)).toBe(true)
  })

  it('todas las rutas parten desde JFK', async () => {
    const res = await request(app).get('/api/routes')
    res.body.data.routes.forEach(r => {
      expect(r.from.iata).toBe('JFK')
    })
  })

})

// ── Autenticación ─────────────────────────────────────────────
describe('POST /api/auth/login', () => {

  it('rechaza sin body', async () => {
    const res = await request(app).post('/api/auth/login').send({})
    expect(res.status).toBe(400)
  })

  it('rechaza credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin.jfk', password: 'clave-mala' })
    expect(res.status).toBe(401)
  })

  it('rechaza sin contraseña', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin.jfk' })
    expect(res.status).toBe(400)
  })

  it('rechaza sin usuario', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'clave' })
    expect(res.status).toBe(400)
  })

  it('success false con credenciales malas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nadie', password: 'nada' })
    expect(res.body.success).toBe(false)
  })

})

// ── Rutas no encontradas ──────────────────────────────────────
describe('Rutas inexistentes', () => {

  it('devuelve 404 para ruta no definida', async () => {
    const res = await request(app).get('/api/ruta-que-no-existe')
    expect(res.status).toBe(404)
  })

  it('devuelve success false en el 404', async () => {
    const res = await request(app).get('/api/inventado')
    expect(res.body.success).toBe(false)
  })

})
