import { useState } from "react";
import {
  Calendar,
  Clock,
  Stethoscope,
  CheckCircle,
  ArrowRight,
  Info,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface Professional {
  id: number;
  name: string;
  specialty: string;
  interval: number;
  availableDays: string[];
  startTime: string;
  endTime: string;
  photo?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export function PatientSelfSchedulingPage() {
  const [step, setStep] = useState(1); // 1: Especialidad, 2: Profesional, 3: Fecha/Hora, 4: Confirmación
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [patientData, setPatientData] = useState({
    name: "María González",
    email: "maria@email.com",
    phone: "+52 123 456 7890",
  });

  // Configuración del sistema (simulada - vendría del requerimiento 4)
  const systemConfig = {
    bookingWindowWeeks: 4, // Ventana de agendamiento en semanas
  };

  const professionals: Professional[] = [
    {
      id: 1,
      name: "Dr. Juan Pérez",
      specialty: "Cardiología",
      interval: 30,
      availableDays: ["Lunes", "Miércoles", "Viernes"],
      startTime: "08:00",
      endTime: "14:00",
    },
    {
      id: 2,
      name: "Dra. María López",
      specialty: "Pediatría",
      interval: 20,
      availableDays: ["Lunes", "Martes", "Jueves", "Viernes"],
      startTime: "09:00",
      endTime: "17:00",
    },
    {
      id: 3,
      name: "Lic. Carlos Ramírez",
      specialty: "Fisioterapia",
      interval: 45,
      availableDays: ["Martes", "Miércoles", "Jueves"],
      startTime: "10:00",
      endTime: "18:00",
    },
    {
      id: 4,
      name: "Dra. Ana Martínez",
      specialty: "Neurología",
      interval: 40,
      availableDays: ["Lunes", "Miércoles", "Viernes"],
      startTime: "08:00",
      endTime: "16:00",
    },
  ];

  const specialties = Array.from(new Set(professionals.map((p) => p.specialty)));

  const filteredProfessionals = selectedSpecialty
    ? professionals.filter((p) => p.specialty === selectedSpecialty)
    : [];

  // Generar fechas disponibles basadas en la ventana de agendamiento
  const getAvailableDates = () => {
    if (!selectedProfessional) return [];

    const dates = [];
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + systemConfig.bookingWindowWeeks * 7);

    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayName = dayNames[d.getDay()];
      if (selectedProfessional.availableDays.includes(dayName) && d >= today) {
        dates.push(new Date(d));
      }
    }

    return dates;
  };

  // Generar franjas horarias disponibles
  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (!selectedProfessional || !selectedDate) return [];

    const slots: TimeSlot[] = [];
    const [startHour, startMin] = selectedProfessional.startTime.split(":").map(Number);
    const [endHour, endMin] = selectedProfessional.endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const time = `${currentHour.toString().padStart(2, "0")}:${currentMin
        .toString()
        .padStart(2, "0")}`;

      // Simulación: algunas franjas ocupadas aleatoriamente
      const isOccupied = Math.random() > 0.7;

      slots.push({
        time,
        available: !isOccupied,
      });

      currentMin += selectedProfessional.interval;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }

    return slots;
  };

  const availableDates = getAvailableDates();
  const availableTimeSlots = getAvailableTimeSlots();

  const handleConfirmAppointment = () => {
    console.log("Cita confirmada:", {
      professional: selectedProfessional,
      date: selectedDate,
      time: selectedTime,
      patient: patientData,
    });
    // Aquí se enviaría al backend
    alert("¡Cita agendada exitosamente!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">Agendar Mi Cita</h2>
        <p className="text-gray-600">
          Selecciona tu especialidad, profesional y horario de preferencia
        </p>
      </div>

      {/* Progress Steps */}
      <Card className="p-6 rounded-3xl border-0 shadow-lg">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Especialidad" },
            { num: 2, label: "Profesional" },
            { num: 3, label: "Fecha y Hora" },
            { num: 4, label: "Confirmación" },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                </div>
                <span
                  className={`text-sm mt-2 font-medium ${
                    step >= s.num ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                    step > s.num ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step 1: Seleccionar Especialidad */}
      {step === 1 && (
        <Card className="p-8 rounded-3xl border-0 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Selecciona una Especialidad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => {
                  setSelectedSpecialty(specialty);
                  setStep(2);
                }}
                className="p-6 rounded-2xl border-2 border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{specialty}</h4>
                    <p className="text-sm text-gray-600">
                      {professionals.filter((p) => p.specialty === specialty).length}{" "}
                      profesional(es) disponible(s)
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Step 2: Seleccionar Profesional */}
      {step === 2 && (
        <Card className="p-8 rounded-3xl border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Selecciona un Profesional
            </h3>
            <Button
              variant="outline"
              onClick={() => {
                setStep(1);
                setSelectedProfessional(null);
              }}
              className="rounded-2xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Cambiar Especialidad
            </Button>
          </div>

          <div className="space-y-4">
            {filteredProfessionals.map((prof) => (
              <button
                key={prof.id}
                onClick={() => {
                  setSelectedProfessional(prof);
                  setStep(3);
                }}
                className="w-full p-6 rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform">
                    {prof.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {prof.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-purple-600" />
                        <span>{prof.specialty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span>Consultas de {prof.interval} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>{prof.availableDays.join(", ")}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Horario: {prof.startTime} - {prof.endTime}
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-2 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Step 3: Seleccionar Fecha y Hora */}
      {step === 3 && selectedProfessional && (
        <Card className="p-8 rounded-3xl border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Selecciona Fecha y Hora
            </h3>
            <Button
              variant="outline"
              onClick={() => {
                setStep(2);
                setSelectedDate("");
                setSelectedTime("");
              }}
              className="rounded-2xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Cambiar Profesional
            </Button>
          </div>

          {/* Profesional seleccionado */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {selectedProfessional.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{selectedProfessional.name}</h4>
                <p className="text-sm text-gray-600">{selectedProfessional.specialty}</p>
              </div>
            </div>
          </div>

          {/* Selección de Fecha */}
          <div className="space-y-4 mb-6">
            <Label className="text-lg font-semibold">Fecha Disponible</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {availableDates.slice(0, 14).map((date, idx) => {
                const dateStr = date.toISOString().split("T")[0];
                const dayName = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][
                  date.getDay()
                ];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedTime(""); // Reset time
                    }}
                    className={`p-4 rounded-2xl text-center transition-all ${
                      selectedDate === dateStr
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105"
                        : "bg-white border-2 border-gray-200 hover:border-cyan-400 hover:bg-cyan-50"
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">{dayName}</div>
                    <div className="text-xl font-bold">{date.getDate()}</div>
                    <div className="text-xs">
                      {date.toLocaleDateString("es-ES", { month: "short" })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selección de Hora */}
          {selectedDate && (
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                Franjas Horarias Disponibles
              </Label>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {availableTimeSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      !slot.available
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : selectedTime === slot.time
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105"
                        : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedDate && selectedTime && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setStep(4)}
                className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 h-12 px-8"
              >
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Step 4: Confirmación */}
      {step === 4 && selectedProfessional && (
        <Card className="p-8 rounded-3xl border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Confirmar Cita</h3>
            <Button
              variant="outline"
              onClick={() => setStep(3)}
              className="rounded-2xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Modificar
            </Button>
          </div>

          <div className="space-y-6">
            {/* Resumen de la Cita */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-600" />
                Detalles de la Cita
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Profesional</p>
                  <p className="font-semibold text-gray-900">
                    {selectedProfessional.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Especialidad</p>
                  <p className="font-semibold text-gray-900">
                    {selectedProfessional.specialty}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedDate).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hora</p>
                  <p className="font-semibold text-gray-900">{selectedTime}</p>
                </div>
              </div>
            </div>

            {/* Datos del Paciente */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Tus Datos
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{patientData.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{patientData.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{patientData.phone}</span>
                </div>
              </div>
            </div>

            {/* Información */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-900 mb-1">
                    Importante
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Recibirás una confirmación por correo electrónico</li>
                    <li>
                      Por favor llega 10 minutos antes de tu cita
                    </li>
                    <li>
                      Si necesitas cancelar o re-agendar, hazlo con al menos 24 horas de
                      anticipación
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="flex-1 h-12 rounded-2xl"
              >
                Volver
              </Button>
              <Button
                onClick={handleConfirmAppointment}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirmar Cita
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
