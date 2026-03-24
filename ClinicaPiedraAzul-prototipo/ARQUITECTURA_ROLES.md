# Documentación: Sistema de Gestión de Citas - Separación por Roles

## Resumen de Cambios

Se ha reorganizado completamente la arquitectura del proyecto para separar las funcionalidades en **3 roles distintos** con dashboards independientes:

### 1. **ADMINISTRADOR (Admin)**
**Archivo:** `AdminDashboard.tsx`

#### Responsabilidades:
- Configurar parámetros del sistema
- Gestionar profesionales (médicos y terapistas)
- Gestionar usuarios del sistema
- Ver reportes y estadísticas
- Auditoría del sistema

#### Funcionalidades Principales:
- **Configuración del Sistema** (`SystemConfigPage.tsx`)
  - Ventana de tiempo para habilitar citas (en semanas)
  - Días de la semana que atiende cada profesional
  - Franja horaria de cada profesional
  - Intervalo de tiempo (minutos) entre citas

- **Gestión de Profesionales** (`ProfessionalsManagementPage.tsx`)
  - Agregar/editar/eliminar médicos y terapistas
  - Configurar disponibilidad
  - Asignar especialidades

- **Gestión de Usuarios** (`UsersManagementPage.tsx`)
  - Crear/editar/eliminar usuarios
  - Asignar roles

- **Reportes** (`ReportsPage.tsx`)
  - Estadísticas de citas
  - Uso del sistema
  - Análisis de disponibilidad

- **Log de Auditoría** (`AuditLogPage.tsx`)
  - Registro de todas las acciones del sistema

---

### 2. **AGENDADOR DE CITAS (Scheduler)**
**Archivo:** `SchedulerDashboard.tsx`

#### Responsabilidades:
- Agendar citas para pacientes que contactan por WhatsApp o teléfono
- Visualizar citas disponibles
- Ver lista de citas por día y profesional
- Crear nuevas citas

#### Funcionalidades Principales:
- **Dashboard de Citas del Día**
  - Vista rápida de citas programadas
  - Filtrado por fecha y profesional
  - Estado de confirmación

- **Nueva Cita** (`AppointmentSchedulingPage.tsx`)
  - Capturar datos del paciente:
    - Número de documento de identidad (requerido)
    - Nombres y apellidos (requerido)
    - Celular (requerido)
    - Género: Hombre, Mujer, Otro (requerido)
    - Fecha de nacimiento (opcional)
    - Correo electrónico (opcional)
  
  - Seleccionar:
    - Médico/terapista
    - Hora disponible (respetando intervalos configurados)
  
  - Validaciones:
    - Respetar intervalo de tiempo de cada profesional
    - Mostrar solo horarios disponibles
    - Evitar duplicados

- **Tabla de Citas**
  - Listado de citas filtradas
  - Información del paciente
  - Estado de la cita
  - Contacto rápido (teléfono)
  - Opciones de editar/cancelar

---

### 3. **PACIENTE (Patient)**
**Archivo:** `PatientDashboard.tsx`

#### Responsabilidades:
- Auto-servicio de agendamiento de citas
- Visualizar citas programadas
- Consultar disponibilidad
- Cancelar/reprogramar citas

#### Funcionalidades Principales:
- **Auto-Agendamiento** (`PatientSelfSchedulingPage.tsx`)
  - Requiere registro previo de usuario
  - Seleccionar profesional
  - Ver franjas horarias disponibles
  - Agendar cita de forma segura y eficiente
  - Sistema de confirmación

- **Mis Citas**
  - Ver citas programadas
  - Estado de cada cita
  - Información del profesional
  - Ubicación de la consulta

- **Historial**
  - Registro de citas anteriores
  - Información completada en citas

---

## Flujo de Navegación

```
LOGIN (LoginPage.tsx)
├─ Seleccionar Rol: Admin | Scheduler | Patient
└─ Autenticación
    ├─ → ADMIN DASHBOARD
    │   ├─ Configuración del Sistema
    │   ├─ Gestión de Profesionales
    │   ├─ Gestión de Usuarios
    │   ├─ Reportes
    │   └─ Log de Auditoría
    │
    ├─ → SCHEDULER DASHBOARD
    │   ├─ Citas del Día (Búsqueda y Filtro)
    │   └─ Nueva Cita
    │
    └─ → PATIENT DASHBOARD
        ├─ Auto-Agendamiento de Citas
        ├─ Mis Citas
        └─ Historial
```

---

## Archivos Modificados

### App.tsx
```typescript
// Ahora soporta 3 dashboards separados
- AdminDashboard (admin-dashboard)
- SchedulerDashboard (scheduler-dashboard)
- PatientDashboard (patient-dashboard)
```

### LoginPage.tsx
```typescript
// Ahora tiene 3 opciones de rol
- Admin: Administrador
- Scheduler: Agendador de Citas
- Patient: Paciente
```

---

## Nuevos Componentes Creados

1. **AdminDashboard.tsx**
   - Dashboard principal para administradores
   - Acceso a todas las funciones de configuración

2. **SchedulerDashboard.tsx**
   - Dashboard para agendadores de citas
   - Enfocado en búsqueda y creación de citas
   - Tabla de citas del día con filtros

---

## Componentes Existentes Reutilizados

Los siguientes componentes ya existían y se mantienen:

- `SystemConfigPage.tsx` → Usado por AdminDashboard
- `UsersManagementPage.tsx` → Usado por AdminDashboard
- `ProfessionalsManagementPage.tsx` → Usado por AdminDashboard
- `AppointmentSchedulingPage.tsx` → Usado por SchedulerDashboard y PatientDashboard
- `PatientSelfSchedulingPage.tsx` → Usado por PatientDashboard
- `ReportsPage.tsx` → Usado por AdminDashboard
- `AuditLogPage.tsx` → Usado por AdminDashboard
- `PatientDashboard.tsx` → Dashboard de pacientes
- `MedicalHistoryPage.tsx` → Disponible para ampliar

---

## Características Clave de Seguridad

1. **Validación de Roles**
   - Cada rol solo puede acceder a su dashboard correspondiente
   - En producción, implementar validación en el backend

2. **Protección de Datos de Pacientes**
   - Los agendadores solo ven lo necesario para agendar
   - Los pacientes solo ven sus propias citas

3. **Log de Auditoría**
   - Registro de todas las acciones
   - Especialmente importante para cambios en configuración

---

## Próximos Pasos para Implementación Completa

1. **Backend/API**
   - Crear endpoints para cada rol
   - Implementar autenticación y autorización
   - Base de datos con esquema de roles

2. **Validaciones**
   - Implementar todas las validaciones en cliente
   - Validaciones duplicadas en servidor

3. **Integración con Datos Reales**
   - Conectar con base de datos de profesionales
   - Sincronizar disponibilidad
   - Gestionar confirmaciones de citas

4. **Notificaciones**
   - Email de confirmación
   - SMS/WhatsApp para pacientes
   - Recordatorios de citas

5. **Reportes Avanzados**
   - Análisis de utilización
   - Tendencias de demanda
   - Eficiencia de profesionales

---

## Estructura de Carpetas Actualizada

```
src/app/components/
├── AdminDashboard.tsx (NUEVO)
├── SchedulerDashboard.tsx (NUEVO)
├── PatientDashboard.tsx (EXISTENTE)
├── LoginPage.tsx (MODIFICADO)
├── RegisterPage.tsx
├── AppointmentSchedulingPage.tsx
├── PatientSelfSchedulingPage.tsx
├── SystemConfigPage.tsx
├── UsersManagementPage.tsx
├── ProfessionalsManagementPage.tsx
├── MedicalHistoryPage.tsx
├── ReportsPage.tsx
├── AuditLogPage.tsx
└── ui/
    └── [...componentes de UI]
```

---

## Notas Importantes

⚠️ **En Desarrollo**: Los componentes de funcionalidades específicas (`SystemConfigPage`, `AppointmentSchedulingPage`, etc.) aún necesitan ser completos con toda la lógica de negocio según los requisitos.

✅ **Arquitectura Lista**: La separación de roles está completamente implementada y lista para agregar las funcionalidades específicas.

