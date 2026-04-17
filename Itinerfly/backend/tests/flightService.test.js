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

// ── getDepartures ─────────────────────────────────────────────
describe('getDepartures', () => {

  it('sin filtros devuelve array', async () => {
    const r = await service.getDepartures({})
    expect(Array.isArray(r)).toBe(true)
  })

  it('filtra por fecha de hoy', async () => {
    const r = await service.getDepartures({ date: HOY })
    r.forEach(f => expect(toDateString(f.scheduledOut)).toBe(HOY))
  })

  it('filtra por tipo domestic', async () => {
    const r = await service.getDepartures({ type: 'domestic' })
    r.forEach(f => expect(f.type).toBe('domestic'))
  })

  it('filtra por tipo international', async () => {
    const r = await service.getDepartures({ type: 'international' })
    r.forEach(f => expect(f.type).toBe('international'))
  })

  it('type all devuelve todos los del día', async () => {
    const todos = await service.getDepartures({ date: HOY, type: 'all' })
    const dom   = await service.getDepartures({ date: HOY, type: 'domestic' })
    const intl  = await service.getDepartures({ date: HOY, type: 'international' })
    expect(todos.length).toBe(dom.length + intl.length)
  })

  it('fecha pasada devuelve array vacío', async () => {
    const r = await service.getDepartures({ date: '2020-01-01' })
    expect(r).toHaveLength(0)
  })

  it('filtra por aerolínea AA', async () => {
    const r = await service.getDepartures({ airlineId: 'AA' })
    r.forEach(f => expect(f.airlineId).toBe('AA'))
  })

  it('filtra por aerolínea DL', async () => {
    const r = await service.getDepartures({ airlineId: 'DL' })
    r.forEach(f => expect(f.airlineId).toBe('DL'))
  })

  it('búsqueda por número de vuelo exacto', async () => {
    const r = await service.getDepartures({ search: 'AA101' })
    expect(r.length).toBeGreaterThanOrEqual(0)
  })

  it('búsqueda sin coincidencia devuelve vacío', async () => {
    const r = await service.getDepartures({ search: 'XXXXX' })
    expect(r).toHaveLength(0)
  })

  it('airlineId all devuelve todos', async () => {
    const todos = await service.getDepartures({ date: HOY })
    const all   = await service.getDepartures({ date: HOY, airlineId: 'all' })
    expect(todos.length).toBe(all.length)
  })

})

// ── getArrivals ───────────────────────────────────────────────
describe('getArrivals', () => {

  it('sin filtros devuelve array', async () => {
    const r = await service.getArrivals({})
    expect(Array.isArray(r)).toBe(true)
  })

  it('filtra por tipo domestic', async () => {
    const r = await service.getArrivals({ type: 'domestic' })
    r.forEach(f => expect(f.type).toBe('domestic'))
  })

  it('filtra por tipo international', async () => {
    const r = await service.getArrivals({ type: 'international' })
    r.forEach(f => expect(f.type).toBe('international'))
  })

  it('fecha pasada devuelve vacío', async () => {
    const r = await service.getArrivals({ date: '2020-01-01' })
    expect(r).toHaveLength(0)
  })

  it('filtra por aerolínea BA', async () => {
    const r = await service.getArrivals({ airlineId: 'BA' })
    r.forEach(f => expect(f.airlineId).toBe('BA'))
  })

  it('búsqueda sin coincidencia devuelve vacío', async () => {
    const r = await service.getArrivals({ search: 'XXXXX' })
    expect(r).toHaveLength(0)
  })

  it('filtra por fecha de hoy', async () => {
    const r = await service.getArrivals({ date: HOY })
    expect(Array.isArray(r)).toBe(true)
  })

})

// ── getFlightByCode ───────────────────────────────────────────
describe('getFlightByCode', () => {

  it('encuentra AA101', async () => {
    const v = await service.getFlightByCode('AA101')
    expect(v).not.toBeNull()
    expect(v.flightNumber).toBe('AA101')
  })

  it('encuentra AA102 en arrivals', async () => {
    const v = await service.getFlightByCode('AA102')
    expect(v).not.toBeNull()
  })

  it('devuelve null para código inexistente', async () => {
    const v = await service.getFlightByCode('XX999')
    expect(v).toBeNull()
  })

  it('no distingue mayúsculas', async () => {
    const v = await service.getFlightByCode('aa101')
    expect(v).not.toBeNull()
  })

  it('DL405 tiene delayMinutes > 0', async () => {
    const v = await service.getFlightByCode('DL405')
    expect(v.delayMinutes).toBeGreaterThan(0)
  })

  it('BA178 tiene status BOARDING', async () => {
    const v = await service.getFlightByCode('BA178')
    expect(v.status).toBe('BOARDING')
  })

  it('DL520 tiene status CANCELLED', async () => {
    const v = await service.getFlightByCode('DL520')
    expect(v.status).toBe('CANCELLED')
  })

  it('UA88 tiene status IN_FLIGHT', async () => {
    const v = await service.getFlightByCode('UA88')
    expect(v.status).toBe('IN_FLIGHT')
  })

})

// ── getAirlines ───────────────────────────────────────────────
describe('getAirlines', () => {

  it('devuelve array no vacío', async () => {
    const r = await service.getAirlines()
    expect(r.length).toBeGreaterThan(0)
  })

  it('cada aerolínea tiene id, name, iata', async () => {
    const r = await service.getAirlines()
    r.forEach(a => {
      expect(a).toHaveProperty('id')
      expect(a).toHaveProperty('name')
      expect(a).toHaveProperty('iata')
    })
  })

  it('contiene American Airlines', async () => {
    const r  = await service.getAirlines()
    const aa = r.find(a => a.id === 'AA')
    expect(aa.name).toBe('American Airlines')
  })

  it('contiene JetBlue', async () => {
    const r  = await service.getAirlines()
    const b6 = r.find(a => a.id === 'B6')
    expect(b6).toBeDefined()
  })

  it('contiene Lufthansa', async () => {
    const r  = await service.getAirlines()
    const lh = r.find(a => a.id === 'LH')
    expect(lh.name).toBe('Lufthansa')
  })

})

// ── getRoutes ─────────────────────────────────────────────────
describe('getRoutes', () => {

  it('devuelve array no vacío', async () => {
    const r = await service.getRoutes()
    expect(r.length).toBeGreaterThan(0)
  })

  it('todas parten desde JFK', async () => {
    const r = await service.getRoutes()
    r.forEach(route => expect(route.from.iata).toBe('JFK'))
  })

  it('tienen distanceKm y durationMin positivos', async () => {
    const r = await service.getRoutes()
    r.forEach(route => {
      expect(route.distanceKm).toBeGreaterThan(0)
      expect(route.durationMin).toBeGreaterThan(0)
    })
  })

  it('incluye ruta a Londres', async () => {
    const r    = await service.getRoutes()
    const lhr  = r.find(route => route.to.iata === 'LHR')
    expect(lhr).toBeDefined()
  })

  it('incluye ruta a Tokio', async () => {
    const r   = await service.getRoutes()
    const nrt = r.find(route => route.to.iata === 'NRT')
    expect(nrt).toBeDefined()
  })

})

// ── searchByLocation ──────────────────────────────────────────
describe('searchByLocation', () => {

  it('encuentra vuelos a Londres', async () => {
    const r = await service.searchByLocation('London', 'departures')
    expect(Array.isArray(r)).toBe(true)
  })

  it('encuentra vuelos desde Atlanta en arrivals', async () => {
    const r = await service.searchByLocation('Atlanta', 'arrivals')
    expect(r.length).toBeGreaterThan(0)
  })

  it('busca por código IATA LHR', async () => {
    const r = await service.searchByLocation('LHR', 'departures')
    expect(r.length).toBeGreaterThan(0)
  })

  it('busca por país USA en departures', async () => {
    const r = await service.searchByLocation('USA', 'departures')
    expect(r.length).toBeGreaterThan(0)
  })

  it('sin coincidencias devuelve vacío', async () => {
    const r = await service.searchByLocation('xyzabc123', 'departures')
    expect(r).toHaveLength(0)
  })

  it('modo arrivals busca en origen', async () => {
    const r = await service.searchByLocation('Tokyo', 'arrivals')
    expect(Array.isArray(r)).toBe(true)
  })

  it('departures es el modo por defecto', async () => {
    const r = await service.searchByLocation('London')
    expect(Array.isArray(r)).toBe(true)
  })

  it('búsqueda en minúsculas también funciona', async () => {
    const r = await service.searchByLocation('london', 'departures')
    expect(Array.isArray(r)).toBe(true)
  })

  it('busca por Japón en arrivals', async () => {
    const r = await service.searchByLocation('Japón', 'arrivals')
    expect(Array.isArray(r)).toBe(true)
  })

  it('busca por Frankfurt en departures', async () => {
    const r = await service.searchByLocation('Frankfurt', 'departures')
    expect(r.length).toBeGreaterThan(0)
  })

})
