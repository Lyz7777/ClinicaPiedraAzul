/*
  Warnings:

  - You are about to drop the `Cita` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConfiguracionGlobal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConfiguracionMedico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistorialCita` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Medico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Paciente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Cita";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ConfiguracionGlobal";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ConfiguracionMedico";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HistorialCita";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Medico";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Paciente";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Usuario";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "auth0Id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'paciente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "paciente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "auth0Id" TEXT,
    "documento" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "fechaNacimiento" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "usuarioId" INTEGER,
    CONSTRAINT "paciente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "auth0Id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "usuarioId" INTEGER,
    CONSTRAINT "medico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "configuracionMedico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicoId" INTEGER NOT NULL,
    "diasAtencion" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "intervaloMinutos" INTEGER NOT NULL DEFAULT 30,
    CONSTRAINT "configuracionMedico_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "configuracionGlobal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ventanaSemanas" INTEGER NOT NULL DEFAULT 4
);

-- CreateTable
CREATE TABLE "cita" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'AGENDADA',
    "codigoVerificacion" TEXT,
    "recordatorioEnviado" BOOLEAN NOT NULL DEFAULT false,
    "recordatorioEnviadoEn" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cita_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cita_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historialCita" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "citaId" INTEGER NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT NOT NULL,
    "valorNuevo" TEXT NOT NULL,
    "modificadoPor" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historialCita_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "cita" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_auth0Id_key" ON "usuario"("auth0Id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_username_key" ON "usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "paciente_auth0Id_key" ON "paciente"("auth0Id");

-- CreateIndex
CREATE UNIQUE INDEX "paciente_documento_key" ON "paciente"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "paciente_usuarioId_key" ON "paciente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "medico_auth0Id_key" ON "medico"("auth0Id");

-- CreateIndex
CREATE UNIQUE INDEX "medico_usuarioId_key" ON "medico"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "configuracionMedico_medicoId_key" ON "configuracionMedico"("medicoId");

-- CreateIndex
CREATE UNIQUE INDEX "cita_codigoVerificacion_key" ON "cita"("codigoVerificacion");
