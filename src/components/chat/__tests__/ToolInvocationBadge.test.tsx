import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// str_replace_editor — create
test("shows 'Creating' with filename for str_replace_editor create command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("shows 'Creating file' when no path provided for create command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating file")).toBeDefined();
});

// str_replace_editor — str_replace / insert
test("shows 'Editing' with filename for str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/components/Button.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();
});

test("shows 'Editing' with filename for insert command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/index.ts" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing index.ts")).toBeDefined();
});

// str_replace_editor — view
test("shows 'Reading' with filename for view command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "/App.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Reading App.tsx")).toBeDefined();
});

// str_replace_editor — unknown command falls back to editing
test("falls back to 'Editing' label for unknown str_replace_editor command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ path: "/App.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

// file_manager — delete
test("shows 'Deleting' with filename for file_manager delete command", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/old-component.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Deleting old-component.tsx")).toBeDefined();
});

// file_manager — rename
test("shows 'Renaming' with both filenames for file_manager rename command", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/Foo.tsx", new_path: "/Bar.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Renaming Foo.tsx to Bar.tsx")).toBeDefined();
});

// Unknown tool falls back to tool name
test("falls back to tool name for unknown tools", () => {
  render(
    <ToolInvocationBadge
      toolName="some_custom_tool"
      args={{}}
      state="call"
    />
  );
  expect(screen.getByText("some_custom_tool")).toBeDefined();
});

// Loading spinner shown while in-progress
test("shows loading spinner when state is 'call'", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

// Green dot shown when done
test("shows green dot when state is 'result' and result is present", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="ok"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

// Still shows spinner when state is result but result is undefined
test("shows spinner when state is 'result' but result is undefined", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result={undefined}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
