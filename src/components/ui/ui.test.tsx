import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Badge, Button, Card, IconButton, Input, Spinner } from "@/components/ui";

describe("Button", () => {
  it("renders children and handles clicks", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Salvar</Button>);
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disables + shows busy state when loading", () => {
    render(<Button loading>Salvar</Button>);
    const btn = screen.getByRole("button", { name: "Salvar" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });
});

describe("Input", () => {
  it("marks invalid fields for assistive tech", () => {
    render(<Input aria-label="nome" invalid />);
    expect(screen.getByLabelText("nome")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Card", () => {
  it("renders content", () => {
    render(<Card>oi</Card>);
    expect(screen.getByText("oi")).toBeInTheDocument();
  });
});

describe("Badge", () => {
  it("renders tone text", () => {
    render(<Badge tone="danger">Alta</Badge>);
    expect(screen.getByText("Alta")).toBeInTheDocument();
  });
});

describe("IconButton", () => {
  it("requires an accessible label", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <IconButton label="Fechar" onClick={onClick}>
        ×
      </IconButton>,
    );
    await user.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("Spinner", () => {
  it("exposes a status role", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
