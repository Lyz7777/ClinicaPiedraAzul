import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { getPacientes, crearPaciente, actualizarPaciente, eliminarPaciente } from "../services/pacientes.service";

function Pacientes() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [documento, setDocumento] = useState("");
  const [celular, setCelular] = useState("");
  const [genero, setGenero] = useState<"Hombre" | "Mujer" | "Otro">("Otro");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [email, setEmail] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const limpiarError = (campo: string) => {
    setErrores((actuales) => {
      if (!actuales[campo]) {
        return actuales;
      }

      const siguientes = { ...actuales };
      delete siguientes[campo];
      return siguientes;
    });
  };

  const validarFormulario = () => {
    const siguientesErrores: Record<string, string> = {};

    if (!nombres.trim()) siguientesErrores.nombres = "El nombre es obligatorio.";
    if (!apellidos.trim()) siguientesErrores.apellidos = "El apellido es obligatorio.";
    if (!documento.trim()) siguientesErrores.documento = "El documento de identidad es obligatorio.";
    if (!celular.trim()) siguientesErrores.celular = "El celular es obligatorio.";

    setErrores(siguientesErrores);
    return Object.keys(siguientesErrores).length === 0;
  };

  const cargar = async () => {
    const data = await getPacientes();
    setPacientes(data);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    const pacienteData = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      documento: documento.trim(),
      celular: celular.trim(),
      genero,
      fechaNacimiento: fechaNacimiento || null,
      email: email.trim() || null
    };

    if (editandoId) {
      await actualizarPaciente(editandoId, pacienteData);
      setEditandoId(null);
    } else {
      await crearPaciente(pacienteData);
    }

    // Limpiar formulario
    setNombres("");
    setApellidos("");
    setDocumento("");
    setCelular("");
    setGenero("Otro");
    setFechaNacimiento("");
    setEmail("");
    setErrores({});
    cargar();
  };

  const eliminar = async (id: number) => {
    if (confirm("¿Eliminar este paciente?")) {
      await eliminarPaciente(id);
      cargar();
    }
  };

  const editar = (p: any) => {
    setNombres(p.nombres || "");
    setApellidos(p.apellidos || "");
    setDocumento(p.documento || "");
    setCelular(p.celular || "");
    setGenero(p.genero || "Otro");
    setFechaNacimiento(p.fechaNacimiento || "");
    setEmail(p.email || "");
    setEditandoId(p.id);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24, color: "var(--violet-dark)" }}>Gestión de Pacientes</h2>

      <div className="card-custom">
        <h4>{editandoId ? "Editar paciente" : "Nuevo paciente"}</h4>

        <div className="form-row">
          <div className="form-group">
            <label>Nombres *</label>
            <input
              placeholder="Nombres"
              value={nombres}
              onChange={(e) => {
                setNombres(e.target.value);
                limpiarError("nombres");
              }}
              className={errores.nombres ? "input-error" : ""}
              aria-invalid={Boolean(errores.nombres)}
            />
            {errores.nombres && <small className="error-message">{errores.nombres}</small>}
          </div>
          <div className="form-group">
            <label>Apellidos *</label>
            <input
              placeholder="Apellidos"
              value={apellidos}
              onChange={(e) => {
                setApellidos(e.target.value);
                limpiarError("apellidos");
              }}
              className={errores.apellidos ? "input-error" : ""}
              aria-invalid={Boolean(errores.apellidos)}
            />
            {errores.apellidos && <small className="error-message">{errores.apellidos}</small>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Documento de identidad *</label>
            <input
              placeholder="Documento"
              value={documento}
              onChange={(e) => {
                setDocumento(e.target.value);
                limpiarError("documento");
              }}
              className={errores.documento ? "input-error" : ""}
              aria-invalid={Boolean(errores.documento)}
            />
            {errores.documento && <small className="error-message">{errores.documento}</small>}
          </div>
          <div className="form-group">
            <label>Celular *</label>
            <input
              placeholder="Celular"
              value={celular}
              onChange={(e) => {
                setCelular(e.target.value);
                limpiarError("celular");
              }}
              className={errores.celular ? "input-error" : ""}
              aria-invalid={Boolean(errores.celular)}
            />
            {errores.celular && <small className="error-message">{errores.celular}</small>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Género *</label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value as "Hombre" | "Mujer" | "Otro")}
            >
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha de nacimiento</label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {(errores.nombres || errores.apellidos || errores.documento || errores.celular) && (
          <div className="error-message form-error-summary" style={{ marginBottom: 16 }}>
            Complete los campos obligatorios marcados con * antes de guardar.
          </div>
        )}

        <button className="btn btn-primary" onClick={guardar} type="button">
          {editandoId ? "Actualizar" : "Guardar"}
        </button>
      </div>

      <h4 style={{ marginBottom: 16, marginTop: 8 }}>Lista de Pacientes</h4>
      {pacientes.map((p: any) => (
        <div className="card-custom" key={p.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="logo-icon" style={{ background: "var(--violet-bg)", color: "var(--icon-neutral)", fontSize: "1.5rem", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserRound size={20} />
              </div>
              <div>
                <strong style={{ fontSize: "1rem" }}>{p.nombres} {p.apellidos}</strong>
                <br />
                <small style={{ color: "var(--gray-text)" }}>
                  Documento: {p.documento} | Celular: {p.celular} | Género: {p.genero}
                </small>
                <br />
                {p.email && <small style={{ color: "var(--gray-text)" }}>Email: {p.email}</small>}
                {p.fechaNacimiento && <small style={{ color: "var(--gray-text)", marginLeft: 8 }}>Nacimiento: {p.fechaNacimiento}</small>}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => editar(p)}>
                Editar
              </button>
              <button className="btn btn-danger" onClick={() => eliminar(p.id)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Pacientes;