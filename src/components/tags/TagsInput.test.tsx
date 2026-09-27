import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { TagsInput } from "@/components/tags/TagsInput";
import { useTaskStore } from "@/store/taskStore";
import { resetStore } from "@/test/helpers";

beforeEach(resetStore);

function Harness({ initial = [] as string[] }: { initial?: string[] }) {
  const [value, setValue] = useState(initial);
  return <TagsInput id="tags" value={value} onChange={setValue} />;
}

describe("TagsInput", () => {
  it("adds a tag on Enter and removes via chip button", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByLabelText(/tags/i), "casa{enter}");
    expect(screen.getByText("#casa")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remover tag casa" }));
    expect(screen.queryByText("#casa")).not.toBeInTheDocument();
  });

  it("suggests existing tags and adds on click", async () => {
    const user = userEvent.setup();
    useTaskStore
      .getState()
      .addTask({ title: "T", description: "", tags: ["mercado"] });
    render(<Harness />);
    const input = screen.getByLabelText(/tags/i);
    await user.click(input);
    await user.click(screen.getByRole("option", { name: "#mercado" }));
    expect(screen.getByText("#mercado")).toBeInTheDocument();
  });

  it("Backspace with empty input removes the last tag", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["a", "b"]} />);
    const input = screen.getByLabelText(/tags/i);
    input.focus();
    await user.keyboard("{Backspace}");
    expect(screen.queryByText("#b")).not.toBeInTheDocument();
    expect(screen.getByText("#a")).toBeInTheDocument();
  });

  it("ignores duplicates case-insensitively", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagsInput id="t" value={["Casa"]} onChange={onChange} />);
    await user.type(screen.getByLabelText(/tags/i), "casa{enter}");
    expect(onChange).not.toHaveBeenCalled();
  });
});
