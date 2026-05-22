import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./i18n.js";
import App from "./App.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import Preloader from "./components/Preloader.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <Preloader>
          <App />
        </Preloader>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);