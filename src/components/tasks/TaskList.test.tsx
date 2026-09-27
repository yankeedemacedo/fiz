import { beforeEach, describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskList } from "@/components/tasks/TaskList";
import { FilterBar } from "@/components/filters/FilterBar";
import { Toasts } from "@/components/feedback/Toasts";
import { useTaskStore } from "@/store/taskStore";
import { resetStore } from "@/test/helpers";

beforeEach(resetStore);

function seed() {
  const api = useTaskStore.getState();
  api.addTask({ title: "Urgente", description: "", priority: "high" });
  api.addTask({ title: "Tranquila", description: "", priority: "low" });
}

describe("TaskList", () => {
  it("renders tasks and toggles completion", async () => {
    const user = userEvent.setup();
    seed();
    render(<TaskList />);
    expect(screen.getByText("Urgente")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /concluir "urgente"/i }));
    expect(useTaskStore.getState().tasks[0]?.isCompleted).toBe(true);
    expect(screen.getByText("Urgente")).toHaveClass("line-through");
  });

  it("deletes with undo via toast", async () => {
    const user = userEvent.setup();
    seed();
    render(
      <>
        <TaskList />
        <Toasts />
      </>,
    );
    await user.click(screen.getByRole("button", { name: /excluir "urgente"/i }));
    expect(screen.queryByText("Urgente")).not.toBeInTheDocument();
    // NOTE: role=status takes its accessible name from author only,
    // never from contents — assert the live-region text instead.
    expect(screen.getByText(/“Urgente” excluída/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Desfazer" }));
    expect(screen.getByText("Urgente")).toBeInTheDocument();
    expect(useTaskStore.getState().tasks).toHaveLength(2);
  });

  it("opens the detail sheet from the item", async () => {
    const user = userEvent.setup();
    seed();
    render(<TaskList />);
    await user.click(
      screen.getAllByRole("button", { name: /ver detalhes/i })[0] as HTMLElement,
    );
    expect(useTaskStore.getState().detailId).toBe(
      useTaskStore.getState().tasks[0]?.id,
    );
  });

  it("shows the filtered empty state with reset", async () => {
    const user = userEvent.setup();
    seed();
    render(<TaskList />);
    act(() => {
      useTaskStore.getState().setFilter({ query: "zzz" });
    });
    expect(screen.getByText("Nada por aqui")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getByText("Urgente")).toBeInTheDocument();
  });

  it("shows the onboarding empty state when no tasks exist", () => {
    render(<TaskList />);
    expect(screen.getByText("Nenhuma tarefa ainda")).toBeInTheDocument();
  });
});

describe("FilterBar", () => {
  it("filters by priority and clears via chips", async () => {
    const user = userEvent.setup();
    seed();
    render(
      <>
        <FilterBar />
        <TaskList />
      </>,
    );
    await user.selectOptions(screen.getByLabelText("Filtrar por prioridade"), "high");
    expect(screen.queryByText("Tranquila")).not.toBeInTheDocument();
    expect(screen.getByText("Urgente")).toBeInTheDocument();

    const region = screen.getByLabelText("Filtros");
    await user.click(within(region).getByRole("button", { name: /remover filtro/i }));
    expect(screen.getByText("Tranquila")).toBeInTheDocument();
  });

  it("toggles tag filters", async () => {
    const user = userEvent.setup();
    const api = useTaskStore.getState();
    api.addTask({ title: "Com tag", description: "", tags: ["casa"] });
    api.addTask({ title: "Sem tag", description: "" });
    render(
      <>
        <FilterBar />
        <TaskList />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "#casa" }));
    expect(screen.queryByText("Sem tag")).not.toBeInTheDocument();
    expect(screen.getByText("Com tag")).toBeInTheDocument();
  });
});
