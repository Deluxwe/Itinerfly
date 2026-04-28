// globals: describe, it, expect vienen de vitest automáticamente
const { addDays, toDateString, getNextDays, delayMinutes } = require('../utils/dateHelpers')

describe('addDays', () => {
describe('addDays', () => {
  it('agrega 0 días devuelve la misma fecha', () => {
    const base = new Date(2024, 9, 14); // 14 Oct 2024
    expect(toDateString(addDays(base, 0))).toBe('2024-10-14');
  });

  it('agrega 1 día correctamente', () => {
    const base = new Date(2024, 9, 14);
    expect(toDateString(addDays(base, 1))).toBe('2024-10-15');
  });

  it('agrega 2 días correctamente', () => {
    const base = new Date(2024, 9, 14);
    expect(toDateString(addDays(base,2))).toBe('2024-10-16');
  })

  it('no muta la fecha original', () => {
    const base = new Date(2024, 9, 14);
    addDays(base, 2);
    expect(toDateString(base)).toBe('2024-10-14'); // Si esperabas 16 aquí, tu lógica de test estaba mal
  });
  });


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
  it('devuelve 3 días', () => {
    expect(getNextDays(3)).toHaveLength(3)
  })
  it('el primer elemento es hoy', () => {
    expect(getNextDays(3)[0]).toBe(toDateString(new Date()))
  })
  it('días en orden ascendente', () => {
    const dias = getNextDays(3)
    expect(dias[0] < dias[1]).toBe(true)
    expect(dias[1] < dias[2]).toBe(true)
  })
  it('todos tienen formato YYYY-MM-DD', () => {
    getNextDays(3).forEach(d => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/))
  })
  it('devuelve N días cuando se pide', () => {
    expect(getNextDays(1)).toHaveLength(1)
    expect(getNextDays(5)).toHaveLength(5)
  })
})

describe('delayMinutes', () => {
  it('devuelve 0 sin retraso', () => {
    const h = '2024-10-15T10:00:00Z'
    expect(delayMinutes(h, h)).toBe(0)
  })
  it('calcula 25 minutos', () => {
    expect(delayMinutes('2024-10-15T10:00:00Z', '2024-10-15T10:25:00Z')).toBe(25)
  })
  it('calcula 65 minutos', () => {
    expect(delayMinutes('2024-10-15T10:00:00Z', '2024-10-15T11:05:00Z')).toBe(65)
  })
  it('devuelve 0 si llega antes', () => {
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
