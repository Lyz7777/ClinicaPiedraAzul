import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  Stethoscope,
  FileText,
  Download,
  Filter,
  PieChart,
  Activity,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [selectedYear, setSelectedYear] = useState<string>("2026");

  // Datos de ejemplo para citas por mes
  const appointmentsByMonth = [
    { mes: "Ene", citas: 245, completadas: 230, canceladas: 15 },
    { mes: "Feb", citas: 280, completadas: 265, canceladas: 15 },
    { mes: "Mar", citas: 320, completadas: 295, canceladas: 25 },
    { mes: "Abr", citas: 295, completadas: 275, canceladas: 20 },
    { mes: "May", citas: 310, completadas: 290, canceladas: 20 },
    { mes: "Jun", citas: 335, completadas: 315, canceladas: 20 },
    { mes: "Jul", citas: 290, completadas: 270, canceladas: 20 },
    { mes: "Ago", citas: 305, completadas: 285, canceladas: 20 },
    { mes: "Sep", citas: 325, completadas: 305, canceladas: 20 },
    { mes: "Oct", citas: 340, completadas: 320, canceladas: 20 },
    { mes: "Nov", citas: 355, completadas: 335, canceladas: 20 },
    { mes: "Dic", citas: 315, completadas: 295, canceladas: 20 },
  ];

  // Datos de ejemplo para citas por profesional
  const appointmentsByProfessional = [
    { nombre: "Dr. Pérez", citas: 456, satisfaccion: 4.8 },
    { nombre: "Dra. López", citas: 520, satisfaccion: 4.9 },
    { nombre: "Lic. Ramírez", citas: 380, satisfaccion: 4.7 },
    { nombre: "Dra. Martínez", citas: 425, satisfaccion: 4.8 },
    { nombre: "Dr. Sánchez", citas: 310, satisfaccion: 4.6 },
  ];

  // Datos de ejemplo para citas por especialidad
  const appointmentsBySpecialty = [
    { especialidad: "Cardiología", citas: 456, porcentaje: 23 },
    { especialidad: "Pediatría", citas: 520, porcentaje: 26 },
    { especialidad: "Neurología", citas: 425, porcentaje: 21 },
    { especialidad: "Fisioterapia", citas: 380, porcentaje: 19 },
    { especialidad: "Traumatología", citas: 210, porcentaje: 11 },
  ];

  // Colores para los gráficos
  const COLORS = [
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#8b5cf6", // purple-500
    "#ec4899", // pink-500
    "#10b981", // green-500
  ];

  const stats = {
    totalAppointments: appointmentsByMonth.reduce((acc, curr) => acc + curr.citas, 0),
    totalCompleted: appointmentsByMonth.reduce((acc, curr) => acc + curr.completadas, 0),
    totalCancelled: appointmentsByMonth.reduce((acc, curr) => acc + curr.canceladas, 0),
    totalProfessionals: appointmentsByProfessional.length,
    totalSpecialties: appointmentsBySpecialty.length,
    avgAppointmentsPerMonth: Math.round(
      appointmentsByMonth.reduce((acc, curr) => acc + curr.citas, 0) /
        appointmentsByMonth.length
    ),
  };

  const completionRate = (
    (stats.totalCompleted / stats.totalAppointments) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Reportes Estadísticos
          </h2>
          <p className="text-gray-600 mt-1">
            Análisis y visualización de datos del sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 outline-none"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
          <Button className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white shadow-lg h-12 px-6">
            <Download className="w-5 h-5 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalAppointments}
            </p>
            <p className="text-xs text-gray-600 mt-1">Total Citas</p>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-2">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            <p className="text-xs text-gray-600 mt-1">Tasa Completadas</p>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalProfessionals}
            </p>
            <p className="text-xs text-gray-600 mt-1">Profesionales</p>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-2">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalSpecialties}
            </p>
            <p className="text-xs text-gray-600 mt-1">Especialidades</p>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.avgAppointmentsPerMonth}
            </p>
            <p className="text-xs text-gray-600 mt-1">Promedio/Mes</p>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-2">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalCancelled}
            </p>
            <p className="text-xs text-gray-600 mt-1">Canceladas</p>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citas por Mes */}
        <Card className="p-6 rounded-3xl border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-cyan-600" />
                Citas por Mes
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Tendencia anual de agendamiento
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px",
                }}
              />
              <Legend />
              <Bar
                dataKey="citas"
                fill="url(#colorCitas)"
                radius={[8, 8, 0, 0]}
                name="Total Citas"
              />
              <Bar
                dataKey="completadas"
                fill="url(#colorCompletadas)"
                radius={[8, 8, 0, 0]}
                name="Completadas"
              />
              <defs>
                <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="colorCompletadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Citas por Especialidad */}
        <Card className="p-6 rounded-3xl border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-purple-600" />
                Citas por Especialidad
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Distribución de consultas
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={appointmentsBySpecialty}
                dataKey="citas"
                nameKey="especialidad"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ especialidad, porcentaje }) =>
                  `${especialidad} ${porcentaje}%`
                }
              >
                {appointmentsBySpecialty.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px",
                }}
              />
            </RePieChart>
          </ResponsiveContainer>
        </Card>

        {/* Citas por Profesional */}
        <Card className="p-6 rounded-3xl border-0 shadow-lg lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Desempeño por Profesional
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Citas atendidas y satisfacción
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsByProfessional} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="nombre" type="category" stroke="#6b7280" width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px",
                }}
              />
              <Legend />
              <Bar
                dataKey="citas"
                fill="url(#colorProfessional)"
                radius={[0, 8, 8, 0]}
                name="Citas Atendidas"
              />
              <defs>
                <linearGradient id="colorProfessional" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-gray-700" />
            Resumen Detallado por Especialidad
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Especialidad
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Total Citas
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Porcentaje
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Tendencia
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointmentsBySpecialty.map((specialty, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-semibold text-gray-900">
                        {specialty.especialidad}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-gray-900">
                      {specialty.citas}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex-1 max-w-[100px] h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${specialty.porcentaje}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {specialty.porcentaje}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-green-100 text-green-700 text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      +{Math.floor(Math.random() * 15) + 5}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
