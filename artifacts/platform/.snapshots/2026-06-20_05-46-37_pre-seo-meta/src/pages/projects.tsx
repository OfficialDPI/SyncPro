import { useState } from "react";
import { useListProjects, useGetProjectStats, useCreateProject } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Folder, Clock, Activity, MessageSquare, Plus, X, Loader2, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  archived: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
  draft: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

export default function Projects() {
  const { data: projects = [], isLoading, refetch } = useListProjects();
  const { data: stats } = useGetProjectStats();
  const createProject = useCreateProject();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!name.trim()) { setError("Project name is required."); return; }
    setError("");
    createProject.mutate(
      { data: { name: name.trim(), description: description.trim() || undefined } },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setDescription("");
          refetch();
        },
        onError: () => setError("Failed to create project. Please try again."),
      }
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1.5">Manage your AI workspaces and applications.</p>
          </div>
          <Button onClick={() => setOpen(true)} className="rounded-full px-5 gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Projects", value: stats.totalProjects, icon: Folder, color: "text-blue-400" },
              { label: "Active", value: stats.activeProjects, icon: Activity, color: "text-emerald-400" },
              { label: "Conversations", value: stats.totalConversations, icon: MessageSquare, color: "text-violet-400" },
              { label: "Messages", value: stats.totalMessages, icon: Zap, color: "text-amber-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-5 rounded-2xl bg-card/40 border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
                <div className="text-3xl font-bold text-foreground">{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Project Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-card/20 animate-pulse border border-border/20" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border/40 rounded-2xl bg-card/10">
            <Folder className="w-10 h-10 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-foreground mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-5">Create your first project to get started.</p>
            <Button onClick={() => setOpen(true)} variant="outline" className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="group relative flex flex-col p-5 h-full min-h-[160px] bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/40 hover:bg-card/60 transition-all duration-200 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
                      <Folder className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[project.status] ?? STATUS_COLORS.draft}`}>
                      {project.status}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                    {project.name}
                  </h3>

                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed flex-1">
                      {project.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center text-[11px] text-muted-foreground/70 pt-3 border-t border-border/30 mt-auto">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{project.conversationCount} conversation{project.conversationCount !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Add new project card */}
            <button
              onClick={() => setOpen(true)}
              className="flex flex-col items-center justify-center min-h-[160px] border border-dashed border-border/40 rounded-2xl bg-card/10 hover:border-primary/40 hover:bg-card/30 transition-all duration-200 text-muted-foreground hover:text-foreground group"
            >
              <Plus className="w-8 h-8 mb-2 opacity-30 group-hover:opacity-70 transition-opacity" />
              <span className="text-sm font-medium">New Project</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/60 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">New Project</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Create a new AI workspace to organize your conversations and builds.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
                Project Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. SaaS Landing Page"
                className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
                Description <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you building?"
                rows={3}
                className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createProject.isPending} className="rounded-full gap-2">
              {createProject.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
