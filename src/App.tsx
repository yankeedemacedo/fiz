import { Suspense, lazy } from "react";
import { AppShell } from "./components/layout/AppShell";
import { AddTaskForm } from "./components/tasks/AddTaskForm";
import { TaskList } from "./components/tasks/TaskList";
import { Toasts } from "./components/feedback/Toasts";
import { Spinner } from "./components/ui";
import { Stack } from "./components/layout/Container";
import { useShortcuts } from "./hooks/useShortcuts";

const TaskDetail = lazy(() =>
  import("./components/detail/TaskDetail").then((m) => ({
    default: m.TaskDetail,
  })),
);
const CategoryManager = lazy(() =>
  import("./components/categories/CategoryManager").then((m) => ({
    default: m.CategoryManager,
  })),
);

function App() {
  useShortcuts();

  return (
    <AppShell>
      <h1 className="sr-only">Minhas tarefas</h1>
      <Stack gap={4}>
        <AddTaskForm inline />
        <TaskList />
      </Stack>
      <Suspense
        fallback={
          <span className="fixed inset-0 z-50 flex items-center justify-center">
            <Spinner label="Abrindo…" />
          </span>
        }
      >
        <CategoryManager />
        <TaskDetail />
      </Suspense>
      <Toasts />
    </AppShell>
  );
}

export default App;
