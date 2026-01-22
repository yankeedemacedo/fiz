import { FilePlus } from "lucide-react";
import { useState } from "react";

function AddTask({ onAddTaskSubmit, isDark }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div
      className={`space-y-4 p-6 rounded-md shadow flex flex-col ${
        isDark ? "bg-gray-700" : "bg-white"
      }`}
    >
      <input
        type="text"
        placeholder="Digite o título da tarefa"
        className={`border px-4 py-2 rounded-md outline-cyan-900 ${
          isDark
            ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
            : "border-cyan-700 bg-white text-black"
        }`}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (!title.trim() || !description.trim()) {
              setTitle("");
              setDescription("");
              return alert("Preencha o título e a descrição da tarefa.");
            }
            onAddTaskSubmit(title, description);
            setTitle("");
            setDescription("");
          }
        }}
      />
      <input
        type="text"
        placeholder="Digite a descrição da tarefa"
        className={`border px-4 py-2 rounded-md outline-cyan-900 ${
          isDark
            ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
            : "border-cyan-700 bg-white text-black"
        }`}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (!title.trim() || !description.trim()) {
              setTitle("");
              setDescription("");
              return alert("Preencha o título e a descrição da tarefa.");
            }
            onAddTaskSubmit(title, description);
            setTitle("");
            setDescription("");
          }
        }}
      />
      <button
        onClick={() => {
          if (!title.trim() || !description.trim()) {
            setTitle("");
            setDescription("");
            return alert("Preencha o título e a descrição da tarefa.");
          }
          onAddTaskSubmit(title, description);
          setTitle("");
          setDescription("");
        }}
        className={`text-white px-4 py-2 rounded-md cursor-pointer flex items-center justify-center ${
          isDark
            ? "bg-cyan-600 hover:bg-cyan-700"
            : "bg-cyan-700 hover:bg-cyan-800"
        }`}
      >
        <FilePlus />
      </button>
    </div>
  );
}
export default AddTask;
