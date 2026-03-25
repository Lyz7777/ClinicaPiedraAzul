# Guía de Implementación por Rol

## 1. ROL ADMINISTRADOR - Implementación Detallada

### 1.1 SystemConfigPage.tsx - Configuración del Sistema

**Campos a Capturar:**

```typescript
interface SystemConfig {
  // Ventana de tiempo para habilitar citas
  citesWindowWeeks: number;  // Ej: 4 semanas
  
  // Configuración por profesional
  professionals: {
    id: string;
    name: string;
    specialty: string;
    
    // Días que atiende (Lun-Dom)
    workingDays: boolean[]; // [true, true, true, true, true, false, false]
    
    // Franja horaria
    startTime: string; // Ej: "08:00"
    endTime: string;   // Ej: "17:00"
    
    // Intervalo entre citas (minutos)
    appointmentDuration: number; // Ej: 30
    
    // Descansos
    breakTimes: {
      start: string; // Ej: "12:00"
      end: string;   // Ej: "13:00"
    }[];
  }[];
}
```

**Componente Sugerido:**
```tsx
export function SystemConfigPage() {
  const [config, setConfig] = useState<SystemConfig>({
    citesWindowWeeks: 4,
    professionals: []
  });

  // Funciones necesarias:
  // - loadConfiguration() - Traer config actual
  // - savConfiguration() - Guardar cambios
  // - addProfessional()
  // - updateProfessional()
  // - deleteProfessional()
}
```

---

### 1.2 ProfessionalsManagementPage.tsx - Gestión de Profesionales

**CRUD Completo de Profesionales:**

```typescript
interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  license: string;
  
  // Configuración de disponibilidad
  workingDays: boolean[];
  startTime: string;
  endTime: string;
  appointmentDuration: number;
  breakTimes: BreakTime[];
  
  // Estado
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Funcionalidades:**
- ✅ Listar profesionales en tabla
- ✅ Crear nuevo profesional
- ✅ Editar información profesional
- ✅ Cambiar disponibilidad
- ✅ Desactivar/activar profesionales
- ✅ Eliminar profesionales

---

### 1.3 UsersManagementPage.tsx - Gestión de Usuarios

**Tipos de Usuario:**

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "scheduler" | "patient";
  
  // Solo para pacientes
  documentType?: "CC" | "CE" | "Pasaporte";
  document?: string;
  phone?: string;
  birthDate?: Date;
  
  // Estado
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}
```

**Funcionalidades:**
- ✅ Listar usuarios con rol
- ✅ Crear usuarios por rol
- ✅ Cambiar rol de usuario
- ✅ Desactivar/activar usuarios
- ✅ Ver último acceso
- ✅ Resetear contraseña

---

### 1.4 ReportsPage.tsx - Reportes del Sistema

**Reportes Sugeridos:**

1. **Citas por Profesional**
   - Cantidad de citas por profesional
   - Tasa de ocupación
   - Ingresos estimados

2. **Citas por Especialidad**
   - Demanda por especialidad
   - Tendencias

3. **Pacientes**
   - Total de pacientes
   - Nuevos pacientes este mes
   - Pacientes recurrentes

4. **Utilización del Sistema**
   - Citas confirmadas vs canceladas
   - Tasa de no-show

---

### 1.5 AuditLogPage.tsx - Log de Auditoría

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: "appointment" | "professional" | "user" | "config";
  entityId: string;
  changes: {
    before: any;
    after: any;
  };
  timestamp: Date;
  ipAddress?: string;
}
```

**Funcionalidades:**
- ✅ Filtrar por fecha
- ✅ Filtrar por usuario
- ✅ Filtrar por tipo de acción
- ✅ Ver detalles de cambios

---

## 2. ROL AGENDADOR DE CITAS - Implementación Detallada

### 2.1 AppointmentSchedulingPage.tsx - Crear Cita Manual

**Flujo de Creación:**

```
PASO 1: Datos del Paciente
├─ Número de Documento (REQUERIDO)
├─ Nombres y Apellidos (REQUERIDO)
├─ Celular (REQUERIDO)
├─ Género: Hombre, Mujer, Otro (REQUERIDO)
├─ Fecha de Nacimiento (OPCIONAL)
└─ Correo (OPCIONAL)

PASO 2: Seleccionar Profesional
├─ Listar profesionales activos
├─ Filtrar por especialidad
└─ Mostrar disponibilidad

PASO 3: Seleccionar Hora
├─ Mostrar calendario con días disponibles
├─ Mostrar horas disponibles según intervalo
└─ Respetar configuración de descansos

PASO 4: Confirmación
├─ Resumen de cita
└─ Confirmar agendamiento
```

**Estructura de Datos:**

```typescript
interface NewAppointmentForm {
  // Datos del paciente
  patientData: {
    documentType: "CC" | "CE" | "Pasaporte";
    document: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: "M" | "F" | "O";
    birthDate?: Date;
    email?: string;
  };
  
  // Datos de la cita
  appointmentData: {
    professionalId: string;
    date: Date;
    time: string; // HH:mm
    notes?: string;
  };
}
```

**Validaciones Críticas:**
```typescript
// 1. Validar documento único
// 2. Validar teléfono formato
// 3. Validar email (si se proporciona)
// 4. Validar que la hora no está ocupada
// 5. Validar dentro de ventana configurada
// 6. Validar que es día laboral del profesional
```

**Algoritmo para Mostrar Horarios Disponibles:**

```typescript
function getAvailableSlots(professional: Professional, date: Date) {
  const dayOfWeek = date.getDay();
  
  // 1. Verificar que sea día laboral
  if (!professional.workingDays[dayOfWeek]) return [];
  
  // 2. Generar slots de tiempo
  const slots = [];
  let currentTime = parseTime(professional.startTime);
  const endTime = parseTime(professional.endTime);
  const duration = professional.appointmentDuration;
  
  while (currentTime < endTime) {
    // 3. Saltar descansos
    if (!isInBreakTime(currentTime, professional.breakTimes)) {
      // 4. Verificar que no está ocupado
      if (!isSlotBooked(professional.id, date, currentTime)) {
        slots.push(currentTime);
      }
    }
    currentTime += duration;
  }
  
  return slots;
}
```

---

### 2.2 SchedulerDashboard.tsx - Vista de Citas del Día

**Tabla de Citas con Filtros:**

```typescript
interface AppointmentListFilters {
  date: Date;
  professionalId?: string;
  status?: "Confirmada" | "Pendiente" | "Cancelada";
  searchText?: string; // Buscar por nombre paciente
}
```

**Funcionalidades:**
- ✅ Listar citas del día filtradas
- ✅ Mostrar información completa del paciente
- ✅ Ver estado de confirmación
- ✅ Contacto rápido (teléfono, email)
- ✅ Editar cita (cambiar hora/profesional)
- ✅ Cancelar cita
- ✅ Enviar recordatorio (SMS/Email)
- ✅ Marcar como completada/no-show

**Información a Mostrar por Cita:**
```
| Hora | Paciente | Documento | Profesional | Especialidad | Estado | Contacto | Acciones |
|------|----------|-----------|-------------|--------------|--------|----------|----------|
```

---

## 3. ROL PACIENTE - Implementación Detallada

### 3.1 PatientSelfSchedulingPage.tsx - Auto-Agendamiento

**Requisito Previo:** El paciente debe estar registrado y autenticado

**Flujo:**

```
PASO 1: Seleccionar Especialidad
├─ Listar especialidades disponibles
└─ Mostrar profesionales por especialidad

PASO 2: Seleccionar Profesional
├─ Mostrar información del profesional
├─ Mostrar calificación/comentarios
└─ Mostrar disponibilidad

PASO 3: Seleccionar Fecha y Hora
├─ Calendario interactivo
├─ Mostrar solo días con disponibilidad
├─ Mostrar solo horas disponibles
└─ Indicador de ocupación

PASO 4: Motivo de la Consulta (OPCIONAL)
├─ Texto libre para descripción
└─ Adjuntar documentos

PASO 5: Confirmación
├─ Resumen de cita
├─ Términos y condiciones
└─ Confirmar agendamiento
```

**Estructura de Datos:**

```typescript
interface PatientAppointment {
  patientId: string;
  professionalId: string;
  date: Date;
  time: string;
  reason?: string;
  attachments?: string[]; // URLs de documentos
  
  // Control
  status: "Confirmada" | "Pendiente";
  createdAt: Date;
  confirmationToken?: string;
}
```

**Seguridad:**
```typescript
// ✅ El paciente solo ve su propia información
// ✅ Solo puede agendar en nombre propio
// ✅ Validar token de sesión
// ✅ No mostrar datos de otros pacientes
```

---

### 3.2 PatientDashboard.tsx - Vista de Citas del Paciente

**Secciones:**

1. **Mis Citas Próximas**
   - Citas confirmadas
   - Citas pendientes
   - Opción de cancelar/reagendar

2. **Historial de Citas**
   - Citas completadas
   - Citas canceladas
   - Informes/documentos

3. **Mi Perfil**
   - Editar datos personales
   - Cambiar contraseña
   - Preferencias

---

## 4. Entidades de Base de Datos Sugeridas

### Tabla: patients
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  document_type VARCHAR(20),
  document VARCHAR(50) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  gender CHAR(1), -- M, F, O
  birth_date DATE,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: professionals
```sql
CREATE TABLE professionals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  specialty VARCHAR(100),
  license VARCHAR(50),
  start_time TIME,
  end_time TIME,
  appointment_duration INT, -- minutos
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: appointments
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  professional_id UUID REFERENCES professionals(id),
  appointment_date DATE,
  appointment_time TIME,
  reason TEXT,
  status VARCHAR(50), -- Confirmada, Pendiente, Cancelada
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: professional_schedules
```sql
CREATE TABLE professional_schedules (
  id UUID PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id),
  day_of_week INT, -- 0-6 (Dom-Sab)
  is_working_day BOOLEAN,
  PRIMARY KEY (professional_id, day_of_week)
);
```

### Tabla: system_config
```sql
CREATE TABLE system_config (
  id UUID PRIMARY KEY,
  cites_window_weeks INT,
  config_json JSONB, -- Configuraciones adicionales
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100),
  entity VARCHAR(50),
  entity_id VARCHAR(100),
  changes JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Endpoints API Sugeridos

### Admin Endpoints
```
GET    /api/admin/config                    - Obtener configuración
POST   /api/admin/config                    - Actualizar configuración
GET    /api/admin/professionals             - Listar profesionales
POST   /api/admin/professionals             - Crear profesional
PUT    /api/admin/professionals/:id         - Actualizar profesional
DELETE /api/admin/professionals/:id         - Eliminar profesional
GET    /api/admin/users                     - Listar usuarios
POST   /api/admin/users                     - Crear usuario
PUT    /api/admin/users/:id                 - Actualizar usuario
DELETE /api/admin/users/:id                 - Eliminar usuario
GET    /api/admin/reports                   - Obtener reportes
GET    /api/admin/audit-logs                - Obtener logs de auditoría
```

### Scheduler Endpoints
```
GET    /api/scheduler/appointments          - Listar citas (con filtros)
POST   /api/scheduler/appointments          - Crear cita
PUT    /api/scheduler/appointments/:id      - Editar cita
DELETE /api/scheduler/appointments/:id      - Cancelar cita
GET    /api/scheduler/professionals         - Listar profesionales
GET    /api/scheduler/available-slots/:prof - Obtener horarios disponibles
POST   /api/scheduler/send-reminder/:id     - Enviar recordatorio
```

### Patient Endpoints
```
GET    /api/patient/profile                 - Obtener perfil
PUT    /api/patient/profile                 - Actualizar perfil
GET    /api/patient/appointments            - Obtener mis citas
POST   /api/patient/appointments            - Agendar cita
PUT    /api/patient/appointments/:id        - Editar mi cita
DELETE /api/patient/appointments/:id        - Cancelar mi cita
GET    /api/patient/professionals           - Listar profesionales
GET    /api/patient/available-slots/:prof   - Obtener horarios disponibles
GET    /api/patient/appointment-history     - Historial de citas
```

---

## 6. Checklist de Implementación

### Fase 1: Base (Ya completada)
- [x] Separación de roles en Login
- [x] Dashboards independientes por rol
- [x] Estructura base de componentes

### Fase 2: Admin
- [ ] SystemConfigPage funcional
- [ ] ProfessionalsManagementPage CRUD
- [ ] UsersManagementPage CRUD
- [ ] ReportsPage con datos reales
- [ ] AuditLogPage con filtros

### Fase 3: Scheduler
- [ ] Tabla de citas del día con filtros
- [ ] Nueva cita con validación
- [ ] Algoritmo de slots disponibles
- [ ] Editar cita
- [ ] Cancelar cita

### Fase 4: Patient
- [ ] Auto-agendamiento con wizard
- [ ] Mis citas listadas
- [ ] Cancelar/reagendar cita
- [ ] Historial de citas

### Fase 5: Backend e Integración
- [ ] Crear endpoints API
- [ ] Crear tablas en BD
- [ ] Autenticación y autorización
- [ ] Validaciones en servidor
- [ ] Notificaciones (Email/SMS)

---

**¡Espero que esta guía te ayude a completar la implementación!** 🎯

