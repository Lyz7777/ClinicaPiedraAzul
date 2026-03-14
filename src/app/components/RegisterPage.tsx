import { useState } from "react";
import {
  Eye,
  EyeOff,
  Heart,
  Mail,
  Lock,
  User,
  Phone,
  IdCard,
  Calendar,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    document: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthdate: "",
    gender: "Hombre" as "Hombre" | "Mujer" | "Otro",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // Aquí se enviaría al backend para crear el usuario
    console.log("Registro de paciente:", formData);
    
    // Mostrar mensaje de éxito y redirigir
    alert("¡Registro exitoso! Ahora puedes iniciar sesión");
    onNavigate("login");
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-white via-cyan-50 to-purple-50">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 shadow-lg">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Crear Cuenta de Paciente
            </h1>
            <p className="text-gray-600">
              Completa tus datos para poder agendar citas de forma rápida y segura
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-600" />
                  Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Documento */}
                  <div className="space-y-2">
                    <Label htmlFor="document">
                      Número de Documento <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="document"
                        type="text"
                        placeholder="123456789"
                        value={formData.document}
                        onChange={(e) => handleChange("document", e.target.value)}
                        className="pl-10 h-12 rounded-2xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Género */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      Género <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) =>
                        handleChange("gender", e.target.value as "Hombre" | "Mujer" | "Otro")
                      }
                      className="w-full h-12 px-4 rounded-2xl border border-gray-200 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400"
                      required
                    >
                      <option value="Hombre">Hombre</option>
                      <option value="Mujer">Mujer</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  {/* Nombres */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      Nombres <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Juan Carlos"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        className="pl-10 h-12 rounded-2xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Apellidos */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Apellidos <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="García Pérez"
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        className="pl-10 h-12 rounded-2xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="birthdate"
                        type="date"
                        value={formData.birthdate}
                        onChange={(e) => handleChange("birthdate", e.target.value)}
                        className="pl-10 h-12 rounded-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  Información de Contacto
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Teléfono/Celular <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+52 123 456 7890"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="pl-10 h-12 rounded-2xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="pl-10 h-12 rounded-2xl"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seguridad */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Seguridad
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Contraseña <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        className="pl-10 pr-10 h-12 rounded-2xl"
                        required
                        minLength={8}
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
                    <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmar Contraseña <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        className="pl-10 pr-10 h-12 rounded-2xl"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-gray-900 mb-1">
                      Protección de Datos
                    </p>
                    <p>
                      Tu información personal está protegida y solo será utilizada para
                      la gestión de tus citas médicas y comunicación relacionada con tu
                      atención médica.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate("login")}
                  className="flex-1 h-12 rounded-2xl border-2"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Crear Cuenta
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
