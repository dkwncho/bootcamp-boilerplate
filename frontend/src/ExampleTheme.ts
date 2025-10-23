import { createTheme } from "@mui/material/styles";

export function createAppTheme(mode: "light" | "dark" = "light") {
  return createTheme({
    cssVariables: true,
    palette: {
      mode,
      primary: {
        main: "#2563eb",
      },
      secondary: {
        main: "#14b8a6",
      },
      background: {
        default: mode === "light" ? "#f8fafc" : "#071024",
        paper: mode === "light" ? "#ffffff" : "#04263a",
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      h6: {
        fontWeight: 700,
      },
      body2: {
        color: mode === "light" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)",
      },
    },
  });
}

// Default export for existing imports
export default createAppTheme("light");
