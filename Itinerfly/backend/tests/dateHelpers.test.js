// ============================================================
// tests/dateHelpers.test.js
//
// Prueba las funciones utilitarias de fechas.
// Son funciones puras — fáciles de testear y muy confiables.
// ============================================================

const { addDays, toDateString, getNextDays, delayMinutes } = require('../src/utils/dateHelpers')

describe('addDays', () => {

  it('agrega 0 días devuelve la misma fecha', () => {
    const fecha = new Date('2024-10-15')
    expect(toDateString(addDays(fecha, 0))).toBe('2024-10-15')
  })

  it('agrega 1 día correctamente', () => {
    const fecha = new Date('2024-10-15')
    expect(toDateString(addDays(fecha, 1))).toBe('2024-10-16')
  })

  it('agrega 2 días correctamente', () => {
    const fecha = new Date('2024-10-15')
    expect(toDateString(addDays(fecha, 2))).toBe('2024-10-17')
  })

  it('maneja cambio de mes', () => {
    const fecha = new Date('2024-10-31')
    expect(toDateString(addDays(fecha, 1))).toBe('2024-11-01')
  })

  it('maneja cambio de año', () => {
    const fecha = new Date('2024-12-31')
    expect(toDateString(addDays(fecha, 1))).toBe('2025-01-01')
  })

  it('no muta la fecha original', () => {
    const original = new Date('2024-10-15')
    addDays(original, 5)
    expect(toDateString(original)).toBe('2024-10-15')
  })

})

describe('toDateString', () => {

  it('devuelve formato YYYY-MM-DD', () => {
    expect(toDateString(new Date('2024-10-15'))).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('tiene exactamente 10 caracteres', () => {
    expect(toDateString(new Date('2024-10-15'))).toHaveLength(10)
  })

  it('devuelve string no vacío', () => {
    expect(toDateString(new Date())).toBeTruthy()
  })

})

describe('getNextDays', () => {

  it('devuelve 3 días por defecto', () => {
    expect(getNextDays(3)).toHaveLength(3)
  })

  it('el primer elemento es hoy', () => {
    const hoy = toDateString(new Date())
    expect(getNextDays(3)[0]).toBe(hoy)
  })

  it('los días están en orden ascendente', () => {
    const dias = getNextDays(3)
    expect(dias[0] < dias[1]).toBe(true)
    expect(dias[1] < dias[2]).toBe(true)
  })

  it('todos tienen formato YYYY-MM-DD', () => {
    getNextDays(3).forEach(d => {
      expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  it('devuelve N días cuando se pide', () => {
    expect(getNextDays(1)).toHaveLength(1)
    expect(getNextDays(5)).toHaveLength(5)
  })

})

describe('delayMinutes', () => {

  it('devuelve 0 sin retraso', () => {
    const hora = '2024-10-15T10:00:00Z'
    expect(delayMinutes(hora, hora)).toBe(0)
  })

  it('calcula 25 minutos correctamente', () => {
    expect(delayMinutes('2024-10-15T10:00:00Z', '2024-10-15T10:25:00Z')).toBe(25)
  })

  it('calcula 65 minutos correctamente', () => {
    expect(delayMinutes('2024-10-15T10:00:00Z', '2024-10-15T11:05:00Z')).toBe(65)
  })

  it('devuelve 0 si el avión llega antes', () => {
    expect(delayMinutes('2024-10-15T10:30:00Z', '2024-10-15T10:00:00Z')).toBe(0)
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
