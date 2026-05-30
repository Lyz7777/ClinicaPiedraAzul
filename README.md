
---

```markdown
# Clínica PiedraAzul

## Instalación

### Backend
```bash
cd backend/clinica-api
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### Frontend
```bash
cd frontend
npm install
```

## Variables de entorno

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
AUTH0_DOMAIN=dev-nz115b8posmhlw8u.us.auth0.com
AUTH0_AUDIENCE=https://piedrazul-api
```

### Frontend (.env)
```
VITE_AUTH0_DOMAIN=dev-nz115b8posmhlw8u.us.auth0.com
VITE_AUTH0_CLIENT_ID=qyP86VAZmE2VYx1YeqI1Lt4Y3J0raA3Q
VITE_AUTH0_AUDIENCE=https://piedrazul-api
VITE_API_URL=http://localhost:3000
```

## Ejecutar

### Backend
```bash
cd backend/clinica-api
npm run start:dev
```

### Frontend
```bash
cd frontend
npm run dev
```

Abrir: http://localhost:5173

## Despliegue en Render

1. Subir a GitHub
2. En Render: New → Blueprint
3. Seleccionar repositorio y rama `full-project`
4. Agregar variables de Auth0
5. Apply

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Iniciar backend |
| `npm run build` | Compilar |
| `npm run test` | Pruebas |
| `npx prisma studio` | Ver BD |
```

