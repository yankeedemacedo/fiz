import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { useTaskStore } from "@/store/taskStore";
import { resetStore } from "@/test/helpers";

beforeEach(resetStore);

function open() {
  useTaskStore.getState().setManagerOpen(true);
}

describe("CategoryManager", () => {
  it("creates a category with color and icon", async () => {
    const user = userEvent.setup();
    open();
    render(<CategoryManager />);

    await user.click(screen.getByRole("button", { name: "Nova categoria" }));
    await user.type(screen.getByLabelText("Nome da categoria"), "Saúde");
    await user.click(screen.getByRole("button", { name: "Criar" }));

    const cats = useTaskStore.getState().categories;
    expect(cats.map((c) => c.name)).toContain("Saúde");
    expect(screen.getByText("Saúde")).toBeInTheDocument();
  });

  it("validates the name", async () => {
    const user = userEvent.setup();
    open();
    render(<CategoryManager />);
    await user.click(screen.getByRole("button", { name: "Nova categoria" }));
    await user.click(screen.getByRole("button", { name: "Criar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("nome");
    expect(useTaskStore.getState().categories).toHaveLength(0);
  });

  it("deletes with two-step confirmation", async () => {
    const user = userEvent.setup();
    useTaskStore.getState().addCategory({ name: "X", color: "#fff" });
    open();
    render(<CategoryManager />);

    await user.click(screen.getByRole("button", { name: "Excluir X" }));
    await user.click(screen.getByRole("button", { name: "Sim" }));
    expect(useTaskStore.getState().categories).toHaveLength(0);
  });
});
