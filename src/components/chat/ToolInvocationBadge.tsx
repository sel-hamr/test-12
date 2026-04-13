import { Loader2, FilePlus, FilePen, FileSearch, Trash2, FolderInput } from "lucide-react";

interface StrReplaceArgs {
  command?: "view" | "create" | "str_replace" | "insert" | "undo_edit";
  path?: string;
}

interface FileManagerArgs {
  command?: "rename" | "delete";
  path?: string;
  new_path?: string;
}

type ToolArgs = StrReplaceArgs | FileManagerArgs | Record<string, unknown>;

interface ToolInvocationBadgeProps {
  toolName: string;
  args: ToolArgs;
  state: "call" | "partial-call" | "result";
  result?: unknown;
}

function getFileName(path?: string): string {
  if (!path) return "";
  return path.split("/").pop() || path;
}

function getLabel(toolName: string, args: ToolArgs): { icon: React.ReactNode; text: string } {
  if (toolName === "str_replace_editor") {
    const { command, path } = args as StrReplaceArgs;
    const file = getFileName(path);

    switch (command) {
      case "create":
        return {
          icon: <FilePlus className="w-3 h-3" />,
          text: file ? `Creating ${file}` : "Creating file",
        };
      case "str_replace":
      case "insert":
      case "undo_edit":
        return {
          icon: <FilePen className="w-3 h-3" />,
          text: file ? `Editing ${file}` : "Editing file",
        };
      case "view":
        return {
          icon: <FileSearch className="w-3 h-3" />,
          text: file ? `Reading ${file}` : "Reading file",
        };
      default:
        return {
          icon: <FilePen className="w-3 h-3" />,
          text: file ? `Editing ${file}` : "Editing file",
        };
    }
  }

  if (toolName === "file_manager") {
    const { command, path, new_path } = args as FileManagerArgs;
    const file = getFileName(path);

    switch (command) {
      case "delete":
        return {
          icon: <Trash2 className="w-3 h-3" />,
          text: file ? `Deleting ${file}` : "Deleting file",
        };
      case "rename":
        return {
          icon: <FolderInput className="w-3 h-3" />,
          text:
            file && new_path
              ? `Renaming ${file} to ${getFileName(new_path)}`
              : "Renaming file",
        };
      default:
        return {
          icon: <FolderInput className="w-3 h-3" />,
          text: "Managing file",
        };
    }
  }

  return {
    icon: <FilePen className="w-3 h-3" />,
    text: toolName,
  };
}

export function ToolInvocationBadge({ toolName, args, state, result }: ToolInvocationBadgeProps) {
  const done = state === "result" && result != null;
  const { icon, text } = getLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <span className="text-neutral-600">{icon}</span>
      <span className="text-neutral-700">{text}</span>
    </div>
  );
}
