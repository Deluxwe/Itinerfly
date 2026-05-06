// ============================================================
// dateHelpers.test.js
//
// Prueba las funciones de manejo de fechas.
// Son funciones puras (sin efectos secundarios) así que
// son las más fáciles y rápidas de probar.
// ============================================================

import { describe, it, expect} from 'vitest'

// ── Helpers locales (copiados del backend para testear en frontend) ──
function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function toDateString(date) {
  return new Date(date).toISOString().split('T')[0]
}

function getNextDays(n = 3) {
  return Array.from({ length: n }, (_, i) =>
    toDateString(addDays(new Date(), i))
  )
}

function delayMinutes(scheduledTime, estimatedTime) {
  if (!scheduledTime || !estimatedTime) return 0
  const diff = new Date(estimatedTime) - new Date(scheduledTime)
  return Math.max(0, Math.round(diff / 60000))
}

// ── Tests ────────────────────────────────────────────────────
describe('addDays', () => {

  it('agrega 0 días devuelve la misma fecha', () => {
    const hoy = new Date('2024-10-15')
    const resultado = addDays(hoy, 0)
    expect(toDateString(resultado)).toBe('2024-10-15')
  })

  it('agrega 1 día correctamente', () => {
    const hoy = new Date('2024-10-15')
    const resultado = addDays(hoy, 1)
    expect(toDateString(resultado)).toBe('2024-10-16')
  })

  it('agrega 2 días correctamente', () => {
    const hoy = new Date('2024-10-15')
    const resultado = addDays(hoy, 2)
    expect(toDateString(resultado)).toBe('2024-10-17')
  })

  it('maneja el cambio de mes correctamente', () => {
    const fin_de_mes = new Date('2024-10-31')
    const resultado = addDays(fin_de_mes, 1)
    expect(toDateString(resultado)).toBe('2024-11-01')
  })

  it('maneja el cambio de año correctamente', () => {
    const fin_de_año = new Date('2024-12-31')
    const resultado = addDays(fin_de_año, 1)
    expect(toDateString(resultado)).toBe('2025-01-01')
  })

})

describe('toDateString', () => {

  it('convierte fecha a formato YYYY-MM-DD', () => {
    const fecha = new Date('2024-10-15T14:30:00Z')
    expect(toDateString(fecha)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('devuelve string no vacío', () => {
    const fecha = new Date()
    expect(toDateString(fecha)).toBeTruthy()
  })

  it('tiene longitud de 10 caracteres', () => {
    const fecha = new Date('2024-10-15')
    expect(toDateString(fecha)).toHaveLength(10)
  })

})

describe('getNextDays', () => {

  it('devuelve exactamente 3 días por defecto', () => {
    const dias = getNextDays(3)
    expect(dias).toHaveLength(3)
  })

  it('el primer día es hoy', () => {
    const hoy = toDateString(new Date())
    const dias = getNextDays(3)
    expect(dias[0]).toBe(hoy)
  })

  it('el segundo día es mañana', () => {
    const manana = toDateString(addDays(new Date(), 1))
    const dias = getNextDays(3)
    expect(dias[1]).toBe(manana)
  })

  it('todos los días tienen formato YYYY-MM-DD', () => {
    const dias = getNextDays(3)
    dias.forEach(dia => {
      expect(dia).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  it('los días están en orden ascendente', () => {
    const dias = getNextDays(3)
    expect(dias[0] < dias[1]).toBe(true)
    expect(dias[1] < dias[2]).toBe(true)
  })

  it('devuelve N días cuando se especifica', () => {
    expect(getNextDays(1)).toHaveLength(1)
    expect(getNextDays(5)).toHaveLength(5)
  })

})

describe('delayMinutes', () => {

  it('devuelve 0 si no hay retraso', () => {
    const hora = '2024-10-15T10:00:00Z'
    expect(delayMinutes(hora, hora)).toBe(0)
  })

  it('calcula 25 minutos de retraso correctamente', () => {
    const programado = '2024-10-15T10:00:00Z'
    const estimado   = '2024-10-15T10:25:00Z'
    expect(delayMinutes(programado, estimado)).toBe(25)
  })

  it('calcula 65 minutos de retraso correctamente', () => {
    const programado = '2024-10-15T10:00:00Z'
    const estimado   = '2024-10-15T11:05:00Z'
    expect(delayMinutes(programado, estimado)).toBe(65)
  })

  it('devuelve 0 si el avión llega antes (adelantado)', () => {
    const programado = '2024-10-15T10:30:00Z'
    const estimado   = '2024-10-15T10:00:00Z'
    expect(delayMinutes(programado, estimado)).toBe(0)
  })

  it('devuelve 0 si scheduledTime es null', () => {
    expect(delayMinutes(null, '2024-10-15T10:00:00Z')).toBe(0)
  })

  it('devuelve 0 si estimatedTime es null', () => {
    expect(delayMinutes('2024-10-15T10:00:00Z', null)).toBe(0)
  })

  it('devuelve 0 si ambos son null', () => {
    expect(delayMinutes(null, null)).toBe(0)
  })

})
