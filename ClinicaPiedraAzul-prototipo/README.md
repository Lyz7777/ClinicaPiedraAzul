
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

## 3) Configuracion de base de datos

El backend usa SQLite local con Prisma.

Archivo de entorno:

1. backend/clinica-api/.env

Valor esperado:

```env
DATABASE_URL="file:./dev.db"
```

## 4) Instalar dependencias

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

## 5) Inicializar base de datos

Desde backend/clinica-api:

```powershell
npm run prisma:migrate
npm run prisma:seed
```

Esto crea la base SQLite y registra usuario administrador inicial.

## 6) Levantar el proyecto

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

## 7) Credenciales de acceso

Credenciales de prueba:

1. Usuario: admin
2. Contrasena: admin

## 8) Comandos utiles

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

## 9) Solucion de problemas

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

## 10) Flujo rapido recomendado

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
  