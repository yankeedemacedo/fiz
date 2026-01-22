import { ChevronLeftIcon, SquareCheck, Square, Moon, Sun } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import useDarkMode from "../hooks/useDarkMode";
import logo from "../assets/logo.png";

function TaskPage() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title");
  const description = searchParams.get("description");
  const id = searchParams.get("id");
  const initialCompleted = searchParams.get("isCompleted") === "true";
  const [isCompleted, setIsCompleted] = useState(initialCompleted);

  function handleToggleStatus() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const newTasks = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, isCompleted: !t.isCompleted };
      }
      return t;
    });
    localStorage.setItem("tasks", JSON.stringify(newTasks));
    setIsCompleted((s) => !s);
  }

  return (
    <>
      <div
        className={`h-screen w-screen p-6 flex justify-center ${
          isDark
            ? "bg-gradient-to-b from-cyan-700 to-gray-800"
            : "bg-gradient-to-b from-cyan-700 to-slate-300"
        }`}
      >
        <div className="w-[500px] space-y-4">
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
          <div className="flex justify-center relative mb-6">
            <button
              onClick={() => navigate(-1)}
              className={`absolute left-0 top-0 bottom-0 cursor-pointer hover:opacity-70 transition-opacity ${
                isDark ? "text-gray-300" : "text-white hover:text-slate-400"
              }`}
            >
              <ChevronLeftIcon />
            </button>
            <h1
              className={`text-3xl font-bold text-center ${
                isDark ? "text-gray-100" : "text-slate-100"
              }`}
            >
              Detalhes da Tarefa
            </h1>
          </div>
          <div
            className={`p-4 rounded-md ${
              isDark ? "bg-gray-700 text-gray-100" : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-bold text-center mb-5 ${
                isDark ? "text-gray-100" : "text-cyan-900"
              }`}
            >
              {title}
            </h2>
            <p className={isDark ? "text-gray-300" : "text-cyan-900"}>
              {description}
            </p>
            <p
              className={`mt-3 mb-3 ${
                isDark ? "text-gray-300" : "text-cyan-900"
              }`}
            >{`Status: ${isCompleted ? "Realizada" : "Pendente"}`}</p>
            <div className="flex justify-end">
              <button
                onClick={handleToggleStatus}
                className={`p-2 cursor-pointer rounded-md flex items-center justify-center transition-colors ${
                  isDark
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                    : "bg-cyan-700 hover:bg-cyan-800 text-white"
                }`}
              >
                {isCompleted ? <SquareCheck /> : <Square />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default TaskPage;
