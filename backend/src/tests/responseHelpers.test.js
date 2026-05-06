const { success, clientError, serverError } = require('../utils/responseHelpers')

function crearRes() {
  const res = { statusCode: null, body: null }
  res.status = (code) => { res.statusCode = code; return res }
  res.json   = (body) => { res.body = body; return res }
  return res
}

describe('success', () => {
  it('responde 200 por defecto', () => {
    const res = crearRes()
    success(res, {})
    expect(res.statusCode).toBe(200)
  })
  it('success es true', () => {
    const res = crearRes()
    success(res, {})
    expect(res.body.success).toBe(true)
  })
  it('incluye los datos', () => {
    const res = crearRes()
    success(res, { total: 5 })
    expect(res.body.data).toEqual({ total: 5 })
  })
  it('incluye timestamp', () => {
    const res = crearRes()
    success(res, {})
    expect(res.body.timestamp).toBeDefined()
  })
  it('respeta código personalizado', () => {
    const res = crearRes()
    success(res, {}, 201)
    expect(res.statusCode).toBe(201)
  })
})

describe('clientError', () => {
  it('responde 400 por defecto', () => {
    const res = crearRes()
    clientError(res, 'Error')
    expect(res.statusCode).toBe(400)
  })
  it('success es false', () => {
    const res = crearRes()
    clientError(res, 'Error')
    expect(res.body.success).toBe(false)
  })
  it('incluye el mensaje', () => {
    const res = crearRes()
    clientError(res, 'Fecha inválida')
    expect(res.body.error).toBe('Fecha inválida')
  })
  it('respeta código 404', () => {
    const res = crearRes()
    clientError(res, 'No encontrado', 404)
    expect(res.statusCode).toBe(404)
  })
  it('respeta código 401', () => {
    const res = crearRes()
    clientError(res, 'No autorizado', 401)
    expect(res.statusCode).toBe(401)
  })
  it('incluye timestamp', () => {
    const res = crearRes()
    clientError(res, 'Error')
    expect(res.body.timestamp).toBeDefined()
  })
})

describe('serverError', () => {
  it('responde 500', () => {
    const res = crearRes()
    serverError(res)
    expect(res.statusCode).toBe(500)
  })
  it('success es false', () => {
    const res = crearRes()
    serverError(res)
    expect(res.body.success).toBe(false)
  })
  it('usa mensaje por defecto', () => {
    const res = crearRes()
    serverError(res)
    expect(res.body.error).toBe('Error interno del servidor')
  })
  it('usa mensaje personalizado', () => {
    const res = crearRes()
    serverError(res, 'FlightAware caído')
    expect(res.body.error).toBe('FlightAware caído')
  })
})
