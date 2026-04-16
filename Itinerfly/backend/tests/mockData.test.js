// ============================================================
// tests/mockData.test.js
//
// Verifica que los datos mock del backend tienen la
// estructura correcta que esperan los controladores.
// ============================================================

const { AIRLINES, ROUTES, DEPARTURES, ARRIVALS } = require('../src/mock/flightData')

describe('AIRLINES mock', () => {

  it('existe y no está vacío', () => {
    expect(AIRLINES).toBeDefined()
    expect(AIRLINES.length).toBeGreaterThan(0)
  })

  it('cada aerolínea tiene los campos requeridos', () => {
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

  it('los códigos IATA tienen 2 caracteres', () => {
    AIRLINES.forEach(a => expect(a.iata).toHaveLength(2))
  })

  it('los códigos ICAO tienen 3 caracteres', () => {
    AIRLINES.forEach(a => expect(a.icao).toHaveLength(3))
  })

  it('no hay IDs duplicados', () => {
    const ids = AIRLINES.map(a => a.id)
    expect(ids).toHaveLength([...new Set(ids)].length)
  })

})

describe('ROUTES mock', () => {

  it('existe y no está vacío', () => {
    expect(ROUTES).toBeDefined()
    expect(ROUTES.length).toBeGreaterThan(0)
  })

  it('todas las rutas parten desde JFK', () => {
    ROUTES.forEach(r => expect(r.from.iata).toBe('JFK'))
  })

  it('cada ruta tiene coordenadas válidas de origen', () => {
    ROUTES.forEach(r => {
      expect(r.from.lat).toBeGreaterThan(-90)
      expect(r.from.lat).toBeLessThan(90)
      expect(r.from.lng).toBeGreaterThan(-180)
      expect(r.from.lng).toBeLessThan(180)
    })
  })

  it('cada ruta tiene coordenadas válidas de destino', () => {
    ROUTES.forEach(r => {
      expect(r.to.lat).toBeGreaterThan(-90)
      expect(r.to.lat).toBeLessThan(90)
    })
  })

  it('la distancia en km es un número positivo', () => {
    ROUTES.forEach(r => expect(r.distanceKm).toBeGreaterThan(0))
  })

  it('la duración en minutos es un número positivo', () => {
    ROUTES.forEach(r => expect(r.durationMin).toBeGreaterThan(0))
  })

})

describe('DEPARTURES mock', () => {

  it('existe y tiene vuelos', () => {
    expect(DEPARTURES).toBeDefined()
    expect(DEPARTURES.length).toBeGreaterThan(0)
  })

  it('todos salen desde JFK', () => {
    DEPARTURES.forEach(f => expect(f.origin.iata).toBe('JFK'))
  })

  it('cada vuelo tiene los campos requeridos', () => {
    DEPARTURES.forEach(f => {
      expect(f).toHaveProperty('flightNumber')
      expect(f).toHaveProperty('airlineId')
      expect(f).toHaveProperty('origin')
      expect(f).toHaveProperty('destination')
      expect(f).toHaveProperty('scheduledOut')
      expect(f).toHaveProperty('estimatedOut')
      expect(f).toHaveProperty('status')
      expect(f).toHaveProperty('gate')
      expect(f).toHaveProperty('terminal')
      expect(f).toHaveProperty('type')
      expect(f).toHaveProperty('delayMinutes')
    })
  })

  it('los estados son válidos IATA AIDM', () => {
    const validos = ['ON_TIME','DELAYED','BOARDING','LAST_CALL','CLOSED','IN_FLIGHT','LANDED','CANCELLED']
    DEPARTURES.forEach(f => expect(validos).toContain(f.status))
  })

  it('los vuelos DELAYED tienen delayMinutes > 0', () => {
    DEPARTURES.filter(f => f.status === 'DELAYED')
      .forEach(f => expect(f.delayMinutes).toBeGreaterThan(0))
  })

  it('el tipo es domestic o international', () => {
    DEPARTURES.forEach(f => expect(['domestic','international']).toContain(f.type))
  })

  it('los números de vuelo tienen formato válido', () => {
    DEPARTURES.forEach(f => expect(f.flightNumber).toMatch(/^[A-Z0-9]{3,8}$/))
  })

})

describe('ARRIVALS mock', () => {

  it('existe y tiene vuelos', () => {
    expect(ARRIVALS).toBeDefined()
    expect(ARRIVALS.length).toBeGreaterThan(0)
  })

  it('todos llegan a JFK', () => {
    ARRIVALS.forEach(f => expect(f.destination.iata).toBe('JFK'))
  })

  it('cada vuelo tiene scheduledOut y estimatedOut', () => {
    ARRIVALS.forEach(f => {
      expect(f).toHaveProperty('scheduledOut')
      expect(f).toHaveProperty('estimatedOut')
    })
  })

  it('los estados son válidos IATA AIDM', () => {
    const validos = ['ON_TIME','DELAYED','BOARDING','LAST_CALL','CLOSED','IN_FLIGHT','LANDED','CANCELLED']
    ARRIVALS.forEach(f => expect(validos).toContain(f.status))
  })

})
