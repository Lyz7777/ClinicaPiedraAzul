import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Filter,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Dialog } from "./ui/dialog";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "Administrador" | "Médico/Terapista" | "Agendador";
  status: "Activo" | "Inactivo";
  createdAt: string;
  lastLogin: string;
}

export function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Datos de ejemplo
  const users: User[] = [
    {
      id: 1,
      name: "Dr. Juan Pérez",
      email: "juan.perez@hospital.com",
      phone: "+52 123 456 7890",
      role: "Médico/Terapista",
      status: "Activo",
      createdAt: "2024-01-15",
      lastLogin: "2026-02-20 09:30",
    },
    {
      id: 2,
      name: "María González",
      email: "maria.gonzalez@hospital.com",
      phone: "+52 123 456 7891",
      role: "Administrador",
      status: "Activo",
      createdAt: "2024-01-10",
      lastLogin: "2026-02-20 08:15",
    },
    {
      id: 3,
      name: "Carlos Ramírez",
      email: "carlos.ramirez@hospital.com",
      phone: "+52 123 456 7892",
      role: "Agendador",
      status: "Activo",
      createdAt: "2024-02-01",
      lastLogin: "2026-02-19 16:45",
    },
    {
      id: 4,
      name: "Dra. Ana López",
      email: "ana.lopez@hospital.com",
      phone: "+52 123 456 7893",
      role: "Médico/Terapista",
      status: "Inactivo",
      createdAt: "2023-12-20",
      lastLogin: "2026-01-15 14:20",
    },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Administrador":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "Médico/Terapista":
        return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white";
      case "Agendador":
        return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Administrador":
        return Shield;
      case "Médico/Terapista":
        return UserCheck;
      case "Agendador":
        return Calendar;
      default:
        return Users;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600 mt-1">
            Administra usuarios del sistema con control de roles y accesos
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white shadow-lg h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Crear Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administradores</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {users.filter((u) => u.role === "Administrador").length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Médicos/Terapistas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {users.filter((u) => u.role === "Médico/Terapista").length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {users.filter((u) => u.status === "Activo").length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6 rounded-3xl border-0 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 outline-none"
            >
              <option value="all">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Médico/Terapista">Médico/Terapista</option>
              <option value="Agendador">Agendador</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Contacto
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Último Acceso
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl ${getRoleBadgeColor(
                          user.role
                        )} shadow-md`}
                      >
                        <RoleIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl ${
                          user.status === "Activo"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status === "Activo" ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserX className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{user.lastLogin}</div>
                      <div className="text-xs text-gray-400">Creado: {user.createdAt}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="rounded-xl hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl hover:bg-red-50 hover:text-red-600"
                        >
                          {user.status === "Activo" ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Modal Preview */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Crear Nuevo Usuario</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl"
                >
                  ✕
                </Button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre Completo</Label>
                    <Input
                      placeholder="Ej: Dr. Juan Pérez"
                      className="h-12 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="usuario@hospital.com"
                      className="h-12 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      type="tel"
                      placeholder="+52 123 456 7890"
                      className="h-12 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <select className="w-full h-12 px-4 rounded-2xl border border-gray-200 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400">
                      <option>Administrador</option>
                      <option>Médico/Terapista</option>
                      <option>Agendador</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Contraseña</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Contraseña</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 h-12 rounded-2xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    Crear Usuario
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
