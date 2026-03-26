import { useState, useEffect } from "react";
import Login from "./app/components/Login";
import Sidebar from "./app/components/Sidebar";
import Header from "./app/components/Header";
import Footer from "./app/components/Footer";
import Citas from "./app/pages/citas";
import Medicos from "./app/pages/medicos";
import Pacientes from "./app/pages/pacientes";
import AgendarWeb from "./app/components/AgendarWeb";
import "./style.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vista, setVista] = useState("citas");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderVista = () => {
    switch (vista) {
      case "citas":
        return <Citas />;
      case "medicos":
        return <Medicos />;
      case "pacientes":
        return <Pacientes />;
      case "agendar-web":
        return <AgendarWeb />;
      case "configuracion":
        return (
          <div>
            <div className="page-header">
              <h2>Configuración del Sistema</h2>
              <p>Parámetros generales de agendamiento</p>
            </div>
            <div className="card-custom">
              <h4>Configuración Global</h4>
              <div className="form-group">
                <label>Ventana de tiempo para agendar citas (semanas)</label>
                <input type="number" min="1" max="12" defaultValue="4" />
                <small>Las citas se pueden agendar con esta cantidad de semanas de anticipación</small>
              </div>
            </div>
            <div className="card-custom">
              <h4>Configuración por Especialista</h4>
              <p>Seleccione un especialista para configurar su horario de atención</p>
              <select style={{ marginTop: 10 }}>
                <option>Dra. Ana García - Medicina General</option>
                <option>Dr. Carlos Pérez - Cardiología</option>
                <option>Dra. María López - Pediatría</option>
              </select>
            </div>
          </div>
        );
      default:
        return <Citas />;
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        <Sidebar setVista={setVista} />
        <main className="main-content">
          {renderVista()}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;