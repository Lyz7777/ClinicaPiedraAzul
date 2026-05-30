import { useState, useEffect, useRef, useCallback } from "react";
import { QrCode, Scan, CheckCircle, XCircle, Camera, Keyboard, AlertTriangle, Clock, RefreshCw, X } from "lucide-react";
import { getAuthHeaders } from "../../auth/authService";
import { Button, Input, Card, useToast } from "../UI";
import { Html5Qrcode } from "html5-qrcode";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const URL = `${API_URL}/citas`;

const TIMEOUT_ESCANEO = 30; // aumentado a 30 segundos

interface ValidadorQRProps {
  rol?: "admin" | "agendador" | "medico" | "paciente";
}

function ValidadorQR({ rol = "agendador" }: ValidadorQRProps) {
  const toast = useToast();
  
  const [modo, setModo] = useState<"escaner" | "manual">("escaner");
  const [escaneando, setEscaneando] = useState(false);
  const [camaras, setCamaras] = useState<any[]>([]);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState("");
  const [tiempoRestante, setTiempoRestante] = useState(TIMEOUT_ESCANEO);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scannerDivId = "qr-scanner-reader";
  const [intentos, setIntentos] = useState(0);

  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadoEscaneo, setEstadoEscaneo] = useState<"inactivo" | "buscando" | "exito" | "error" | "timeout">("inactivo");
  const [qrDetectado, setQrDetectado] = useState<string | null>(null);

  const limpiarTimers = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  // Obtener cámaras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        console.log("📷 Cámaras encontradas:", devices?.length || 0);
        setCamaras(devices || []);
        if (devices && devices.length > 0) {
          const trasera = devices.find(d => 
            d.label.toLowerCase().includes("back") || 
            d.label.toLowerCase().includes("trasera") || 
            d.label.toLowerCase().includes("environment")
          );
          setCamaraSeleccionada(trasera?.id || devices[0].id);
        }
      })
      .catch((err) => {
        console.error("Error obteniendo cámaras:", err);
        setError("No se pudo acceder a las cámaras. Verifica los permisos.");
      });

    return () => {
      limpiarTimers();
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [limpiarTimers]);

  const detenerEscaner = useCallback(async () => {
    limpiarTimers();
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        console.log("📷 Escáner detenido");
      } catch (err) {
        console.log("📷 Escáner ya estaba detenido");
      }
      scannerRef.current = null;
    }
    setEscaneando(false);
  }, [limpiarTimers]);

  const validarCodigo = async (codigoValidar: string) => {
    const codigoLimpio = codigoValidar.trim().toUpperCase();
    console.log("🔍 Validando código:", codigoLimpio);
    
    if (!codigoLimpio || codigoLimpio.length < 5) {
      console.log("❌ Código muy corto:", codigoLimpio);
      return;
    }

    setQrDetectado(codigoLimpio);
    setCargando(true);
    setError(null);
    setEstadoEscaneo("exito");

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL}/validar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ codigo: codigoLimpio }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Código no válido");
      }

      console.log("✅ Código válido:", data);
      setResultado(data);
      toast.success("¡Código válido!", "Paciente verificado correctamente");
    } catch (err: any) {
      console.error("❌ Error validando:", err.message);
      setError(err.message || "Error al validar el código");
      setEstadoEscaneo("error");
      toast.error("Código inválido", err.message);
    } finally {
      setCargando(false);
      await detenerEscaner();
    }
  };

  const iniciarEscaner = async () => {
    if (!camaraSeleccionada) {
      toast.error("No se encontraron cámaras disponibles");
      return;
    }

    // Limpiar estado anterior
    setError(null);
    setResultado(null);
    setQrDetectado(null);
    setEstadoEscaneo("buscando");
    setTiempoRestante(TIMEOUT_ESCANEO);
    setIntentos(prev => prev + 1);

    // Detener escáner anterior si existe
    await detenerEscaner();

    // Pequeña pausa para asegurar que la cámara se liberó
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log("📷 Iniciando escáner con cámara:", camaraSeleccionada);

    // Timer de timeout
    timeoutRef.current = setTimeout(async () => {
      console.log("⏰ Timeout alcanzado");
      setEstadoEscaneo("timeout");
      setError(`No se detectó ningún código QR después de ${TIMEOUT_ESCANEO} segundos.`);
      await detenerEscaner();
    }, TIMEOUT_ESCANEO * 1000);

    // Contador regresivo
    intervalRef.current = setInterval(() => {
      setTiempoRestante(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    setEscaneando(true);

    try {
      const html5QrCode = new Html5Qrcode(scannerDivId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        // Configuración adicional para mejorar detección
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      };

      await html5QrCode.start(
        camaraSeleccionada,
        config,
        (decodedText) => {
          // 🎉 CÓDIGO DETECTADO
          console.log("🎉 QR DETECTADO:", decodedText);
          if (decodedText && decodedText.trim().length > 0) {
            validarCodigo(decodedText);
          }
        },
        (errorMessage) => {
          // Error de escaneo parcial - ignorar la mayoría
          // Solo loguear errores que NO sean "no se encontró QR"
          if (!errorMessage.includes("No MultiFormat Readers") && 
              !errorMessage.includes("No barcode") &&
              !errorMessage.includes("NotFound")) {
            console.warn("⚠️ Error escaneo:", errorMessage);
          }
        }
      );
      
      console.log("✅ Escáner iniciado correctamente");
    } catch (err: any) {
      console.error("❌ Error iniciando escáner:", err);
      setEstadoEscaneo("error");
      setError(`Error al iniciar la cámara: ${err.message || "Verifica los permisos"}`);
      setEscaneando(false);
      limpiarTimers();
    }
  };

  const validarCodigoManual = async () => {
    if (!codigo || codigo.length < 5) {
      setError("Ingrese un código válido (mínimo 5 caracteres)");
      return;
    }
    setEstadoEscaneo("buscando");
    await validarCodigo(codigo);
  };

  const limpiar = async () => {
    await detenerEscaner();
    setCodigo("");
    setResultado(null);
    setError(null);
    setEstadoEscaneo("inactivo");
    setQrDetectado(null);
  };

  const cambiarModo = async (nuevoModo: "escaner" | "manual") => {
    await detenerEscaner();
    setModo(nuevoModo);
    setError(null);
    setResultado(null);
    setCodigo("");
    setEstadoEscaneo("inactivo");
    setQrDetectado(null);
  };

  const reintentar = async () => {
    setError(null);
    setEstadoEscaneo("inactivo");
    setQrDetectado(null);
    await detenerEscaner();
    setTimeout(() => iniciarEscaner(), 500);
  };

  return (
    <div>
      <div className="page-header">
        <h2>📷 Validar entrada de paciente</h2>
        <p>Escanea el código QR del paciente o ingresa el código manualmente</p>
      </div>

      {/* Selector de modo */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          className={`tab-btn ${modo === "escaner" ? "active" : ""}`}
          onClick={() => cambiarModo("escaner")}
          style={{
            padding: "10px 24px", borderRadius: "30px", border: "none",
            background: modo === "escaner" ? "var(--primary-500)" : "var(--slate-100)",
            color: modo === "escaner" ? "white" : "var(--text-secondary)",
            fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
          }}
        >
          <Camera size={18} /> Escanear QR
        </button>
        <button
          className={`tab-btn ${modo === "manual" ? "active" : ""}`}
          onClick={() => cambiarModo("manual")}
          style={{
            padding: "10px 24px", borderRadius: "30px", border: "none",
            background: modo === "manual" ? "var(--primary-500)" : "var(--slate-100)",
            color: modo === "manual" ? "white" : "var(--text-secondary)",
            fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
          }}
        >
          <Keyboard size={18} /> Ingresar manual
        </button>
      </div>

      {/* MODO ESCÁNER */}
      {modo === "escaner" && (
        <Card title="📷 Escanear código QR" variant="elevated">
          <div style={{ textAlign: "center" }}>
            {/* Selector de cámara */}
            {camaras.length > 1 && (
              <div className="form-group" style={{ maxWidth: 300, margin: "0 auto 16px" }}>
                <label className="input-label">Seleccionar cámara</label>
                <select
                  className="input-field"
                  value={camaraSeleccionada}
                  onChange={(e) => {
                    setCamaraSeleccionada(e.target.value);
                    if (escaneando) detenerEscaner();
                  }}
                  disabled={escaneando}
                >
                  {camaras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Cámara ${cam.id.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Visor */}
            <div
              id={scannerDivId}
              style={{
                width: "100%", maxWidth: 350, margin: "0 auto",
                borderRadius: "16px", overflow: "hidden",
                border: escaneando ? "3px solid var(--primary-500)" : "2px solid var(--border)",
                minHeight: escaneando ? 300 : 200,
                background: escaneando ? "#000" : "var(--slate-100)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {!escaneando && estadoEscaneo === "inactivo" && (
                <div style={{ color: "var(--text-muted)" }}>
                  <Camera size={48} />
                  <p style={{ marginTop: 8 }}>Presiona "Iniciar escáner"</p>
                </div>
              )}
            </div>

            {/* Estado buscando */}
            {estadoEscaneo === "buscando" && (
              <div style={{
                background: "#EFF6FF", border: "1px solid #BFDBFE",
                borderRadius: "12px", padding: "16px", marginTop: "16px", textAlign: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
                  <div className="spinner-ring spinner-sm" />
                  <Clock size={18} color="#3B82F6" />
                  <span style={{ fontWeight: 600, color: "#1E40AF" }}>
                    Escaneando... {tiempoRestante}s
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#3B82F6", margin: 0 }}>
                  📷 Apunta al código QR. Asegúrate de que esté bien iluminado.
                </p>
                <div style={{ marginTop: "12px", height: "6px", background: "#DBEAFE", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${((TIMEOUT_ESCANEO - tiempoRestante) / TIMEOUT_ESCANEO) * 100}%`,
                    background: "#3B82F6", borderRadius: "3px", transition: "width 1s linear",
                  }} />
                </div>
              </div>
            )}

            {/* Código detectado */}
            {qrDetectado && cargando && (
              <div style={{
                background: "#F0FDF4", border: "1px solid #BBF7D0",
                borderRadius: "12px", padding: "16px", marginTop: "16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <div className="spinner-ring spinner-sm" />
                  <span style={{ fontWeight: 600, color: "#166534" }}>
                    ✅ Código detectado: {qrDetectado}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#166534", marginTop: 4 }}>
                  Validando en el sistema...
                </p>
              </div>
            )}

            {/* Timeout */}
            {estadoEscaneo === "timeout" && (
              <div style={{
                background: "#FFFBEB", border: "1px solid #FDE68A",
                borderRadius: "12px", padding: "16px", marginTop: "16px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong style={{ color: "#92400E" }}>⏰ Tiempo agotado</strong>
                    <p style={{ fontSize: "0.85rem", color: "#92400E", margin: "4px 0" }}>
                      No se detectó ningún código QR después de {TIMEOUT_ESCANEO} segundos.
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#92400E" }}>
                      💡 Consejos: Asegura buena iluminación, acerca el QR a la cámara, mantenlo estable.
                    </p>
                    <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <Button variant="primary" size="sm" onClick={reintentar}>
                        <RefreshCw size={14} /> Reintentar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => cambiarModo("manual")}>
                        <Keyboard size={14} /> Ingresar manualmente
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {estadoEscaneo === "error" && error && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FECACA",
                borderRadius: "12px", padding: "16px", marginTop: "16px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <XCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong style={{ color: "#991B1B" }}>❌ Error</strong>
                    <p style={{ fontSize: "0.85rem", color: "#991B1B", margin: "4px 0" }}>{error}</p>
                    <Button variant="secondary" size="sm" onClick={limpiar} style={{ marginTop: "8px" }}>
                      Intentar de nuevo
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div style={{ marginTop: 16 }}>
              {!escaneando && estadoEscaneo !== "timeout" && (
                <div>
                  <Button variant="primary" onClick={iniciarEscaner} disabled={!camaraSeleccionada}>
                    <Camera size={18} /> Iniciar escáner
                  </Button>
                  <p style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Tiempo máximo: {TIMEOUT_ESCANEO}s · Intento #{intentos + 1}
                  </p>
                </div>
              )}
              {escaneando && (
                <Button variant="secondary" onClick={detenerEscaner}>
                  <X size={18} /> Cancelar
                </Button>
              )}
            </div>
          </div>

          {/* Resultado exitoso */}
          {resultado?.valido && (
            <div style={{
              background: "#D1FAE5", color: "#059669",
              padding: 24, borderRadius: 16, marginTop: 16, textAlign: "center",
            }}>
              <CheckCircle size={48} style={{ marginBottom: 12 }} />
              <h3 style={{ marginBottom: 8 }}>✅ Acceso permitido</h3>
              <p style={{ fontSize: "1.1rem", marginBottom: 4 }}>
                <strong>{resultado.cita.paciente}</strong>
              </p>
              <p style={{ fontSize: "0.9rem", marginBottom: 4 }}>
                📅 {resultado.cita.fecha} a las {resultado.cita.hora}
              </p>
              <p style={{ fontSize: "0.9rem", marginBottom: 16 }}>
                👨‍⚕️ Dr/a. {resultado.cita.medico}
              </p>
              <Button variant="secondary" onClick={limpiar}>
                ✅ Nueva validación
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* MODO MANUAL */}
      {modo === "manual" && (
        <Card title="⌨️ Ingresar código manualmente" variant="elevated">
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                background: "#E0F2FE", width: 80, height: 80,
                borderRadius: "50%", display: "inline-flex",
                alignItems: "center", justifyContent: "center", marginBottom: 16,
              }}>
                <QrCode size={40} color="#0EA5E9" />
              </div>
              <p>Ingresa el código de verificación de la cita</p>
            </div>

            <Input
              label="Código de verificación"
              placeholder="Ej: CITA-A3F8D2"
              value={codigo}
              onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setError(null); }}
              icon={<Scan size={18} />}
              helperText="El código aparece en el mensaje de confirmación"
              onKeyDown={(e) => e.key === "Enter" && validarCodigoManual()}
            />

            {error && (
              <div style={{
                background: "#FEE2E2", color: "#DC2626",
                padding: 12, borderRadius: 12, marginTop: 12,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <XCircle size={18} />
                <span style={{ fontSize: 14 }}>{error}</span>
              </div>
            )}

            {resultado?.valido && (
              <div style={{
                background: "#D1FAE5", color: "#059669",
                padding: 16, borderRadius: 16, marginTop: 16, textAlign: "center",
              }}>
                <CheckCircle size={32} style={{ marginBottom: 8 }} />
                <h4 style={{ marginBottom: 4 }}>✅ Acceso permitido</h4>
                <p style={{ marginBottom: 8 }}><strong>{resultado.cita.paciente}</strong></p>
                <p style={{ fontSize: 14, marginBottom: 4 }}>
                  📅 {resultado.cita.fecha} a las {resultado.cita.hora}
                </p>
                <p style={{ fontSize: 14 }}>👨‍⚕️ Dr/a. {resultado.cita.medico}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <Button
                variant="primary" fullWidth
                onClick={validarCodigoManual}
                loading={cargando}
                disabled={!codigo || codigo.length < 5}
              >
                <Scan size={18} /> Validar código
              </Button>
              {(resultado || error) && (
                <Button variant="secondary" onClick={limpiar}>Nueva validación</Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default ValidadorQR;