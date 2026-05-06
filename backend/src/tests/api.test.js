process.env.USE_MOCK_DATA  = 'true'
process.env.NODE_ENV       = 'test'
process.env.JWT_SECRET     = 'secreto_de_test'
process.env.PORT           = '4001'
process.env.CORS_ORIGIN    = 'http://localhost:3000'
process.env.AIRPORT_ICAO   = 'KJFK'
process.env.AIRPORT_IATA   = 'JFK'
process.env.JWT_EXPIRES_IN = '1h'

const request = require('supertest')
const app     = require('../../server')

describe('GET /health', () => {
  it('responde 200', async () => {
    expect((await request(app).get('/health')).status).toBe(200)
  })
  it('tiene status ok', async () => {
    expect((await request(app).get('/health')).body.status).toBe('ok')
  })
  it('indica modo MOCK', async () => {
    expect((await request(app).get('/health')).body.mode).toContain('MOCK')
  })
  it('incluye el código del aeropuerto', async () => {
    expect((await request(app).get('/health')).body.airport).toBe('JFK')
  })
})

describe('GET /api/flights/departures', () => {
  it('responde 200', async () => {
    expect((await request(app).get('/api/flights/departures')).status).toBe(200)
  })
  it('devuelve array de vuelos', async () => {
    const res = await request(app).get('/api/flights/departures')
    expect(Array.isArray(res.body.data.flights)).toBe(true)
  })
  it('devuelve modo departures', async () => {
    expect((await request(app).get('/api/flights/departures')).body.data.mode).toBe('departures')
  })
  it('filtra por tipo domestic', async () => {
    expect((await request(app).get('/api/flights/departures?type=domestic')).status).toBe(200)
  })
  it('rechaza fecha inválida', async () => {
    expect((await request(app).get('/api/flights/departures?date=15-10-2024')).status).toBe(400)
  })
  it('rechaza tipo inválido', async () => {
    expect((await request(app).get('/api/flights/departures?type=invalido')).status).toBe(400)
  })
  it('acepta fecha de hoy', async () => {
    const hoy = new Date().toISOString().split('T')[0]
    expect((await request(app).get(`/api/flights/departures?date=${hoy}`)).status).toBe(200)
  })
  it('rechaza fecha pasada', async () => {
    expect((await request(app).get('/api/flights/departures?date=2020-01-01')).status).toBe(400)
  })
})

describe('GET /api/flights/arrivals', () => {
  it('responde 200', async () => {
    expect((await request(app).get('/api/flights/arrivals')).status).toBe(200)
  })
  it('devuelve modo arrivals', async () => {
    expect((await request(app).get('/api/flights/arrivals')).body.data.mode).toBe('arrivals')
  })
  it('rechaza tipo inválido', async () => {
    expect((await request(app).get('/api/flights/arrivals?type=xyz')).status).toBe(400)
  })
})

describe('GET /api/flights/search', () => {
  it('busca London y devuelve 200', async () => {
    expect((await request(app).get('/api/flights/search?q=London')).status).toBe(200)
  })
  it('rechaza query de 1 caracter', async () => {
    expect((await request(app).get('/api/flights/search?q=A')).status).toBe(400)
  })
  it('rechaza sin query', async () => {
    expect((await request(app).get('/api/flights/search')).status).toBe(400)
  })
  it('incluye el query en la respuesta', async () => {
    expect((await request(app).get('/api/flights/search?q=Tokyo')).body.data.query).toBe('Tokyo')
  })
  it('acepta modo arrivals', async () => {
    expect((await request(app).get('/api/flights/search?q=London&mode=arrivals')).body.data.mode).toBe('arrivals')
  })
  it('rechaza modo inválido', async () => {
    expect((await request(app).get('/api/flights/search?q=London&mode=xyz')).status).toBe(400)
  })
})

describe('GET /api/flights/:flightCode', () => {
  it('devuelve 200 para AA101', async () => {
    expect((await request(app).get('/api/flights/AA101')).status).toBe(200)
  })
  it('devuelve datos del vuelo', async () => {
    expect((await request(app).get('/api/flights/AA101')).body.data.flight.flightNumber).toBe('AA101')
  })
  it('devuelve 404 para vuelo inexistente', async () => {
    expect((await request(app).get('/api/flights/XX999')).status).toBe(404)
  })
  it('devuelve 400 para código muy corto', async () => {
    expect((await request(app).get('/api/flights/AB')).status).toBe(400)
  })
})

describe('GET /api/airlines', () => {
  it('responde 200', async () => {
    expect((await request(app).get('/api/airlines')).status).toBe(200)
  })
  it('devuelve array de aerolíneas', async () => {
    expect(Array.isArray((await request(app).get('/api/airlines')).body.data.airlines)).toBe(true)
  })
})

describe('GET /api/routes', () => {
  it('responde 200', async () => {
    expect((await request(app).get('/api/routes')).status).toBe(200)
  })
  it('devuelve array de rutas', async () => {
    expect(Array.isArray((await request(app).get('/api/routes')).body.data.routes)).toBe(true)
  })
  it('todas las rutas parten de JFK', async () => {
    const res = await request(app).get('/api/routes')
    res.body.data.routes.forEach(r => expect(r.from.iata).toBe('JFK'))
  })
})

describe('POST /api/auth/login', () => {
  it('rechaza sin body', async () => {
    expect((await request(app).post('/api/auth/login').send({})).status).toBe(400)
  })
  it('rechaza credenciales incorrectas', async () => {
    expect((await request(app).post('/api/auth/login').send({ username: 'admin.jfk', password: 'mala' })).status).toBe(401)
  })
  it('rechaza sin contraseña', async () => {
    expect((await request(app).post('/api/auth/login').send({ username: 'admin.jfk' })).status).toBe(400)
  })
})

describe('Rutas inexistentes', () => {
  it('devuelve 404', async () => {
    expect((await request(app).get('/api/ruta-que-no-existe')).status).toBe(404)
  })
  it('success false en 404', async () => {
    expect((await request(app).get('/api/inventado')).body.success).toBe(false)
  })
})
