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


// ─── Tests para filtrar y helpers ────────────────────────────────────────────
// Añadir al final de flightService.test.js

const {
  filtrar,
  fechaLocal,
  obtenerFechaVuelo,
  cumpleFiltroTipo,
  cumpleFiltroAerolinea,
  cumpleFiltroVuelo,
  cumpleFiltroUbicacion,
} = require('../services/flightAwareService')

// ── Fixtures ──────────────────────────────────────────────────
const HOY_ISO = new Date().toISOString().slice(0, 10)
const mañana  = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10) })()

function makeVuelo(overrides = {}) {
  return {
    flightNumber: 'AA101',
    airlineId:    'AA',
    type:         'domestic',
    scheduledOut: `${HOY_ISO}T10:00:00.000Z`,
    scheduledIn:  `${HOY_ISO}T14:00:00.000Z`,
    destination: { city: 'Los Angeles', country: 'USA', iata: 'LAX' },
    origin:      { city: 'New York',    country: 'USA', iata: 'JFK' },
    ...overrides,
  }
}

// ── obtenerFechaVuelo ─────────────────────────────────────────
describe('obtenerFechaVuelo', () => {
  it('departures usa scheduledOut', () => {
    const f = makeVuelo()
    expect(obtenerFechaVuelo(f, 'departures')).toBe(HOY_ISO)
  })

  it('arrivals usa scheduledIn', () => {
    const f = makeVuelo({ scheduledIn: `${mañana}T08:00:00.000Z` })
    expect(obtenerFechaVuelo(f, 'arrivals')).toBe(mañana)
  })

  it('arrivals sin scheduledIn cae en scheduledOut', () => {
    const f = makeVuelo({ scheduledIn: null })
    expect(obtenerFechaVuelo(f, 'arrivals')).toBe(HOY_ISO)
  })

  it('scheduledOut null devuelve null', () => {
    const f = makeVuelo({ scheduledOut: null, scheduledIn: null })
    expect(obtenerFechaVuelo(f, 'departures')).toBeNull()
  })
})

// ── cumpleFiltroTipo ──────────────────────────────────────────
describe('cumpleFiltroTipo', () => {
  it('sin filtro siempre pasa', () => {
    expect(cumpleFiltroTipo(makeVuelo(), undefined)).toBe(true)
  })

  it('type all siempre pasa', () => {
    expect(cumpleFiltroTipo(makeVuelo(), 'all')).toBe(true)
  })

  it('domestic coincide', () => {
    expect(cumpleFiltroTipo(makeVuelo({ type: 'domestic' }), 'domestic')).toBe(true)
  })

  it('international no coincide con domestic', () => {
    expect(cumpleFiltroTipo(makeVuelo({ type: 'international' }), 'domestic')).toBe(false)
  })
})

// ── cumpleFiltroAerolinea ─────────────────────────────────────
describe('cumpleFiltroAerolinea', () => {
  it('sin filtro siempre pasa', () => {
    expect(cumpleFiltroAerolinea(makeVuelo(), undefined)).toBe(true)
  })

  it('airlineId all siempre pasa', () => {
    expect(cumpleFiltroAerolinea(makeVuelo(), 'all')).toBe(true)
  })

  it('AA coincide', () => {
    expect(cumpleFiltroAerolinea(makeVuelo({ airlineId: 'AA' }), 'AA')).toBe(true)
  })

  it('BA no coincide con AA', () => {
    expect(cumpleFiltroAerolinea(makeVuelo({ airlineId: 'BA' }), 'AA')).toBe(false)
  })
})

// ── cumpleFiltroVuelo ─────────────────────────────────────────
describe('cumpleFiltroVuelo', () => {
  it('sin search siempre pasa', () => {
    expect(cumpleFiltroVuelo(makeVuelo(), undefined)).toBe(true)
  })

  it('búsqueda exacta coincide', () => {
    expect(cumpleFiltroVuelo(makeVuelo({ flightNumber: 'AA101' }), 'AA101')).toBe(true)
  })

  it('búsqueda en minúsculas coincide (case-insensitive)', () => {
    expect(cumpleFiltroVuelo(makeVuelo({ flightNumber: 'AA101' }), 'aa101')).toBe(true)
  })

  it('búsqueda parcial coincide', () => {
    expect(cumpleFiltroVuelo(makeVuelo({ flightNumber: 'AA101' }), 'AA')).toBe(true)
  })

  it('búsqueda sin coincidencia falla', () => {
    expect(cumpleFiltroVuelo(makeVuelo({ flightNumber: 'AA101' }), 'DL')).toBe(false)
  })

  it('flightNumber undefined no rompe', () => {
    expect(cumpleFiltroVuelo(makeVuelo({ flightNumber: undefined }), 'AA')).toBe(false)
  })
})

// ── cumpleFiltroUbicacion ─────────────────────────────────────
describe('cumpleFiltroUbicacion', () => {
  it('sin locationSearch siempre pasa', () => {
    expect(cumpleFiltroUbicacion(makeVuelo(), undefined, 'departures')).toBe(true)
  })

  it('departures busca en destination.city', () => {
    expect(cumpleFiltroUbicacion(makeVuelo(), 'Los Angeles', 'departures')).toBe(true)
  })

  it('departures busca en destination.country', () => {
    expect(cumpleFiltroUbicacion(makeVuelo(), 'USA', 'departures')).toBe(true)
  })

  it('departures busca en destination.iata', () => {
    expect(cumpleFiltroUbicacion(makeVuelo(), 'LAX', 'departures')).toBe(true)
  })

  it('arrivals busca en origin.city', () => {
    expect(cumpleFiltroUbicacion(makeVuelo(), 'New York', 'arrivals')).toBe(true)
  })

  it('arrivals busca en origin.iata', () => {
    expect(cumpleFiltroUbicacion(makeVuelo(), 'JFK', 'arrivals')).toBe(true)
  })

  it('búsqueda es case-insensitive', () => {
    expect(cumpleFiltroUbicacion(makeVuelo(), 'los angeles', 'departures')).toBe(true)
  })

  it('sin coincidencia falla', () => {
    expect(cumpleFiltroUbicacion(makeVuelo(), 'xyzabc', 'departures')).toBe(false)
  })
})

// ── filtrar (integración) ─────────────────────────────────────
describe('filtrar', () => {
  const vuelos = [
    makeVuelo({ flightNumber: 'AA101', airlineId: 'AA', type: 'domestic' }),
    makeVuelo({ flightNumber: 'BA178', airlineId: 'BA', type: 'international',
      destination: { city: 'London', country: 'UK', iata: 'LHR' } }),
    makeVuelo({ flightNumber: 'DL405', airlineId: 'DL', type: 'domestic',
      scheduledOut: '2020-01-01T10:00:00.000Z' }),  // fecha pasada
  ]

  it('sin filtros devuelve solo vuelos en fechas válidas', () => {
    const r = filtrar(vuelos, {}, 'departures')
    expect(r.every(f => f.flightNumber !== 'DL405')).toBe(true)
  })

  it('filtra por fecha de hoy', () => {
    const r = filtrar(vuelos, { date: HOY_ISO }, 'departures')
    r.forEach(f => expect(fechaLocal(f.scheduledOut)).toBe(HOY_ISO))
  })

  it('fecha pasada excluye el vuelo', () => {
    const r = filtrar(vuelos, { date: '2020-01-01' }, 'departures')
    expect(r).toHaveLength(0)
  })

  it('filtra por type domestic', () => {
    const r = filtrar(vuelos, { type: 'domestic' }, 'departures')
    r.forEach(f => expect(f.type).toBe('domestic'))
  })

  it('filtra por airlineId BA', () => {
    const r = filtrar(vuelos, { airlineId: 'BA' }, 'departures')
    r.forEach(f => expect(f.airlineId).toBe('BA'))
  })

  it('filtra por search AA', () => {
    const r = filtrar(vuelos, { search: 'AA' }, 'departures')
    r.forEach(f => expect(f.flightNumber).toContain('AA'))
  })

  it('filtra por locationSearch London en departures', () => {
    const r = filtrar(vuelos, { locationSearch: 'London' }, 'departures')
    expect(r).toHaveLength(1)
    expect(r[0].flightNumber).toBe('BA178')
  })

  it('type all no filtra por tipo', () => {
    const r    = filtrar(vuelos, { type: 'all' }, 'departures')
    const sinF = filtrar(vuelos, {},              'departures')
    expect(r.length).toBe(sinF.length)
  })

  it('search sin coincidencia devuelve vacío', () => {
    expect(filtrar(vuelos, { search: 'XXXXX' }, 'departures')).toHaveLength(0)
  })
})