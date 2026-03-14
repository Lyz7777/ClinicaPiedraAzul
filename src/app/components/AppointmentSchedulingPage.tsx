import { useState } from "react";
import {
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Select } from "./ui/select";

interface PatientData {
  documentType: "CC" | "CE" | "Pasaporte";
  document: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: "M" | "F" | "O";
  birthDate?: string;
  email?: string;
}

interface AppointmentData {
  professionalId: string;
  professionalName: string;
  specialty: string;
  date: string;
  time: string;
  reason?: string;
}

interface Professional {
  id: string;
  name: string;
  specialty: string;
  startTime: string;
  endTime: string;
  appointmentDuration: number;
  workingDays: boolean[];
  breakTimes: { start: string; end: string }[];
}

export function AppointmentSchedulingPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [patientData, setPatientData] = useState<PatientData>({
    documentType: "CC",
    document: "",
    firstName: "",
    lastName: "",
    phone: "",
    gender: "M",
  });

  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    professionalId: "",
    professionalName: "",
    specialty: "",
    date: "",
    time: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Datos simulados - en producción vendrían del backend
  const professionals: Professional[] = [
    {
      id: "1",
      name: "Dr. Juan Pérez",
      specialty: "Cardiología",
      startTime: "08:00",
      endTime: "17:00",
      appointmentDuration: 30,
      workingDays: [false, true, true, true, true, true, false],
      breakTimes: [{ start: "12:00", end: "13:00" }],
    },
    {
      id: "2",
      name: "Dra. Ana López",
      specialty: "Neurología",
      startTime: "09:00",
      endTime: "18:00",
      appointmentDuration: 45,
      workingDays: [false, true, true, true, true, true, false],
      breakTimes: [{ start: "12:00", end: "13:00" }],
    },
    {
      id: "3",
      name: "Dra. Laura Martínez",
      specialty: "Pediatría",
      startTime: "08:00",
      endTime: "16:00",
      appointmentDuration: 30,
      workingDays: [false, true, true, true, true, false, false],
      breakTimes: [{ start: "12:00", end: "13:00" }],
    },
  ];

  // PASO 1: Validar datos del paciente
  const validatePatientData = () => {
    const newErrors: Record<string, string> = {};

    if (!patientData.document) {
      newErrors.document = "El documento es requerido";
    } else if (patientData.document.length < 5) {
      newErrors.document = "El documento debe tener al menos 5 caracteres";
    }

    if (!patientData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    }

    if (!patientData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    }

    if (!patientData.phone) {
      newErrors.phone = "El celular es requerido";
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(patientData.phone)) {
      newErrors.phone = "El formato del celular no es válido";
    }

    if (patientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      newErrors.email = "El email no es válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // PASO 3: Calcular horarios disponibles
  const calculateAvailableSlots = (professionalId: string, date: string) => {
    const professional = professionals.find((p) => p.id === professionalId);
    if (!professional) return [];

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Verificar que sea día laboral
    if (!professional.workingDays[dayOfWeek]) {
      return [];
    }

    const slots: string[] = [];

    // Convertir hora a minutos
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const minutesToTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    };

    let currentTime = timeToMinutes(professional.startTime);
    const endTime = timeToMinutes(professional.endTime);
    const duration = professional.appointmentDuration;

    while (currentTime + duration <= endTime) {
      // Verificar que no esté en descanso
      let isInBreak = false;
      for (const breakTime of professional.breakTimes) {
        const breakStart = timeToMinutes(breakTime.start);
        const breakEnd = timeToMinutes(breakTime.end);
        if (currentTime >= breakStart && currentTime < breakEnd) {
          isInBreak = true;
          break;
        }
      }

      // TODO: Verificar que no esté ocupado (comparar con citas existentes)
      if (!isInBreak) {
        slots.push(minutesToTime(currentTime));
      }

      currentTime += duration;
    }

    return slots;
  };

  // Manejadores de cambio
  const handlePatientChange = (field: keyof PatientData, value: any) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleProfessionalSelect = (professionalId: string) => {
    const professional = professionals.find((p) => p.id === professionalId);
    if (professional) {
      setAppointmentData((prev) => ({
        ...prev,
        professionalId,
        professionalName: professional.name,
        specialty: professional.specialty,
      }));
    }
  };

  const handleDateSelect = (date: string) => {
    setAppointmentData((prev) => ({
      ...prev,
      date,
      time: "", // Limpiar hora seleccionada
    }));
    // Calcular slots disponibles
    const slots = calculateAvailableSlots(appointmentData.professionalId, date);
    setAvailableSlots(slots);
  };

  // Renderizar paso 1: Datos del paciente
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-cyan-800">
          Completa la información del paciente que desea agendar la cita
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 mb-2 block">Tipo de Documento</Label>
          <select
            value={patientData.documentType}
            onChange={(e) =>
              handlePatientChange("documentType", e.target.value)
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
        </div>

        <div>
          <Label className="text-gray-700 mb-2 block">
            Número de Documento {errors.document && <span className="text-red-600">*</span>}
          </Label>
          <Input
            value={patientData.document}
            onChange={(e) => handlePatientChange("document", e.target.value)}
            placeholder="Ej: 1234567890"
            className={errors.document ? "border-red-500" : ""}
          />
          {errors.document && (
            <p className="text-red-600 text-xs mt-1">{errors.document}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 mb-2 block">
            Nombre {errors.firstName && <span className="text-red-600">*</span>}
          </Label>
          <Input
            value={patientData.firstName}
            onChange={(e) => handlePatientChange("firstName", e.target.value)}
            placeholder="Ej: María"
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && (
            <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <Label className="text-gray-700 mb-2 block">
            Apellido {errors.lastName && <span className="text-red-600">*</span>}
          </Label>
          <Input
            value={patientData.lastName}
            onChange={(e) => handlePatientChange("lastName", e.target.value)}
            placeholder="Ej: González"
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && (
            <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 mb-2 block">
            Celular {errors.phone && <span className="text-red-600">*</span>}
          </Label>
          <Input
            type="tel"
            value={patientData.phone}
            onChange={(e) => handlePatientChange("phone", e.target.value)}
            placeholder="Ej: +57 312 456 7890"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <Label className="text-gray-700 mb-2 block">Género</Label>
          <select
            value={patientData.gender}
            onChange={(e) => handlePatientChange("gender", e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="M">Hombre</option>
            <option value="F">Mujer</option>
            <option value="O">Otro</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 mb-2 block">
            Fecha de Nacimiento (Opcional)
          </Label>
          <Input
            type="date"
            value={patientData.birthDate || ""}
            onChange={(e) => handlePatientChange("birthDate", e.target.value)}
          />
        </div>

        <div>
          <Label className="text-gray-700 mb-2 block">
            Correo Electrónico (Opcional)
          </Label>
          <Input
            type="email"
            value={patientData.email || ""}
            onChange={(e) => handlePatientChange("email", e.target.value)}
            placeholder="email@ejemplo.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <Button
        onClick={() => {
          if (validatePatientData()) {
            setStep(2);
          }
        }}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
        size="lg"
      >
        Continuar a Profesional
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  // Renderizar paso 2: Seleccionar profesional
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Selecciona el Profesional
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {professionals.map((prof) => (
            <Card
              key={prof.id}
              onClick={() => {
                handleProfessionalSelect(prof.id);
                setStep(3);
              }}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg border-2 ${
                appointmentData.professionalId === prof.id
                  ? "border-cyan-500 bg-cyan-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{prof.name}</p>
                  <p className="text-sm text-gray-600">{prof.specialty}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {prof.startTime} - {prof.endTime} | Citas de {prof.appointmentDuration} min
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setStep(1)}
          variant="outline"
          className="flex-1"
        >
          Atrás
        </Button>
      </div>
    </div>
  );

  // Renderizar paso 3: Seleccionar fecha y hora
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Selecciona Fecha y Hora
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 mb-2 block">Fecha</Label>
            <Input
              type="date"
              value={appointmentData.date}
              onChange={(e) => handleDateSelect(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {appointmentData.date && availableSlots.length > 0 && (
            <div>
              <Label className="text-gray-700 mb-2 block">Hora Disponible</Label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() =>
                      setAppointmentData((prev) => ({
                        ...prev,
                        time: slot,
                      }))
                    }
                    className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      appointmentData.time === slot
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-gray-200 text-gray-700 hover:border-cyan-300"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {appointmentData.date && availableSlots.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                No hay horarios disponibles para la fecha seleccionada
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setStep(2)}
          variant="outline"
          className="flex-1"
        >
          Atrás
        </Button>
        <Button
          onClick={() => setStep(4)}
          disabled={!appointmentData.date || !appointmentData.time}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
        >
          Continuar
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Renderizar paso 4: Motivo (opcional)
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Motivo de la Consulta (Opcional)
        </h2>
        <textarea
          value={appointmentData.reason || ""}
          onChange={(e) =>
            setAppointmentData((prev) => ({
              ...prev,
              reason: e.target.value,
            }))
          }
          placeholder="Describe brevemente el motivo de tu consulta..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent h-32 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setStep(3)}
          variant="outline"
          className="flex-1"
        >
          Atrás
        </Button>
        <Button
          onClick={() => setStep(5)}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
        >
          Revisar Cita
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Renderizar paso 5: Confirmación
  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-800">
          Revisa los datos de tu cita antes de confirmar
        </p>
      </div>

      {/* Resumen de datos del paciente */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Datos del Paciente
        </h3>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2">
            <p className="text-gray-600">Documento:</p>
            <p className="font-medium text-gray-900">
              {patientData.document} ({patientData.documentType})
            </p>
          </div>
          <div className="grid grid-cols-2">
            <p className="text-gray-600">Nombre:</p>
            <p className="font-medium text-gray-900">
              {patientData.firstName} {patientData.lastName}
            </p>
          </div>
          <div className="grid grid-cols-2">
            <p className="text-gray-600">Celular:</p>
            <p className="font-medium text-gray-900">{patientData.phone}</p>
          </div>
          {patientData.email && (
            <div className="grid grid-cols-2">
              <p className="text-gray-600">Correo:</p>
              <p className="font-medium text-gray-900">{patientData.email}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Resumen de la cita */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Datos de la Cita
        </h3>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2">
            <p className="text-gray-600">Profesional:</p>
            <p className="font-medium text-gray-900">{appointmentData.professionalName}</p>
          </div>
          <div className="grid grid-cols-2">
            <p className="text-gray-600">Especialidad:</p>
            <p className="font-medium text-gray-900">{appointmentData.specialty}</p>
          </div>
          <div className="grid grid-cols-2">
            <p className="text-gray-600">Fecha:</p>
            <p className="font-medium text-gray-900">
              {new Date(appointmentData.date).toLocaleDateString("es-ES")}
            </p>
          </div>
          <div className="grid grid-cols-2">
            <p className="text-gray-600">Hora:</p>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {appointmentData.time}
            </p>
          </div>
          {appointmentData.reason && (
            <div className="grid grid-cols-2">
              <p className="text-gray-600">Motivo:</p>
              <p className="font-medium text-gray-900">{appointmentData.reason}</p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={() => setStep(4)}
          variant="outline"
          className="flex-1"
        >
          Atrás
        </Button>
        <Button
          onClick={() => {
            // TODO: Enviar datos al backend
            alert("¡Cita agendada exitosamente!");
            // setStep(1); // Reiniciar
          }}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          size="lg"
        >
          Confirmar Cita
        </Button>
      </div>
    </div>
  );

  // Indicador de progreso
  const progressSteps = [
    { number: 1, label: "Paciente" },
    { number: 2, label: "Profesional" },
    { number: 3, label: "Fecha/Hora" },
    { number: 4, label: "Motivo" },
    { number: 5, label: "Confirmación" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Indicador de progreso */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {progressSteps.map((s) => (
            <div key={s.number} className="flex-1 flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  s.number <= step
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {s.number}
              </div>
              {s.number < progressSteps.length && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    s.number < step ? "bg-cyan-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          {progressSteps.map((s) => (
            <span key={s.number} className="text-center flex-1">
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Contenido del paso actual */}
      <Card className="p-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </Card>
    </div>
  );
}

