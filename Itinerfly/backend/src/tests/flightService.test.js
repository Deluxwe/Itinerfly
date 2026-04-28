process.env.USE_MOCK_DATA  = 'true'
process.env.NODE_ENV       = 'test'
process.env.JWT_SECRET     = 'secreto_test'
process.env.AIRPORT_ICAO   = 'KJFK'
process.env.AIRPORT_IATA   = 'JFK'
process.env.JWT_EXPIRES_IN = '1h'
process.env.CORS_ORIGIN    = 'http://localhost:3000'

const service = require('../services/flightAwareService')
const { toDateString } = require('../utils/dateHelpers')
const HOY = toDateString(new Date())

describe('getDepartures', () => {
  it('sin filtros devuelve array', async () => {
    expect(Array.isArray(await service.getDepartures({}))).toBe(true)
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
  it('fecha pasada devuelve vacío', async () => {
    expect(await service.getDepartures({ date: '2020-01-01' })).toHaveLength(0)
  })
  it('filtra por aerolínea AA', async () => {
    const r = await service.getDepartures({ airlineId: 'AA' })
    r.forEach(f => expect(f.airlineId).toBe('AA'))
  })
  it('búsqueda sin coincidencia devuelve vacío', async () => {
    expect(await service.getDepartures({ search: 'XXXXX' })).toHaveLength(0)
  })
  it('type all = domestic + international', async () => {
    const todos = await service.getDepartures({ date: HOY })
    const dom   = await service.getDepartures({ date: HOY, type: 'domestic' })
    const intl  = await service.getDepartures({ date: HOY, type: 'international' })
    expect(todos.length).toBe(dom.length + intl.length)
  })
})

describe('getArrivals', () => {
  it('sin filtros devuelve array', async () => {
    expect(Array.isArray(await service.getArrivals({}))).toBe(true)
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
    expect(await service.getArrivals({ date: '2020-01-01' })).toHaveLength(0)
  })
  it('filtra por aerolínea BA', async () => {
    const r = await service.getArrivals({ airlineId: 'BA' })
    r.forEach(f => expect(f.airlineId).toBe('BA'))
  })
})

describe('getFlightByCode', () => {
  it('encuentra AA101', async () => {
    const v = await service.getFlightByCode('AA101')
    expect(v).not.toBeNull()
    expect(v.flightNumber).toBe('AA101')
  })
  it('devuelve null para código inexistente', async () => {
    expect(await service.getFlightByCode('XX999')).toBeNull()
  })
  it('no distingue mayúsculas', async () => {
    expect(await service.getFlightByCode('aa101')).not.toBeNull()
  })
  it('DL405 tiene delayMinutes > 0', async () => {
    const v = await service.getFlightByCode('DL405')
    expect(v.delayMinutes).toBeGreaterThan(0)
  })
  it('BA178 tiene status BOARDING', async () => {
    expect((await service.getFlightByCode('BA178')).status).toBe('BOARDING')
  })
  it('DL520 tiene status CANCELLED', async () => {
    expect((await service.getFlightByCode('DL520')).status).toBe('CANCELLED')
  })
})

describe('getAirlines', () => {
  it('devuelve array no vacío', async () => {
    expect((await service.getAirlines()).length).toBeGreaterThan(0)
  })
  it('contiene American Airlines', async () => {
    const r = await service.getAirlines()
    expect(r.find(a => a.id === 'AA').name).toBe('American Airlines')
  })
  it('cada aerolínea tiene id y name', async () => {
    const r = await service.getAirlines()
    r.forEach(a => {
      expect(a).toHaveProperty('id')
      expect(a).toHaveProperty('name')
    })
  })
})

describe('getRoutes', () => {
  it('devuelve array no vacío', async () => {
    expect((await service.getRoutes()).length).toBeGreaterThan(0)
  })
  it('todas parten desde JFK', async () => {
    const r = await service.getRoutes()
    r.forEach(route => expect(route.from.iata).toBe('JFK'))
  })
  it('incluye ruta a Londres', async () => {
    const r = await service.getRoutes()
    expect(r.find(route => route.to.iata === 'LHR')).toBeDefined()
  })
})

describe('searchByLocation', () => {
  it('encuentra vuelos a Londres', async () => {
    expect(Array.isArray(await service.searchByLocation('London', 'departures'))).toBe(true)
  })
  it('encuentra vuelos desde Atlanta en arrivals', async () => {
    expect((await service.searchByLocation('Atlanta', 'arrivals')).length).toBeGreaterThan(0)
  })
  it('sin coincidencias devuelve vacío', async () => {
    expect(await service.searchByLocation('xyzabc123', 'departures')).toHaveLength(0)
  })
  it('busca por país USA', async () => {
    expect((await service.searchByLocation('USA', 'departures')).length).toBeGreaterThan(0)
  })
  it('busca por código IATA LHR', async () => {
    expect((await service.searchByLocation('LHR', 'departures')).length).toBeGreaterThan(0)
  })
})


