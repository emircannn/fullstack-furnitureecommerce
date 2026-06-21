"use client";

import React from "react";
import { Bold, Italic, Underline, List, ListOrdered, Heading3, Type, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);

  // Sync value from parent to editor div ONLY when the content differs
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, val: string = "") => {
    document.execCommand(command, false, val);
    handleInput();
  };

  const toolbarButtons = [
    { icon: Bold, label: "Kalın", action: () => execCmd("bold") },
    { icon: Italic, label: "İtalik", action: () => execCmd("italic") },
    { icon: Underline, label: "Altı Çizili", action: () => execCmd("underline") },
    { icon: List, label: "Madde İşaretli Liste", action: () => execCmd("insertUnorderedList") },
    { icon: ListOrdered, label: "Numaralı Liste", action: () => execCmd("insertOrderedList") },
    { icon: Heading3, label: "Başlık 3", action: () => execCmd("formatBlock", "<h3>") },
    { icon: Type, label: "Paragraf", action: () => execCmd("formatBlock", "<p>") },
    { icon: RotateCcw, label: "Biçimlendirmeyi Temizle", action: () => execCmd("removeFormat") },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white text-secondary focus-within:border-primary transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-zinc-50 border-b border-gray-100 p-2">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            title={btn.label}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200 hover:text-secondary transition-colors"
          >
            <btn.icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className={cn(
          "min-h-[150px] p-4 focus:outline-none prose prose-sm max-w-none text-sm leading-relaxed",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-400 empty:before:pointer-events-none"
        )}
        data-placeholder={placeholder || "Açıklama buraya yazın..."}
        style={{ outline: "none" }}
      />
    </div>
  );
}
