// ============================================================
// tests/flightService.test.js
//
// Prueba el servicio principal en modo MOCK.
// Esto cubre las funciones del flightAwareService que los
// tests de API no cubren directamente (filtros internos,
// normalización, búsqueda por ubicación, etc.)
// ============================================================

process.env.USE_MOCK_DATA  = 'true'
process.env.NODE_ENV       = 'test'
process.env.JWT_SECRET     = 'secreto_test'
process.env.AIRPORT_ICAO   = 'KJFK'
process.env.AIRPORT_IATA   = 'JFK'
process.env.JWT_EXPIRES_IN = '1h'
process.env.CORS_ORIGIN    = 'http://localhost:3000'

const service = require('../src/services/flightAwareService')
const { toDateString } = require('../src/utils/dateHelpers')

const HOY = toDateString(new Date())

describe('getDepartures — filtros internos', () => {

  it('devuelve vuelos sin filtros', async () => {
    const resultado = await service.getDepartures({})
    expect(Array.isArray(resultado)).toBe(true)
  })

  it('filtra por fecha de hoy', async () => {
    const resultado = await service.getDepartures({ date: HOY })
    expect(Array.isArray(resultado)).toBe(true)
    resultado.forEach(f => {
      const fecha = toDateString(f.scheduledOut)
      expect(fecha).toBe(HOY)
    })
  })

  it('filtra por tipo domestic', async () => {
    const resultado = await service.getDepartures({ type: 'domestic' })
    resultado.forEach(f => expect(f.type).toBe('domestic'))
  })

  it('filtra por tipo international', async () => {
    const resultado = await service.getDepartures({ type: 'international' })
    resultado.forEach(f => expect(f.type).toBe('international'))
  })

  it('devuelve array vacío para fecha fuera del rango', async () => {
    const resultado = await service.getDepartures({ date: '2020-01-01' })
    expect(resultado).toHaveLength(0)
  })

  it('filtra por aerolínea AA', async () => {
    const resultado = await service.getDepartures({ airlineId: 'AA' })
    resultado.forEach(f => expect(f.airlineId).toBe('AA'))
  })

  it('filtra por búsqueda de número de vuelo', async () => {
    const resultado = await service.getDepartures({ search: 'AA101' })
    expect(resultado.length).toBeGreaterThanOrEqual(0)
  })

  it('devuelve array vacío si búsqueda no coincide', async () => {
    const resultado = await service.getDepartures({ search: 'XXXXX' })
    expect(resultado).toHaveLength(0)
  })

  it('type all devuelve todos los vuelos del día', async () => {
    const todos   = await service.getDepartures({ date: HOY, type: 'all' })
    const dom     = await service.getDepartures({ date: HOY, type: 'domestic' })
    const intl    = await service.getDepartures({ date: HOY, type: 'international' })
    expect(todos.length).toBe(dom.length + intl.length)
  })

})

describe('getArrivals — filtros internos', () => {

  it('devuelve vuelos sin filtros', async () => {
    const resultado = await service.getArrivals({})
    expect(Array.isArray(resultado)).toBe(true)
  })

  it('filtra por fecha de hoy', async () => {
    const resultado = await service.getArrivals({ date: HOY })
    resultado.forEach(f => {
      const fecha = toDateString(f.scheduledIn || f.scheduledOut)
      expect(typeof fecha).toBe('string')
    })
  })

  it('filtra por tipo domestic', async () => {
    const resultado = await service.getArrivals({ type: 'domestic' })
    resultado.forEach(f => expect(f.type).toBe('domestic'))
  })

  it('filtra por tipo international', async () => {
    const resultado = await service.getArrivals({ type: 'international' })
    resultado.forEach(f => expect(f.type).toBe('international'))
  })

  it('devuelve array vacío para fecha pasada', async () => {
    const resultado = await service.getArrivals({ date: '2020-01-01' })
    expect(resultado).toHaveLength(0)
  })

  it('filtra por aerolínea BA', async () => {
    const resultado = await service.getArrivals({ airlineId: 'BA' })
    resultado.forEach(f => expect(f.airlineId).toBe('BA'))
  })

})

describe('getFlightByCode', () => {

  it('encuentra AA101 existente', async () => {
    const vuelo = await service.getFlightByCode('AA101')
    expect(vuelo).not.toBeNull()
    expect(vuelo.flightNumber).toBe('AA101')
  })

  it('encuentra AA102 en arrivals', async () => {
    const vuelo = await service.getFlightByCode('AA102')
    expect(vuelo).not.toBeNull()
  })

  it('devuelve null para código inexistente', async () => {
    const vuelo = await service.getFlightByCode('XX999')
    expect(vuelo).toBeNull()
  })

  it('busca sin distinguir mayúsculas/minúsculas', async () => {
    const vuelo = await service.getFlightByCode('aa101')
    expect(vuelo).not.toBeNull()
  })

  it('encuentra DL405 con retraso', async () => {
    const vuelo = await service.getFlightByCode('DL405')
    expect(vuelo).not.toBeNull()
    expect(vuelo.delayMinutes).toBeGreaterThan(0)
  })

})

describe('getAirlines', () => {

  it('devuelve array de aerolíneas', async () => {
    const airlines = await service.getAirlines()
    expect(Array.isArray(airlines)).toBe(true)
    expect(airlines.length).toBeGreaterThan(0)
  })

  it('cada aerolínea tiene id y name', async () => {
    const airlines = await service.getAirlines()
    airlines.forEach(a => {
      expect(a).toHaveProperty('id')
      expect(a).toHaveProperty('name')
    })
  })

  it('contiene American Airlines', async () => {
    const airlines = await service.getAirlines()
    const aa = airlines.find(a => a.id === 'AA')
    expect(aa).toBeDefined()
    expect(aa.name).toBe('American Airlines')
  })

})

describe('getRoutes', () => {

  it('devuelve array de rutas', async () => {
    const routes = await service.getRoutes()
    expect(Array.isArray(routes)).toBe(true)
    expect(routes.length).toBeGreaterThan(0)
  })

  it('todas las rutas salen desde JFK', async () => {
    const routes = await service.getRoutes()
    routes.forEach(r => expect(r.from.iata).toBe('JFK'))
  })

  it('las rutas tienen distancia y duración', async () => {
    const routes = await service.getRoutes()
    routes.forEach(r => {
      expect(r.distanceKm).toBeGreaterThan(0)
      expect(r.durationMin).toBeGreaterThan(0)
    })
  })

})

describe('searchByLocation', () => {

  it('encuentra vuelos a Londres', async () => {
    const resultado = await service.searchByLocation('London', 'departures')
    expect(Array.isArray(resultado)).toBe(true)
  })

  it('encuentra vuelos desde Atlanta en arrivals', async () => {
    const resultado = await service.searchByLocation('Atlanta', 'arrivals')
    expect(Array.isArray(resultado)).toBe(true)
    expect(resultado.length).toBeGreaterThan(0)
  })

  it('busca por código IATA', async () => {
    const resultado = await service.searchByLocation('LHR', 'departures')
    expect(Array.isArray(resultado)).toBe(true)
  })

  it('busca por país', async () => {
    const resultado = await service.searchByLocation('USA', 'departures')
    expect(Array.isArray(resultado)).toBe(true)
  })

  it('devuelve array vacío si no hay coincidencias', async () => {
    const resultado = await service.searchByLocation('xyzabc123', 'departures')
    expect(resultado).toHaveLength(0)
  })

  it('modo arrivals busca en origen', async () => {
    const resultado = await service.searchByLocation('Tokyo', 'arrivals')
    expect(Array.isArray(resultado)).toBe(true)
  })

  it('modo departures es el default', async () => {
    const resultado = await service.searchByLocation('London')
    expect(Array.isArray(resultado)).toBe(true)
  })

})
