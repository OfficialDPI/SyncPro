import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  useGetProject, useDeleteProject, useUpdateProject, useListConversations,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Folder, Clock, Trash2, Settings, MessageSquare, ArrowLeft,
  ChevronRight, Plus, Loader2, Activity, Pencil, X, Check,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  archived: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
  draft: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;

  const { data: project, isLoading, refetch } = useGetProject(id);
  const { data: allConversations = [] } = useListConversations();
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [descValue, setDescValue] = useState("");

  const projectConversations = allConversations.filter((c) => c.projectId === id);

  const handleDelete = () => {
    deleteProject.mutate(
      { id },
      { onSuccess: () => setLocation("/projects") }
    );
  };

  const startEditName = () => {
    setNameValue(project?.name ?? "");
    setEditingName(true);
  };

  const saveName = () => {
    if (!nameValue.trim()) return;
    updateProject.mutate(
      { id, data: { name: nameValue.trim() } },
      { onSuccess: () => { setEditingName(false); refetch(); } }
    );
  };

  const startEditDesc = () => {
    setDescValue(project?.description ?? "");
    setEditingDesc(true);
  };

  const saveDesc = () => {
    updateProject.mutate(
      { id, data: { description: descValue.trim() } },
      { onSuccess: () => { setEditingDesc(false); refetch(); } }
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Folder className="w-12 h-12 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" className="rounded-full" onClick={() => setLocation("/projects")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{project.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Folder className="w-8 h-8" />
            </div>
            <div>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                    className="text-2xl font-semibold bg-card border border-primary/50 rounded-lg px-3 py-1 text-foreground outline-none"
                    autoFocus
                  />
                  <button onClick={saveName} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">{project.name}</h1>
                  <button
                    onClick={startEditName}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-secondary transition-all text-muted-foreground"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[project.status] ?? STATUS_COLORS.draft}`}>
                  {project.status}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="rounded-full gap-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="p-6 rounded-2xl bg-card/40 border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Description</h3>
                {!editingDesc && (
                  <button
                    onClick={startEditDesc}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {editingDesc ? (
                <div className="space-y-3">
                  <textarea
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    rows={4}
                    className="w-full bg-background border border-primary/40 rounded-xl px-3 py-2 text-sm text-foreground outline-none resize-none focus:border-primary/60"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveDesc} className="rounded-full h-7 px-3 text-xs gap-1.5">
                      <Check className="w-3 h-3" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingDesc(false)} className="rounded-full h-7 px-3 text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.description || <span className="italic opacity-50">No description. Click the pencil to add one.</span>}
                </p>
              )}
            </div>

            {/* Conversations */}
            <div className="p-6 rounded-2xl bg-card/40 border border-border/50">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Conversations
                </h3>
                <span className="text-xs bg-secondary px-2.5 py-1 rounded-full border border-border/30 text-muted-foreground">
                  {projectConversations.length} total
                </span>
              </div>

              {projectConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 border border-dashed border-border/40 rounded-xl bg-background/20">
                  <MessageSquare className="w-7 h-7 text-muted-foreground mb-2.5 opacity-30" />
                  <p className="text-sm text-muted-foreground mb-3">No conversations yet.</p>
                  <Link href="/">
                    <Button variant="outline" size="sm" className="rounded-full gap-1.5 h-7 px-3 text-xs">
                      <Plus className="w-3 h-3" /> Start a conversation
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {projectConversations.map((conv) => (
                    <Link key={conv.id} href={`/chat/${conv.id}`}>
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-background/30 border border-border/30 hover:border-primary/30 hover:bg-background/50 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <div>
                            <p className="text-sm font-medium text-foreground truncate max-w-xs">{conv.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {conv.messageCount} message{conv.messageCount !== 1 ? "s" : ""} · {formatDistanceToNow(new Date(conv.updatedAt ?? conv.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-card/40 border border-border/50">
              <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] text-muted-foreground/70 mb-1 uppercase tracking-wide">Project ID</div>
                  <div className="text-sm font-mono text-foreground bg-background/50 px-2.5 py-1.5 rounded-lg border border-border/30">
                    PRJ-{project.id.toString().padStart(4, "0")}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground/70 mb-1 uppercase tracking-wide">Status</div>
                  <select
                    defaultValue={project.status}
                    onChange={(e) =>
                      updateProject.mutate(
                        { id, data: { status: e.target.value as "active" | "archived" } },
                        { onSuccess: () => refetch() }
                      )
                    }
                    className="w-full bg-background border border-border/50 rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground/70 mb-1 uppercase tracking-wide">Created</div>
                  <div className="text-sm text-foreground">{format(new Date(project.createdAt), "MMM d, yyyy")}</div>
                  <div className="text-[11px] text-muted-foreground">{format(new Date(project.createdAt), "h:mm a")}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground/70 mb-1 uppercase tracking-wide">Conversations</div>
                  <div className="text-2xl font-bold text-foreground">{project.conversationCount}</div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-card/40 border border-border/50">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Activity</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs">Last active {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border/60 text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{project.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the project and all its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-destructive hover:bg-destructive/90 text-white gap-2"
            >
              {deleteProject.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
