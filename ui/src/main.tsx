import React from "react";
import ReactDOM from "react-dom/client";
import { Home } from "./pages/Home.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Recs } from "./pages/Recs.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import Logo from "./components/Logo.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/recs",
    element: <Recs />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div>
        <header className="my-12 flex justify-center">
          <Logo className="w-[300px] h-auto" />
        </header>
        <React.StrictMode>
          <RouterProvider router={router} />
        </React.StrictMode>
      </div>
    </ThemeProvider>
  </TooltipProvider>
);
