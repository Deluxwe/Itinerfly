import { describe, it, expect } from 'vitest'
import {
  AIRLINES,
  ROUTES,
  DEPARTURES,
  ARRIVALS,
  BAGGAGE_REGULATIONS
} from '../data/mockData'

describe('AIRLINES', () => {
  it('existe y no está vacío', () => {
    expect(AIRLINES).toBeDefined()
    expect(AIRLINES.length).toBeGreaterThan(0)
  })
  it('cada aerolínea tiene los campos requeridos', () => {
    AIRLINES.forEach(airline => {
      expect(airline).toHaveProperty('id')
      expect(airline).toHaveProperty('name')
      expect(airline).toHaveProperty('iata')
      expect(airline).toHaveProperty('phone')
      expect(airline).toHaveProperty('terminalDep')
      expect(airline).toHaveProperty('terminalArr')
    })
  })
  it('los códigos IATA tienen 2 caracteres', () => {
    AIRLINES.forEach(airline => {
      expect(airline.iata).toHaveLength(2)
    })
  })
  it('no hay aerolíneas duplicadas por ID', () => {
    const ids = AIRLINES.map(a => a.id)
    expect(ids).toHaveLength([...new Set(ids)].length)
  })
  it('contiene las aerolíneas principales del JFK', () => {
    const iatas = AIRLINES.map(a => a.iata)
    expect(iatas).toContain('AA')
    expect(iatas).toContain('DL')
    expect(iatas).toContain('UA')
    expect(iatas).toContain('B6')
  })
})

describe('ROUTES', () => {
  it('existe y no está vacío', () => {
    expect(ROUTES).toBeDefined()
    expect(ROUTES.length).toBeGreaterThan(0)
  })
  it('cada ruta tiene los campos requeridos', () => {
    ROUTES.forEach(route => {
      expect(route).toHaveProperty('id')
      expect(route).toHaveProperty('from')
      expect(route).toHaveProperty('to')
      expect(route).toHaveProperty('distance')
      expect(route).toHaveProperty('duration')
    })
  })
  it('todas las rutas salen desde JFK', () => {
    ROUTES.forEach(route => {
      expect(route.from.iata).toBe('JFK')
    })
  })
  it('cada ruta tiene coordenadas válidas', () => {
    ROUTES.forEach(route => {
      expect(route.from.lat).toBeGreaterThan(-90)
      expect(route.from.lat).toBeLessThan(90)
      expect(route.to.lat).toBeGreaterThan(-90)
      expect(route.to.lat).toBeLessThan(90)
    })
  })
  it('los IDs de rutas tienen formato IATA-IATA', () => {
    ROUTES.forEach(route => {
      expect(route.id).toMatch(/^[A-Z]{3}-[A-Z]{3}$/)
    })
  })
})

describe('DEPARTURES', () => {
  it('existe y no está vacío', () => {
    expect(DEPARTURES).toBeDefined()
    expect(DEPARTURES.length).toBeGreaterThan(0)
  })
  it('cada vuelo tiene los campos requeridos por la tabla', () => {
    DEPARTURES.forEach(flight => {
      expect(flight).toHaveProperty('flightNumber')
      expect(flight).toHaveProperty('airline')
      expect(flight).toHaveProperty('origin')
      expect(flight).toHaveProperty('destination')
      expect(flight).toHaveProperty('scheduledOut')
      expect(flight).toHaveProperty('estimatedOut')
      expect(flight).toHaveProperty('status')
      expect(flight).toHaveProperty('gate')
      expect(flight).toHaveProperty('terminal')
      expect(flight).toHaveProperty('type')
    })
  })
  it('todos los vuelos salen desde JFK', () => {
    DEPARTURES.forEach(flight => {
      expect(flight.origin.iata).toBe('JFK')
    })
  })
  it('los estados son uno de los 8 estados IATA AIDM', () => {
    const estadosValidos = ['ON_TIME','DELAYED','BOARDING','LAST_CALL','CLOSED','IN_FLIGHT','LANDED','CANCELLED']
    DEPARTURES.forEach(flight => {
      expect(estadosValidos).toContain(flight.status)
    })
  })
  it('el tipo de vuelo es domestic o international', () => {
    DEPARTURES.forEach(flight => {
      expect(['domestic','international']).toContain(flight.type)
    })
  })
  it('los minutos de retraso son números no negativos', () => {
    DEPARTURES.forEach(flight => {
      expect(flight.delayMinutes).toBeGreaterThanOrEqual(0)
    })
  })
  it('los vuelos DELAYED tienen delayMinutes mayor a 0', () => {
    DEPARTURES.filter(f => f.status === 'DELAYED').forEach(flight => {
      expect(flight.delayMinutes).toBeGreaterThan(0)
    })
  })
  it('los números de vuelo tienen formato válido', () => {
    DEPARTURES.forEach(flight => {
      expect(flight.flightNumber).toMatch(/^[A-Z0-9]{3,8}$/)
    })
  })
})

describe('ARRIVALS', () => {
  it('existe y no está vacío', () => {
    expect(ARRIVALS).toBeDefined()
    expect(ARRIVALS.length).toBeGreaterThan(0)
  })
  it('todos los vuelos llegan a JFK', () => {
    ARRIVALS.forEach(flight => {
      expect(flight.destination.iata).toBe('JFK')
    })
  })

  // Verificamos scheduledOut que sí existe en el mock del frontend
  it('cada vuelo tiene scheduledOut y estimatedOut', () => {
    ARRIVALS.forEach(flight => {
      expect(flight).toHaveProperty('scheduledOut')
      expect(flight).toHaveProperty('estimatedOut')
    })
  })

  it('los estados son válidos IATA AIDM', () => {
    const estadosValidos = ['ON_TIME','DELAYED','BOARDING','LAST_CALL','CLOSED','IN_FLIGHT','LANDED','CANCELLED']
    ARRIVALS.forEach(flight => {
      expect(estadosValidos).toContain(flight.status)
    })
  })
})

describe('BAGGAGE_REGULATIONS', () => {
  it('existe y tiene exactamente 4 categorías', () => {
    expect(BAGGAGE_REGULATIONS).toBeDefined()
    expect(BAGGAGE_REGULATIONS).toHaveLength(4)
  })
  it('cada categoría tiene nombre, icono y reglas', () => {
    BAGGAGE_REGULATIONS.forEach(cat => {
      expect(cat).toHaveProperty('category')
      expect(cat).toHaveProperty('icon')
      expect(cat).toHaveProperty('rules')
      expect(cat.rules.length).toBeGreaterThan(0)
    })
  })
  it('las reglas son strings no vacíos', () => {
    BAGGAGE_REGULATIONS.forEach(cat => {
      cat.rules.forEach(rule => {
        expect(typeof rule).toBe('string')
        expect(rule.length).toBeGreaterThan(0)
      })
    })
  })
})
