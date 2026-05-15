
# Clinica PiedraAzul - Guia de ejecucion

Este proyecto tiene dos partes principales:

1. Frontend en React + Vite
2. Backend en NestJS + Prisma + SQLite

## 1) Requisitos

Antes de iniciar, instala lo siguiente:

1. Node.js (recomendado: version 20 LTS o 22 LTS)
2. npm (viene con Node.js)
3. VS Code (opcional, recomendado)

Para verificar:

```powershell
node -v
npm -v
```

## 2) Estructura del proyecto

Carpetas importantes:

1. frontend
2. backend/clinica-api

## 3) Configuracion de login (Auth0)

El login del frontend usa Auth0. Debes configurar variables de entorno en
frontend/.env y backend/clinica-api/.env. Los valores base ya estan en los
archivos .env.example para que queden versionados en Git.

### 3.1 Frontend (.env)

Copia el ejemplo y ajusta si hace falta:

```powershell
cd frontend
Copy-Item .env.example .env
```

Contenido esperado:

```env
VITE_AUTH0_DOMAIN=dev-nz115b8posmhlw8u.us.auth0.com
VITE_AUTH0_CLIENT_ID=qyP86VAZmE2VYx1YeqI1Lt4Y3J0raA3Q
VITE_AUTH0_AUDIENCE=https://piedrazul-api
```

### 3.2 Backend (.env)

Copia el ejemplo y ajusta si hace falta:

```powershell
cd backend/clinica-api
Copy-Item .env.example .env
```

Contenido esperado:

```env
AUTH0_DOMAIN=dev-nz115b8posmhlw8u.us.auth0.com
AUTH0_AUDIENCE=https://piedrazul-api
```

### 3.3 Configuracion en Auth0 (Dashboard)

En la aplicacion de Auth0, completa:

1. Allowed Callback URLs: http://localhost:5173
2. Allowed Logout URLs: http://localhost:5173
3. Allowed Web Origins: http://localhost:5173
4. API Audience: https://piedrazul-api

Si necesitas roles en el backend, agrega el claim
https://piedrazul.com/roles con un arreglo de valores como admin, scheduler o
patient.

## 4) Configuracion de base de datos

El backend usa SQLite local con Prisma.

Archivo de entorno:

1. backend/clinica-api/.env

Valor esperado:

```env
DATABASE_URL="file:./dev.db"
```

## 5) Instalar dependencias

### 4.1 Backend

```powershell
cd backend/clinica-api
npm install
```

### 4.2 Frontend

En otra terminal:

```powershell
cd frontend
npm install
```

## 6) Inicializar base de datos

Desde backend/clinica-api:

```powershell
npm run prisma:migrate
npm run prisma:seed
```

Esto crea la base SQLite y registra usuario administrador inicial.

## 7) Levantar el proyecto

Necesitas dos terminales abiertas.

### 6.1 Levantar backend

Desde backend/clinica-api:

```powershell
npm run start:dev
```

Backend esperado en:

1. http://localhost:3000

### 6.2 Levantar frontend

Desde frontend:

```powershell
npm run dev
```

Frontend esperado en:

1. http://localhost:5173

## 8) Credenciales de acceso

Con Auth0, inicia sesion con un usuario creado en tu tenant. Si estas usando
el flujo local con seed, entonces las credenciales son:

1. Usuario: admin
2. Contrasena: admin

## 9) Comandos utiles

### Backend

```powershell
npm run prisma:generate
npm run prisma:studio
npm run build
npm run test
```

### Frontend

```powershell
npm run build
npm run dev -- --host
```

## 10) Solucion de problemas

### Error de puerto ocupado (3000 o 5173)

1. Cierra procesos anteriores
2. Reinicia terminal
3. Vuelve a correr los comandos de arranque

### Error de Prisma al iniciar backend

Ejecuta en backend/clinica-api:

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate
```

### Login falla aunque backend esta arriba

1. Verifica que corriste npm run prisma:seed
2. Verifica credenciales admin/admin
3. Limpia localStorage del navegador y vuelve a iniciar sesion

## 11) Flujo rapido recomendado

Si quieres levantar todo rapido en el orden correcto:

Terminal 1:

```powershell
cd backend/clinica-api
npm install
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Terminal 2:

```powershell
cd frontend
npm install
npm run dev
```

Abre:

1. http://localhost:5173
  