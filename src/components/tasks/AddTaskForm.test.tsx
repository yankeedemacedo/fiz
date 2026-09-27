import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTaskForm } from "@/components/tasks/AddTaskForm";
import { useTaskStore } from "@/store/taskStore";
import { resetStore } from "@/test/helpers";

beforeEach(resetStore);

describe("AddTaskForm", () => {
  it("creates a task with metadata on submit", async () => {
    const user = userEvent.setup();
    useTaskStore.getState().addCategory({ name: "Casa", color: "#fff" });
    render(<AddTaskForm />);

    await user.type(screen.getByLabelText("Título da tarefa"), "Comprar pão");
    await user.type(screen.getByLabelText("Descrição (opcional)"), "integral");
    await user.selectOptions(screen.getByLabelText("Categoria"), "Casa");
    await user.click(screen.getByRole("button", { name: "Alta" }));
    await user.click(screen.getByRole("button", { name: /adicionar tarefa/i }));

    const tasks = useTaskStore.getState().tasks;
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      title: "Comprar pão",
      description: "integral",
      priority: "high",
    });
    expect(tasks[0]?.categoryId).toBeDefined();
    expect(screen.getByLabelText("Título da tarefa")).toHaveValue("");
  });

  it("shows an inline error instead of submitting empty", async () => {
    const user = userEvent.setup();
    render(<AddTaskForm />);
    await user.click(screen.getByRole("button", { name: /adicionar tarefa/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("título");
    expect(useTaskStore.getState().tasks).toHaveLength(0);
  });
});
