import { useEffect, useState } from "react";
import AddTask from "./components/AddTask";
import Tasks from "./components/Tasks";
import { v4 } from "uuid";
import { Moon, Sun } from "lucide-react";
import useDarkMode from "./hooks/useDarkMode";
import logo from "./assets/logo.png";

function App() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const [tasks, setTasks] = useState(
    JSON.parse(localStorage.getItem("tasks")) || [],
  );

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  function onTaskClick(taskId) {
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, isCompleted: !task.isCompleted };
      } else {
        return task;
      }
    });
    setTasks(newTasks);
  }

  function onDeleteTask(taskId) {
    const newTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(newTasks);
  }

  function onAddTaskSubmit(title, description) {
    const newTask = {
      id: v4(),
      title,
      description,
      isCompleted: false,
    };
    setTasks([...tasks, newTask]);
  }

  return (
    <>
      <div
        className={`w-screen min-h-screen bg-fixed flex justify-center p-6 ${
          isDark
            ? "bg-gradient-to-b from-cyan-700 to-gray-800"
            : "bg-gradient-to-b from-cyan-700 to-slate-300"
        }`}
      >
        <div className="w-[450px] space-y-4 sm:w-[600px] space-y-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md cursor-pointer transition-colors ${
                isDark
                  ? "bg-cyan-900 hover:bg-cyan-950 text-white"
                  : "bg-cyan-800 hover:bg-cyan-900 text-white"
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <a href="/" className="flex justify-center">
            <img
              className="h-30 w-120 object-contain object-center"
              src={logo}
              alt="Logo"
            />
          </a>
          <AddTask onAddTaskSubmit={onAddTaskSubmit} isDark={isDark} />
          <Tasks
            tasks={tasks}
            onTaskClick={onTaskClick}
            onDeleteTask={onDeleteTask}
            isDark={isDark}
          />
        </div>
      </div>
    </>
  );
}

export default App;
