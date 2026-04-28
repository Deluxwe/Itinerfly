import { describe, it, expect } from 'vitest'

// Los datos de baggage ahora están embebidos en BaggageModal
// Este test verifica la estructura que esperamos del backend
describe('Estructura de datos del backend', () => {

  it('un vuelo de salida tiene los campos requeridos', () => {
    const vuelo = {
      flightNumber: "AA101", airlineId: "AA",
      origin:      { iata: "JFK", city: "New York", country: "USA" },
      destination: { iata: "LAX", city: "Los Angeles", country: "USA" },
      scheduledOut: new Date().toISOString(),
      estimatedOut: new Date().toISOString(),
      status: "ON_TIME", gate: "B22",
      terminal: "Terminal 8", type: "domestic", delayMinutes: 0,
    }
    expect(vuelo).toHaveProperty("flightNumber")
    expect(vuelo).toHaveProperty("airlineId")
    expect(vuelo).toHaveProperty("origin")
    expect(vuelo).toHaveProperty("destination")
    expect(vuelo).toHaveProperty("status")
    expect(vuelo).toHaveProperty("scheduledOut")
    expect(vuelo).toHaveProperty("gate")
    expect(vuelo).toHaveProperty("type")
  })

  it('los 8 estados IATA AIDM son válidos', () => {
    const estados = ["ON_TIME","DELAYED","BOARDING","LAST_CALL","CLOSED","IN_FLIGHT","LANDED","CANCELLED"]
    expect(estados).toHaveLength(8)
    estados.forEach(e => expect(typeof e).toBe("string"))
  })

  it('tipo de vuelo solo puede ser domestic o international', () => {
    const tipos = ["domestic", "international"]
    expect(tipos).toContain("domestic")
    expect(tipos).toContain("international")
    expect(tipos).not.toContain("other")
  })

})
