import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Keyboard, UserRound, AlertTriangle, Clock, Search } from "lucide-react";
import { getAuthHeaders } from "../../auth/authService";
import { Button, Input, Card, useToast } from "../UI";
import { Html5Qrcode, Html5QrcodeScanType } from "html5-qrcode";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const URL = `${API_URL}/citas`;
const TIMEOUT_ESCANEO = 30;

interface ValidadorQRProps { rol?: "admin" | "agendador" | "medico" | "paciente"; }

function ValidadorQR({ rol = "agendador" }: ValidadorQRProps) {
  const toast = useToast();
  const [modo, setModo] = useState<"escaner" | "manual" | "documento">("escaner");
  const [escaneando, setEscaneando] = useState(false);
  const [camaras, setCamaras] = useState<any[]>([]);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState("");
  const [tiempoRestante, setTiempoRestante] = useState(TIMEOUT_ESCANEO);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scannerDivId = "qr-scanner-reader";
  const [codigo, setCodigo] = useState("");
  const [documentoBusqueda, setDocumentoBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadoEscaneo, setEstadoEscaneo] = useState<"inactivo" | "buscando" | "exito" | "error" | "timeout">("inactivo");
  const [marcandoAsistencia, setMarcandoAsistencia] = useState(false);
  const [citasEncontradas, setCitasEncontradas] = useState<any[]>([]);

  const limpiarTimers = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => {
    Html5Qrcode.getCameras().then((devices) => { 
      setCamaras(devices || []); 
      if (devices && devices.length > 0) {
        const trasera = devices.find(d => 
          d.label.toLowerCase().includes("back") || 
          d.label.toLowerCase().includes("trasera") || 
          d.label.toLowerCase().includes("environment")
        );
        setCamaraSeleccionada(trasera?.id || devices[0].id);
      }
    }).catch(() => {});
    return () => { limpiarTimers(); if (scannerRef.current) scannerRef.current.stop().catch(() => {}); };
  }, [limpiarTimers]);

  const detenerEscaner = useCallback(async () => {
    limpiarTimers();
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setEscaneando(false);
  }, [limpiarTimers]);

  const validarCodigo = async (codigoValidar: string) => {
    const codigoLimpio = codigoValidar.trim().toUpperCase();
    if (!codigoLimpio || codigoLimpio.length < 5) return;
    setCargando(true);
    setError(null);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL}/validar-codigo`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json", ...authHeaders }, 
        body: JSON.stringify({ codigo: codigoLimpio }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Código no válido");
      
      if (data.cita) {
        setCitasEncontradas([data.cita]);
        toast.success("¡Código válido!");
      }
      await detenerEscaner();
    } catch (err: any) {
      setError(err.message);
      toast.error("Código inválido", err.message);
    } finally {
      setCargando(false);
    }
  };

  const buscarPorDocumento = async () => {
    if (!documentoBusqueda.trim()) { 
      toast.error("Ingrese un número de documento"); 
      return; 
    }
    setCargando(true);
    setError(null);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL}/por-documento/${documentoBusqueda.trim()}`, { headers: authHeaders });
      
      if (!res.ok) { 
        if (res.status === 404) throw new Error("No se encontró un paciente con ese documento");
        throw new Error("Error al buscar citas");
      }
      
      const data = await res.json();
      const citas = data.data || [];
      if (citas.length === 0) throw new Error("El paciente no tiene citas agendadas");
      
      setCitasEncontradas(citas);
      toast.success(`Se encontraron ${citas.length} cita(s)`);
    } catch (err: any) {
      setError(err.message);
      toast.error("Error", err.message);
    } finally {
      setCargando(false);
    }
  };

  const marcarComoAtendido = async (cita: any) => {
    setMarcandoAsistencia(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL}/${cita.id}/asistencia`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ asistio: true, metodo: modo === "documento" ? "DOCUMENTO" : modo === "escaner" ? "QR" : "MANUAL" }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      toast.success("Paciente marcado como atendido");
      setCitasEncontradas(prev => prev.map(c => c.id === cita.id ? { ...c, asistio: true } : c));
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setMarcandoAsistencia(false);
    }
  };

  const iniciarEscaner = async () => {
    if (!camaraSeleccionada) { toast.error("No hay cámaras disponibles"); return; }
    setError(null); setCitasEncontradas([]); setEstadoEscaneo("buscando"); 
    setTiempoRestante(TIMEOUT_ESCANEO);
    await detenerEscaner();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    timeoutRef.current = setTimeout(async () => { 
      setEstadoEscaneo("timeout"); 
      setError(`No se detectó QR después de ${TIMEOUT_ESCANEO}s`); 
      await detenerEscaner(); 
    }, TIMEOUT_ESCANEO * 1000);
    
    intervalRef.current = setInterval(() => setTiempoRestante(prev => prev <= 1 ? 0 : prev - 1), 1000);
    setEscaneando(true);
    
    try {
      const html5QrCode = new Html5Qrcode(scannerDivId);
      scannerRef.current = html5QrCode;
      await html5QrCode.start(camaraSeleccionada, { fps: 30, qrbox: { width: 300, height: 300 }, aspectRatio: 1.0 }, 
        (decodedText) => { if (decodedText?.trim()) validarCodigo(decodedText); }, 
        () => {}
      );
    } catch (err: any) { 
      setEstadoEscaneo("error"); 
      setError(`Error: ${err.message}`); 
      setEscaneando(false); 
      limpiarTimers(); 
    }
  };

  const validarCodigoManual = async () => { 
    if (!codigo || codigo.length < 5) { setError("Código inválido (mínimo 5 caracteres)"); return; } 
    await validarCodigo(codigo); 
  };

  const limpiar = async () => { 
    await detenerEscaner(); 
    setCodigo(""); 
    setDocumentoBusqueda("");
    setCitasEncontradas([]);
    setError(null); 
    setEstadoEscaneo("inactivo"); 
  };

  const cambiarModo = async (nuevoModo: "escaner" | "manual" | "documento") => { 
    await detenerEscaner(); 
    setModo(nuevoModo); 
    setError(null); 
    setCitasEncontradas([]);
    setCodigo(""); 
    setDocumentoBusqueda("");
    setEstadoEscaneo("inactivo"); 
  };

  const mostrarResultados = () => {
    if (citasEncontradas.length === 0) return null;
    
    return (
      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>📋 Citas encontradas</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {citasEncontradas.map((cita: any) => {
            // Extraer valores de forma segura
            const pacienteNombre = typeof cita.paciente === 'string' ? cita.paciente : (cita.paciente?.nombres ? `${cita.paciente.nombres} ${cita.paciente.apellidos}` : 'No especificado');
            const pacienteDocumento = typeof cita.pacienteDocumento === 'string' ? cita.pacienteDocumento : (cita.paciente?.documento || 'No disponible');
            const medicoNombre = typeof cita.medico === 'string' ? cita.medico : (cita.medico?.nombre || 'No especificado');
            const medicoEspecialidad = typeof cita.medicoEspecialidad === 'string' ? cita.medicoEspecialidad : (cita.medico?.especialidad || 'No especificada');
            const pacienteCelular = typeof cita.pacienteCelular === 'string' ? cita.pacienteCelular : (cita.paciente?.celular || 'No disponible');
            
            return (
              <div key={cita.id} style={{ background: "#F0FDF4", padding: 16, borderRadius: 16, border: "1px solid #BBF7D0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <p><strong>👤 Paciente:</strong> {pacienteNombre}</p>
                    <p><strong>📄 Documento:</strong> {pacienteDocumento}</p>
                    <p><strong>📅 Fecha:</strong> {cita.fecha || "No especificada"} - {cita.hora || "No especificada"}</p>
                    <p><strong>👨‍⚕️ Especialista:</strong> {medicoNombre}</p>
                    <p><strong>🏥 Especialidad:</strong> {medicoEspecialidad}</p>
                    <p><strong>📞 Celular:</strong> {pacienteCelular}</p>
                    <p><strong>📌 Estado:</strong> {cita.estado || "AGENDADA"}</p>
                  </div>
                  <div>
                    {cita.asistio ? (
                      <span className="badge badge-success" style={{ background: "#10b981", color: "white", padding: "6px 12px" }}>✅ Ya atendido</span>
                    ) : (
                      <Button variant="success" onClick={() => marcarComoAtendido(cita)} loading={marcandoAsistencia} style={{ background: "#10b981" }}>
                        ✅ Marcar como atendido
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Button variant="secondary" onClick={limpiar} style={{ marginTop: 16 }}>Nueva búsqueda</Button>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2>📷 Validar entrada de paciente</h2>
        <p>Escanea el código QR, ingresa el código manualmente o busca por documento</p>
      </div>
      
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button className={`tab-btn ${modo === "escaner" ? "active" : ""}`} onClick={() => cambiarModo("escaner")} style={{ padding: "10px 24px", borderRadius: 30, border: "none", background: modo === "escaner" ? "var(--primary-500)" : "var(--slate-100)", color: modo === "escaner" ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: 600 }}><Camera size={18} /> QR</button>
        <button className={`tab-btn ${modo === "manual" ? "active" : ""}`} onClick={() => cambiarModo("manual")} style={{ padding: "10px 24px", borderRadius: 30, border: "none", background: modo === "manual" ? "var(--primary-500)" : "var(--slate-100)", color: modo === "manual" ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: 600 }}><Keyboard size={18} /> Código</button>
        <button className={`tab-btn ${modo === "documento" ? "active" : ""}`} onClick={() => cambiarModo("documento")} style={{ padding: "10px 24px", borderRadius: 30, border: "none", background: modo === "documento" ? "var(--primary-500)" : "var(--slate-100)", color: modo === "documento" ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: 600 }}><UserRound size={18} /> Documento</button>
      </div>
      
      {modo === "escaner" && (
        <Card title="📷 Escanear código QR">
          {camaras.length > 1 && (<div className="form-group"><label>Seleccionar cámara</label><select className="input-field" value={camaraSeleccionada} onChange={(e) => { setCamaraSeleccionada(e.target.value); if (escaneando) detenerEscaner(); }} disabled={escaneando}>{camaras.map(cam => (<option key={cam.id} value={cam.id}>{cam.label || `Cámara ${cam.id.slice(0,8)}`}</option>))}</select></div>)}
          <div id={scannerDivId} style={{ width: "100%", maxWidth: 400, margin: "0 auto", minHeight: escaneando ? 300 : 200, background: escaneando ? "#000" : "var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, overflow: "hidden", border: escaneando ? "3px solid var(--primary-500)" : "2px solid var(--border)" }}>
            {!escaneando && estadoEscaneo === "inactivo" && <div style={{ color: "var(--text-muted)", textAlign: "center" }}><Camera size={48} /><p>Presiona "Iniciar escáner"</p></div>}
          </div>
          {estadoEscaneo === "buscando" && (<div style={{ background: "#EFF6FF", padding: 16, borderRadius: 12, marginTop: 16, textAlign: "center" }}><div className="spinner-ring spinner-sm" style={{ display: "inline-block" }} /> Escaneando... {tiempoRestante}s</div>)}
          {estadoEscaneo === "timeout" && (<div style={{ background: "#FFFBEB", padding: 16, borderRadius: 12, marginTop: 16 }}><AlertTriangle /> Tiempo agotado <Button variant="primary" size="sm" onClick={iniciarEscaner}>Reintentar</Button></div>)}
          {estadoEscaneo === "error" && error && (<div style={{ background: "#FEF2F2", padding: 16, borderRadius: 12, marginTop: 16 }}>{error}<Button variant="secondary" size="sm" onClick={limpiar}>Reintentar</Button></div>)}
          <div style={{ marginTop: 16 }}>{!escaneando && estadoEscaneo !== "timeout" && <Button variant="primary" onClick={iniciarEscaner} disabled={!camaraSeleccionada}>Iniciar escáner</Button>}{escaneando && <Button variant="secondary" onClick={detenerEscaner}>Cancelar</Button>}</div>
          {mostrarResultados()}
        </Card>
      )}
      
      {modo === "manual" && (
        <Card title="⌨️ Ingresar código manualmente">
          <Input label="Código de verificación" placeholder="Ej: CITA-A3F8D2" value={codigo} onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setError(null); }} onKeyDown={(e) => e.key === "Enter" && validarCodigoManual()} />
          {error && <div style={{ background: "#FEE2E2", padding: 12, borderRadius: 12, marginTop: 12, color: "#DC2626" }}>{error}</div>}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}><Button variant="primary" onClick={validarCodigoManual} loading={cargando} disabled={!codigo || codigo.length < 5}>Validar código</Button></div>
          {mostrarResultados()}
        </Card>
      )}
      
      {modo === "documento" && (
        <Card title="🔍 Buscar por número de documento">
          <Input label="Número de documento" placeholder="Ej: 1234567890" value={documentoBusqueda} onChange={(e) => { setDocumentoBusqueda(e.target.value); setError(null); }} onKeyDown={(e) => e.key === "Enter" && buscarPorDocumento()} />
          {error && <div style={{ background: "#FEE2E2", padding: 12, borderRadius: 12, marginTop: 12, color: "#DC2626" }}>{error}</div>}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}><Button variant="primary" onClick={buscarPorDocumento} loading={cargando} disabled={!documentoBusqueda.trim()}><Search size={18} /> Buscar citas</Button></div>
          {mostrarResultados()}
        </Card>
      )}
    </div>
  );
}

export default ValidadorQR;