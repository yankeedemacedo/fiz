import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function Boom(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  it("renders a recovery card instead of crashing", async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Algo deu errado")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    // Reset attempt re-renders Boom → boundary catches again, still standing.
    expect(screen.getByText("Algo deu errado")).toBeInTheDocument();
  });
});
