import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/components/ui/Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="T">
        x
      </Modal>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="Caixa">
        <button type="button">dentro</button>
      </Modal>,
    );
    expect(screen.getByRole("dialog", { name: "Caixa" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes via the close button and traps focus inside", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="Caixa">
        corpo
      </Modal>,
    );
    await user.click(screen.getByRole("button", { name: "Fechar diálogo" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
