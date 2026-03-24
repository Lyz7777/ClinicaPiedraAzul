import { useEffect, useState } from "react";
import { getCitas, crearCita, getHorasDisponibles } from "../services/citas.service";
import { getPacientes, buscarPacientePorDocumento, crearPaciente } from "../services/pacientes.service";
import { getMedicos } from "../services/medicos.service";

function Citas() {
  const [citas, setCitas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);
  const [filtroMedicoId, setFiltroMedicoId] = useState("");
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0]);
  const [citasFiltradas, setCitasFiltradas] = useState<any[]>([]);
  const [mostrandoListado, setMostrandoListado] = useState(true);

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  
  const [nuevoPaciente, setNuevoPaciente] = useState<{
    documento: string;
    nombres: string;
    apellidos: string;
    celular: string;
    genero: "Hombre" | "Mujer" | "Otro";
    fechaNacimiento: string;
    email: string;
  }>({
    documento: "",
    nombres: "",
    apellidos: "",
    celular: "",
    genero: "Otro",
    fechaNacimiento: "",
    email: ""
  });
  
  const [mostrarFormPaciente, setMostrarFormPaciente] = useState(false);
  const [pacienteExistente, setPacienteExistente] = useState<any>(null);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);

  const cargarTodo = async () => {
    const [citasData, pacientesData, medicosData] = await Promise.all([
      getCitas(),
      getPacientes(),
      getMedicos()
    ]);
    
    setCitas(citasData);
    setPacientes(pacientesData);
    setMedicos(medicosData);
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  useEffect(() => {
    if (filtroMedicoId && filtroFecha) {
      const filtradas = citas.filter(cita => 
        cita.medicoId === Number(filtroMedicoId) && 
        cita.fecha === filtroFecha
      );
      setCitasFiltradas(filtradas);
    } else {
      setCitasFiltradas([]);
    }
  }, [citas, filtroMedicoId, filtroFecha]);

  useEffect(() => {
    if (medicoId && fecha) {
      const cargarHoras = async () => {
        const horas = await getHorasDisponibles(Number(medicoId), fecha);
        setHorasDisponibles(horas);
      };
      cargarHoras();
    } else {
      setHorasDisponibles([]);
    }
  }, [medicoId, fecha]);

  const buscarPaciente = async (documento: string) => {
    if (!documento || documento.length < 5) return;
    
    setBuscandoPaciente(true);
    const paciente = await buscarPacientePorDocumento(documento);
    
    if (paciente) {
      setPacienteExistente(paciente);
      setPacienteId(paciente.id.toString());
      setMostrarFormPaciente(false);
    } else {
      setPacienteExistente(null);
      setMostrarFormPaciente(true);
    }
    setBuscandoPaciente(false);
  };

  const registrarNuevoPaciente = async () => {
    if (!nuevoPaciente.documento || !nuevoPaciente.nombres || !nuevoPaciente.apellidos || !nuevoPaciente.celular) {
      alert("Por favor complete los campos obligatorios del paciente");
      return;
    }

    const nuevo = await crearPaciente(nuevoPaciente);
    setPacienteId(nuevo.id.toString());
    setMostrarFormPaciente(false);
    setPacienteExistente(nuevo);
    cargarTodo();
  };

  const crear = async () => {
    if (!fecha || !hora || !pacienteId || !medicoId) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    await crearCita({
      fecha,
      hora,
      pacienteId: Number(pacienteId),
      medicoId: Number(medicoId),
      descripcion,
      estado: "AGENDADA"
    });

    setFecha("");
    setHora("");
    setPacienteId("");
    setMedicoId("");
    setDescripcion("");
    setNuevoPaciente({
      documento: "",
      nombres: "",
      apellidos: "",
      celular: "",
      genero: "Otro",
      fechaNacimiento: "",
      email: ""
    });
    setPacienteExistente(null);
    setMostrarFormPaciente(false);

    alert("Cita agendada exitosamente");
    cargarTodo();
  };

  const buscarCitas = () => {
    if (!filtroMedicoId) {
      alert("Por favor seleccione un especialista");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Agenda de Citas</h2>
        <p>Consulte y programe sus citas médicas</p>
      </div>

      <div className="tab-container">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${mostrandoListado ? "active" : ""}`}
            onClick={() => setMostrandoListado(true)}
          >
            Consultar Citas
          </button>
          <button 
            className={`tab-btn ${!mostrandoListado ? "active" : ""}`}
            onClick={() => setMostrandoListado(false)}
          >
            Nueva Cita
          </button>
        </div>
      </div>

      {mostrandoListado ? (
        <div>
          <div className="card-custom">
            <h4>Buscar Citas</h4>
            
            <div className="form-group">
              <label>Especialista</label>
              <select
                value={filtroMedicoId}
                onChange={(e) => setFiltroMedicoId(e.target.value)}
              >
                <option value="">Seleccionar especialista</option>
                {medicos.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} - {m.especialidad}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={buscarCitas}>
              Buscar
            </button>
          </div>

          <div className="card-custom">
            <div className="result-header">
              <h4>Resultados</h4>
              <span className="result-count">{citasFiltradas.length} cita{citasFiltradas.length !== 1 ? "s" : ""}</span>
            </div>
            
            {citasFiltradas.length > 0 ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Hora</th>
                      <th>Estado</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasFiltradas.map((cita: any) => {
                      const paciente = pacientes.find(p => p.id === cita.pacienteId);
                      return (
                        <tr key={cita.id}>
                          <td>{paciente?.nombres} {paciente?.apellidos || paciente?.nombre}</td>
                          <td>{cita.hora}</td>
                          <td>
                            <span className={`badge ${cita.estado === "AGENDADA" ? "badge-warning" : "badge-success"}`}>
                              {cita.estado === "AGENDADA" ? "Programada" : "Confirmada"}
                            </span>
                          </td>
                          <td>{cita.descripcion || "---"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No hay citas programadas para esta fecha</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="card-custom">
            <h4>Datos de la Cita</h4>

            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Hora</label>
              <select
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                disabled={horasDisponibles.length === 0}
              >
                <option value="">Seleccionar hora</option>
                {horasDisponibles.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Especialista</label>
              <select
                value={medicoId}
                onChange={(e) => setMedicoId(e.target.value)}
              >
                <option value="">Seleccionar especialista</option>
                {medicos.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} - {m.especialidad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-custom">
            <h4>Información del Paciente</h4>
            
            <div className="form-group">
              <label>Número de documento</label>
              <input
                type="text"
                placeholder="Documento de identidad"
                value={nuevoPaciente.documento}
                onChange={(e) => {
                  setNuevoPaciente({...nuevoPaciente, documento: e.target.value});
                  buscarPaciente(e.target.value);
                }}
              />
            </div>
            
            {buscandoPaciente && <div className="loading-spinner">Buscando...</div>}

            {pacienteExistente && (
              <div className="success-message">
                <span>✓</span>
                <p>{pacienteExistente.nombres} {pacienteExistente.apellidos} - {pacienteExistente.celular}</p>
              </div>
            )}

            {mostrarFormPaciente && nuevoPaciente.documento && (
              <div className="new-patient-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombres</label>
                    <input
                      type="text"
                      placeholder="Nombres"
                      value={nuevoPaciente.nombres}
                      onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombres: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellidos</label>
                    <input
                      type="text"
                      placeholder="Apellidos"
                      value={nuevoPaciente.apellidos}
                      onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellidos: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Celular</label>
                    <input
                      type="tel"
                      placeholder="Celular"
                      value={nuevoPaciente.celular}
                      onChange={(e) => setNuevoPaciente({...nuevoPaciente, celular: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Género</label>
                    <select
                      value={nuevoPaciente.genero}
                      onChange={(e) => setNuevoPaciente({...nuevoPaciente, genero: e.target.value as "Hombre" | "Mujer" | "Otro"})}
                    >
                      <option value="Hombre">Hombre</option>
                      <option value="Mujer">Mujer</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de nacimiento</label>
                    <input
                      type="date"
                      value={nuevoPaciente.fechaNacimiento}
                      onChange={(e) => setNuevoPaciente({...nuevoPaciente, fechaNacimiento: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={nuevoPaciente.email}
                      onChange={(e) => setNuevoPaciente({...nuevoPaciente, email: e.target.value})}
                    />
                  </div>
                </div>

                <button className="btn btn-primary" onClick={registrarNuevoPaciente}>
                  Registrar Paciente
                </button>
              </div>
            )}
          </div>

          <div className="card-custom">
            <div className="form-group">
              <label>Motivo de consulta</label>
              <input
                placeholder="Describa el motivo de la consulta"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <button 
              className="btn btn-primary btn-block" 
              onClick={crear}
              disabled={!fecha || !hora || !medicoId || !pacienteId}
            >
              Agendar Cita
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Citas;