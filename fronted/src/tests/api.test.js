// ============================================================
// api.test.js
//
// Prueba el servicio api.js que conecta con el backend.
// Como no tenemos backend corriendo en los tests, usamos
// vi.fn() para simular (mockear) las respuestas del fetch.
//
// Esto es TDD puro: probamos la lógica sin depender
// de servicios externos.
// ============================================================

import { describe, it, expect, vi, beforeEach} from 'vitest'

// ── Simular fetch globalmente ────────────────────────────────
// En lugar de hacer peticiones HTTP reales, interceptamos fetch
// y devolvemos respuestas controladas para cada test.
const mockFetch = vi.fn()
global.fetch = mockFetch

// Helper para crear respuestas simuladas del backend
function crearRespuestaOk(data) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true, data }),
  })
}

function crearRespuestaError(mensaje, status = 400) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ success: false, error: mensaje }),
  })
}

// Importar las funciones a testear
import {
  getDepartures,
  getArrivals,
  getFlightByCode,
  searchByLocation,
  getAirlines,
  login,
  logout,
  getCurrentUser,
  isAMW,
} from '../services/api'

describe('getDepartures', () => {

  beforeEach(() => {
    mockFetch.mockReset()
    localStorage.clear()
  })

  it('llama al endpoint correcto', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flights: [], count: 0 }))
    await getDepartures()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/flights/departures'),
      expect.any(Object)
    )
  })

  it('devuelve los vuelos del backend', async () => {
    const vuelosMock = [{ flightNumber: 'AA101', status: 'ON_TIME' }]
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flights: vuelosMock, count: 1 }))
    const resultado = await getDepartures()
    expect(resultado.flights).toHaveLength(1)
    expect(resultado.flights[0].flightNumber).toBe('AA101')
  })

  it('incluye los parámetros de filtro en la URL', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flights: [], count: 0 }))
    await getDepartures({ date: '2024-10-15', type: 'domestic' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('date=2024-10-15'),
      expect.any(Object)
    )
  })

  it('no incluye parámetros vacíos en la URL', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flights: [], count: 0 }))
    await getDepartures({ date: '', type: 'all' })
    const url = mockFetch.mock.calls[0][0]
    expect(url).not.toContain('date=')
    expect(url).not.toContain('type=')
  })

  it('lanza error cuando el backend responde con error', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaError('Fecha inválida'))
    await expect(getDepartures({ date: 'fecha-mala' })).rejects.toThrow('Fecha inválida')
  })

  it('lanza error claro cuando el backend no está corriendo', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(getDepartures()).rejects.toThrow('No se puede conectar con el servidor')
  })

})

describe('getArrivals', () => {

  beforeEach(() => {
    mockFetch.mockReset()
    localStorage.clear()
  })

  it('llama al endpoint de arrivals', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flights: [], count: 0 }))
    await getArrivals()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/flights/arrivals'),
      expect.any(Object)
    )
  })

  it('devuelve lista vacía si no hay vuelos', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flights: [], count: 0 }))
    const resultado = await getArrivals()
    expect(resultado.flights).toHaveLength(0)
  })

  it('acepta filtro de tipo internacional', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flights: [], count: 0 }))
    await getArrivals({ type: 'international' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('type=international'),
      expect.any(Object)
    )
  })

})

describe('getFlightByCode', () => {

  beforeEach(() => {
    mockFetch.mockReset()
    localStorage.clear()
  })

  it('llama al endpoint con el código correcto', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flight: { flightNumber: 'AA101' } }))
    await getFlightByCode('AA101')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/flights/AA101'),
      expect.any(Object)
    )
  })

  it('devuelve los datos del vuelo', async () => {
    const vueloMock = { flightNumber: 'AA101', status: 'BOARDING', gate: 'B22' }
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flight: vueloMock }))
    const resultado = await getFlightByCode('AA101')
    expect(resultado.flight.flightNumber).toBe('AA101')
    expect(resultado.flight.status).toBe('BOARDING')
  })

  it('lanza error 404 si el vuelo no existe', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaError('Vuelo XX999 no encontrado.', 404))
    await expect(getFlightByCode('XX999')).rejects.toThrow('Vuelo XX999 no encontrado.')
  })

})

describe('searchByLocation', () => {

  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('llama al endpoint de búsqueda con el query', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flights: [], count: 0 }))
    await searchByLocation('London')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('q=London'),
      expect.any(Object)
    )
  })

  it('incluye el modo en la URL', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flights: [], count: 0 }))
    await searchByLocation('Paris', 'arrivals')
    const url = mockFetch.mock.calls[0][0]
    expect(url).toContain('mode=arrivals')
  })

  it('el modo por defecto es departures', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ flights: [], count: 0 }))
    await searchByLocation('Tokyo')
    const url = mockFetch.mock.calls[0][0]
    expect(url).toContain('mode=departures')
  })

})

describe('getAirlines', () => {

  beforeEach(() => mockFetch.mockReset())

  it('llama al endpoint de aerolíneas', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ airlines: [], count: 0 }))
    await getAirlines()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/airlines'),
      expect.any(Object)
    )
  })

  it('devuelve la lista de aerolíneas', async () => {
    const mockAirlines = [{ id: 'AA', name: 'American Airlines' }]
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ airlines: mockAirlines, count: 1 }))
    const resultado = await getAirlines()
    expect(resultado.airlines).toHaveLength(1)
  })

})

describe('login', () => {

  beforeEach(() => {
    mockFetch.mockReset()
    localStorage.clear()
  })

  it('llama al endpoint de login con POST', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({
      token: 'jwt-token-falso',
      user: { id: '1', username: 'admin.jfk', role: 'AMW' }
    }))
    await login('admin.jfk', 'password123')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('guarda el token en localStorage tras login exitoso', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaOk({
      token: 'jwt-token-falso',
      user: { id: '1', username: 'admin.jfk', role: 'AMW' }
    }))
    await login('admin.jfk', 'password123')
    expect(localStorage.getItem('jfk_token')).toBe('jwt-token-falso')
  })

  it('guarda el usuario en localStorage tras login exitoso', async () => {
    const userMock = { id: '1', username: 'admin.jfk', role: 'AMW' }
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ token: 'jwt', user: userMock }))
    await login('admin.jfk', 'password123')
    const guardado = JSON.parse(localStorage.getItem('jfk_user'))
    expect(guardado.username).toBe('admin.jfk')
  })

  it('lanza error si las credenciales son incorrectas', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaError('Usuario o contraseña incorrectos.', 401))
    await expect(login('admin.jfk', 'clave-mala')).rejects.toThrow('Usuario o contraseña incorrectos.')
  })

  it('no guarda token si el login falla', async () => {
    mockFetch.mockReturnValueOnce(crearRespuestaError('Credenciales inválidas', 401))
    try { await login('admin', 'mal') } catch {}
    expect(localStorage.getItem('jfk_token')).toBeNull()
  })

})

describe('logout', () => {

  beforeEach(() => {
    mockFetch.mockReset()
    localStorage.clear()
  })

  it('elimina el token del localStorage', async () => {
    localStorage.setItem('jfk_token', 'token-de-prueba')
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ message: 'Sesión cerrada.' }))
    await logout()
    expect(localStorage.getItem('jfk_token')).toBeNull()
  })

  it('elimina el usuario del localStorage', async () => {
    localStorage.setItem('jfk_user', JSON.stringify({ username: 'admin' }))
    mockFetch.mockReturnValueOnce(crearRespuestaOk({ message: 'Sesión cerrada.' }))
    await logout()
    expect(localStorage.getItem('jfk_user')).toBeNull()
  })

  it('limpia localStorage aunque el backend falle', async () => {
    localStorage.setItem('jfk_token', 'token')
    mockFetch.mockRejectedValueOnce(new Error('Backend caído'))
    try { await logout() } catch {}
    expect(localStorage.getItem('jfk_token')).toBeNull()
  })

})

describe('getCurrentUser y isAMW', () => {

  beforeEach(() => localStorage.clear())

  it('getCurrentUser devuelve null si no hay sesión', () => {
    expect(getCurrentUser()).toBeNull()
  })

  it('getCurrentUser devuelve el usuario guardado', () => {
    const user = { id: '1', username: 'admin.jfk', role: 'AMW' }
    localStorage.setItem('jfk_user', JSON.stringify(user))
    expect(getCurrentUser()).toEqual(user)
  })

  it('isAMW devuelve false si no hay sesión', () => {
    expect(isAMW()).toBe(false)
  })

  it('isAMW devuelve true si el usuario tiene rol AMW', () => {
    localStorage.setItem('jfk_user', JSON.stringify({ role: 'AMW' }))
    expect(isAMW()).toBe(true)
  })

  it('isAMW devuelve false si el usuario no tiene rol AMW', () => {
    localStorage.setItem('jfk_user', JSON.stringify({ role: 'USER' }))
    expect(isAMW()).toBe(false)
  })

})
