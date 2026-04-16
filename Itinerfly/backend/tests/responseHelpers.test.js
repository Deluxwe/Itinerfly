// ============================================================
// tests/responseHelpers.test.js
//
// Prueba que las funciones de respuesta HTTP devuelvan
// siempre el mismo formato que espera el frontend.
// Usamos un objeto "res" falso para simular Express.
// ============================================================

const { success, clientError, serverError } = require('../src/utils/responseHelpers')

// Crea un objeto que imita res de Express
function crearResMock() {
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(body)   { this.body = body; return this },
  }
  return res
}

describe('success', () => {

  it('responde con código 200 por defecto', () => {
    const res = crearResMock()
    success(res, { flights: [] })
    expect(res.statusCode).toBe(200)
  })

  it('responde con success: true', () => {
    const res = crearResMock()
    success(res, { vuelos: [] })
    expect(res.body.success).toBe(true)
  })

  it('incluye los datos en el body', () => {
    const res = crearResMock()
    success(res, { total: 5 })
    expect(res.body.data).toEqual({ total: 5 })
  })

  it('incluye timestamp en el body', () => {
    const res = crearResMock()
    success(res, {})
    expect(res.body.timestamp).toBeDefined()
  })

  it('respeta el código de estado personalizado', () => {
    const res = crearResMock()
    success(res, {}, 201)
    expect(res.statusCode).toBe(201)
  })

})

describe('clientError', () => {

  it('responde con código 400 por defecto', () => {
    const res = crearResMock()
    clientError(res, 'Dato inválido')
    expect(res.statusCode).toBe(400)
  })

  it('responde con success: false', () => {
    const res = crearResMock()
    clientError(res, 'Error')
    expect(res.body.success).toBe(false)
  })

  it('incluye el mensaje de error', () => {
    const res = crearResMock()
    clientError(res, 'Fecha inválida')
    expect(res.body.error).toBe('Fecha inválida')
  })

  it('respeta código 404', () => {
    const res = crearResMock()
    clientError(res, 'No encontrado', 404)
    expect(res.statusCode).toBe(404)
  })

  it('respeta código 401', () => {
    const res = crearResMock()
    clientError(res, 'No autorizado', 401)
    expect(res.statusCode).toBe(401)
  })

  it('incluye timestamp', () => {
    const res = crearResMock()
    clientError(res, 'Error')
    expect(res.body.timestamp).toBeDefined()
  })

})

describe('serverError', () => {

  it('responde con código 500', () => {
    const res = crearResMock()
    serverError(res, 'Error interno')
    expect(res.statusCode).toBe(500)
  })

  it('responde con success: false', () => {
    const res = crearResMock()
    serverError(res)
    expect(res.body.success).toBe(false)
  })

  it('usa mensaje por defecto si no se pasa ninguno', () => {
    const res = crearResMock()
    serverError(res)
    expect(res.body.error).toBe('Error interno del servidor')
  })

  it('usa el mensaje personalizado si se pasa', () => {
    const res = crearResMock()
    serverError(res, 'FlightAware no responde')
    expect(res.body.error).toBe('FlightAware no responde')
  })

})
