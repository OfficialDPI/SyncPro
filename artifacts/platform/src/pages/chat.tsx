import { useEffect, useState, useRef, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetConversation, useListMessages, useDeleteConversation, useListConversations, useListProjects } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  ArrowUp, ChevronLeft, ChevronRight, RefreshCw, Home as HomeIcon,
  Layout, Database, Rocket, Copy, Check, Terminal,
  Loader2, Paperclip, Mic, Trash2, MoreHorizontal,
  MessageSquare, Folder, Plus, Command, PanelLeftClose, PanelLeftOpen,
  Monitor, Smartphone, ArrowLeft, ArrowRight, RotateCw, Lock, Share, Sun, Maximize,
  Zap, GitBranch, Layers, LayoutGrid, Clock, Bell,
  FileCode, FileText, Settings
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Link } from "wouter";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

type PreviewTab = "preview" | "code" | "database" | "deploy";

const DEFAULT_LANDING_PAGE_JSX = `
const { Layout, Database, Rocket, Command, Search, Play, Folder, Sparkles, Check, ChevronRight } = window.lucide;

function App() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white selection:bg-purple-500/30 font-sans">
      <nav className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M17 7 C 14.5 7, 13.5 17, 7 17 C 4.5 17, 3 15, 3 12 C 3 9, 4.5 7, 7 7 C 13.5 7, 14.5 17, 17 17 C 19.5 17, 21 15, 21 12 C 21 9, 19.5 7, 17 7 Z" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-semibold text-xl tracking-tight">Sync</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Integrations</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
          <button className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-lg transition-colors font-semibold text-xs tracking-wide">
            Get Started
          </button>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center pt-20 pb-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          AI-POWERED DEVELOPMENT
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Build Better.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Ship Faster.</span>
        </h1>
        
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Sync is your AI development and design workspace.<br />
          Build full-stack apps, connect databases, and deploy in minutes.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16">
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/25">
            <Sparkles className="w-4 h-4" /> Start Building
          </button>
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium px-6 py-3 rounded-xl transition-all">
            <Play className="w-4 h-4" /> View Demo
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400 mb-20 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-bold">&lt;/&gt;</span> Full-Stack Apps
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" /> Database Ready
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> AI-Powered
          </div>
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-pink-400" /> Deploy Anywhere
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#0d1117] p-2 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
          <div className="flex gap-4 h-[440px]">
            <div className="w-56 border-r border-white/10 pr-4 pt-4 flex flex-col gap-1 text-left">
              <div className="flex items-center gap-2 px-3 py-2 mb-4 text-white">
                <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M17 7 C 14.5 7, 13.5 17, 7 17 C 4.5 17, 3 15, 3 12 C 3 9, 4.5 7, 7 7 C 13.5 7, 14.5 17, 17 17 C 19.5 17, 21 15, 21 12 C 21 9, 19.5 7, 17 7 Z" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-semibold text-sm">Sync <span className="text-gray-400 font-normal">Dashboard</span></span>
              </div>
              <div className="px-3 py-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-sm font-medium flex items-center gap-3">
                <Layout className="w-4 h-4" /> Overview
              </div>
              <div className="px-3 py-2.5 text-gray-400 hover:text-white text-sm flex items-center gap-3 cursor-pointer">
                <Folder className="w-4 h-4" /> Projects
              </div>
              <div className="px-3 py-2.5 text-gray-400 hover:text-white text-sm flex items-center gap-3 cursor-pointer">
                <Database className="w-4 h-4" /> Database
              </div>
              <div className="px-3 py-2.5 text-gray-400 hover:text-white text-sm flex items-center gap-3 cursor-pointer">
                <Rocket className="w-4 h-4" /> Deployments
              </div>
              <div className="px-3 py-2.5 text-gray-400 hover:text-white text-sm flex items-center gap-3 cursor-pointer mt-auto mb-2">
                <Command className="w-4 h-4" /> Settings
              </div>
            </div>
            
            <div className="flex-1 pl-4 pt-6 pr-6 text-left flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-semibold text-lg text-white">Overview</h3>
                  <div className="relative flex items-center gap-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="text" placeholder="Search..." className="bg-transparent border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none text-white w-64" />
                    </div>
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs font-medium text-white">P</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-5 rounded-xl bg-[#111620] border border-white/5">
                    <div className="text-xs text-gray-400 mb-3 font-medium">Projects</div>
                    <div className="text-3xl font-bold text-white mb-3">12</div>
                    <div className="text-[10px] text-emerald-400 bg-emerald-400/10 inline-block px-2 py-0.5 rounded font-medium">↑ 20%</div>
                  </div>
                  <div className="p-5 rounded-xl bg-[#111620] border border-white/5">
                    <div className="text-xs text-gray-400 mb-3 font-medium">Deployments</div>
                    <div className="text-3xl font-bold text-white mb-3">8</div>
                    <div className="text-[10px] text-emerald-400 bg-emerald-400/10 inline-block px-2 py-0.5 rounded font-medium">↑ 15%</div>
                  </div>
                  <div className="p-5 rounded-xl bg-[#111620] border border-white/5">
                    <div className="text-xs text-gray-400 mb-3 font-medium">Database</div>
                    <div className="text-3xl font-bold text-white mb-3">3</div>
                    <div className="text-[10px] text-emerald-400 bg-emerald-400/10 inline-block px-2 py-0.5 rounded font-medium">↑ 5%</div>
                  </div>
                  <div className="p-5 rounded-xl bg-[#111620] border border-white/5">
                    <div className="text-xs text-gray-400 mb-3 font-medium">Usage</div>
                    <div className="text-3xl font-bold text-white mb-3">78%</div>
                    <div className="text-[10px] text-emerald-400 bg-emerald-400/10 inline-block px-2 py-0.5 rounded font-medium">↑ 12%</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-2"></div>
                <div className="col-span-2 bg-[#111620] border border-white/5 rounded-xl p-4 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-semibold text-gray-400">Recent Activity</h4>
                    <button className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">View all</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/5" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-indigo-500" strokeDasharray="78, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute text-xs font-bold text-white">78%</div>
                    </div>
                    <div className="flex-1 space-y-2 text-[10px] text-gray-400 font-medium">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>Project created</span>
                        </div>
                        <span className="text-[9px] text-gray-500">2m ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Database connected</span>
                        </div>
                        <span className="text-[9px] text-gray-500">5m ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Deployment successful</span>
                        </div>
                        <span className="text-[9px] text-gray-500">12m ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                          <span>Domain configured</span>
                        </div>
                        <span className="text-[9px] text-gray-500">1h ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
`;

function extractHtml(content: string): string | null {
  const m = content.match(/```(?:html|htm|xml)?\n?([\s\S]*?)(?:```|$)/i);
  if (!m || !m[1].trim()) {
    const rawHtml = content.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
    return rawHtml ? rawHtml[0].trim() : null;
  }
  let code = m[1].trim();
  const blockBoundary = code.search(/(?:^|\n)(?:```|###)/);
  if (blockBoundary !== -1) {
    code = code.slice(0, blockBoundary).trim();
  }
  return code;
}

function extractJsx(content: string): string | null {
  const m = content.match(/```(?:jsx|tsx|typescript|javascript|ts|js|react)\n?([\s\S]*?)(?:```|$)/i);
  if (!m) return null;
  let code = m[1].trim();
  const blockBoundary = code.search(/(?:^|\n)(?:```|###)/);
  if (blockBoundary !== -1) {
    code = code.slice(0, blockBoundary).trim();
  }
  return autoCloseCode(code);
}

function autoCloseCode(code: string): string {
  const stack: string[] = [];
  const jsxTags: string[] = [];
  const tagStackDepths: number[] = [];
  const ternaryStack: number[] = [];
  let inJsxTag = false;
  
  let i = 0;
  while (i < code.length) {
    const char = code[i];
    const nextChar = code[i + 1] || "";
    
    const top = stack[stack.length - 1];
    
    // Handle escape characters inside string/template literal
    if (char === "\\" && (top === "'" || top === '"' || top === "`")) {
      i += 2;
      continue;
    }
    
    if (top === "'" || top === '"') {
      if (char === top) {
        stack.pop();
      }
      i++;
      continue;
    }
    
    if (top === "`") {
      if (char === "`") {
        stack.pop();
      } else if (char === "$" && nextChar === "{") {
        stack.push("JSX_EXPR_END");
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    
    // Determine if we are in JS mode
    const inJsMode = (jsxTags.length === 0) || inJsxTag || stack.includes("JSX_EXPR_END");
    
    if (inJsMode) {
      if (char === "'") {
        stack.push("'");
        i++;
        continue;
      }
      if (char === '"') {
        stack.push('"');
        i++;
        continue;
      }
      if (char === "`") {
        stack.push("`");
        i++;
        continue;
      }
      
      // Comments
      if (char === "/" && nextChar === "/") {
        while (i < code.length && code[i] !== "\n") {
          i++;
        }
        continue;
      }
      if (char === "/" && nextChar === "*") {
        i += 2;
        while (i < code.length && !(code[i] === "*" && code[i+1] === "/")) {
          i++;
        }
        i += 2;
        continue;
      }
      
      // Opening brackets/parentheses
      if (char === "{") {
        stack.push("}");
        i++;
        continue;
      }
      if (char === "(") {
        stack.push(")");
        i++;
        continue;
      }
      if (char === "[") {
        stack.push("]");
        i++;
        continue;
      }
      
      // Closing brackets/parentheses
      if (char === "}" || char === ")" || char === "]") {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
        } else if (char === "}" && stack[stack.length - 1] === "JSX_EXPR_END") {
          stack.pop();
        }
        i++;
        continue;
      }
      
      // Ternary operator tracking
      if (char === "?" && nextChar !== ".") {
        ternaryStack.push(stack.length);
      } else if (char === ":") {
        if (ternaryStack.length > 0 && stack.length === ternaryStack[ternaryStack.length - 1]) {
          ternaryStack.pop();
        }
      }
    } else {
      // In JSX Children mode (raw text)
      if (char === "{") {
        stack.push("JSX_EXPR_END");
        i++;
        continue;
      }
    }
    
    // Tag open/close scanning
    if (char === "<") {
      if (nextChar === "/") {
        i += 2;
        let tagName = "";
        while (i < code.length && /[a-zA-Z0-9\-]/.test(code[i])) {
          tagName += code[i];
          i++;
        }
        if (tagName && jsxTags[jsxTags.length - 1] === tagName) {
          jsxTags.pop();
          tagStackDepths.pop();
        }
        inJsxTag = true;
        continue;
      } else if (/[a-zA-Z]/.test(nextChar)) {
        i++;
        let tagName = "";
        while (i < code.length && /[a-zA-Z0-9\-]/.test(code[i])) {
          tagName += code[i];
          i++;
        }
        jsxTags.push(tagName);
        tagStackDepths.push(stack.length);
        inJsxTag = true;
        continue;
      }
    }
    
    if (char === ">") {
      if (tagStackDepths.length === 0 || stack.length === tagStackDepths[tagStackDepths.length - 1]) {
        inJsxTag = false;
      }
      i++;
      continue;
    }
    
    if (char === "/" && nextChar === ">") {
      if (tagStackDepths.length === 0 || stack.length === tagStackDepths[tagStackDepths.length - 1]) {
        if (jsxTags.length > 0) {
          jsxTags.pop();
          tagStackDepths.pop();
        }
        inJsxTag = false;
        i += 2;
        continue;
      }
    }
    
    i++;
  }
  
  let suffix = "";
  
  // Close any tags/delimiters nested inside each other
  while (stack.length > 0 || tagStackDepths.length > 0) {
    if (tagStackDepths.length > 0 && stack.length === tagStackDepths[tagStackDepths.length - 1]) {
      const tag = jsxTags.pop();
      tagStackDepths.pop();
      if (inJsxTag) {
        suffix += " />";
        inJsxTag = false;
      } else {
        suffix += `</${tag}>`;
      }
      continue;
    }
    
    if (stack.length > 0) {
      const currentLen = stack.length;
      if (ternaryStack.length > 0 && currentLen === ternaryStack[ternaryStack.length - 1]) {
        suffix += ' : ""';
        ternaryStack.pop();
      }
      
      const item = stack.pop();
      if (item === "JSX_EXPR_END") {
        suffix += "}";
      } else {
        suffix += item;
      }
    } else {
      break;
    }
  }
  
  while (ternaryStack.length > 0) {
    suffix += ' : ""';
    ternaryStack.pop();
  }
  
  while (jsxTags.length > 0) {
    const tag = jsxTags.pop();
    tagStackDepths.pop();
    if (inJsxTag) {
      suffix += " />";
      inJsxTag = false;
    } else {
      suffix += `</${tag}>`;
    }
  }
  
  return code + suffix;
}

function buildReactSrcDoc(jsxCode: string): string {
  let componentName = "App";
  if (!jsxCode.includes("function App") && !jsxCode.includes("const App") && !jsxCode.includes("class App")) {
    const matches = [...jsxCode.matchAll(/(?:function|const|class)\s+([A-Z][a-zA-Z0-9_]*)/g)].map(m => m[1]);
    if (matches.length > 0) {
      const appMatch = matches.find(name => name.toLowerCase().includes("app"));
      if (appMatch) {
        componentName = appMatch;
      } else {
        componentName = matches[matches.length - 1];
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>
    // Suppress annoying development warnings/logs from React and Babel Standalone
    const suppressFilter = (msg) => {
      if (typeof msg === 'string') {
        return msg.includes('React DevTools') || 
               msg.includes('in-browser Babel transformer') ||
               msg.includes('You are using the in-browser Babel transformer') ||
               msg.includes('cdn.tailwindcss.com') ||
               msg.includes('should not be used in production');
      }
      return false;
    };
    const originalLog = console.log;
    const originalWarn = console.warn;
    console.log = function(...args) {
      if (args.some(suppressFilter)) return;
      originalLog.apply(console, args);
    };
    console.warn = function(...args) {
      if (args.some(suppressFilter)) return;
      originalWarn.apply(console, args);
    };

    window.addEventListener('error', function(event) {
      const container = document.getElementById('root') || document.body;
      if (container) {
        container.innerHTML = \`
          <div style="padding: 24px; background: #0f1015; border: 1px solid #f87171; border-radius: 16px; color: #f3f4f6; font-family: Inter, system-ui, sans-serif; margin: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); border-left: 4px solid #ef4444;">
            <div style="display: flex; align-items: center; gap: 8px; color: #ef4444; font-weight: 700; margin-bottom: 12px; font-size: 16px;">
              <span>⚠️ Preview Rendering Error</span>
            </div>
            <p style="font-size: 14px; margin: 0 0 12px 0; color: #e5e7eb; font-weight: 500; line-height: 1.5;">
              \${event.message}
            </p>
            <pre style="font-size: 12px; font-family: ui-monospace, monospace; background: #070709; padding: 16px; border-radius: 12px; overflow: auto; max-height: 300px; margin: 0; color: #d1d5db; border: 1px solid #1f2937; line-height: 1.6;">
\${event.error ? event.error.stack : 'No stack trace available.'}
            </pre>
            <div style="margin-top: 12px; font-size: 11px; color: #6b7280; font-family: monospace;">
              File: \${event.filename || 'inline-script'} (line \${event.lineno}, col \${event.colno})
            </div>
          </div>
        \`;
      }
    });
  </script>
  <script src="https://cdn.tailwindcss.com" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin="anonymous"></script>
  <script>
    Babel.registerPreset("react-classic", {
      presets: [
        [
          Babel.availablePresets["react"],
          {
            "runtime": "classic"
          }
        ]
      ]
    });
  </script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js" crossorigin="anonymous"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background-color: #0b0f17; color: white; }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react-classic">
    // Expose React and lucide globally to code block scripts
    window.React = React;
    
    // Robust Lucide React Shim using getter/setter to avoid timing/race conditions
    let currentLucide = window.lucide;
    const iconCache = new Map();

    const getIconData = (original, name) => {
      if (original[name]) return original[name];
      const lowerName = name.toLowerCase();
      for (const key of Object.keys(original)) {
        if (key.toLowerCase() === lowerName) return original[key];
      }
      const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      if (original[kebab]) return original[kebab];
      for (const key of Object.keys(original)) {
        if (key.toLowerCase() === kebab.toLowerCase()) return original[key];
      }
      return null;
    };

    const makeProxy = (original) => {
      if (!original) return original;
      return new Proxy(original, {
        get(target, prop) {
          if (typeof prop === 'string') {
            if (prop in target && typeof target[prop] === 'function') {
              return target[prop];
            }
            const iconData = getIconData(target, prop);
            // Return a React component function for icons
            if (Array.isArray(iconData) || (prop.length > 0 && prop[0] === prop[0].toUpperCase())) {
              if (iconCache.has(prop)) {
                return iconCache.get(prop);
              }
              const ReactComponent = (props) => {
                const { size = 24, color = 'currentColor', strokeWidth = 2, children, ...rest } = props;
                const svgProps = {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: props.width || size,
                  height: props.height || size,
                  viewBox: "0 0 24 24",
                  fill: props.fill || "none",
                  stroke: props.stroke || color,
                  strokeWidth: strokeWidth,
                  strokeLinecap: props.strokeLinecap || "round",
                  strokeLinejoin: props.strokeLinejoin || "round",
                  ...rest
                };
                
                // Fallback for missing/invalid icon data (dashed square outline)
                const finalData = Array.isArray(iconData) ? iconData : [
                  ['rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, strokeDasharray: '4', stroke: color }]
                ];
                
                const childElements = finalData.map((node, i) => {
                  const [tagName, attrs] = node;
                  return React.createElement(tagName, { ...attrs, key: i });
                });
                return React.createElement('svg', svgProps, ...childElements, children);
              };
              ReactComponent.displayName = prop;
              iconCache.set(prop, ReactComponent);
              return ReactComponent;
            }
          }
          return target[prop];
        }
      });
    };

    let proxyInstance = makeProxy(currentLucide);

    try {
      Object.defineProperty(window, 'lucide', {
        get() {
          return proxyInstance;
        },
        set(val) {
          currentLucide = val;
          proxyInstance = makeProxy(val);
        },
        configurable: true
      });
      
      Object.defineProperty(window, 'lucideReact', {
        get() {
          return proxyInstance;
        },
        configurable: true
      });
    } catch (e) {
      window.lucide = proxyInstance;
      window.lucideReact = proxyInstance;
    }
    
    try {
      ${jsxCode}
      const rootEl = document.getElementById('root');
      const root = ReactDOM.createRoot(rootEl);
      root.render(React.createElement(${componentName}));
    } catch (e) {
      window.dispatchEvent(new ErrorEvent('error', {
        error: e,
        message: e.message,
        filename: 'App.tsx'
      }));
    }
  </script>
</body>
</html>`;
}

function extractCodeBlocks(content: string) {
  const blocks: { lang: string; code: string }[] = [];
  const regex = /```(\w*)\n?([\s\S]*?)(?:```|$)/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    if (m[2].trim()) blocks.push({ lang: m[1] || "text", code: m[2].trim() });
  }
  return blocks;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-700/60"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function parseThinkBlocks(content: string) {
  const parts: { type: "think" | "text"; content: string; isClosed: boolean }[] = [];
  let remaining = content || "";
  
  while (true) {
    const thinkStart = remaining.indexOf("<think>");
    if (thinkStart === -1) {
      if (remaining) parts.push({ type: "text", content: remaining, isClosed: true });
      break;
    }
    
    if (thinkStart > 0) {
      parts.push({ type: "text", content: remaining.slice(0, thinkStart), isClosed: true });
    }
    
    remaining = remaining.slice(thinkStart + 7);
    const thinkEnd = remaining.indexOf("</think>");
    
    if (thinkEnd === -1) {
      parts.push({ type: "think", content: remaining, isClosed: false });
      break;
    }
    
    parts.push({ type: "think", content: remaining.slice(0, thinkEnd), isClosed: true });
    remaining = remaining.slice(thinkEnd + 8);
  }
  
  return parts;
}

function ThinkBlock({ content, isClosed }: { content: string; isClosed: boolean }) {
  const [expanded, setExpanded] = useState(!isClosed);
  useEffect(() => { if (!isClosed) setExpanded(true); }, [isClosed]);

  return (
    <div className="my-3 border-l-2 border-zinc-700 pl-3">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 uppercase tracking-wider mb-1 transition-colors"
      >
        <div className={`flex items-center justify-center transition-transform ${expanded ? "rotate-90" : ""}`}>
          <ChevronRight className="w-3 h-3" />
        </div>
        Thinking Process {isClosed ? "" : <Loader2 className="w-3 h-3 animate-spin inline-block ml-1" />}
      </button>
      {expanded && (
        <div className="text-zinc-400 text-[13px] leading-relaxed whitespace-pre-wrap font-serif italic mt-2">
          {content}
        </div>
      )}
    </div>
  );
}

function MessageMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ className, children }) {
          const isInline = !className;
          const code = String(children).replace(/\n$/, "");
          const lang = className?.replace("language-", "") ?? "";
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[0.82em] border border-zinc-700/50 break-words whitespace-pre-wrap">
                {children}
              </code>
            );
          }
          return (
            <div className="my-3 rounded-xl overflow-hidden border border-zinc-700/60 shadow-lg w-full max-w-full">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700/40">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{lang || "code"}</span>
                <CopyButton text={code} />
              </div>
              <div className="overflow-x-auto w-full">
                <code className={`block p-4 text-[13px] font-mono bg-[#0d1117] leading-relaxed whitespace-pre ${className}`}>
                  {children}
                </code>
              </div>
            </div>
          );
        },
        pre({ children }) { return <>{children}</>; },
        p({ children }) { return <p className="mb-2.5 last:mb-0 leading-7 text-[14px]">{children}</p>; },
        ul({ children }) { return <ul className="list-disc pl-5 mb-2.5 space-y-1.5">{children}</ul>; },
        ol({ children }) { return <ol className="list-decimal pl-5 mb-2.5 space-y-1.5">{children}</ol>; },
        li({ children }) { return <li className="text-[14px] leading-relaxed text-zinc-200">{children}</li>; },
        h1({ children }) { return <h1 className="text-xl font-bold mb-3 mt-5 text-white">{children}</h1>; },
        h2({ children }) { return <h2 className="text-lg font-semibold mb-2 mt-4 text-white border-b border-zinc-800 pb-2">{children}</h2>; },
        h3({ children }) { return <h3 className="text-base font-semibold mb-2 mt-3 text-zinc-100">{children}</h3>; },
        blockquote({ children }) {
          return <blockquote className="border-l-[3px] border-blue-500/60 pl-4 text-zinc-400 italic my-3 bg-zinc-800/30 py-2 rounded-r-lg">{children}</blockquote>;
        },
        hr() { return <hr className="border-zinc-700/50 my-4" />; },
        a({ href, children }) {
          return <a href={href} target="_blank" rel="noreferrer" className="text-blue-400 underline underline-offset-2 hover:text-blue-300">{children}</a>;
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3 rounded-xl border border-zinc-700/50 w-full max-w-full">
              <table className="text-xs border-collapse w-full">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return <th className="border-b border-zinc-700/50 px-4 py-2.5 bg-zinc-800 font-semibold text-left text-zinc-300">{children}</th>;
        },
        td({ children }) {
          return <td className="border-b border-zinc-800 px-4 py-2.5 text-zinc-300">{children}</td>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = parseThinkBlocks(content);
  return (
    <div className="w-full min-w-0 overflow-hidden">
      {parts.map((part, i) => (
        part.type === "think" 
          ? <ThinkBlock key={i} content={part.content} isClosed={part.isClosed} />
          : <MessageMarkdown key={i} content={part.content} />
      ))}
    </div>
  );
}

const UserMessage = ({ content }: { content: string }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > 200;
  return (
    <>
      <div className={expanded ? "whitespace-pre-wrap" : "line-clamp-4 whitespace-pre-wrap"}>{content}</div>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-300 hover:text-white mt-1 underline">
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </>
  );
};

const TABS: { id: PreviewTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "preview", label: "Preview", Icon: Layout },
  { id: "code", label: "Code", Icon: Terminal },
  { id: "database", label: "Database", Icon: Database },
  { id: "deploy", label: "Deploy", Icon: Rocket },
];

export default function Chat() {
  const [, params] = useRoute("/chat/:id");
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;

  const { data: conversation } = useGetConversation(id);
  const { data: messages = [], refetch: refetchMessages } = useListMessages(id);
  const { data: allConversations = [] } = useListConversations();
  const { data: projects = [] } = useListProjects();
  const deleteConversation = useDeleteConversation();

  useEffect(() => {
    if (conversation?.projectId && id) {
      localStorage.setItem(`sync_lastConv_${conversation.projectId}`, String(id));
    }
  }, [conversation?.projectId, id]);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState<Record<string, string>>({ code: "", db: "", deploy: "" });
  const [activeTab, setActiveTab] = useState<PreviewTab>("preview");
  const [codeBlocks, setCodeBlocks] = useState<{ lang: string; code: string }[]>([]);
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const [activeCodeIdx, setActiveCodeIdx] = useState(0);
  const [leftNavOpen, setLeftNavOpen] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [selectedFilePath, setSelectedFilePath] = useState("src/App.tsx");
  const [srcFolderOpen, setSrcFolderOpen] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sentInitial = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, streamedContent]);

  useEffect(() => {
    if (!messages.length || isStreaming) return;
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistantMsg) return;
    const assistantContent = lastAssistantMsg.content;
    const blocks = extractCodeBlocks(assistantContent);
    if (blocks.length > 0) setCodeBlocks(blocks);
    const jsx = extractJsx(assistantContent);
    if (jsx) {
      setHtmlPreview(buildReactSrcDoc(jsx));
      setIframeKey((k) => k + 1);
      return;
    }
    let html = extractHtml(assistantContent);
    if (html) {
      // 1. Transpile original script tags in the generated HTML before injecting helper scripts
      html = html.replace(/<script>/g, '<script type="text/babel" data-presets="react-classic">');

      // 2. Inject console filter and registration scripts using normal un-transpiled script tags
      const consoleFilter = `<script>
        (function() {
          const filter = (m) => typeof m === 'string' && (m.includes('React DevTools') || m.includes('Babel transformer') || m.includes('cdn.tailwindcss.com'));
          const log = console.log, warn = console.warn;
          console.log = (...a) => a.some(filter) ? undefined : log.apply(console, a);
          console.warn = (...a) => a.some(filter) ? undefined : warn.apply(console, a);
        })();
      </script>`;
      html = html.replace("<head>", "<head>\n" + consoleFilter);
      if (!html.includes("react.development.js") && html.includes("React")) {
        html = html.replace("</head>", `<script src="https://unpkg.com/react@18/umd/react.development.js"></script>\n<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>\n<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n<script>Babel.registerPreset("react-classic", { presets: [[Babel.availablePresets["react"], { "runtime": "classic" }]] });</script>\n</head>`);
      } else if (html.includes("babel.min.js")) {
        html = html.replace(/<script src="[^"]*babel\\.min\\.js"[^>]*><\/script>/i, (match) => match + `\n<script>Babel.registerPreset("react-classic", { presets: [[Babel.availablePresets["react"], { "runtime": "classic" }]] });</script>`);
      }

      // 3. Inject lucide icon auto-rendering logic
      if (html.includes("lucide") && html.includes("</body>")) {
        html = html.replace("</body>", `<script>
          (function() {
            const runLucide = () => {
              if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
              }
            };
            runLucide();
            document.addEventListener('DOMContentLoaded', runLucide);
            window.addEventListener('load', runLucide);
          })();
        </script>\n</body>`);
      }

      setHtmlPreview(html);
      setIframeKey((k) => k + 1);
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;
    setInput("");
    setIsStreaming(true);
    setStreamedContent({ code: "", db: "", deploy: "" });

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(`API returned status ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let currentStreams = { code: "", db: "", deploy: "" };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "stream" && data.agent && data.content) {
              currentStreams[data.agent as keyof typeof currentStreams] += data.content;
              setStreamedContent({ ...currentStreams });
            }
            if (data.type === "done" && data.done) {
              setIsStreaming(false);
              setStreamedContent({ code: "", db: "", deploy: "" });
              const fullText = currentStreams.code;
              const blocks = extractCodeBlocks(fullText);
              if (blocks.length > 0) { setCodeBlocks(blocks); setActiveCodeIdx(0); }
              const jsx = extractJsx(fullText);
              if (jsx) {
                setHtmlPreview(buildReactSrcDoc(jsx));
                setIframeKey((k) => k + 1);
                setActiveTab("preview");
              } else {
                let html = extractHtml(fullText);
                if (html) {
                  // 1. Transpile original script tags in the generated HTML before injecting helper scripts
                  html = html.replace(/<script>/g, '<script type="text/babel" data-presets="react-classic">');

                  // 2. Inject console filter and registration scripts using normal un-transpiled script tags
                  const consoleFilter = `<script>
                    (function() {
                      const filter = (m) => typeof m === 'string' && (m.includes('React DevTools') || m.includes('Babel transformer') || m.includes('cdn.tailwindcss.com'));
                      const log = console.log, warn = console.warn;
                      console.log = (...a) => a.some(filter) ? undefined : log.apply(console, a);
                      console.warn = (...a) => a.some(filter) ? undefined : warn.apply(console, a);
                    })();
                  </script>`;
                  html = html.replace("<head>", "<head>\n" + consoleFilter);
                  if (!html.includes("react.development.js") && html.includes("React")) {
                    html = html.replace("</head>", `<script src="https://unpkg.com/react@18/umd/react.development.js"></script>\n<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>\n<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n<script>Babel.registerPreset("react-classic", { presets: [[Babel.availablePresets["react"], { "runtime": "classic" }]] });</script>\n</head>`);
                  } else if (html.includes("babel.min.js")) {
                    html = html.replace(/<script src="[^"]*babel\\.min\\.js"[^>]*><\/script>/i, (match) => match + `\n<script>Babel.registerPreset("react-classic", { presets: [[Babel.availablePresets["react"], { "runtime": "classic" }]] });</script>`);
                  }

                  // 3. Inject lucide icon auto-rendering logic
                  if (html.includes("lucide") && html.includes("</body>")) {
                    html = html.replace("</body>", `<script>
                      (function() {
                        const runLucide = () => {
                          if (window.lucide && typeof window.lucide.createIcons === 'function') {
                            window.lucide.createIcons();
                          }
                        };
                        runLucide();
                        document.addEventListener('DOMContentLoaded', runLucide);
                        window.addEventListener('load', runLucide);
                      })();
                    </script>\n</body>`);
                  }

                  setHtmlPreview(html);
                  setIframeKey((k) => k + 1);
                  setActiveTab("preview");
                } else if (blocks.length > 0) {
                  setActiveTab("code");
                }
              }
              refetchMessages();
            }
          } catch { /* partial chunk */ }
        }
      }
    } catch {
      setIsStreaming(false);
      setStreamedContent({ code: "", db: "", deploy: "" });
    }
  }, [id, isStreaming, refetchMessages]);

  useEffect(() => {
    if (sentInitial.current) return;
    const urlParams = new URLSearchParams(window.location.search);
    const ip = urlParams.get("initialPrompt");
    if (ip && messages.length === 0) {
      sentInitial.current = true;
      window.history.replaceState({}, document.title, window.location.pathname);
      sendMessage(ip);
    }
  }, [messages.length, sendMessage]);

  const handleDelete = () => {
    deleteConversation.mutate(
      { id },
      { onSuccess: () => setLocation("/") }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const currentCode = codeBlocks[activeCodeIdx];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070709] text-zinc-100 font-sans selection:bg-blue-500/30">

      {/* ── Global Top Bar ── */}
      <div className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-zinc-800/60 bg-[#0c0c0e]">
        {/* Left: Logo + Dropdown + Helper Icons */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sync-grad-top" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <path 
                d="M17 7 C 14.5 7, 13.5 17, 7 17 C 4.5 17, 3 15, 3 12 C 3 9, 4.5 7, 7 7 C 13.5 7, 14.5 17, 17 17 C 19.5 17, 21 15, 21 12 C 21 9, 19.5 7, 17 7 Z" 
                stroke="url(#sync-grad-top)" 
                strokeWidth="3.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-bold text-white text-sm tracking-tight group-hover:text-blue-400 transition-colors">Sync</span>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#141416] border border-zinc-800/80 text-zinc-300 text-[11px] font-medium rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                <span>Perfect Designer: Customizer</span>
                <ChevronRight className="w-3 h-3 text-zinc-500 rotate-90" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-zinc-900 border-zinc-700">
              <DropdownMenuItem className="text-zinc-300 cursor-pointer">Perfect Designer: Customizer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* separation line */}
          <div className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Clock icon with notification badge 1 */}
          <div className="relative cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors">
            <Clock className="w-4 h-4" />
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-semibold">1</span>
          </div>
          {/* Layers icon */}
          <div className="cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          {/* Grid icon */}
          <div className="cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors">
            <LayoutGrid className="w-4 h-4" />
          </div>
        </div>

        {/* Center: Tabs pill */}
        <div className="flex items-center bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800/60">
          {TABS.map(({ id: tabId, label, Icon }) => {
            const active = activeTab === tabId;
            return (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center gap-1.5 h-7 px-4 rounded-md text-xs font-semibold transition-all ${
                  active
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {tabId === "code" && codeBlocks.length > 0 && (
                  <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 py-px rounded-full font-mono leading-none">
                    {codeBlocks.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <GitBranch className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-full bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-[11px] font-bold text-indigo-400">
            S
          </div>
          <button className="h-8 w-8 rounded-lg flex items-center justify-center text-amber-500 hover:text-amber-400 transition-colors">
            <Zap className="w-4 h-4 fill-amber-500/10" />
          </button>
          
          <button className="h-8 px-4 rounded-lg text-xs font-semibold bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/30 transition-colors">
            Upgrade
          </button>
          <button
            onClick={() => {
              if (htmlPreview) {
                const w = window.open("", "_blank");
                w?.document.write(htmlPreview);
                w?.document.close();
              }
            }}
            disabled={!htmlPreview}
            className="h-8 px-5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Publish
          </button>
          <div className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
            P
          </div>
        </div>
      </div>

      {/* ── Main Split View ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left Chat Panel ── */}
        <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-zinc-800/60 overflow-hidden bg-[#08080a]">

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth w-full">
            <div className="flex flex-col gap-6 p-5 pb-4">
              
              {/* If empty state / welcome bubble */}
              {messages.length === 0 && !isStreaming && (
                <div className="flex flex-col gap-5">
                  <div className="p-4 bg-[#141416] border border-zinc-800/60 rounded-2xl text-[13px] leading-relaxed text-zinc-300">
                    Hi Princeton! I am Sync, your AI development and design workspace. I can build fully operational web applications, normalise databases schemas, or answer code QA. Try saying 'Hi' to chat, or ask me to build a project!
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Get Started</div>
                    
                    <button onClick={() => setInput("Build a landing page for...")} className="flex items-center gap-3.5 text-left p-3.5 bg-zinc-900/30 border border-zinc-800/60 hover:bg-zinc-800/40 hover:border-zinc-700 rounded-2xl transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all flex-shrink-0">
                        <Layout className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-200">Build a landing page</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Create a modern landing page</div>
                      </div>
                    </button>

                    <button onClick={() => setInput("Build a task management app...")} className="flex items-center gap-3.5 text-left p-3.5 bg-zinc-900/30 border border-zinc-800/60 hover:bg-zinc-800/40 hover:border-zinc-700 rounded-2xl transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-all flex-shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-200">Build a task app</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Create a full-stack task manager</div>
                      </div>
                    </button>

                    <button onClick={() => setInput("Connect a PostgreSQL database and create a schema...")} className="flex items-center gap-3.5 text-left p-3.5 bg-zinc-900/30 border border-zinc-800/60 hover:bg-zinc-800/40 hover:border-zinc-700 rounded-2xl transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all flex-shrink-0">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-200">Connect database</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Set up and connect a database</div>
                      </div>
                    </button>
                  </div>

                  <div className="p-4 bg-[#121216] border border-zinc-800/80 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Subscription Tier</span>
                      <span className="text-[9px] font-bold text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider bg-zinc-900/50">Developer</span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-zinc-400 mb-3.5">
                      Upgrade to the Scale Tier for $29.00/mo to get 1,200 RPM and access to Sync 2.0 Pro & Reasoner.
                    </p>
                    <button className="w-full py-2 rounded-xl text-xs font-semibold bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/30 transition-colors">
                      Upgrade to Scale ($29/mo)
                    </button>
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"} w-full min-w-0`}>
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Command className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  )}
                  <div className={
                    m.role === "user"
                      ? "max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm bg-blue-600 text-white leading-relaxed break-words"
                      : "flex-1 min-w-0 text-sm text-zinc-200 leading-relaxed overflow-hidden"
                  }>
                    {m.role === "user" ? <UserMessage content={m.content} /> : <MessageContent content={m.content} />}
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="flex gap-3 w-full min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Command className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0 text-sm text-zinc-200 leading-relaxed overflow-hidden">
                    {streamedContent.code || streamedContent.db || streamedContent.deploy ? (
                      <>
                        {streamedContent.code && <MessageContent content={streamedContent.code} />}
                        <span className="inline-block w-0.5 h-4 ml-0.5 bg-blue-400 animate-pulse align-middle rounded-full" />
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-zinc-600 py-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-xs">Building…</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-4 bg-[#0c0c0c] border-t border-zinc-800/60">
            <div className="relative bg-zinc-900 border border-zinc-700/60 rounded-2xl focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all shadow-lg">
              <textarea
                ref={textareaRef}
                className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 px-4 pt-3.5 pb-12 outline-none resize-none text-sm leading-relaxed"
                placeholder="Ask Sync to build something…"
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                rows={1}
                style={{ minHeight: "52px", maxHeight: "160px" }}
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <button disabled={isStreaming} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-30">
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                  <button disabled={isStreaming} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-30">
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isStreaming}
                  className="h-7 w-7 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0 text-white"
                >
                  {isStreaming
                    ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    : <ArrowUp className="w-3.5 h-3.5 text-white" />}
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-zinc-700 mt-2">
              Sync AI · Groq llama-3.3-70b · ⏎ send · ⇧⏎ newline
            </p>
          </div>
        </div>

        {/* ── Right Panel Container ── */}
        <div className="flex-1 p-3 flex flex-col overflow-hidden bg-[#070709]">

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c0e] border border-zinc-800/80 rounded-[20px] shadow-2xl">
              {/* Browser bar */}
              <div className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-zinc-800/60 bg-[#111115]">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Monitor className="w-4 h-4 text-zinc-300 cursor-pointer transition-colors" />
                    <Smartphone className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" />
                  </div>
                  <div className="h-4 w-px bg-zinc-800" />
                  <div className="flex items-center gap-3 text-zinc-500">
                    <ArrowLeft className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" />
                    <ArrowRight className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" />
                    <RotateCw className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" onClick={() => setIframeKey(k => k + 1)} />
                    <HomeIcon className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors ml-1" />
                  </div>
                </div>
                
                <div className="flex-1 max-w-xl mx-6 relative flex items-center">
                  <input 
                    readOnly
                    value={htmlPreview ? "sync://preview/live" : "http://localhost:3000/"}
                    className="w-full bg-[#141416] border border-zinc-800/80 rounded-full py-1.5 pl-4 pr-10 text-[12px] text-zinc-400 focus:outline-none focus:border-zinc-700 transition-colors shadow-inner"
                  />
                  <Lock className="w-3.5 h-3.5 text-zinc-650 absolute right-4" />
                </div>

                <div className="flex items-center gap-4 text-zinc-500">
                  <Share className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" />
                  <Sun className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" />
                  <button className="px-3.5 py-1 bg-zinc-80 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors">
                    Edit
                  </button>
                  <Maximize className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors ml-1" />
                </div>
              </div>
              
              {/* iFrame */}
              <div className="flex-1 bg-[#0b0f17] overflow-hidden relative">
                {isStreaming ? (
                  <div className="flex flex-col items-center justify-center h-full bg-[#0b0f17] text-zinc-400 font-sans p-8 text-center select-none">
                    <div className="relative w-16 h-16 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-4 border-blue-500/10 border-b-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <h3 className="text-white text-lg font-semibold tracking-tight mb-2 animate-pulse">Building Workspace</h3>
                    <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
                      Sync is generating files, compiling dependencies, and starting the live dev server in the background...
                    </p>
                  </div>
                ) : (!conversation || messages.length === 0) ? (
                  <div className="flex flex-col items-center justify-center h-full bg-[#0b0f17] text-zinc-400 font-sans p-8 text-center select-none">
                    <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/5">
                      <Zap className="w-6 h-6 text-purple-400 animate-pulse" />
                    </div>
                    <h3 className="text-white text-lg font-semibold tracking-tight mb-2">Sync Designer Sandbox</h3>
                    <p className="text-zinc-500 text-sm max-w-sm leading-relaxed mb-6">
                      Enter a prompt in the chat input on the left (e.g., "Build a SaaS billing dashboard") to scaffold a complete project and launch the Vite dev server.
                    </p>
                    <div className="grid grid-cols-1 gap-3 max-w-sm w-full text-left">
                      <div className="p-4 bg-[#14141a]/60 border border-zinc-800/40 rounded-xl hover:border-zinc-700/60 transition-colors">
                        <div className="text-[13px] font-semibold text-zinc-300 mb-1">⚡ Dynamic Dev Server</div>
                        <div className="text-[11px] text-zinc-500">Every project runs a full Vite development server with HMR and Tailwind CSS v4 compilation.</div>
                      </div>
                      <div className="p-4 bg-[#14141a]/60 border border-zinc-800/40 rounded-xl hover:border-zinc-700/60 transition-colors">
                        <div className="text-[13px] font-semibold text-zinc-300 mb-1">🛠️ Full Stack Scaffolding</div>
                        <div className="text-[11px] text-zinc-500">Generates database schemas, Docker configs, GitHub Action workflows, and Playwright tests.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    key={iframeKey}
                    src={window.location.protocol === "https:" ? `/workspaces/${id}/index.html` : `http://${window.location.hostname}:5001/workspaces/${id}/index.html`}
                    className="w-full h-full border-none bg-[#0b0f17]"
                    sandbox="allow-scripts allow-forms"
                    title="Live Preview"
                  />
                )}
              </div>
            </div>
          )}

          {/* Code Tab */}
          {activeTab === "code" && (() => {
            const liveCodeBlocks = isStreaming && streamedContent.code ? extractCodeBlocks(streamedContent.code) : codeBlocks;
            
            const getFileContent = (filePath: string): string => {
              if (filePath === "src/App.tsx") {
                const block = liveCodeBlocks.find(b => ["tsx", "jsx", "react", "typescript", "javascript", "ts", "js"].includes(b.lang?.toLowerCase()));
                return block ? block.code : (liveCodeBlocks[0]?.code || "// No React application generated yet");
              }
              if (filePath === "schema.sql") {
                const block = liveCodeBlocks.find(b => ["sql", "postgres", "postgresql", "db"].includes(b.lang?.toLowerCase()));
                return block ? block.code : "-- No database schema generated yet\n-- Ask Sync to design a database schema or connect to a database.";
              }
              if (filePath === "docker-compose.yml") {
                const block = liveCodeBlocks.find(b => ["yaml", "yml", "docker", "dockercompose"].includes(b.lang?.toLowerCase()));
                return block ? block.code : "# No deployment configuration generated yet\n# Ask Sync to generate docker-compose configuration.";
              }
              if (filePath === "package.json") {
                return `{
  "name": "sync-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.395.0"
  }
}`;
              }
              if (filePath === "tsconfig.json") {
                return `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true
  }
}`;
              }
              if (filePath === "src/index.css") {
                return `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #0b0f17;
  color: #f3f4f6;
  font-family: 'Inter', sans-serif;
}`;
              }
              return "";
            };

            const fileContent = getFileContent(selectedFilePath);

            return (
              <div className="flex-1 flex overflow-hidden bg-[#0d1117] border border-zinc-800/80 rounded-[20px] shadow-2xl">
                {/* Left: Explorer Sidebar */}
                <div className="w-52 flex-shrink-0 border-r border-zinc-800/60 bg-[#090b0e] flex flex-col p-3">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2 flex items-center justify-between">
                    <span>Explorer</span>
                    <Folder className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {/* src folder */}
                    <div>
                      <button 
                        onClick={() => setSrcFolderOpen(!srcFolderOpen)}
                        className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/40 rounded transition-colors font-medium"
                      >
                        <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${srcFolderOpen ? "rotate-90" : ""}`} />
                        <Folder className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10" />
                        <span>src</span>
                      </button>
                      {srcFolderOpen && (
                        <div className="pl-6 space-y-1 mt-1">
                          <button 
                            onClick={() => setSelectedFilePath("src/App.tsx")}
                            className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors text-left ${selectedFilePath === "src/App.tsx" ? "bg-blue-500/10 text-blue-400 font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"}`}
                          >
                            <FileCode className="w-3.5 h-3.5 text-blue-400" />
                            <span className="truncate">App.tsx</span>
                          </button>
                          <button 
                            onClick={() => setSelectedFilePath("src/index.css")}
                            className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors text-left ${selectedFilePath === "src/index.css" ? "bg-blue-500/10 text-blue-400 font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"}`}
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-400" />
                            <span className="truncate">index.css</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* schema.sql */}
                    <button 
                      onClick={() => setSelectedFilePath("schema.sql")}
                      className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors text-left ${selectedFilePath === "schema.sql" ? "bg-blue-500/10 text-blue-400 font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"}`}
                    >
                      <div className="pl-5 flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-amber-500/80" />
                        <span className="truncate">schema.sql</span>
                      </div>
                    </button>

                    {/* docker-compose.yml */}
                    <button 
                      onClick={() => setSelectedFilePath("docker-compose.yml")}
                      className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors text-left ${selectedFilePath === "docker-compose.yml" ? "bg-blue-500/10 text-blue-400 font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"}`}
                    >
                      <div className="pl-5 flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="truncate">docker-compose.yml</span>
                      </div>
                    </button>

                    {/* package.json */}
                    <button 
                      onClick={() => setSelectedFilePath("package.json")}
                      className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors text-left ${selectedFilePath === "package.json" ? "bg-blue-500/10 text-blue-400 font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"}`}
                    >
                      <div className="pl-5 flex items-center gap-2">
                        <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="truncate">package.json</span>
                      </div>
                    </button>

                    {/* tsconfig.json */}
                    <button 
                      onClick={() => setSelectedFilePath("tsconfig.json")}
                      className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors text-left ${selectedFilePath === "tsconfig.json" ? "bg-blue-500/10 text-blue-400 font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"}`}
                    >
                      <div className="pl-5 flex items-center gap-2">
                        <FileCode className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="truncate">tsconfig.json</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Right: Code Viewer */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-[#161b22] flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs font-mono text-zinc-300">{selectedFilePath}</span>
                    </div>
                    <CopyButton text={fileContent} />
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <pre className="p-5 text-[13px] font-mono text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
                      {fileContent}
                      {isStreaming && selectedFilePath === "src/App.tsx" && <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-zinc-400 animate-pulse align-middle" />}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Database Tab */}
          {activeTab === "database" && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-[#0c0c0e] border border-zinc-800/80 rounded-[20px] shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
                <Database className="w-8 h-8 text-zinc-750" />
              </div>
              <h3 className="text-zinc-200 font-semibold text-lg mb-2">Database Explorer</h3>
              <p className="text-zinc-550 text-sm max-w-xs leading-relaxed mb-6">
                Ask Sync to create database schemas, run queries, or connect to a database — results will appear here.
              </p>
              <button className="px-4 py-2 rounded-lg bg-zinc-850 border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Connect Database
              </button>
            </div>
          )}

          {/* Deploy Tab */}
          {activeTab === "deploy" && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-[#0c0c0e] border border-zinc-800/80 rounded-[20px] shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-5">
                <Rocket className="w-8 h-8 text-blue-500/60" />
              </div>
              <h3 className="text-zinc-200 font-semibold text-lg mb-2">Deploy your project</h3>
              <p className="text-zinc-550 text-sm max-w-xs leading-relaxed mb-6">
                Publish to a live URL in seconds. Your project will be globally accessible via CDN.
              </p>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-400 hover:text-zinc-250 hover:border-zinc-650 transition-colors">
                  Configure
                </button>
                <button
                  onClick={() => {
                    if (htmlPreview) {
                      const w = window.open("", "_blank");
                      w?.document.write(htmlPreview);
                      w?.document.close();
                    }
                  }}
                  disabled={!htmlPreview}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors disabled:opacity-30 flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" /> Publish Now
                </button>
              </div>
              {!htmlPreview && (
                <p className="text-zinc-750 text-xs mt-4">Build something first to enable deployment.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
