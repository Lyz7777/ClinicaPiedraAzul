import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { getPacientes, crearPaciente, actualizarPaciente, eliminarPaciente } from "../services/pacientes.service";
import { Button, Input, Card, Modal } from "../../components/UI";
import { useToast } from "../../components/UI";

type Genero = "Hombre" | "Mujer" | "Otro";

interface FormErrors {
  nombres?: string; apellidos?: string; documento?: string;
  celular?: string; email?: string; fechaNacimiento?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const celularRegex = /^[0-9]{7,15}$/;
const docRegex = /^[A-Za-z0-9]{4,20}$/;

function Pacientes() {
  const toast = useToast();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [documento, setDocumento] = useState("");
  const [celular, setCelular] = useState("");
  const [genero, setGenero] = useState<Genero>("Otro");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [email, setEmail] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [pacienteAEliminar, setPacienteAEliminar] = useState<any>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [busqueda, setBusqueda] = useState("");

  const cargar = async () => {
    try {
      const data = await getPacientes();
      setPacientes(Array.isArray(data) ? data : data?.data ?? []);
    } catch { toast.error("Error al cargar pacientes"); }
  };

  useEffect(() => { cargar(); }, []);

  const validar = (): boolean => {
    const e: FormErrors = {};
    if (!nombres.trim()) e.nombres = "El nombre es obligatorio";
    else if (nombres.trim().length < 2) e.nombres = "Mínimo 2 caracteres";
    if (!apellidos.trim()) e.apellidos = "Los apellidos son obligatorios";
    else if (apellidos.trim().length < 2) e.apellidos = "Mínimo 2 caracteres";
    if (!documento.trim()) e.documento = "El documento es obligatorio";
    else if (!docRegex.test(documento.trim())) e.documento = "Documento inválido (4-20 caracteres alfanuméricos)";
    if (!celular.trim()) e.celular = "El celular es obligatorio";
    else if (!celularRegex.test(celular.trim())) e.celular = "Celular inválido (7-15 dígitos)";
    if (email.trim() && !emailRegex.test(email.trim())) e.email = "Correo electrónico inválido";
    if (fechaNacimiento) {
      const hoy = new Date(); const nac = new Date(fechaNacimiento);
      if (nac >= hoy) e.fechaNacimiento = "La fecha de nacimiento debe ser en el pasado";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      const data = { nombres: nombres.trim(), apellidos: apellidos.trim(), documento: documento.trim(),
        celular: celular.trim(), genero, fechaNacimiento: fechaNacimiento || undefined,
        email: email.trim() || undefined };
      if (editandoId) {
        await actualizarPaciente(editandoId, data);
        toast.success("Paciente actualizado correctamente");
        setEditandoId(null);
      } else {
        await crearPaciente(data as any);
        toast.success("Paciente registrado correctamente");
      }
      resetForm(); cargar();
    } catch (err: any) {
      toast.error("Error al guardar paciente", err?.message);
    } finally { setGuardando(false); }
  };

  const resetForm = () => {
    setNombres(""); setApellidos(""); setDocumento(""); setCelular("");
    setGenero("Otro"); setFechaNacimiento(""); setEmail(""); setErrors({});
  };

  const eliminar = async (id: number) => {
    try {
      await eliminarPaciente(id);
      toast.success("Paciente eliminado");
      setMostrarModal(false); setPacienteAEliminar(null); cargar();
    } catch { toast.error("Error al eliminar paciente"); }
  };

  const editar = (p: any) => {
    setNombres(p.nombres || ""); setApellidos(p.apellidos || "");
    setDocumento(p.documento || ""); setCelular(p.celular || "");
    setGenero(p.genero || "Otro"); setFechaNacimiento(p.fechaNacimiento || "");
    setEmail(p.email || ""); setEditandoId(p.id); setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => { setEditandoId(null); resetForm(); };

  const pacientesFiltrados = pacientes.filter(p =>
    busqueda === "" || `${p.nombres} ${p.apellidos} ${p.documento}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h2>Gestión de Pacientes</h2>
        <p>Registre, edite o elimine pacientes del sistema</p>
      </div>

      <Card title={editandoId ? "✏️ Editar paciente" : "➕ Nuevo paciente"} variant="elevated">
        <div className="form-row">
          <Input label="Nombres" required value={nombres} onChange={e => setNombres(e.target.value)} error={errors.nombres} />
          <Input label="Apellidos" required value={apellidos} onChange={e => setApellidos(e.target.value)} error={errors.apellidos} />
        </div>
        <div className="form-row">
          <Input label="Documento de identidad" required value={documento}
            onChange={e => setDocumento(e.target.value)} error={errors.documento}
            helperText="Ej: CC, TI, Pasaporte (4-20 caracteres)" />
          <Input label="Celular" required value={celular}
            onChange={e => setCelular(e.target.value.replace(/\D/g, ""))} error={errors.celular}
            helperText="Solo dígitos (7-15)" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="input-label">Género <span className="input-required">*</span></label>
            <select value={genero} onChange={e => setGenero(e.target.value as Genero)} className="input-field">
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <Input type="date" label="Fecha de nacimiento" value={fechaNacimiento}
            onChange={e => setFechaNacimiento(e.target.value)} error={errors.fechaNacimiento}
            max={new Date().toISOString().split("T")[0]} />
        </div>
        <Input type="email" label="Correo electrónico" value={email}
          onChange={e => setEmail(e.target.value)} error={errors.email}
          helperText="Opcional" />
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Button variant="primary" onClick={guardar} loading={guardando}>
            {editandoId ? "Actualizar paciente" : "Guardar paciente"}
          </Button>
          {editandoId && <Button variant="secondary" onClick={cancelarEdicion}>Cancelar edición</Button>}
        </div>
      </Card>

      <div style={{ marginBottom: 12 }}>
        <Input placeholder="Buscar por nombre o documento..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)} />
      </div>

      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10 }}>
        {pacientesFiltrados.length} paciente(s) encontrado(s)
      </p>

      {pacientesFiltrados.length === 0 ? (
        <Card><div className="empty-state"><p>No hay pacientes registrados</p><small>Agregue un nuevo paciente para comenzar</small></div></Card>
      ) : (
        pacientesFiltrados.map((p: any) => (
          <Card key={p.id} variant="compact">
            <div className="list-item">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="paciente-avatar"><UserRound size={20} /></div>
                <div>
                  <strong style={{ fontSize: "0.92rem" }}>{p.nombres} {p.apellidos}</strong>
                  <p className="list-item-meta">
                    Doc: <strong>{p.documento}</strong> · Cel: <strong>{p.celular}</strong> · {p.genero}
                    {p.email && <> · {p.email}</>}
                    {p.fechaNacimiento && <> · Nac: {p.fechaNacimiento}</>}
                  </p>
                </div>
              </div>
              <div className="list-item-actions">
                <Button variant="secondary" size="sm" onClick={() => editar(p)}>Editar</Button>
                <Button variant="danger" size="sm" onClick={() => { setPacienteAEliminar(p); setMostrarModal(true); }}>Eliminar</Button>
              </div>
            </div>
          </Card>
        ))
      )}

      <Modal isOpen={mostrarModal} onClose={() => setMostrarModal(false)} title="Confirmar eliminación" size="sm">
        <p style={{ marginBottom: 8 }}>
          ¿Seguro que deseas eliminar a <strong>{pacienteAEliminar?.nombres} {pacienteAEliminar?.apellidos}</strong>?
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--danger-600)", marginBottom: 16 }}>Esta acción no se puede deshacer.</p>
        <div className="modal-buttons">
          <Button variant="danger" onClick={() => eliminar(pacienteAEliminar?.id)}>Confirmar eliminación</Button>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  );
}
export default Pacientes;