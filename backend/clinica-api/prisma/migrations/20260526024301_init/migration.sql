/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Medico` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Medico` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ConfiguracionGlobal` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ConfiguracionGlobal` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ConfiguracionMedico` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ConfiguracionMedico` table. All the data in the column will be lost.
  - Added the required column `auth0Id` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "HistorialCita" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "citaId" INTEGER NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT NOT NULL,
    "valorNuevo" TEXT NOT NULL,
    "modificadoPor" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistorialCita_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cita" (
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
    CONSTRAINT "Cita_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Cita_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cita" ("createdAt", "descripcion", "estado", "fecha", "hora", "id", "medicoId", "pacienteId", "updatedAt") SELECT "createdAt", "descripcion", "estado", "fecha", "hora", "id", "medicoId", "pacienteId", "updatedAt" FROM "Cita";
DROP TABLE "Cita";
ALTER TABLE "new_Cita" RENAME TO "Cita";
CREATE UNIQUE INDEX "Cita_codigoVerificacion_key" ON "Cita"("codigoVerificacion");
CREATE TABLE "new_Medico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "auth0Id" TEXT
);
INSERT INTO "new_Medico" ("especialidad", "id", "nombre") SELECT "especialidad", "id", "nombre" FROM "Medico";
DROP TABLE "Medico";
ALTER TABLE "new_Medico" RENAME TO "Medico";
CREATE UNIQUE INDEX "Medico_auth0Id_key" ON "Medico"("auth0Id");
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "auth0Id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'paciente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Usuario" ("id", "role", "username") SELECT "id", "role", "username" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_auth0Id_key" ON "Usuario"("auth0Id");
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");
CREATE TABLE "new_Paciente" (
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
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Paciente" ("apellidos", "celular", "createdAt", "documento", "email", "fechaNacimiento", "genero", "id", "nombres", "updatedAt") SELECT "apellidos", "celular", "createdAt", "documento", "email", "fechaNacimiento", "genero", "id", "nombres", "updatedAt" FROM "Paciente";
DROP TABLE "Paciente";
ALTER TABLE "new_Paciente" RENAME TO "Paciente";
CREATE UNIQUE INDEX "Paciente_auth0Id_key" ON "Paciente"("auth0Id");
CREATE UNIQUE INDEX "Paciente_documento_key" ON "Paciente"("documento");
CREATE TABLE "new_ConfiguracionGlobal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ventanaSemanas" INTEGER NOT NULL DEFAULT 4
);
INSERT INTO "new_ConfiguracionGlobal" ("id", "ventanaSemanas") SELECT "id", "ventanaSemanas" FROM "ConfiguracionGlobal";
DROP TABLE "ConfiguracionGlobal";
ALTER TABLE "new_ConfiguracionGlobal" RENAME TO "ConfiguracionGlobal";
CREATE TABLE "new_ConfiguracionMedico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicoId" INTEGER NOT NULL,
    "diasAtencion" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "intervaloMinutos" INTEGER NOT NULL DEFAULT 30,
    CONSTRAINT "ConfiguracionMedico_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ConfiguracionMedico" ("diasAtencion", "horaFin", "horaInicio", "id", "intervaloMinutos", "medicoId") SELECT "diasAtencion", "horaFin", "horaInicio", "id", "intervaloMinutos", "medicoId" FROM "ConfiguracionMedico";
DROP TABLE "ConfiguracionMedico";
ALTER TABLE "new_ConfiguracionMedico" RENAME TO "ConfiguracionMedico";
CREATE UNIQUE INDEX "ConfiguracionMedico_medicoId_key" ON "ConfiguracionMedico"("medicoId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
