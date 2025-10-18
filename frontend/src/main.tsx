import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./ExampleTheme.ts";
import ExampleDashboard from "./ExampleDashboard.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<ExampleDashboard />} />
        </Routes>
      </ThemeProvider>
    </StrictMode>
  </BrowserRouter>
);
