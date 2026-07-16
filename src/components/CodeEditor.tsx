import { useRef, useEffect } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle, indentUnit } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';

function getLanguageExtension(language: string) {
  switch (language) {
    case 'javascript': return javascript();
    case 'python': return python();
    case 'cpp':
    case 'c': return cpp();
    case 'java': return java();
    case 'html': return html();
    default: return javascript();
  }
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  fontSize?: number;
}

export default function CodeEditor({ value, onChange, language, fontSize = 14 }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        indentOnInput(),
        indentUnit.of("    "), // 4 spaces
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        getLanguageExtension(language),
        oneDark,
        updateListener,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...closeBracketsKeymap,
          ...completionKeymap,
          indentWithTab, // Tab for indentation
        ]),
        EditorView.theme({
          '&': { 
            height: '100%',
            fontSize: `${fontSize}px`,
          },
          '.cm-scroller': { 
            overflow: 'auto',
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
          },
          '.cm-content': {
            padding: '16px 0',
            caretColor: '#a78bfa',
          },
          '.cm-line': {
            padding: '0 12px',
          },
          '.cm-gutters': {
            backgroundColor: '#0f172a !important',
            borderRight: '1px solid #1e293b !important',
          },
          '.cm-lineNumbers .cm-gutterElement': {
            color: '#475569',
            padding: '0 12px 0 8px',
          },
          '.cm-activeLine': {
            backgroundColor: 'rgba(124, 92, 255, 0.08) !important',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'rgba(124, 92, 255, 0.12) !important',
            color: '#a78bfa',
          },
          '.cm-cursor': {
            borderLeftColor: '#a78bfa',
            borderLeftWidth: '2px',
          },
          '.cm-selectionBackground': {
            backgroundColor: 'rgba(124, 92, 255, 0.25) !important',
          },
          '&.cm-focused .cm-selectionBackground': {
            backgroundColor: 'rgba(124, 92, 255, 0.3) !important',
          },
          '.cm-matchingBracket': {
            backgroundColor: 'rgba(124, 92, 255, 0.3) !important',
            outline: '1px solid #a78bfa',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language, fontSize]);

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div ref={editorRef} className="h-full w-full overflow-hidden bg-[#0f172a]" />
  );
}