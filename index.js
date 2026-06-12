// password-server/index.js
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3333;
const SECRET = process.env.PASSWORD_SERVER_JWT_SECRET;

if (!SECRET) {
  console.error("❌  JWT_SECRET não definido no .env");
  process.exit(1);
}

app.use(express.json());

// ── Middleware de autenticação JWT ────────────────────────
function requireJWT(req, res, next) {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token ausente" });
  }

  try {
    const payload = jwt.verify(token, SECRET, {
      algorithms: ["HS256"],
      issuer:     "protec-app",
      audience:   "password-server",
    });
    req.jwtPayload = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

// ── Geração de senha (10 dígitos) ─────────────────────────
// TODO: substitua esta função pelo algoritmo real quando disponível
function generatePassword({ serialNumber, pin, gasType, cellNumber }) {
  // Placeholder: 10 dígitos aleatórios — troque pela lógica real
  const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10));
  return digits.join("");
}

// ── Rota principal ────────────────────────────────────────
app.post("/generate", requireJWT, (req, res) => {
  const { serialNumber, pin, gasType, cellNumber } = req.body;

  if (!serialNumber || !pin || !gasType || !cellNumber) {
    return res.status(400).json({ error: "Campos obrigatórios: serialNumber, pin, gasType, cellNumber" });
  }

  const password = generatePassword({ serialNumber, pin, gasType, cellNumber });

  console.log(`[${new Date().toISOString()}] Senha gerada | serial=${serialNumber} gas=${gasType} cell=${cellNumber}`);

  return res.json({ password });
});

// ── Health check ──────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`✅  Password server rodando na porta ${PORT}`);
});
