import { useState } from "react";
import {
  Settings,
  Save,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Label } from "./ui/label";

interface ProfessionalConfig {
  id: number;
  name: string;
  specialty: string;
  availableDays: string[];
  startTime: string;
  endTime: string;
  interval: number;
  enabled: boolean;
}

export function SystemConfigPage() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Configuración general del sistema
  const [generalConfig, setGeneralConfig] = useState({
    bookingWindowWeeks: 4,
    minCancellationHours: 24,
    maxAppointmentsPerDay: 50,
  });

  // Configuración de profesionales
  const [professionalsConfig, setProfessionalsConfig] = useState<ProfessionalConfig[]>([
    {
      id: 1,
      name: "Dr. Juan Pérez",
      specialty: "Cardiología",
      availableDays: ["Lunes", "Miércoles", "Viernes"],
      startTime: "08:00",
      endTime: "14:00",
      interval: 30,
      enabled: true,
    },
    {
      id: 2,
      name: "Dra. María López",
      specialty: "Pediatría",
      availableDays: ["Lunes", "Martes", "Jueves", "Viernes"],
      startTime: "09:00",
      endTime: "17:00",
      interval: 20,
      enabled: true,
    },
    {
      id: 3,
      name: "Lic. Carlos Ramírez",
      specialty: "Fisioterapia",
      availableDays: ["Martes", "Miércoles", "Jueves"],
      startTime: "10:00",
      endTime: "18:00",
      interval: 45,
      enabled: true,
    },
    {
      id: 4,
      name: "Dra. Ana Martínez",
      specialty: "Neurología",
      availableDays: ["Lunes", "Miércoles", "Viernes"],
      startTime: "08:00",
      endTime: "16:00",
      interval: 40,
      enabled: true,
    },
  ]);

  const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const handleGeneralConfigChange = (field: string, value: string | number) => {
    setGeneralConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfessionalConfigChange = (
    id: number,
    field: string,
    value: any
  ) => {
    setProfessionalsConfig((prev) =>
      prev.map((prof) =>
        prof.id === id ? { ...prof, [field]: value } : prof
      )
    );
  };

  const toggleDayForProfessional = (profId: number, day: string) => {
    setProfessionalsConfig((prev) =>
      prev.map((prof) => {
        if (prof.id === profId) {
          const days = prof.availableDays.includes(day)
            ? prof.availableDays.filter((d) => d !== day)
            : [...prof.availableDays, day];
          return { ...prof, availableDays: days };
        }
        return prof;
      })
    );
  };

  const handleSaveConfiguration = () => {
    // Aquí se enviaría la configuración al backend
    console.log("Configuración general:", generalConfig);
    console.log("Configuración de profesionales:", professionalsConfig);
    
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Configuración del Sistema
          </h2>
          <p className="text-gray-600 mt-1">
            Administra los parámetros del agendamiento autónomo de citas
          </p>
        </div>
        <Button
          onClick={handleSaveConfiguration}
          className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg h-12 px-6"
        >
          <Save className="w-5 h-5 mr-2" />
          Guardar Configuración
        </Button>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <Card className="p-4 rounded-3xl border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Configuración Guardada
              </p>
              <p className="text-sm text-gray-600">
                Los cambios se han aplicado correctamente al sistema
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Configuración General */}
      <Card className="p-6 rounded-3xl border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Configuración General
            </h3>
            <p className="text-sm text-gray-600">
              Parámetros globales del sistema de agendamiento
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ventana de Agendamiento */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200">
            <Label className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-cyan-600" />
              Ventana de Agendamiento
            </Label>
            <div className="space-y-2">
              <Input
                type="number"
                min="1"
                max="12"
                value={generalConfig.bookingWindowWeeks}
                onChange={(e) =>
                  handleGeneralConfigChange("bookingWindowWeeks", parseInt(e.target.value))
                }
                className="h-12 rounded-2xl"
              />
              <p className="text-xs text-gray-600">
                Semanas hacia adelante que los pacientes pueden agendar citas
              </p>
            </div>
          </div>

          {/* Horas de Cancelación */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
            <Label className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-purple-600" />
              Horas de Cancelación Mínima
            </Label>
            <div className="space-y-2">
              <Input
                type="number"
                min="1"
                max="72"
                value={generalConfig.minCancellationHours}
                onChange={(e) =>
                  handleGeneralConfigChange("minCancellationHours", parseInt(e.target.value))
                }
                className="h-12 rounded-2xl"
              />
              <p className="text-xs text-gray-600">
                Horas de anticipación requeridas para cancelar una cita
              </p>
            </div>
          </div>

          {/* Máximo de Citas por Día */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <Label className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-green-600" />
              Máximo Citas por Día
            </Label>
            <div className="space-y-2">
              <Input
                type="number"
                min="1"
                max="200"
                value={generalConfig.maxAppointmentsPerDay}
                onChange={(e) =>
                  handleGeneralConfigChange("maxAppointmentsPerDay", parseInt(e.target.value))
                }
                className="h-12 rounded-2xl"
              />
              <p className="text-xs text-gray-600">
                Límite global de citas que se pueden agendar por día
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">
                Información Importante
              </p>
              <p>
                La ventana de agendamiento determina cuántas semanas hacia el futuro los
                pacientes pueden reservar citas de forma autónoma. Una ventana de 4 semanas
                significa que pueden agendar hasta 28 días a partir de hoy.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Configuración por Profesional */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Configuración por Profesional
            </h3>
            <p className="text-sm text-gray-600">
              Define horarios, días de atención e intervalos para cada profesional
            </p>
          </div>
        </div>

        {professionalsConfig.map((prof) => (
          <Card key={prof.id} className="p-6 rounded-3xl border-0 shadow-lg">
            <div className="space-y-6">
              {/* Header del Profesional */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                    {prof.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{prof.name}</h4>
                    <p className="text-sm text-gray-600">{prof.specialty}</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prof.enabled}
                    onChange={(e) =>
                      handleProfessionalConfigChange(prof.id, "enabled", e.target.checked)
                    }
                    className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {prof.enabled ? "Habilitado" : "Deshabilitado"}
                  </span>
                </label>
              </div>

              {/* Configuración */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Hora de Inicio */}
                <div className="space-y-2">
                  <Label className="text-sm">Hora de Inicio</Label>
                  <Input
                    type="time"
                    value={prof.startTime}
                    onChange={(e) =>
                      handleProfessionalConfigChange(prof.id, "startTime", e.target.value)
                    }
                    disabled={!prof.enabled}
                    className="h-12 rounded-2xl"
                  />
                </div>

                {/* Hora de Fin */}
                <div className="space-y-2">
                  <Label className="text-sm">Hora de Fin</Label>
                  <Input
                    type="time"
                    value={prof.endTime}
                    onChange={(e) =>
                      handleProfessionalConfigChange(prof.id, "endTime", e.target.value)
                    }
                    disabled={!prof.enabled}
                    className="h-12 rounded-2xl"
                  />
                </div>

                {/* Intervalo */}
                <div className="space-y-2">
                  <Label className="text-sm">Intervalo (minutos)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="120"
                    step="5"
                    value={prof.interval}
                    onChange={(e) =>
                      handleProfessionalConfigChange(
                        prof.id,
                        "interval",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={!prof.enabled}
                    className="h-12 rounded-2xl"
                  />
                </div>

                {/* Citas por Día */}
                <div className="space-y-2">
                  <Label className="text-sm">Citas por Día</Label>
                  <div className="h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <span className="font-bold text-gray-900">
                      {prof.enabled
                        ? Math.floor(
                            ((parseInt(prof.endTime.split(":")[0]) * 60 +
                              parseInt(prof.endTime.split(":")[1])) -
                              (parseInt(prof.startTime.split(":")[0]) * 60 +
                                parseInt(prof.startTime.split(":")[1]))) /
                              prof.interval
                          )
                        : 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Días de Atención */}
              <div className="space-y-3">
                <Label className="text-sm">Días de Atención</Label>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDayForProfessional(prof.id, day)}
                      disabled={!prof.enabled}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        prof.availableDays.includes(day)
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-cyan-400"
                      } ${!prof.enabled && "opacity-50 cursor-not-allowed"}`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                {prof.availableDays.length === 0 && prof.enabled && (
                  <p className="text-sm text-red-600">
                    Debe seleccionar al menos un día de atención
                  </p>
                )}
              </div>

              {/* Resumen */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Horario: </span>
                    <span className="font-semibold text-gray-900">
                      {prof.startTime} - {prof.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Días: </span>
                    <span className="font-semibold text-gray-900">
                      {prof.availableDays.join(", ") || "Ninguno"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duración consulta: </span>
                    <span className="font-semibold text-gray-900">
                      {prof.interval} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer con botón de guardar */}
      <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Recuerda Guardar los Cambios
              </p>
              <p className="text-sm text-gray-600">
                Los cambios en la configuración afectarán inmediatamente la disponibilidad
                de citas en el sistema de agendamiento autónomo.
              </p>
            </div>
          </div>
          <Button
            onClick={handleSaveConfiguration}
            className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-12 px-8 flex-shrink-0"
          >
            <Save className="w-5 h-5 mr-2" />
            Guardar
          </Button>
        </div>
      </Card>
    </div>
  );
}
