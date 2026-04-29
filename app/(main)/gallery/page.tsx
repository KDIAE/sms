"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder, faFolderOpen, faFolderPlus, faCloudArrowUp,
  faVideo, faEllipsisVertical, faChevronRight, faChevronDown,
  faTrash, faPencil, faDownload, faXmark,
  faMagnifyingGlass, faTableCells, faTableList,
  faChevronLeft, faImages,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// ── Types ────────────────────────────────────────────────────────────────────

type MediaType = "image" | "video";

interface MediaFile {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  size: number; // bytes
  uploadedAt: string;
  folderId: string;
  mimeType: string;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  color: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FOLDER_COLORS = [
  "#FFCA2B", "#3B82F6", "#10B981", "#F43F5E", "#8B5CF6",
  "#F97316", "#06B6D4", "#84CC16",
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Initial seed data ─────────────────────────────────────────────────────────

const INITIAL_FOLDERS: Folder[] = [
  { id: "root",      name: "Gallery",           parentId: null,     createdAt: "2025-01-01", color: "#3B82F6" },
  { id: "f1",        name: "Annual Day 2025",   parentId: "root",   createdAt: "2025-03-10", color: "#FFCA2B" },
  { id: "f2",        name: "Sports Meet",       parentId: "root",   createdAt: "2025-02-15", color: "#10B981" },
  { id: "f3",        name: "Science Fair",      parentId: "root",   createdAt: "2025-01-22", color: "#8B5CF6" },
  { id: "f1-1",      name: "Rehearsals",        parentId: "f1",     createdAt: "2025-03-05", color: "#F97316" },
  { id: "f1-2",      name: "Main Event",        parentId: "f1",     createdAt: "2025-03-11", color: "#F43F5E" },
  { id: "f1-2-1",    name: "Stage Performances",parentId: "f1-2",   createdAt: "2025-03-11", color: "#06B6D4" },
  { id: "f2-1",      name: "Athletics",         parentId: "f2",     createdAt: "2025-02-14", color: "#84CC16" },
  { id: "f2-2",      name: "Team Sports",       parentId: "f2",     createdAt: "2025-02-14", color: "#FFCA2B" },
];

const PLACEHOLDER_IMGS = [
  "https://picsum.photos/seed/a1/600/400",
  "https://picsum.photos/seed/b2/600/400",
  "https://picsum.photos/seed/c3/600/400",
  "https://picsum.photos/seed/d4/600/400",
  "https://picsum.photos/seed/e5/600/400",
  "https://picsum.photos/seed/f6/600/400",
];

const INITIAL_MEDIA: MediaFile[] = [
  { id: "m1", name: "opening_ceremony.jpg",  type: "image", url: PLACEHOLDER_IMGS[0], size: 2_340_000, uploadedAt: "2025-03-11", folderId: "f1-2", mimeType: "image/jpeg" },
  { id: "m2", name: "dance_group.jpg",       type: "image", url: PLACEHOLDER_IMGS[1], size: 1_870_000, uploadedAt: "2025-03-11", folderId: "f1-2", mimeType: "image/jpeg" },
  { id: "m3", name: "drama_club.jpg",        type: "image", url: PLACEHOLDER_IMGS[2], size: 3_100_000, uploadedAt: "2025-03-11", folderId: "f1-2-1", mimeType: "image/jpeg" },
  { id: "m4", name: "rehearsal_1.jpg",       type: "image", url: PLACEHOLDER_IMGS[3], size: 980_000,   uploadedAt: "2025-03-05", folderId: "f1-1", mimeType: "image/jpeg" },
  { id: "m5", name: "100m_sprint.jpg",       type: "image", url: PLACEHOLDER_IMGS[4], size: 2_100_000, uploadedAt: "2025-02-14", folderId: "f2-1", mimeType: "image/jpeg" },
  { id: "m6", name: "football_final.jpg",    type: "image", url: PLACEHOLDER_IMGS[5], size: 1_560_000, uploadedAt: "2025-02-15", folderId: "f2-2", mimeType: "image/jpeg" },
];

// ── FolderTree Component ──────────────────────────────────────────────────────

function FolderTree({
  folders,
  mediaFiles,
  currentFolderId,
  onSelect,
}: {
  folders: Folder[];
  mediaFiles: MediaFile[];
  currentFolderId: string;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["root", "f1", "f2"]));

  function countItems(folderId: string): number {
    const direct = mediaFiles.filter(m => m.folderId === folderId).length;
    const sub = folders.filter(f => f.parentId === folderId);
    return direct + sub.reduce((a, f) => a + countItems(f.id), 0);
  }

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function renderNode(folder: Folder, depth = 0): React.ReactNode {
    const children = folders.filter(f => f.parentId === folder.id);
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(folder.id);
    const isActive = currentFolderId === folder.id;
    const count = countItems(folder.id);

    return (
      <div key={folder.id}>
        <button
          onClick={() => { onSelect(folder.id); if (hasChildren) toggle(folder.id); }}
          style={{ paddingLeft: depth * 16 + 8 }}
          className={`w-full flex items-center gap-1.5 py-1.5 pr-2 rounded-md text-[12.5px] transition-colors ${
            isActive ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {hasChildren ? (
            <FontAwesomeIcon
              icon={isExpanded ? faChevronDown : faChevronRight}
              className="w-2.5 text-slate-400 shrink-0"
            />
          ) : (
            <span className="w-2.5 shrink-0" />
          )}
          <FontAwesomeIcon
            icon={isExpanded && hasChildren ? faFolderOpen : faFolder}
            className="w-3.5 shrink-0"
            style={{ color: folder.color }}
          />
          <span className="flex-1 text-left truncate">{folder.name}</span>
          {count > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
            }`}>{count}</span>
          )}
        </button>
        {isExpanded && hasChildren && (
          <div>
            {children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  const roots = folders.filter(f => f.parentId === null);
  return (
    <div className="flex flex-col gap-0.5 select-none">
      {roots.map(r => renderNode(r))}
    </div>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function getBreadcrumb(folders: Folder[], folderId: string): Folder[] {
  const crumbs: Folder[] = [];
  let current: Folder | undefined = folders.find(f => f.id === folderId);
  while (current) {
    crumbs.unshift(current);
    current = current.parentId ? folders.find(f => f.id === current!.parentId) : undefined;
  }
  return crumbs;
}

// ── Context Menu ──────────────────────────────────────────────────────────────

interface CtxMenu {
  x: number; y: number;
  type: "folder" | "file";
  id: string;
}

function ContextMenu({
  menu, onClose, onRename, onDelete, onDownload,
}: {
  menu: CtxMenu;
  onClose: () => void;
  onRename: (id: string, type: "folder" | "file") => void;
  onDelete: (id: string, type: "folder" | "file") => void;
  onDownload?: (id: string) => void;
}) {
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [onClose]);

  return (
    <div
      className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-xl py-1 min-w-[160px] text-[13px]"
      style={{ top: menu.y, left: menu.x }}
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={() => { onRename(menu.id, menu.type); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-slate-700"
      >
        <FontAwesomeIcon icon={faPencil} className="w-3.5 text-slate-400" />
        Rename
      </button>
      {menu.type === "file" && onDownload && (
        <button
          onClick={() => { onDownload(menu.id); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-slate-700"
        >
          <FontAwesomeIcon icon={faDownload} className="w-3.5 text-slate-400" />
          Download
        </button>
      )}
      <div className="my-1 border-t border-slate-100" />
      <button
        onClick={() => { onDelete(menu.id, menu.type); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 text-red-500"
      >
        <FontAwesomeIcon icon={faTrash} className="w-3.5" />
        Delete
      </button>
    </div>
  );
}

// ── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  files, index, onClose, onNav,
}: {
  files: MediaFile[];
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  const file = files[index];
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
      if (e.key === "ArrowRight" && index < files.length - 1) onNav(index + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, files.length, onClose, onNav]);

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>

      {index > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onNav(index - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}
      {index < files.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNav(index + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      )}

      <div onClick={e => e.stopPropagation()} className="flex flex-col items-center max-w-5xl w-full px-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.url}
          alt={file.name}
          className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
        />
        <div className="mt-4 text-white/80 text-sm text-center">
          <p className="font-medium text-white">{file.name}</p>
          <p className="text-xs mt-0.5 text-white/50">
            {formatBytes(file.size)} · {formatDate(file.uploadedAt)} · {index + 1} / {files.length}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(INITIAL_MEDIA);
  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
  const [lightbox, setLightbox] = useState<{ files: MediaFile[]; index: number } | null>(null);
  const [renameDialog, setRenameDialog] = useState<{ id: string; type: "folder" | "file"; name: string } | null>(null);
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; progress: number }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [renameName, setRenameName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFolder = folders.find(f => f.id === currentFolderId)!;
  const breadcrumb = getBreadcrumb(folders, currentFolderId);
  const subFolders = folders.filter(f => f.parentId === currentFolderId);
  const filesInFolder = mediaFiles.filter(f =>
    f.folderId === currentFolderId &&
    (search === "" || f.name.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredFolders = subFolders.filter(f =>
    search === "" || f.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  function openCtxMenu(e: React.MouseEvent, type: "folder" | "file", id: string) {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, type, id });
  }

  function handleDelete(id: string, type: "folder" | "file") {
    if (type === "folder") {
      // Recursively delete folder and all children
      function collectIds(folderId: string): string[] {
        const children = folders.filter(f => f.parentId === folderId).map(f => f.id);
        return [folderId, ...children.flatMap(collectIds)];
      }
      const toDelete = new Set(collectIds(id));
      setFolders(prev => prev.filter(f => !toDelete.has(f.id)));
      setMediaFiles(prev => prev.filter(m => !toDelete.has(m.folderId)));
      if (toDelete.has(currentFolderId)) {
        const parent = folders.find(f => f.id === id)?.parentId ?? "root";
        setCurrentFolderId(parent);
      }
    } else {
      setMediaFiles(prev => prev.filter(m => m.id !== id));
    }
  }

  function handleRenameOpen(id: string, type: "folder" | "file") {
    const name = type === "folder"
      ? folders.find(f => f.id === id)?.name ?? ""
      : mediaFiles.find(m => m.id === id)?.name ?? "";
    setRenameDialog({ id, type, name });
    setRenameName(name);
  }

  function handleRenameSubmit() {
    if (!renameDialog || !renameName.trim()) return;
    if (renameDialog.type === "folder") {
      setFolders(prev => prev.map(f => f.id === renameDialog.id ? { ...f, name: renameName.trim() } : f));
    } else {
      setMediaFiles(prev => prev.map(m => m.id === renameDialog.id ? { ...m, name: renameName.trim() } : m));
    }
    setRenameDialog(null);
  }

  function handleNewFolder() {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: generateId(),
      name: newFolderName.trim(),
      parentId: currentFolderId,
      createdAt: new Date().toISOString().slice(0, 10),
      color: newFolderColor,
    };
    setFolders(prev => [...prev, newFolder]);
    setNewFolderDialog(false);
    setNewFolderName("");
    setNewFolderColor(FOLDER_COLORS[0]);
  }

  function simulateUpload(files: File[]) {
    const items = files.map(f => ({ name: f.name, progress: 0 }));
    setUploadProgress(prev => [...prev, ...items]);

    files.forEach((file, fileIdx) => {
      const startIdx = uploadProgress.length + fileIdx;
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          // Add to state
          const url = URL.createObjectURL(file);
          const newFile: MediaFile = {
            id: generateId(),
            name: file.name,
            type: file.type.startsWith("video") ? "video" : "image",
            url,
            size: file.size,
            uploadedAt: new Date().toISOString().slice(0, 10),
            folderId: currentFolderId,
            mimeType: file.type,
          };
          setMediaFiles(prev => [...prev, newFile]);
          setUploadProgress(prev => prev.filter((_, i) => i !== startIdx));
        } else {
          setUploadProgress(prev => prev.map((item, i) =>
            i === startIdx ? { ...item, progress } : item
          ));
        }
      }, 150);
    });
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) simulateUpload(Array.from(e.target.files));
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) simulateUpload(Array.from(e.dataTransfer.files));
  }

  // Total stats
  const totalFiles = mediaFiles.filter(m => m.folderId === currentFolderId).length;
  const totalSize = mediaFiles.filter(m => m.folderId === currentFolderId).reduce((a, m) => a + m.size, 0);

  return (
    <>
        <div className="flex flex-1 overflow-hidden h-full">
          {/* ── Left Sidebar: Folder Tree ─────────────────────────────── */}
          <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
            <div className="px-3 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Folders</span>
              <button
                onClick={() => setNewFolderDialog(true)}
                title="New folder"
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <FontAwesomeIcon icon={faFolderPlus} className="w-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2">
              <FolderTree
                folders={folders}
                mediaFiles={mediaFiles}
                currentFolderId={currentFolderId}
                onSelect={setCurrentFolderId}
              />
            </div>
          </aside>

          {/* ── Main Area ────────────────────────────────────────────── */}
          <main
            className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-colors ${dragOver ? "bg-blue-50" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {/* Toolbar */}
            <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-3 shrink-0">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 text-[12.5px] flex-1 min-w-0 overflow-hidden">
                {breadcrumb.map((crumb, i) => (
                  <span key={crumb.id} className="flex items-center gap-1 min-w-0">
                    {i > 0 && <FontAwesomeIcon icon={faChevronRight} className="w-2 text-slate-300 shrink-0" />}
                    <button
                      onClick={() => setCurrentFolderId(crumb.id)}
                      className={`truncate transition-colors ${
                        i === breadcrumb.length - 1
                          ? "text-slate-800 font-semibold"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {i === 0 ? <FontAwesomeIcon icon={faImages} className="w-3.5" /> : crumb.name}
                    </button>
                  </span>
                ))}
              </nav>

              {/* Info */}
              <span className="text-[11px] text-slate-400 shrink-0">
                {totalFiles} file{totalFiles !== 1 ? "s" : ""} · {formatBytes(totalSize)}
              </span>

              {/* Search */}
              <div className="relative shrink-0">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 text-slate-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-7 h-8 w-44 text-[12.5px]"
                />
              </div>

              {/* View toggle */}
              <div className="flex items-center border border-slate-200 rounded-md overflow-hidden shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`w-8 h-8 flex items-center justify-center text-[12px] transition-colors ${viewMode === "grid" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <FontAwesomeIcon icon={faTableCells} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`w-8 h-8 flex items-center justify-center text-[12px] transition-colors ${viewMode === "list" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <FontAwesomeIcon icon={faTableList} />
                </button>
              </div>

              {/* New folder */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewFolderDialog(true)}
                className="h-8 text-[12.5px] gap-1.5 shrink-0"
              >
                <FontAwesomeIcon icon={faFolderPlus} className="w-3" />
                New Folder
              </Button>

              {/* Upload */}
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-[12.5px] gap-1.5 shrink-0 bg-[#007BFF] hover:bg-blue-600"
              >
                <FontAwesomeIcon icon={faCloudArrowUp} className="w-3.5" />
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {/* Upload progress */}
            {uploadProgress.length > 0 && (
              <div className="bg-blue-50 border-b border-blue-100 px-5 py-2 flex items-center gap-4 overflow-x-auto shrink-0">
                {uploadProgress.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 min-w-[160px]">
                    <FontAwesomeIcon icon={faCloudArrowUp} className="w-3 text-blue-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[11px] text-blue-700 truncate max-w-[100px]">{item.name}</p>
                      <div className="h-1 bg-blue-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-blue-500 shrink-0">{Math.round(item.progress)}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Drag-over overlay */}
            {dragOver && (
              <div className="absolute inset-0 z-50 bg-blue-500/10 border-2 border-dashed border-blue-400 flex items-center justify-center pointer-events-none rounded-lg m-4">
                <div className="flex flex-col items-center gap-2 text-blue-500">
                  <FontAwesomeIcon icon={faCloudArrowUp} className="w-10 h-10" />
                  <p className="text-lg font-semibold">Drop files here</p>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Subfolders */}
              {filteredFolders.length > 0 && (
                <section className="mb-5">
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Folders ({filteredFolders.length})
                  </h3>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {filteredFolders.map(folder => {
                        const count = mediaFiles.filter(m => m.folderId === folder.id).length;
                        return (
                          <div
                            key={folder.id}
                            onDoubleClick={() => setCurrentFolderId(folder.id)}
                            onContextMenu={e => openCtxMenu(e, "folder", folder.id)}
                            className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm cursor-pointer transition-all select-none"
                          >
                            <div
                              className="w-12 h-12 flex items-center justify-center rounded-xl"
                              style={{ background: folder.color + "22" }}
                            >
                              <FontAwesomeIcon
                                icon={faFolder}
                                className="w-7 h-7"
                                style={{ color: folder.color }}
                              />
                            </div>
                            <p className="text-[12px] font-medium text-slate-700 text-center leading-tight line-clamp-2">{folder.name}</p>
                            <p className="text-[10px] text-slate-400">{count} file{count !== 1 ? "s" : ""}</p>
                            <button
                              onContextMenu={e => e.stopPropagation()}
                              onClick={e => openCtxMenu(e, "folder", folder.id)}
                              className="absolute top-1.5 right-1.5 w-5 h-5 items-center justify-center rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 hidden group-hover:flex"
                            >
                              <FontAwesomeIcon icon={faEllipsisVertical} className="w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      {filteredFolders.map((folder, i) => {
                        const count = mediaFiles.filter(m => m.folderId === folder.id).length;
                        return (
                          <div
                            key={folder.id}
                            onDoubleClick={() => setCurrentFolderId(folder.id)}
                            onContextMenu={e => openCtxMenu(e, "folder", folder.id)}
                            className={`group flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${i > 0 ? "border-t border-slate-100" : ""}`}
                          >
                            <FontAwesomeIcon icon={faFolder} className="w-4 shrink-0" style={{ color: folder.color }} />
                            <span className="flex-1 text-[13px] text-slate-700 font-medium truncate">{folder.name}</span>
                            <span className="text-[11px] text-slate-400">{count} files</span>
                            <span className="text-[11px] text-slate-400">{formatDate(folder.createdAt)}</span>
                            <button
                              onClick={e => openCtxMenu(e, "folder", folder.id)}
                              className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100"
                            >
                              <FontAwesomeIcon icon={faEllipsisVertical} className="w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* Files */}
              {filesInFolder.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Files ({filesInFolder.length})
                  </h3>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {filesInFolder.map((file, idx) => (
                        <div
                          key={file.id}
                          onContextMenu={e => openCtxMenu(e, "file", file.id)}
                          className="group relative flex flex-col rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md cursor-pointer transition-all overflow-hidden"
                          onClick={() => setLightbox({ files: filesInFolder, index: idx })}
                        >
                          <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                            {file.type === "image" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                <FontAwesomeIcon icon={faVideo} className="w-8 text-white/60" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                          <div className="px-2 py-1.5">
                            <p className="text-[11.5px] font-medium text-slate-700 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
                          </div>
                          <button
                            onContextMenu={e => e.stopPropagation()}
                            onClick={e => { e.stopPropagation(); openCtxMenu(e, "file", file.id); }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 items-center justify-center rounded-full bg-white/80 text-slate-600 hover:bg-white shadow-sm hidden group-hover:flex"
                          >
                            <FontAwesomeIcon icon={faEllipsisVertical} className="w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      {filesInFolder.map((file, idx) => (
                        <div
                          key={file.id}
                          onContextMenu={e => openCtxMenu(e, "file", file.id)}
                          onClick={() => setLightbox({ files: filesInFolder, index: idx })}
                          className={`group flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors ${idx > 0 ? "border-t border-slate-100" : ""}`}
                        >
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-100 shrink-0">
                            {file.type === "image" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                <FontAwesomeIcon icon={faVideo} className="w-3 text-white/60" />
                              </div>
                            )}
                          </div>
                          <span className="flex-1 text-[13px] text-slate-700 font-medium truncate">{file.name}</span>
                          <span className="text-[11px] text-slate-400 capitalize">{file.type}</span>
                          <span className="text-[11px] text-slate-400">{formatBytes(file.size)}</span>
                          <span className="text-[11px] text-slate-400">{formatDate(file.uploadedAt)}</span>
                          <button
                            onClick={e => { e.stopPropagation(); openCtxMenu(e, "file", file.id); }}
                            className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100"
                          >
                            <FontAwesomeIcon icon={faEllipsisVertical} className="w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Empty state */}
              {filteredFolders.length === 0 && filesInFolder.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  {search ? (
                    <>
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="w-10 h-10 mb-3 text-slate-200" />
                      <p className="text-[14px] font-medium">No results for "{search}"</p>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faImages} className="w-12 h-12 mb-3 text-slate-200" />
                      <p className="text-[14px] font-medium">This folder is empty</p>
                      <p className="text-[12px] mt-1">Upload files or create a subfolder to get started</p>
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setNewFolderDialog(true)}
                          className="text-[12.5px] gap-1.5"
                        >
                          <FontAwesomeIcon icon={faFolderPlus} className="w-3" />
                          New Folder
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[12.5px] gap-1.5 bg-[#007BFF] hover:bg-blue-600"
                        >
                          <FontAwesomeIcon icon={faCloudArrowUp} className="w-3.5" />
                          Upload Media
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>

      {/* ── Context Menu ────────────────────────────────────────────────── */}
      {ctxMenu && (
        <ContextMenu
          menu={ctxMenu}
          onClose={() => setCtxMenu(null)}
          onRename={handleRenameOpen}
          onDelete={handleDelete}
          onDownload={id => {
            const file = mediaFiles.find(m => m.id === id);
            if (file) {
              const a = document.createElement("a");
              a.href = file.url;
              a.download = file.name;
              a.click();
            }
          }}
        />
      )}

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      {lightbox && (
        <Lightbox
          files={lightbox.files}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNav={i => setLightbox(prev => prev ? { ...prev, index: i } : null)}
        />
      )}

      {/* ── Rename Dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!renameDialog} onOpenChange={open => !open && setRenameDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename {renameDialog?.type === "folder" ? "Folder" : "File"}</DialogTitle>
          </DialogHeader>
          <Input
            value={renameName}
            onChange={e => setRenameName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleRenameSubmit()}
            autoFocus
            className="mt-2"
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRenameDialog(null)}>Cancel</Button>
            <Button onClick={handleRenameSubmit} className="bg-[#007BFF] hover:bg-blue-600">Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── New Folder Dialog ────────────────────────────────────────────── */}
      <Dialog open={newFolderDialog} onOpenChange={setNewFolderDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <Input
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleNewFolder()}
              placeholder="Folder name"
              autoFocus
            />
            <div>
              <p className="text-[12px] text-slate-500 mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {FOLDER_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewFolderColor(color)}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      background: color,
                      borderColor: newFolderColor === color ? "#334155" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setNewFolderDialog(false); setNewFolderName(""); }}>Cancel</Button>
            <Button
              onClick={handleNewFolder}
              disabled={!newFolderName.trim()}
              className="bg-[#007BFF] hover:bg-blue-600"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
