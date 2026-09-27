import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider } from "./theme";
import { ErrorBoundary } from "./components/feedback/ErrorBoundary";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  // Passo 6: detail is a sheet now — old bookmarks land on the list.
  {
    path: "/task",
    element: <Navigate to="/" replace />,
  },
]);

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element");

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
);
