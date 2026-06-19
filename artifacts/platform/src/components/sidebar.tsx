import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import {
  Plus, Search, Folder, MessageSquare, Settings, Command,
  ChevronDown, ChevronRight, Sparkles, X, MoreHorizontal,
  Pin, Archive, Trash2, ArchiveRestore, Zap,
} from "lucide-react";
import {
  useListConversations, useListProjects, useDeleteConversation,
} from "@workspace/api-client-react";
import { useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/lib/settings-context";

function readStorage<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

export default function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { data: conversations = [], refetch } = useListConversations();
  const { data: projects = [] } = useListProjects();
  const deleteConvMutation = useDeleteConversation();
  const { settings } = useSettings();

  const [projectsOpen, setProjectsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [pinnedIds, setPinnedIds] = useState<number[]>(() => readStorage("sync_pinned", []));
  const [archivedIds, setArchivedIds] = useState<number[]>(() => readStorage("sync_archived", []));

  const togglePin = (id: number) => {
    const next = pinnedIds.includes(id) ? pinnedIds.filter((x) => x !== id) : [...pinnedIds, id];
    setPinnedIds(next);
    localStorage.setItem("sync_pinned", JSON.stringify(next));
  };

  const toggleArchive = (id: number) => {
    const next = archivedIds.includes(id) ? archivedIds.filter((x) => x !== id) : [...archivedIds, id];
    setArchivedIds(next);
    localStorage.setItem("sync_archived", JSON.stringify(next));
  };

  const handleDeleteConv = (convId: number) => {
    deleteConvMutation.mutate(
      { id: convId },
      {
        onSuccess: () => {
          if (location === `/chat/${convId}`) setLocation("/");
          refetch();
        },
      }
    );
  };

  const navigateToProject = (projectId: number) => {
    const lastConvId = localStorage.getItem(`sync_lastConv_${projectId}`);
    if (lastConvId) setLocation(`/chat/${lastConvId}`);
    else setLocation(`/projects/${projectId}`);
  };

  const filtered = conversations.filter(
    (c) => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredProjects = projects.filter(
    (p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinned = filtered.filter((c) => pinnedIds.includes(c.id) && !archivedIds.includes(c.id));
  const regular = filtered.filter((c) => !pinnedIds.includes(c.id) && !archivedIds.includes(c.id));
  const archived = filtered.filter((c) => archivedIds.includes(c.id));
  const visibleConvs = [...pinned, ...regular];
  const archivedCount = archived.length;

  const initials = settings.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Sidebar className="border-r border-border/40 bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border/30">
        <Link href="/">
          <div className="flex items-center gap-2 px-1 cursor-pointer mb-4 group">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Command className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground tracking-tight group-hover:text-primary transition-colors">
              Sync
            </span>
          </div>
        </Link>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sidebar-accent/40 text-sidebar-foreground text-xs rounded-lg pl-8 pr-8 py-1.5 outline-none border border-sidebar-border/40 focus:border-primary/50 transition-all placeholder:text-sidebar-foreground/30"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 gap-2 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/35 uppercase tracking-wider mb-1 px-2">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${location === "/" ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"}`}>
                    <Plus className="w-4 h-4" /> New Chat
                  </div>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <button onClick={() => setProjectsOpen((o) => !o)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${location.startsWith("/projects") ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"}`}>
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    <span>Projects</span>
                  </div>
                  {projectsOpen ? <ChevronDown className="w-3 h-3 opacity-40" /> : <ChevronRight className="w-3 h-3 opacity-40" />}
                </button>
              </SidebarMenuItem>

              {projectsOpen && (
                <div className="pl-8 flex flex-col gap-0.5 mb-1">
                  <Link href="/projects">
                    <div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/40 hover:text-primary transition-colors py-1 cursor-pointer">
                      <Plus className="w-3 h-3" /> All Projects
                    </div>
                  </Link>
                  {(searchQuery ? filteredProjects : projects).slice(0, 6).map((p) => (
                    <button key={p.id} onClick={() => navigateToProject(p.id)}
                      className={`text-xs py-1 text-left transition-colors truncate cursor-pointer w-full ${location === `/projects/${p.id}` ? "text-primary font-medium" : "text-sidebar-foreground/50 hover:text-sidebar-foreground"}`}
                      title={`Resume last session in "${p.name}"`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              )}

              <SidebarMenuItem>
                <Link href="/pricing">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${location === "/pricing" ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"}`}>
                    <Zap className="w-4 h-4" /> Pricing
                  </div>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/settings">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${location === "/settings" ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"}`}>
                    <Settings className="w-4 h-4" /> Settings
                  </div>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Chats */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 mb-1">
            <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/35 uppercase tracking-wider m-0 p-0">
              Recent Chats
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            {visibleConvs.length === 0 && !searchQuery && (
              <p className="text-[11px] text-sidebar-foreground/25 px-3 py-1 italic">No conversations yet.</p>
            )}
            {searchQuery && filtered.length === 0 && (
              <p className="text-[11px] text-sidebar-foreground/25 px-3 py-1 italic">No matches.</p>
            )}

            {visibleConvs.slice(0, 15).map((conv) => {
              const isPinned = pinnedIds.includes(conv.id);
              const isActive = location === `/chat/${conv.id}`;
              return (
                <div key={conv.id} className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors mb-0.5 ${isActive ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"}`}>
                  {isPinned ? <Pin className="w-3 h-3 flex-shrink-0 text-primary/60" /> : <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />}
                  <Link href={`/chat/${conv.id}`} className="flex-1 truncate text-xs min-w-0">{conv.title}</Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 rounded hover:bg-sidebar-accent transition-all">
                        <MoreHorizontal className="w-3.5 h-3.5 text-sidebar-foreground/60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-44 bg-popover border-border/60">
                      <DropdownMenuItem onClick={() => togglePin(conv.id)} className="gap-2 cursor-pointer text-xs">
                        <Pin className="w-3.5 h-3.5" /> {isPinned ? "Unpin" : "Pin to top"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleArchive(conv.id)} className="gap-2 cursor-pointer text-xs">
                        <Archive className="w-3.5 h-3.5" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteConv(conv.id)} className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}

            {archivedCount > 0 && (
              <button onClick={() => setShowArchived((s) => !s)} className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-sidebar-foreground/30 hover:text-sidebar-foreground/60 transition-colors w-full mt-1">
                <Archive className="w-3 h-3" />
                {showArchived ? "Hide" : "Show"} {archivedCount} archived
              </button>
            )}

            {showArchived && archived.map((conv) => {
              const isActive = location === `/chat/${conv.id}`;
              return (
                <div key={conv.id} className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors mb-0.5 opacity-50 hover:opacity-100 ${isActive ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/50 hover:bg-sidebar-accent/40"}`}>
                  <Archive className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
                  <Link href={`/chat/${conv.id}`} className="flex-1 truncate text-xs min-w-0">{conv.title}</Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 rounded hover:bg-sidebar-accent transition-all">
                        <MoreHorizontal className="w-3.5 h-3.5 text-sidebar-foreground/60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-44 bg-popover border-border/60">
                      <DropdownMenuItem onClick={() => toggleArchive(conv.id)} className="gap-2 cursor-pointer text-xs">
                        <ArchiveRestore className="w-3.5 h-3.5" /> Unarchive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteConv(conv.id)} className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/30">
        <div className="mb-2 p-3 rounded-xl bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/15">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-sidebar-foreground">Upgrade to Pro</span>
          </div>
          <p className="text-[10px] text-sidebar-foreground/50 leading-tight mb-2">
            Unlimited builds, all models, custom domains.
          </p>
          <Link href="/pricing">
            <button className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
              View Plans
            </button>
          </Link>
        </div>

        <Link href="/settings">
          <button className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors group">
            <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center border border-sidebar-border overflow-hidden flex-shrink-0">
              {settings.avatarUrl ? (
                <img src={settings.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-sidebar-foreground/70">{initials}</span>
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0 text-left">
              <span className="text-xs font-medium text-sidebar-foreground truncate">{settings.name}</span>
              <span className="text-[10px] text-sidebar-foreground/40 truncate">{settings.email}</span>
            </div>
            <Settings className="w-3.5 h-3.5 text-sidebar-foreground/25 group-hover:text-sidebar-foreground/60 transition-colors flex-shrink-0" />
          </button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
