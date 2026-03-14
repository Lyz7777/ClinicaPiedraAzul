import { useState } from "react";
import { Eye, EyeOff, Heart, Mail, Lock, User, ClipboardList } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

interface LoginPageProps {
  onNavigate: (page: string, role?: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "scheduler" | "patient">("admin");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulación de autenticación - en producción verificar contra backend
    if (selectedRole === "patient") {
      onNavigate("patient-dashboard", "patient");
    } else if (selectedRole === "scheduler") {
      onNavigate("scheduler-dashboard", "scheduler");
    } else {
      onNavigate("admin-dashboard", "admin"); // Dashboard administrativo
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Panel izquierdo - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white to-cyan-50">
        <div className="w-full max-w-md space-y-8">
          {/* Logo y título */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 shadow-lg">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Piedra Azul
            </h1>
            <p className="text-gray-600">Sistema de Gestión Hospitalaria</p>
          </div>

          {/* Selección de tipo de usuario */}
          <div className="space-y-3">
            <Label className="text-gray-700 text-center block">Tipo de Usuario</Label>
            <div className="grid grid-cols-3 gap-2">
              {/* Administrador */}
              <button
                type="button"
                onClick={() => setSelectedRole("admin")}
                className={`p-3 rounded-2xl border-2 transition-all ${
                  selectedRole === "admin"
                    ? "border-cyan-500 bg-cyan-50 shadow-lg"
                    : "border-gray-200 hover:border-cyan-300 bg-white"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedRole === "admin"
                        ? "bg-gradient-to-br from-cyan-500 to-blue-500"
                        : "bg-gray-100"
                    }`}
                  >
                    <User
                      className={`w-5 h-5 ${
                        selectedRole === "admin" ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium text-center ${
                      selectedRole === "admin" ? "text-cyan-700" : "text-gray-600"
                    }`}
                  >
                    Admin
                  </span>
                </div>
              </button>

              {/* Agendador de Citas */}
              <button
                type="button"
                onClick={() => setSelectedRole("scheduler")}
                className={`p-3 rounded-2xl border-2 transition-all ${
                  selectedRole === "scheduler"
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 hover:border-blue-300 bg-white"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedRole === "scheduler"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                        : "bg-gray-100"
                    }`}
                  >
                    <ClipboardList
                      className={`w-5 h-5 ${
                        selectedRole === "scheduler" ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium text-center ${
                      selectedRole === "scheduler" ? "text-blue-700" : "text-gray-600"
                    }`}
                  >
                    Agendador
                  </span>
                </div>
              </button>

              {/* Paciente */}
              <button
                type="button"
                onClick={() => setSelectedRole("patient")}
                className={`p-3 rounded-2xl border-2 transition-all ${
                  selectedRole === "patient"
                    ? "border-purple-500 bg-purple-50 shadow-lg"
                    : "border-gray-200 hover:border-purple-300 bg-white"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedRole === "patient"
                        ? "bg-gradient-to-br from-purple-500 to-pink-500"
                        : "bg-gray-100"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        selectedRole === "patient" ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium text-center ${
                      selectedRole === "patient" ? "text-purple-700" : "text-gray-600"
                    }`}
                  >
                    Paciente
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-2xl border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-2xl border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Recordar y Olvidé contraseña */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Recordarme
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de inicio de sesión */}
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              Iniciar Sesión
            </Button>

            {/* Registro solo para pacientes */}
            {selectedRole === "patient" && (
              <div className="text-center space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gradient-to-br from-white to-cyan-50 text-gray-500">
                      ¿No tienes cuenta?
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate("register")}
                  className="w-full h-12 rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300"
                >
                  Registrarse como Paciente
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Panel derecho - Imagen y contenido promocional */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <img
          src="https://images.unsplash.com/photo-1764885517847-79d62138cc58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3NwaXRhbCUyMG1lZGljYWwlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3MTU1MTkwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Hospital moderno"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white space-y-6">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              {selectedRole === "patient" ? (
                <>
                  Agenda tu Cita
                  <br />
                  de Forma Rápida y Segura
                </>
              ) : (
                <>
                  Bienvenido al Futuro
                  <br />
                  de la Salud Digital
                </>
              )}
            </h2>
            <p className="text-xl text-white/90 max-w-md">
              {selectedRole === "patient"
                ? "Gestiona tus citas médicas de manera sencilla. Selecciona tu especialista y horario preferido desde la comodidad de tu hogar."
                : "Gestión hospitalaria inteligente con tecnología de vanguardia para un mejor cuidado de tus pacientes."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-2">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/80">Disponibilidad</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-2">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-white/80">Seguro</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
