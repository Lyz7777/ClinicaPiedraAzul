import React from "react";

interface DashboardLayoutProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ header, sidebar, footer, children }) => (
  <div className="app-container">
    {header}
    <div className="main-layout">
      {sidebar}
      <main className="main-content">{children}</main>
    </div>
    {footer}
  </div>
);

export default DashboardLayout;
