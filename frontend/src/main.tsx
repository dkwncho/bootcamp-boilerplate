import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./ExampleTheme";
import ExampleDashboard from "./ExampleDashboard";

function AppWrapper() {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    try {
      const stored = localStorage.getItem("themeMode");
      return stored === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("themeMode", mode);
    } catch {}
  }, [mode]);

  // expose a data attribute on the root element so global CSS can switch backgrounds
  useEffect(() => {
    try {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", mode);
      }
    } catch {}
  }, [mode]);

  return (
    <ThemeProvider theme={createAppTheme(mode)}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<ExampleDashboard themeMode={mode} setThemeMode={setMode} />} />
      </Routes>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <AppWrapper />
    </StrictMode>
  </BrowserRouter>
);
