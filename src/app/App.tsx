import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { SchedulerDashboard } from "./components/SchedulerDashboard";
import { PatientDashboard } from "./components/PatientDashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("login");
  const [userRole, setUserRole] = useState<string>("");

  const handleNavigate = (page: string, role?: string) => {
    if (role) {
      setUserRole(role);
    }
    setCurrentPage(page);
  };

  return (
    <div className="size-full">
      {currentPage === "login" && <LoginPage onNavigate={handleNavigate} />}
      {currentPage === "register" && <RegisterPage onNavigate={handleNavigate} />}
      {currentPage === "admin-dashboard" && <AdminDashboard onNavigate={handleNavigate} />}
      {currentPage === "scheduler-dashboard" && <SchedulerDashboard onNavigate={handleNavigate} />}
      {currentPage === "patient-dashboard" && <PatientDashboard onNavigate={handleNavigate} />}
    </div>
  );
}