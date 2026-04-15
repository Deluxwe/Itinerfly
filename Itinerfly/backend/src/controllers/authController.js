const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const config = require("../config");
const { success, clientError, serverError } = require("../utils/responseHelpers");

const USUARIOS_AMW = [
  {
    id:           "amw-001",
    username:     "admin.jfk",
    passwordHash: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewrPV8sGZPbOaR.u",
    role:         "AMW",
    displayName:  "Administrador JFK",
  },
];

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return clientError(res, "Usuario y contraseña requeridos.", 400);
    const usuario = USUARIOS_AMW.find(u => u.username.toLowerCase() === username.toLowerCase());
    const hashFalso = "$2a$12$invalidhashparaevitartimingattacks00000000000000000000";
    const passwordCorrecta = await bcrypt.compare(password, usuario ? usuario.passwordHash : hashFalso);
    if (!usuario || !passwordCorrecta) return clientError(res, "Usuario o contraseña incorrectos.", 401);
    const token = jwt.sign(
      { sub: usuario.id, username: usuario.username, role: usuario.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn, algorithm: "HS256", issuer: "jfk-itinerary-backend", audience: "jfk-itinerary-frontend" }
    );
    console.log(`[Auth] Login exitoso: ${usuario.username} desde ${req.ip}`);
    return success(res, { token, expiresIn: config.jwt.expiresIn, user: { id: usuario.id, username: usuario.username, role: usuario.role, displayName: usuario.displayName } });
  } catch (err) {
    console.error("[login]", err.message);
    return serverError(res, "Error en autenticación.");
  }
}

async function logout(req, res) {
  console.log(`[Auth] Logout: ${req.user?.username}`);
  return success(res, { message: "Sesión cerrada." });
}

async function me(req, res) {
  return success(res, { user: req.user });
}

module.exports = { login, logout, me };
