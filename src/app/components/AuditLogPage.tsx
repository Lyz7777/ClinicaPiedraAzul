import { useState } from "react";
import {
  Shield,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  FileText,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

interface AuditLog {
  id: number;
  action: string;
  module: "Usuarios" | "Citas" | "Historia Clínica" | "Profesionales" | "Sistema";
  user: string;
  userRole: string;
  timestamp: string;
  ipAddress: string;
  details: string;
  status: "Éxito" | "Fallo" | "Advertencia";
  resourceId?: string;
}

export function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Datos de ejemplo
  const auditLogs: AuditLog[] = [
    {
      id: 1,
      action: "Creación de Usuario",
      module: "Usuarios",
      user: "Admin María González",
      userRole: "Administrador",
      timestamp: "2026-02-20 09:15:30",
      ipAddress: "192.168.1.105",
      details: "Nuevo usuario creado: Dr. Juan Pérez - Rol: Médico/Terapista",
      status: "Éxito",
      resourceId: "USER-045",
    },
    {
      id: 2,
      action: "Agendamiento de Cita",
      module: "Citas",
      user: "Sistema",
      userRole: "Sistema",
      timestamp: "2026-02-20 09:30:15",
      ipAddress: "N/A",
      details: "Cita agendada automáticamente para paciente PAC-001 con Dr. Pérez",
      status: "Éxito",
      resourceId: "CITA-128",
    },
    {
      id: 3,
      action: "Acceso a Historia Clínica",
      module: "Historia Clínica",
      user: "Dr. Juan Pérez",
      userRole: "Médico/Terapista",
      timestamp: "2026-02-20 10:05:42",
      ipAddress: "192.168.1.112",
      details: "Consulta de historia clínica del paciente PAC-001",
      status: "Éxito",
      resourceId: "HC-089",
    },
    {
      id: 4,
      action: "Re-agendamiento de Cita",
      module: "Citas",
      user: "Agendador Carlos López",
      userRole: "Agendador",
      timestamp: "2026-02-20 10:22:18",
      ipAddress: "192.168.1.108",
      details: "Cita CITA-125 re-agendada de 2026-02-18 a 2026-02-20",
      status: "Éxito",
      resourceId: "CITA-125",
    },
    {
      id: 5,
      action: "Intento de Acceso No Autorizado",
      module: "Historia Clínica",
      user: "Agendador Carlos López",
      userRole: "Agendador",
      timestamp: "2026-02-20 10:45:55",
      ipAddress: "192.168.1.108",
      details: "Intento de acceso denegado a historia clínica - Permisos insuficientes",
      status: "Fallo",
      resourceId: "HC-089",
    },
    {
      id: 6,
      action: "Modificación de Profesional",
      module: "Profesionales",
      user: "Admin María González",
      userRole: "Administrador",
      timestamp: "2026-02-20 11:10:30",
      ipAddress: "192.168.1.105",
      details: "Intervalo de citas actualizado de Dr. Pérez: 20min → 30min",
      status: "Éxito",
      resourceId: "PROF-012",
    },
    {
      id: 7,
      action: "Creación de Historia Clínica",
      module: "Historia Clínica",
      user: "Dra. María López",
      userRole: "Médico/Terapista",
      timestamp: "2026-02-20 11:35:20",
      ipAddress: "192.168.1.115",
      details: "Nueva historia clínica registrada para paciente PAC-002",
      status: "Éxito",
      resourceId: "HC-090",
    },
    {
      id: 8,
      action: "Desactivación de Usuario",
      module: "Usuarios",
      user: "Admin María González",
      userRole: "Administrador",
      timestamp: "2026-02-20 12:00:45",
      ipAddress: "192.168.1.105",
      details: "Usuario desactivado: Dr. Roberto Sánchez - Motivo: Licencia médica",
      status: "Advertencia",
      resourceId: "USER-028",
    },
    {
      id: 9,
      action: "Cancelación de Cita",
      module: "Citas",
      user: "Paciente (Portal)",
      userRole: "Paciente",
      timestamp: "2026-02-20 13:15:10",
      ipAddress: "181.45.123.67",
      details: "Cita CITA-130 cancelada por el paciente PAC-005",
      status: "Éxito",
      resourceId: "CITA-130",
    },
    {
      id: 10,
      action: "Exportación de Datos",
      module: "Citas",
      user: "Admin María González",
      userRole: "Administrador",
      timestamp: "2026-02-20 14:30:00",
      ipAddress: "192.168.1.105",
      details: "Exportación CSV de citas del mes de febrero 2026",
      status: "Éxito",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Éxito":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Fallo":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "Advertencia":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Éxito":
        return "bg-green-100 text-green-700 border-green-200";
      case "Fallo":
        return "bg-red-100 text-red-700 border-red-200";
      case "Advertencia":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case "Usuarios":
        return "from-purple-500 to-pink-500";
      case "Citas":
        return "from-cyan-500 to-blue-500";
      case "Historia Clínica":
        return "from-blue-500 to-purple-500";
      case "Profesionales":
        return "from-green-500 to-emerald-500";
      case "Sistema":
        return "from-gray-500 to-gray-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === "all" || log.module === selectedModule;
    const matchesStatus = selectedStatus === "all" || log.status === selectedStatus;
    return matchesSearch && matchesModule && matchesStatus;
  });

  const stats = {
    total: auditLogs.length,
    success: auditLogs.filter((l) => l.status === "Éxito").length,
    failed: auditLogs.filter((l) => l.status === "Fallo").length,
    warnings: auditLogs.filter((l) => l.status === "Advertencia").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Registro de Auditoría</h2>
          <p className="text-gray-600 mt-1">
            Trazabilidad completa de operaciones críticas del sistema
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-2xl h-12 px-6 border-2"
        >
          <FileText className="w-5 h-5 mr-2" />
          Exportar Auditoría
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Eventos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Exitosos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.success}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fallidos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.failed}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Advertencias</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.warnings}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 rounded-3xl border-0 shadow-lg">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por acción, usuario o detalles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 outline-none"
              >
                <option value="all">Todos los módulos</option>
                <option value="Usuarios">Usuarios</option>
                <option value="Citas">Citas</option>
                <option value="Historia Clínica">Historia Clínica</option>
                <option value="Profesionales">Profesionales</option>
                <option value="Sistema">Sistema</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 outline-none"
              >
                <option value="all">Todos los estados</option>
                <option value="Éxito">Éxito</option>
                <option value="Fallo">Fallo</option>
                <option value="Advertencia">Advertencia</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-5 h-5 text-gray-600" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 rounded-2xl flex-1"
                placeholder="Desde"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-5 h-5 text-gray-600" />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 rounded-2xl flex-1"
                placeholder="Hasta"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Audit Logs List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card
            key={log.id}
            className="p-5 rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Icon and Status */}
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getModuleColor(
                  log.module
                )} flex items-center justify-center flex-shrink-0`}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900">{log.action}</h3>
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-medium border ${getStatusBadge(
                          log.status
                        )}`}
                      >
                        {getStatusIcon(log.status)}
                        <span>{log.status}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-gray-100 text-gray-700">
                        {log.module}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>
                          {log.user} ({log.userRole})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{log.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>{log.ipAddress}</span>
                      </div>
                      {log.resourceId && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>ID: {log.resourceId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl hover:bg-blue-50 flex-shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card className="p-12 rounded-3xl border-0 shadow-lg text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mx-auto">
              <Search className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">No se encontraron registros</h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros de búsqueda para encontrar los eventos que buscas.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
