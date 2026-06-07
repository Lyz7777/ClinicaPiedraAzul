import { useState, useEffect } from "react";
import { Modal, Button, Spinner, useToast } from "../UI";
import { agregarNota, obtenerNotas } from "../../app/services/citas.service";
import { Clock, User, X } from "lucide-react";

interface ModalNotasProps {
  isOpen: boolean;
  onClose: () => void;
  citaId: number;
  pacienteNombre: string;
  medicoNombre: string;
  fecha: string;
}

function ModalNotas({ isOpen, onClose, citaId, pacienteNombre, medicoNombre, fecha }: ModalNotasProps) {
  const toast = useToast();
  const [notas, setNotas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [nuevaNota, setNuevaNota] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarNotas = async () => {
    if (!citaId) return;
    setCargando(true);
    try {
      const data = await obtenerNotas(citaId);
      setNotas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando notas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (isOpen && citaId) {
      cargarNotas();
    }
  }, [isOpen, citaId]);

  const handleAgregarNota = async () => {
    if (!nuevaNota.trim()) {
      toast.warning("Escribe algo antes de guardar");
      return;
    }
    setGuardando(true);
    try {
      await agregarNota(citaId, nuevaNota.trim());
      toast.success("Nota agregada correctamente");
      setNuevaNota("");
      await cargarNotas();
    } catch (error: any) {
      toast.error("Error al agregar nota", error.message);
    } finally {
      setGuardando(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📝 Historia Clínica" size="lg">
      <div style={{ marginBottom: 16, padding: 12, background: "var(--primary-50)", borderRadius: 12 }}>
        <p><strong>👤 Paciente:</strong> {pacienteNombre}</p>
        <p><strong>👨‍⚕️ Médico:</strong> {medicoNombre}</p>
        <p><strong>📅 Fecha:</strong> {fecha}</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h4 style={{ marginBottom: 12, fontSize: "0.9rem" }}>📋 Historial de notas</h4>
        {cargando ? (
          <Spinner size="sm" text="Cargando notas..." />
        ) : notas.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>
            No hay notas registradas aún
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notas.map((nota, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--slate-50)",
                  padding: 12,
                  borderRadius: 12,
                  borderLeft: "4px solid var(--primary-500)"
                }}
              >
                <p style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>{nota.contenido}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span><User size={12} /> {nota.creadoPor}</span>
                    <span><Clock size={12} /> {formatDate(nota.creadoEn)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <h4 style={{ marginBottom: 12, fontSize: "0.9rem" }}>✏️ Agregar nueva nota</h4>
        <textarea
          className="input-field"
          rows={4}
          value={nuevaNota}
          onChange={(e) => setNuevaNota(e.target.value)}
          placeholder="Escribe aquí la evolución del paciente..."
          style={{ marginBottom: 12 }}
        />
        <Button variant="primary" onClick={handleAgregarNota} loading={guardando} fullWidth>
          Guardar nota
        </Button>
      </div>
    </Modal>
  );
}

export default ModalNotas;