import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./app";
import { auth0Config } from "./auth/auth0-config";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider {...auth0Config} cacheLocation="localstorage">
      <App />
    </Auth0Provider>
  </React.StrictMode>
);