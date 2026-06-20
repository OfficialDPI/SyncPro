/**
 * Design System — src/design-system/index.ts
 * Single entry point for all shared UI primitives and design tokens.
 *
 * RULES FOR FEATURES:
 *   ✅  import { Button } from "@/design-system"
 *   ✅  import { THEME_TOKENS } from "@/design-system"
 *   ❌  import { Button } from "@/components/ui/button"   (too deep)
 *   ❌  Define new base components inline in a feature    (use shared ones)
 *
 * This barrel is the contract between the Design System and Feature modules.
 * New components are added to src/components/ui/ and re-exported here.
 */

// ── Primitives ────────────────────────────────────────────────────────────────
export { Button, buttonVariants } from "@/components/ui/button";
export { Input } from "@/components/ui/input";
export { Textarea } from "@/components/ui/textarea";
export { Label } from "@/components/ui/label";
export { Badge, badgeVariants } from "@/components/ui/badge";
export { Checkbox } from "@/components/ui/checkbox";
export { Switch } from "@/components/ui/switch";
export { Slider } from "@/components/ui/slider";
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ── Layout ────────────────────────────────────────────────────────────────────
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
export { Separator } from "@/components/ui/separator";
export { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
export { AspectRatio } from "@/components/ui/aspect-ratio";

// ── Navigation ────────────────────────────────────────────────────────────────
export { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList, NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
export {
  Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// ── Overlay & Feedback ────────────────────────────────────────────────────────
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
export { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
export { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
export { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
export { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
export { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
export { Toaster } from "@/components/ui/toaster";
export { Progress } from "@/components/ui/progress";
export { Skeleton } from "@/components/ui/skeleton";

// ── Menus ─────────────────────────────────────────────────────────────────────
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
export { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar";

// ── Data Display ──────────────────────────────────────────────────────────────
export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
export { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
export { Toggle, toggleVariants } from "@/components/ui/toggle";
export { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";

// ── Form ──────────────────────────────────────────────────────────────────────
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// ── Design Tokens ─────────────────────────────────────────────────────────────
export { THEME_TOKENS, ACCENT_PRESETS, accentColor } from "@/core/theme";

// ── Utilities ─────────────────────────────────────────────────────────────────
export { cn } from "@/lib/utils";
