import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateConversation } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Paperclip, Search, Image as ImageIcon, Mic, ArrowUp, ChevronDown, Loader2,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Build a landing page", prompt: "Build me a modern, responsive landing page with a hero section, features list, and CTA button. Use clean HTML and CSS with a professional dark theme." },
  { label: "Write React component", prompt: "Write a reusable React TypeScript component for a data table with sorting, filtering, and pagination." },
  { label: "Design a REST API", prompt: "Design a RESTful API for a task management app. Include endpoints, request/response schemas, and authentication strategy." },
  { label: "Debug my code", prompt: "I need help debugging my code. Walk me through a systematic debugging approach and best practices." },
  { label: "Write unit tests", prompt: "Explain how to write comprehensive unit tests for a React component using Vitest and React Testing Library." },
  { label: "SQL query help", prompt: "Help me write an optimized SQL query. What are the best practices for writing performant database queries?" },
  { label: "Docker setup", prompt: "Create a production-ready Dockerfile and docker-compose.yml for a Node.js Express app with a PostgreSQL database." },
  { label: "Research assistant", prompt: "Act as a research assistant. I'll describe a topic and you'll help me understand it deeply with explanations and examples." },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState("");
  const createConversation = useCreateConversation();

  const handleSubmit = (e?: React.FormEvent, overridePrompt?: string) => {
    e?.preventDefault();
    const content = overridePrompt ?? prompt;
    if (!content.trim() || createConversation.isPending) return;

    createConversation.mutate(
      {
        data: {
          title: content.slice(0, 60),
          model: "llama-3.3-70b-versatile",
        },
      },
      {
        onSuccess: (conv) => {
          setLocation(`/chat/${conv.id}?initialPrompt=${encodeURIComponent(content)}`);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChip = (action: { label: string; prompt: string }) => {
    handleSubmit(undefined, action.prompt);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 flex justify-end">
        <Button
          variant="outline"
          className="rounded-full bg-secondary/50 border-border/50 text-xs font-medium px-4 h-9 shadow-none"
        >
          Llama 3.3 70B
          <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-6 pb-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-8 text-center">
          What's on your mind today?
        </h1>

        <div className="w-full relative">
          <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-3xl p-2 transition-all focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/30">
            <textarea
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground p-4 outline-none resize-none min-h-[120px] text-base"
              placeholder="Ask anything..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button variant="ghost" className="rounded-full h-10 text-muted-foreground hover:text-foreground px-4 font-normal text-sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="ghost" className="rounded-full h-10 text-muted-foreground hover:text-foreground px-4 font-normal text-sm">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Create image
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground">
                  <Mic className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleSubmit()}
                  disabled={!prompt.trim() || createConversation.isPending}
                  className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground p-0 flex items-center justify-center disabled:opacity-50"
                >
                  {createConversation.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ArrowUp className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleChip(action)}
              disabled={createConversation.isPending}
              className="px-4 py-2 rounded-full border border-border/40 bg-secondary/30 hover:bg-secondary/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
