import { useEffect, useState, useRef, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetConversation, useListMessages, useDeleteConversation, useListConversations, useListProjects } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  ArrowUp, ChevronLeft, ChevronRight, RefreshCw, Home as HomeIcon,
  Layout, Database, Rocket, Copy, Check, Terminal,
  Loader2, Paperclip, Mic, Trash2, MoreHorizontal,
  MessageSquare, Folder, Plus, Command, PanelLeftClose, PanelLeftOpen,
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

function extractHtml(content: string): string | null {
  const m = content.match(/```html\n?([\s\S]*?)```/i);
  return m ? m[1].trim() : null;
}

function extractJsx(content: string): string | null {
  const m = content.match(/```jsx\n?([\s\S]*?)```/i);
  return m ? m[1].trim() : null;
}

function buildReactSrcDoc(jsxCode: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, system-ui, sans-serif; }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    ${jsxCode}
    const rootEl = document.getElementById('root');
    const root = ReactDOM.createRoot(rootEl);
    root.render(React.createElement(App));
  </script>
</body>
</html>`;
}

function extractCodeBlocks(content: string) {
  const blocks: { lang: string; code: string }[] = [];
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
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

function MessageContent({ content }: { content: string }) {
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
              <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[0.82em] border border-zinc-700/50">
                {children}
              </code>
            );
          }
          return (
            <div className="my-3 rounded-xl overflow-hidden border border-zinc-700/60 shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700/40">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{lang || "code"}</span>
                <CopyButton text={code} />
              </div>
              <code className={`block overflow-x-auto p-4 text-[13px] font-mono bg-[#0d1117] leading-relaxed ${className}`}>
                {children}
              </code>
            </div>
          );
        },
        pre({ children }) { return <pre className="not-prose">{children}</pre>; },
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
            <div className="overflow-x-auto my-3 rounded-xl border border-zinc-700/50">
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
  const [streamedContent, setStreamedContent] = useState("");
  const [activeTab, setActiveTab] = useState<PreviewTab>("preview");
  const [codeBlocks, setCodeBlocks] = useState<{ lang: string; code: string }[]>([]);
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const [activeCodeIdx, setActiveCodeIdx] = useState(0);
  const [leftNavOpen, setLeftNavOpen] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sentInitial = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, streamedContent]);

  useEffect(() => {
    const assistantContent = messages
      .filter((m) => m.role === "assistant")
      .map((m) => m.content)
      .join("\n");
    const blocks = extractCodeBlocks(assistantContent);
    if (blocks.length > 0) setCodeBlocks(blocks);
    const jsx = extractJsx(assistantContent);
    if (jsx) {
      setHtmlPreview(buildReactSrcDoc(jsx));
      setIframeKey((k) => k + 1);
      return;
    }
    const html = extractHtml(assistantContent);
    if (html) {
      setHtmlPreview(html);
      setIframeKey((k) => k + 1);
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;
    setInput("");
    setIsStreaming(true);
    setStreamedContent("");

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) { full += data.content; setStreamedContent(full); }
            if (data.done) {
              setIsStreaming(false);
              setStreamedContent("");
              const blocks = extractCodeBlocks(full);
              if (blocks.length > 0) { setCodeBlocks(blocks); setActiveCodeIdx(0); }
              const jsx = extractJsx(full);
              if (jsx) {
                setHtmlPreview(buildReactSrcDoc(jsx));
                setIframeKey((k) => k + 1);
                setActiveTab("preview");
              } else {
                const html = extractHtml(full);
                if (html) {
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
      setStreamedContent("");
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

  const recentConvs = allConversations.slice(0, 8);
  const currentCode = codeBlocks[activeCodeIdx];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a] text-zinc-100 font-sans">

      {/* ── Collapsible Left Nav ── */}
      {leftNavOpen && (
        <div className="w-[220px] flex-shrink-0 border-r border-zinc-800/60 flex flex-col bg-[#111111] overflow-hidden">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800/60">
            <Link href="/" className="flex items-center gap-2 cursor-pointer group">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                <Command className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white text-sm tracking-tight group-hover:text-blue-400 transition-colors">Sync</span>
            </Link>
            <button
              onClick={() => setLeftNavOpen(false)}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Nav actions */}
          <div className="p-2 border-b border-zinc-800/40 space-y-0.5">
            <Link href="/">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors cursor-pointer text-sm">
                <Plus className="w-4 h-4" /> New Chat
              </div>
            </Link>
            <Link href="/projects">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors cursor-pointer text-sm">
                <Folder className="w-4 h-4" /> Projects
              </div>
            </Link>
          </div>

          {/* Recent chats */}
          <div className="flex-1 overflow-y-auto p-2">
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 py-2">Recent</p>
            {recentConvs.map((c) => (
              <Link key={c.id} href={`/chat/${c.id}`}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer mb-0.5 ${
                  c.id === id
                    ? "bg-blue-600/20 text-blue-300 border border-blue-600/20"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}>
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate text-xs">{c.title}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom */}
          <div className="p-3 border-t border-zinc-800/60">
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">D</div>
              <span className="text-xs text-zinc-500">Developer</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main: Chat + Preview ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <div className="h-12 flex-shrink-0 flex items-center gap-3 px-4 border-b border-zinc-800/60 bg-[#0f0f0f]">
          {!leftNavOpen && (
            <button
              onClick={() => setLeftNavOpen(true)}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors mr-1"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-zinc-100 truncate leading-none">{conversation?.title ?? "Chat"}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-[10px] text-zinc-500 font-mono">llama-3.3-70b-versatile · Groq</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-700">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-400 focus:text-red-400 focus:bg-red-500/10 gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="h-8 px-3 rounded-lg text-xs font-medium text-zinc-400 border border-zinc-700/60 hover:border-zinc-600 hover:text-zinc-200 transition-colors">
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
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Rocket className="w-3.5 h-3.5" /> Publish
            </button>
          </div>
        </div>

        {/* ── Body: Left Chat | Right Preview ── */}
        <div className="flex-1 flex overflow-hidden">

          {/* ── Chat Panel ── */}
          <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-zinc-800/60 overflow-hidden bg-[#0c0c0c]">

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
              <div className="flex flex-col gap-6 p-5 pb-4">
                {messages.length === 0 && !isStreaming && (
                  <div className="flex flex-col items-center justify-center h-32 text-center mt-8">
                    <p className="text-sm text-zinc-600">Send a message to start building.</p>
                  </div>
                )}

                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {m.role === "assistant" && (
                      <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Command className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                    )}
                    <div className={
                      m.role === "user"
                        ? "max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm bg-blue-600 text-white leading-relaxed"
                        : "flex-1 min-w-0 text-sm text-zinc-200 leading-relaxed"
                    }>
                      {m.role === "user" ? m.content : <MessageContent content={m.content} />}
                    </div>
                  </div>
                ))}

                {isStreaming && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Command className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0 text-sm text-zinc-200 leading-relaxed">
                      {streamedContent
                        ? (
                          <>
                            <MessageContent content={streamedContent} />
                            <span className="inline-block w-0.5 h-4 ml-0.5 bg-blue-400 animate-pulse align-middle rounded-full" />
                          </>
                        )
                        : (
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
                    className="h-7 w-7 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
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

          {/* ── Right Panel: Preview / Code / Database / Deploy ── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">

            {/* Tab bar */}
            <div className="h-11 flex-shrink-0 flex items-center justify-between px-3 border-b border-zinc-800/60 bg-[#0f0f0f]">
              <div className="flex items-center gap-0.5 bg-zinc-800/50 p-0.5 rounded-lg">
                {TABS.map(({ id: tabId, label, Icon }) => {
                  const active = activeTab === tabId;
                  return (
                    <button
                      key={tabId}
                      onClick={() => setActiveTab(tabId)}
                      className={`flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-all ${
                        active
                          ? "bg-zinc-700 text-zinc-100 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/40"
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
              {htmlPreview && (
                <button
                  onClick={() => { setIframeKey((k) => k + 1); }}
                  className="h-7 px-2 rounded-md text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              )}
            </div>

            {/* Preview Tab */}
            {activeTab === "preview" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Browser bar */}
                <div className="h-9 flex-shrink-0 flex items-center gap-2 px-3 border-b border-zinc-800/40 bg-[#0d0d0d]">
                  {[ChevronLeft, ChevronRight].map((Icon, i) => (
                    <button key={i} className="h-5 w-5 rounded flex items-center justify-center text-zinc-700 hover:text-zinc-400 transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                  <button className="h-5 w-5 rounded flex items-center justify-center text-zinc-700 hover:text-zinc-400 transition-colors" onClick={() => setIframeKey((k) => k + 1)}>
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <div className="flex-1 max-w-md mx-auto">
                    <div className="px-3 py-1 bg-zinc-800/60 border border-zinc-700/30 rounded-md text-[11px] font-mono text-zinc-600 truncate">
                      {htmlPreview ? "sync://preview/live" : "about:blank"}
                    </div>
                  </div>
                </div>
                {/* iFrame or empty state */}
                <div className="flex-1 bg-white overflow-hidden">
                  {htmlPreview ? (
                    <iframe
                      key={iframeKey}
                      srcDoc={htmlPreview}
                      className="w-full h-full border-none"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      title="Live Preview"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-[#f7f7f7]">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center mb-5">
                        <Layout className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-gray-700 font-semibold text-lg mb-2">Live Preview</h3>
                      <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-1">
                        Ask Sync to build you a website or UI and it will render here instantly.
                      </p>
                      <p className="text-gray-300 text-xs font-mono mt-2">
                        e.g. "Build me an Instagram clone"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Code Tab */}
            {activeTab === "code" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
                {codeBlocks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                    <Terminal className="w-10 h-10 text-zinc-700 mb-3" />
                    <p className="text-zinc-500 text-sm font-medium">No code yet</p>
                    <p className="text-zinc-700 text-xs mt-1.5 max-w-xs">Ask Sync to write code — it'll appear here with full syntax highlighting.</p>
                  </div>
                ) : (
                  <>
                    {codeBlocks.length > 1 && (
                      <div className="flex items-center gap-1 px-4 py-2.5 border-b border-zinc-800 overflow-x-auto flex-shrink-0">
                        {codeBlocks.map((b, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCodeIdx(i)}
                            className={`flex-shrink-0 text-[10px] font-mono px-2.5 py-1 rounded-md transition-colors ${
                              i === activeCodeIdx ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/70"
                            }`}
                          >
                            {b.lang || "file"} {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/80 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">
                          {currentCode?.lang || "code"}
                        </span>
                      </div>
                      <CopyButton text={currentCode?.code ?? ""} />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <pre className="p-5 text-[13px] font-mono text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
                        {currentCode?.code}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Database Tab */}
            {activeTab === "database" && (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
                  <Database className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-zinc-200 font-semibold text-lg mb-2">Database Explorer</h3>
                <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-6">
                  Ask Sync to create database schemas, run queries, or connect to a database — results will appear here.
                </p>
                <button className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Connect Database
                </button>
              </div>
            )}

            {/* Deploy Tab */}
            {activeTab === "deploy" && (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-5">
                  <Rocket className="w-8 h-8 text-blue-500/60" />
                </div>
                <h3 className="text-zinc-200 font-semibold text-lg mb-2">Deploy your project</h3>
                <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-6">
                  Publish to a live URL in seconds. Your project will be globally accessible via CDN.
                </p>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors">
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
                  <p className="text-zinc-700 text-xs mt-4">Build something first to enable deployment.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
