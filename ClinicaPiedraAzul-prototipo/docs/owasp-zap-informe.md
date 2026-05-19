# Informe OWASP ZAP — Clinica Piedra Azul

## Vulnerabilidad 1 — Cabeceras HTTP de seguridad faltantes
- **OWASP Top 10:** A05:2021 Security Misconfiguration
- **Riesgo:** Medio
- **Descripcion:** Sin Helmet, el servidor expone X-Powered-By: Express...
- **Evidencia:** [captura o ejemplo de request/response]
- **Fix aplicado:** `app.use(helmet())` en main.ts

## Vulnerabilidad 2 — CORS demasiado permisivo
- **OWASP Top 10:** A01:2021 Broken Access Control
- **Riesgo:** Alto
- **Descripcion:** origin: '*' permite que cualquier dominio haga requests autenticados...
- **Evidencia:** [ejemplo]
- **Fix aplicado:** Restringir origin a FRONTEND_URL en main.ts
