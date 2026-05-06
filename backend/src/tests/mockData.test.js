const { AIRLINES, ROUTES, DEPARTURES, ARRIVALS } = require('../mock/flightData')

describe('AIRLINES mock', () => {
  it('existe y no está vacío', () => {
    expect(AIRLINES.length).toBeGreaterThan(0)
  })
  it('cada aerolínea tiene campos requeridos', () => {
    AIRLINES.forEach(a => {
      expect(a).toHaveProperty('id')
      expect(a).toHaveProperty('name')
      expect(a).toHaveProperty('iata')
      expect(a).toHaveProperty('icao')
      expect(a).toHaveProperty('phone')
      expect(a).toHaveProperty('terminalDep')
      expect(a).toHaveProperty('terminalArr')
    })
  })
  it('códigos IATA tienen 2 caracteres', () => {
    AIRLINES.forEach(a => expect(a.iata).toHaveLength(2))
  })
  it('códigos ICAO tienen 3 caracteres', () => {
    AIRLINES.forEach(a => expect(a.icao).toHaveLength(3))
  })
  it('no hay IDs duplicados', () => {
    const ids = AIRLINES.map(a => a.id)
    expect(ids).toHaveLength([...new Set(ids)].length)
  })
})

describe('ROUTES mock', () => {
  it('existe y no está vacío', () => {
    expect(ROUTES.length).toBeGreaterThan(0)
  })
  it('todas parten desde JFK', () => {
    ROUTES.forEach(r => expect(r.from.iata).toBe('JFK'))
  })
  it('distanceKm es positiva', () => {
    ROUTES.forEach(r => expect(r.distanceKm).toBeGreaterThan(0))
  })
  it('durationMin es positiva', () => {
    ROUTES.forEach(r => expect(r.durationMin).toBeGreaterThan(0))
  })
  it('coordenadas válidas', () => {
    ROUTES.forEach(r => {
      expect(r.from.lat).toBeGreaterThan(-90)
      expect(r.from.lat).toBeLessThan(90)
    })
  })
})

describe('DEPARTURES mock', () => {
  it('existe y tiene vuelos', () => {
    expect(DEPARTURES.length).toBeGreaterThan(0)
  })
  it('todos salen desde JFK', () => {
    DEPARTURES.forEach(f => expect(f.origin.iata).toBe('JFK'))
  })
  it('cada vuelo tiene campos requeridos', () => {
    DEPARTURES.forEach(f => {
      expect(f).toHaveProperty('flightNumber')
      expect(f).toHaveProperty('airlineId')
      expect(f).toHaveProperty('status')
      expect(f).toHaveProperty('gate')
      expect(f).toHaveProperty('terminal')
      expect(f).toHaveProperty('type')
    })
  })
  it('estados son válidos IATA AIDM', () => {
    const v = ['ON_TIME','DELAYED','BOARDING','LAST_CALL','CLOSED','IN_FLIGHT','LANDED','CANCELLED']
    DEPARTURES.forEach(f => expect(v).toContain(f.status))
  })
  it('vuelos DELAYED tienen delayMinutes > 0', () => {
    DEPARTURES.filter(f => f.status === 'DELAYED')
      .forEach(f => expect(f.delayMinutes).toBeGreaterThan(0))
  })
  it('tipo es domestic o international', () => {
    DEPARTURES.forEach(f => expect(['domestic','international']).toContain(f.type))
  })
})

describe('ARRIVALS mock', () => {
  it('existe y tiene vuelos', () => {
    expect(ARRIVALS.length).toBeGreaterThan(0)
  })
  it('todos llegan a JFK', () => {
    ARRIVALS.forEach(f => expect(f.destination.iata).toBe('JFK'))
  })
  it('cada vuelo tiene scheduledOut', () => {
    ARRIVALS.forEach(f => expect(f).toHaveProperty('scheduledOut'))
  })
  it('estados son válidos', () => {
    const v = ['ON_TIME','DELAYED','BOARDING','LAST_CALL','CLOSED','IN_FLIGHT','LANDED','CANCELLED']
    ARRIVALS.forEach(f => expect(v).toContain(f.status))
  })
})
