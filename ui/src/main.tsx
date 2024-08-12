import React from "react";
import ReactDOM from "react-dom/client";
import { Home } from "./pages/Home.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </ThemeProvider>
  </TooltipProvider>
);
