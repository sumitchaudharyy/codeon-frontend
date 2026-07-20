import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, RotateCcw, Copy, Check, Trash2, ChevronDown, Eye, Terminal, BarChart3, Info } from 'lucide-react';
import { LANGUAGE_CONFIG, STARTER_CODE, type Language } from '../types/languages';
import CodeEditor from '../components/CodeEditor';
import { useState } from "react";
import ConfirmModal from "../components/ConfirmModal";

const JUDGE0_URL = "https://ce.judge0.com/submissions";
const STORAGE_KEY = "codeon_compiler_state";

interface RunResult {
  output: string;
  status: string;
  meta: string;
  isError: boolean;
  isInfo?: boolean;
}

function formatValue(value: unknown): string {
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Detect if code needs input
function codeRequiresInput(language: Language, code: string): boolean {
  if (language === 'javascript') return /\breadline\s*\(|\binput\s*\(/.test(code);
  if (language === 'python') return /\binput\s*\(/.test(code);
  if (language === 'java') return /Scanner|\.next(?:Int|Long|Double|Float|Line|Boolean)?\s*\(/.test(code);
  if (language === 'cpp') return /\bcin\s*>>|getline\s*\(\s*cin/.test(code);
  if (language === 'c') return /\bscanf\s*\(|\bfgets\s*\(/.test(code);
  return false;
}

function runJavaScript(code: string, input: string): string {
  const inputLines = input.split(/\r?\n/);
  let inputIndex = 0;
  const logs: string[] = [];

  const compilerConsole = {
    log: (...values: unknown[]) => logs.push(values.map(formatValue).join(" ")),
    error: (...values: unknown[]) => logs.push("Error: " + values.map(formatValue).join(" ")),
    warn: (...values: unknown[]) => logs.push("Warning: " + values.map(formatValue).join(" ")),
    info: (...values: unknown[]) => logs.push(values.map(formatValue).join(" ")),
  };

  const readline = () => inputLines[inputIndex++] ?? "";
  const print = (...values: unknown[]) => compilerConsole.log(...values);

  const runner = new Function("console", "readline", "input", "print", `"use strict";\n${code}`);
  const result = runner(compilerConsole, readline, readline, print);
  if (result !== undefined) logs.push(formatValue(result));
  return logs.join("\n") || "Program executed successfully with no output.";
}

async function pollJudge0(token: string): Promise<any> {
  for (let i = 0; i < 20; i++) {
    await sleep(800);
    const res = await fetch(`${JUDGE0_URL}/${token}?base64_encoded=false`);
    const data = await res.json();
    if (data.status && data.status.id <= 2) continue;
    return data;
  }
  throw new Error("Execution timeout");
}

async function runViaJudge0(code: string, stdin: string, judge0Id: number): Promise<RunResult> {
  const res = await fetch(`${JUDGE0_URL}?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_code: code,
      language_id: judge0Id,
      stdin: stdin || "",
      cpu_time_limit: 5,
    }),
  });

  if (!res.ok) throw new Error(`Judge0 error (${res.status})`);
  let data = await res.json();

  if (data.error && data.error.includes("wait not allowed")) {
    data = await pollJudge0(data.token);
  }

  const parts: string[] = [];
  if (data.compile_output) parts.push("Compile:\n" + data.compile_output.trim());
  if (data.stdout) parts.push(data.stdout.trimEnd());
  
  // Handle stderr - check for input-related errors
  if (data.stderr) {
    const stderr = data.stderr.trim();
    // If error is about missing input, treat as info not error
    if (/NoSuchElementException|EOFError|InputMismatchException|scanf.*returned|reading input/i.test(stderr)) {
      return {
        output: "✅ Code compiled successfully!\n\n💡 This program requires input. Please enter values in the 'Standard Input' box above and click Run again.",
        status: "Waiting for input",
        meta: data.time ? `${data.time}s` : "—",
        isError: false,
        isInfo: true,
      };
    }
    parts.push("Runtime Error:\n" + stderr);
  }
  
  if (data.message) parts.push(data.message);

  const status = data.status?.description || "Unknown";
  const output = parts.join("\n\n") || (status === "Accepted" ? "Program executed with no output." : status);
  const meta = data.time ? `${data.time}s · ${Math.round((data.memory || 0) / 1024)} KB` : "—";

  return { output, status, meta, isError: status !== "Accepted" };
}

export default function CompilerPage() {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('Output will appear here after you run your code.');
  const [isError, setIsError] = useState(false);
  const [isInfo, setIsInfo] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executionTime, setExecutionTime] = useState<string>('—');
  const [statusMessage, setStatusMessage] = useState('Ready to run');
  const [activeTab, setActiveTab] = useState<'console' | 'preview'>('console');
  const [fontSize, setFontSize] = useState(14);

  const config = LANGUAGE_CONFIG[language];
  const isLoggedIn = !!localStorage.getItem('token');

  const loadSaved = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
  };

  const persistCode = useCallback((lang: Language, codeVal: string, inputVal: string) => {
    const saved = loadSaved();
    saved[lang] = { code: codeVal, input: inputVal };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, []);

  useEffect(() => {
    const saved = loadSaved();
    const data = saved[language];
    setCode(data?.code ?? STARTER_CODE[language]);
    setInput(data?.input ?? '');
    setOutput('Output will appear here after you run your code.');
    setIsError(false);
    setIsInfo(false);
    setActiveTab(config.showPreview ? 'preview' : 'console');
  }, [language, config.showPreview]);

  useEffect(() => {
    const t = setTimeout(() => persistCode(language, code, input), 500);
    return () => clearTimeout(t);
  }, [code, input, language, persistCode]);

  const handleRun = useCallback(async () => {
    if (isRunning || !code.trim()) return;
    persistCode(language, code, input);
    setIsRunning(true);
    setOutput('');
    setIsError(false);
    setIsInfo(false);
    setStatusMessage('Running...');

    // Check if code needs input but none provided
    if (config.showInput && !input.trim() && codeRequiresInput(language, code)) {
      setOutput("✅ Code compiled successfully!\n\n💡 This program requires input.\n\nPlease enter values in the 'Standard Input' box below and click Run again.\n\nExample:\n- For readline() / input() / scanf(): enter one value per line\n- For Scanner.nextInt(): enter numbers on separate lines");
      setIsInfo(true);
      setStatusMessage('Waiting for input');
      setExecutionTime('—');
      setActiveTab('console');
      setIsRunning(false);
      return;
    }

    const start = performance.now();
    try {
      let result: RunResult;

      if (language === 'html') {
        setActiveTab('preview');
        result = { output: 'HTML preview updated.', status: 'Ready', meta: '—', isError: false };
      } else if (config.runLocal) {
        try {
          const out = runJavaScript(code, input);
          result = { output: out, status: 'Success', meta: '—', isError: false };
        } catch (err: any) {
          const errMsg = err.message || String(err);
          // Check if error is about undefined readline/input
          if (/readline is not defined|input is not defined|Cannot read/i.test(errMsg)) {
            result = {
              output: "✅ Code compiled successfully!\n\n💡 This program requires input. Please enter values in the 'Standard Input' box below and click Run again.",
              status: 'Waiting for input',
              meta: '—',
              isError: false,
              isInfo: true,
            };
          } else {
            result = { output: `Error: ${errMsg}`, status: 'Error', meta: '—', isError: true };
          }
        }
        setActiveTab('console');
      } else {
        result = await runViaJudge0(code, input, config.judge0Id!);
        setActiveTab('console');
      }

      const elapsed = `${Math.max(1, Math.round(performance.now() - start))}ms`;
      setOutput(result.output);
      setIsError(result.isError);
      setIsInfo(result.isInfo || false);
      setExecutionTime(result.meta !== '—' ? result.meta : elapsed);
      setStatusMessage(result.status);
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
      setIsError(true);
      setStatusMessage('Failed');
    } finally {
      setIsRunning(false);
    }
  }, [language, code, input, isRunning, config, persistCode]);

  const handleReset = () => {
  setShowResetModal(true);
};

const confirmReset = () => {
  setCode(starterCode);  // your reset logic
  setShowResetModal(false);
};

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFontSize = (delta: number) => {
    setFontSize(prev => Math.max(11, Math.min(24, prev + delta)));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRun]);

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-white overflow-hidden">
      {/* Header */}
      <header className="bg-[#1e293b] border-b border-[#334155]">
        <nav className="flex items-center justify-between px-4 sm:px-6 py-3">
          <Link to="/" className="text-xl font-bold">
            code(<span className="text-blue-500">O</span>)n
          </Link>

          <ul className="hidden md:flex items-center gap-6">
            <li><Link to="/" className="text-slate-300 hover:text-white text-sm">Home</Link></li>
            <li><Link to="/compiler" className="text-blue-400 text-sm">Compiler</Link></li>
            <li><Link to="/analyzer" className="text-slate-300 hover:text-white text-sm">Analyzer</Link></li>
            <li><Link to="/docs" className="text-slate-300 hover:text-white text-sm">Docs</Link></li>
          </ul>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link to="/dashboard" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-300 hover:text-white hidden sm:block">Login</Link>
                <Link to="/signup" className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Toolbar */}
      <div className="bg-[#1e293b] border-b border-[#334155] px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="appearance-none bg-[#0f172a] border border-[#334155] text-white rounded-lg pl-3 pr-8 py-2 text-sm cursor-pointer"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="html">HTML / CSS</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            {isRunning ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            {isRunning ? 'Running...' : 'Run'}
          </button>

          <button onClick={() => { setOutput('Output cleared.'); setIsError(false); setIsInfo(false); }} className="flex items-center gap-1.5 bg-[#334155] hover:bg-[#475569] px-3 py-2 rounded-lg text-sm">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
          <button onClick={handleReset} className="flex items-center gap-1.5 bg-[#334155] hover:bg-[#475569] px-3 py-2 rounded-lg text-sm">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={handleCopy} className="flex items-center gap-1.5 bg-[#334155] hover:bg-[#475569] px-3 py-2 rounded-lg text-sm">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <Link to="/analyzer" className="hidden md:flex items-center gap-1.5 bg-[#334155] hover:bg-[#475569] px-3 py-2 rounded-lg text-sm">
            <BarChart3 className="w-3.5 h-3.5" /> Analyze
          </Link>

          {/* Font Size Controls */}
          <div className="flex items-center gap-1 ml-auto">
            <button 
              onClick={() => handleFontSize(-1)} 
              className="w-7 h-7 flex items-center justify-center bg-[#334155] hover:bg-[#475569] rounded text-xs"
              title="Decrease font size"
            >
              A-
            </button>
            <span className="text-xs text-slate-400 px-2 min-w-[30px] text-center">{fontSize}</span>
            <button 
              onClick={() => handleFontSize(1)} 
              className="w-7 h-7 flex items-center justify-center bg-[#334155] hover:bg-[#475569] rounded text-xs"
              title="Increase font size"
            >
              A+
            </button>
          </div>

          <span className="text-xs text-slate-500 hidden lg:block">Ctrl+Enter to run</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Editor with CodeMirror */}
        <div className="flex flex-col border-r border-[#334155] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b]/50 border-b border-[#334155]">
            <span className="text-sm font-medium flex items-center gap-2">
              Source Code
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#334155] text-slate-400">{config.fileName}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ✨ Auto-format
              </span>
            </span>
          </div>
          <div className="flex-1 overflow-hidden bg-[#0f172a]">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              fontSize={fontSize}
            />
          </div>
        </div>

        {/* IO Panel */}
        <div className="flex flex-col overflow-hidden">
          {config.showInput && (
            <div className="h-[140px] flex flex-col border-b border-[#334155]">
              <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b]/50 border-b border-[#334155]">
                <span className="text-sm font-medium flex items-center gap-2">
                  Standard Input
                  {codeRequiresInput(language, code) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Required
                    </span>
                  )}
                </span>
                <span className="text-xs text-slate-500">
                  {codeRequiresInput(language, code) ? 'Enter input below' : 'Optional'}
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  codeRequiresInput(language, code)
                    ? "⚠️ Your code requires input. Enter values here (one per line)..."
                    : "Enter input (one per line)..."
                }
                spellCheck={false}
                className="flex-1 bg-[#0f172a] text-slate-100 font-mono p-3 resize-none focus:outline-none text-sm"
                style={{ fontSize: `${Math.max(fontSize - 1, 12)}px` }}
              />
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b]/50 border-b border-[#334155]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('console')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${activeTab === 'console' ? 'bg-[#334155] text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Terminal className="w-3.5 h-3.5" /> Console
                </button>
                {config.showPreview && (
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${activeTab === 'preview' ? 'bg-[#334155] text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                )}
              </div>
              <span className={`text-xs ${isError ? 'text-amber-400' : isInfo ? 'text-blue-400' : 'text-slate-500'}`}>
                {statusMessage}
              </span>
            </div>

            <div className={`flex-1 overflow-auto bg-[#0f172a] ${activeTab === 'console' ? 'block' : 'hidden'}`}>
              {isInfo ? (
                <div className="p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <pre className="font-mono text-sm whitespace-pre-wrap break-words text-blue-100 flex-1" style={{ fontSize: `${Math.max(fontSize - 1, 12)}px` }}>
                    {output}
                  </pre>
                </div>
              ) : (
                <pre 
                  className={`p-4 font-mono whitespace-pre-wrap break-words ${
                    isError ? 'text-amber-400' : 
                    output.includes('will appear') || output.includes('cleared') ? 'text-slate-500' : 
                    'text-green-400'
                  }`}
                  style={{ fontSize: `${Math.max(fontSize - 1, 12)}px` }}
                >
                  {output}
                </pre>
              )}
            </div>

            <div className={`flex-1 bg-white ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
              {language === 'html' ? (
                <iframe srcDoc={code} title="Preview" sandbox="allow-scripts allow-modals allow-forms" className="w-full h-full border-0" />
              ) : (
                <div className="flex items-center justify-center h-full bg-[#0f172a] text-slate-500 text-sm">
                  Preview available only for HTML/CSS
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-blue-600 text-white text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded font-bold" style={{ background: config.color, color: config.color === '#f7df1e' || config.color === '#a8b9cc' ? '#000' : '#fff' }}>
            {config.label}
          </span>
          <span>{executionTime}</span>
          <span>{statusMessage}</span>
        </div>
        <div className="hidden sm:block">CodeOn v1.0 · Font: {fontSize}px</div>
      </div>

      {isRunning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#1e293b] rounded-2xl p-8 text-center border border-[#334155]">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Running {config.label}...</p>
          </div>
        </div>
      )}
    </div>
  );
}