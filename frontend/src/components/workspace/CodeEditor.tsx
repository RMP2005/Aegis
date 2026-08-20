"use client";

import { useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  vulnerableLines?: number[];
  filename?: string;
}

export default function CodeEditor({
  value,
  onChange,
  vulnerableLines = [],
  filename = "Contract.sol",
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme("aegis-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "555555", fontStyle: "italic" },
        { token: "keyword", foreground: "C4993C" },
        { token: "string", foreground: "5A9E6F" },
        { token: "number", foreground: "E08C3A" },
      ],
      colors: {
        "editor.background": "#0F0F11",
        "editor.foreground": "#D4D4D4",
        "editorLineNumber.foreground": "#333333",
        "editorLineNumber.activeForeground": "#666666",
        "editor.lineHighlightBackground": "#1A1A1E",
        "editor.selectionBackground": "#C4993C22",
        "editorCursor.foreground": "#C4993C",
      },
    });

    monaco.editor.setTheme("aegis-dark");
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    if (decorationsRef.current.length > 0) {
      editor.deltaDecorations(decorationsRef.current, []);
      decorationsRef.current = [];
    }

    if (vulnerableLines.length === 0) return;

    const newDecorations = vulnerableLines.map((line) => ({
      range: new monaco.Range(line, 1, line, 200),
      options: {
        isWholeLine: true,
        className: "vulnerable-line-highlight",
        overviewRuler: {
          color: "#C94D4D88",
          position: 1,
        },
      },
    }));

    decorationsRef.current = editor.deltaDecorations([], newDecorations);
  }, [vulnerableLines, value]);

  return (
    <div className="h-full bg-[#0F0F11] rounded-lg overflow-hidden border border-aegis-dark-border">
      <div className="flex items-center justify-between px-4 py-2 border-b border-aegis-dark-border bg-[#0A0A0C]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
          </div>
          <span className="text-xs text-[#555] ml-2 font-mono">{filename}</span>
        </div>
        {vulnerableLines.length > 0 && (
          <span className="text-[10px] text-aegis-critical bg-aegis-critical-bg px-2 py-0.5 rounded">
            {vulnerableLines.length} issue{vulnerableLines.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="h-[calc(100%-36px)]">
        <Editor
          height="100%"
          language="sol"
          value={value}
          onChange={(v) => onChange(v || "")}
          onMount={handleEditorMount}
          options={{
            readOnly: false,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            fontLigatures: true,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
}
