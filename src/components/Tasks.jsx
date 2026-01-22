import { ChevronRightIcon, Trash, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Tasks(props) {
  const navigate = useNavigate();

  function onSeeDetailsClick(task) {
    const query = new URLSearchParams();
    query.set("title", task.title);
    query.set("description", task.description);
    query.set("id", task.id);
    query.set("isCompleted", String(task.isCompleted));
    navigate(`/task?${query.toString()}`);
  }

  return (
    <ul
      className={`space-y-4 p-6 rounded-md shadow ${
        props.isDark ? "bg-gray-700" : "bg-white"
      }`}
    >
      {props.tasks.map((task) => (
        <li key={task.id} className="flex gap-2">
          <button
            onClick={() => props.onTaskClick(task.id)}
            className={`w-full p-2 cursor-pointer rounded-md text-left flex gap-2 ${
              task.isCompleted
                ? props.isDark
                  ? "bg-cyan-900 text-white line-through hover:bg-cyan-800"
                  : "bg-cyan-900 text-white line-through hover:bg-cyan-800"
                : props.isDark
                ? "bg-cyan-600 text-white hover:bg-cyan-700"
                : "bg-cyan-700 text-white hover:bg-cyan-800"
            }`}
          >
            <span className="pt-1">
              {task.isCompleted && <Check size={18} />}
            </span>
            <span>{task.title}</span>
          </button>
          <button
            onClick={() => onSeeDetailsClick(task)}
            className={`p-2 cursor-pointer rounded-md text-white ${
              props.isDark
                ? "bg-cyan-600 hover:bg-cyan-700"
                : "bg-cyan-700 hover:bg-cyan-800"
            }`}
          >
            <ChevronRightIcon />
          </button>
          <button
            onClick={() => props.onDeleteTask(task.id)}
            className={`p-2 cursor-pointer rounded-md text-white ${
              props.isDark
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-700 hover:bg-red-800"
            }`}
          >
            <Trash />
          </button>
        </li>
      ))}
    </ul>
  );
}
export default Tasks;
