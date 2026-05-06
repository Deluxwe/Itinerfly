// utils.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { esDomestico, normalizarVuelo, construirRango } = require('../services/flightAwareService.js'); // Ajusta ruta

describe('esDomestico', () => {
  it('ambos US country_code = true', () => {
    const origin = { country_code: 'US' };
    const dest = { country_code: 'US' };
    expect(esDomestico(origin, dest)).toBe(true);
  });

  it('origin US, dest GB = false', () => {
    expect(esDomestico(
      { country_code: 'US' },
      { country_code: 'GB' }
    )).toBe(false);
  });

  it('sin country_code, ambos ICAO K = true', () => {
    expect(esDomestico(
      { icao: 'KJFK' },
      { icao: 'KLAX' }
    )).toBe(true);
  });

  it('ICAO PAxx = USA', () => {
    expect(esDomestico(
      { code: 'PAFA' },
      { code: 'KJFK' }
    )).toBe(true);
  });

  it('ICAO internacional = false', () => {
    expect(esDomestico(
      { icao: 'EGLL' },
      { icao: 'KJFK' }
    )).toBe(false);
  });

  it('sin datos = false', () => {
    expect(esDomestico({}, {})).toBe(false);
  });
});

describe('normalizarVuelo', () => {
  const flightCompleto = {
    ident_iata: 'AA123',
    ident: 'AA1234',
    operator_iata: 'AA',
    origin: { code_iata: 'JFK', code: 'KJFK', city: 'New York', country: 'USA', country_code: 'US' },
    destination: { code_iata: 'LAX', code: 'KLAX', city: 'Los Angeles', country: 'USA', country_code: 'US' },
    scheduled_out: '2024-01-01T10:00:00Z',
    estimated_out: '2024-01-01T10:15:00Z',
    scheduled_in: '2024-01-01T13:00:00Z',
    actual_out: '2024-01-01T10:16:00Z',
    gate_origin: 'A1',
    terminal_origin: 'T1',
    aircraft_type: 'B738'
  };

  it('normaliza vuelo completo', () => {
    const result = normalizarVuelo(flightCompleto);
    expect(result.flightNumber).toBe('AA123');
    expect(result.airlineId).toBe('AA');
    expect(result.origin.iata).toBe('JFK');
    expect(result.type).toBe('domestic');
    expect(result.delayMinutes).toBe(15);
    expect(result.gate).toBe('A1');
    expect(result.terminal).toBe('T1');
  });

  it('usa code como fallback para iata', () => {
    const flight = {
      origin: { code: 'KJFK' },
      destination: { code_iata: 'LAX' }
    };
    const result = normalizarVuelo(flight);
    expect(result.origin.iata).toBe('KJFK');
    expect(result.origin.icao).toBe('KJFK');
  });

  it('delay = 0 sin estimated_out', () => {
    const flight = { scheduled_out: '2024-01-01T10:00:00Z' };
    const result = normalizarVuelo(flight);
    expect(result.delayMinutes).toBe(0);
  });

  it('airlineId desde ident.slice(0,2)', () => {
    const flight = { ident: 'DL405' };
    const result = normalizarVuelo(flight);
    expect(result.airlineId).toBe('DL');
  });

  it('valores por defecto para campos faltantes', () => {
    const result = normalizarVuelo({});
    expect(result.gate).toBe('—');
    expect(result.aircraft).toBe('—');
    expect(result.actualOut).toBeNull();
  });
});

describe('construirRango', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });


  it('fecha específica = 00:00 a 23:59', () => {
    const result = construirRango('2024-01-01');
    expect(result.start).toBe('2024-01-01T00:00:00.000Z');
    expect(result.end).toBe('2024-01-01T23:59:59.000Z');
  });



  it('limita fin a 47h adelante', () => {
    const result = construirRango('2024-01-04');
    expect(result.end).toBe('2024-01-03T11:00:00.000Z'); // maxFin
  });
});