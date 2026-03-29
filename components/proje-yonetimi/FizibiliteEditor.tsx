"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  ChevronRight, Plus, Pencil, Trash2, Search,
  FileText, Save, Users, ArrowLeft, Printer, Download, CalendarDays,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { IconButton } from "../ui/IconButton";
import { Tabs, type TabItem } from "../ui/Tabs";
import { Select } from "../ui/Select";
import { INITIAL_NODES, TABLES } from "./fizibilite-data";
import type { FizNode, TableDef } from "./fizibilite-data";
import bigadicData from "./bigadic-fizibilite.json";

interface ProjectEntry {
  id: string;
  name: string;
}

const isBigadicProject = (projectId: string): boolean => {
  if (projectId === "bigadic") return true;
  if (typeof window === "undefined") return false;
  try {
    const list = JSON.parse(localStorage.getItem("proje_liste_v1") || "[]");
    if (!Array.isArray(list)) return false;
    return list.some((item: ProjectEntry) => typeof item?.id === "string" && typeof item?.name === "string" && item.id === projectId && /bigadi[cç]/i.test(item.name));
  } catch {
    return false;
  }
};

// ── Types ──────────────────────────────────────────────────────
interface NodeMeta {
  assignee?: string;
  startDate?: string;
  dueDate?: string;
}

interface DefinitionEntry {
  id: string;
  type: "tanim" | "kisaltma";
  term: string;
  desc: string;
}

interface NodeContent {
  html?: string;
  form?: Record<string, string>;
  tables?: Record<string, Record<string, string>>;
  meta?: NodeMeta;
}

type Contents = Record<string, NodeContent | DefinitionEntry[]>;

// ── Helpers ────────────────────────────────────────────────────
function deepClone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }

function findNode(nodes: FizNode[], id: string): FizNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) { const f = findNode(n.children, id); if (f) return f; }
  }
  return null;
}

function findPath(nodes: FizNode[], id: string, acc: FizNode[] = []): FizNode[] | null {
  for (const n of nodes) {
    const cur = [...acc, n];
    if (n.id === id) return cur;
    if (n.children?.length) { const f = findPath(n.children, id, cur); if (f) return f; }
  }
  return null;
}

function removeNode(nodes: FizNode[], id: string): FizNode[] {
  return nodes.reduce<FizNode[]>((a, n) => {
    if (n.id === id) return a;
    a.push({ ...n, children: n.children ? removeNode(n.children, id) : [] });
    return a;
  }, []);
}

function addChild(nodes: FizNode[], parentId: string | null, child: FizNode): FizNode[] {
  if (parentId === null) return [...nodes, child];
  return nodes.map(n => {
    if (n.id === parentId) return { ...n, children: [...(n.children || []), child] };
    if (n.children?.length) return { ...n, children: addChild(n.children, parentId, child) };
    return n;
  });
}

function renameNode(nodes: FizNode[], id: string, label: string): FizNode[] {
  return nodes.map(n => {
    if (n.id === id) return { ...n, label };
    if (n.children?.length) return { ...n, children: renameNode(n.children, id, label) };
    return n;
  });
}

const cleanLabel = (text: string) => text.replace(/^[a-z0-9.]+\s+/i, '');

function flattenNodes(nodes: FizNode[]): FizNode[] {
  const res: FizNode[] = [];
  const walk = (ns: FizNode[]) => ns.forEach(n => { res.push(n); if (n.children?.length) walk(n.children); });
  walk(nodes);
  return res;
}

function sanitizeExportHtml(html: string): string {
  return html
    .replace(/-{2,}\s*Page(?:\s*\(\d+\)|\s*\d+)?\s*Break\s*-{2,}(?:<br\s*\/?>\s*\d+)?/gi, "")
    .replace(/Page\s*Break/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function nodeMatchesSearch(n: FizNode, q: string): boolean {
  if (!q) return true;
  const ql = q.toLowerCase();
  if (n.label.toLowerCase().includes(ql)) return true;
  return n.children?.some(c => nodeMatchesSearch(c, ql)) ?? false;
}

function renderTocNodes(nodes: FizNode[], depth: number = 0): React.ReactNode {
  return nodes.map(n => {
    if (n.isToc || n.isDefinitions) return null;
    const pl = depth * 20;
    return (
      <React.Fragment key={n.id}>
        {depth === 0 ? (
          <p className="font-bold text-[14px] mt-4 mb-1 text-slate-800 dark:text-slate-200" style={{ paddingLeft: pl }}>{n.label}</p>
        ) : depth === 1 ? (
          <p className="text-[13px] my-1 text-slate-600 dark:text-slate-400" style={{ paddingLeft: pl }}>&nbsp;&nbsp;— {n.label}</p>
        ) : (
          <p className="text-[12px] my-0.5 text-slate-400 dark:text-slate-500" style={{ paddingLeft: pl }}>&nbsp;&nbsp;&nbsp;&nbsp;• {n.label}</p>
        )}
        {n.children?.length ? renderTocNodes(n.children, depth + 1) : null}
      </React.Fragment>
    );
  });
}

const ICON_MAP: Record<string, string> = {
  "file-text": "📄", "folder-open": "📂", "map-pin": "📍", "map-trifold": "🗺️",
  "chart-line": "📈", "money": "💰", "piggy-bank": "🐷", "storefront": "🏪",
  "trend-down": "📉", "warning": "⚠️", "leaf": "🌿", "users-three": "👥",
  "calendar-check": "📅", "check-circle": "✅", "paperclip": "📎",
  "identification-card": "🪪", "note-pencil": "📝", "frame-corners": "🖼️",
  "magnifying-glass-plus": "🔍", "globe": "🌐", "seal-check": "✔️",
  "scales": "⚖️", "buildings": "🏢", "handshake": "🤝", "flask": "🧪",
  "clipboard-text": "📋", "arrows-split": "↔️", "gear-six": "⚙️",
  "mountains": "⛰️", "crane": "🏗️", "person-arms-spread": "🙆", "house-line": "🏠",
  "chat-dots": "💬", "trend-up": "📈", "sliders": "🎚️", "bank": "🏦",
  "folder-simple": "📁", "credit-card": "💳", "calendar-dots": "📆",
  "binoculars": "🔭", "arrows-left-right": "↔️", "percent": "%", "chart-pie": "🥧",
  "arrows-down-up": "↕️", "ruler": "📏", "globe-hemisphere-west": "🌍",
  "chart-bar": "📊", "target": "🎯", "broadcast": "📡", "dice-five": "🎲",
  "shield-check": "🛡️", "plant": "🌱", "recycle": "♻️", "heart": "❤️",
  "city": "🌆", "office-chair": "🪑", "user-gear": "👤", "map-pin-line": "📍",
  "infinity": "♾️", "warning-octagon": "🚫", "file": "📄", "list-numbers": "📋",
  "book-open": "📖", "table": "📊", "info": "ℹ️", "users": "👥",
  "timer": "⏲️", "shield": "🛡️", "hammer": "🔨", "medal": "🏅", "trophy": "🏆",
  "currency-circle-dollar": "💲", "link": "🔗", "wrench": "🔧",
  "circle-dashed": "⭕", "magnifying-glass": "🔍",
};
const ni = (icon?: string) => ICON_MAP[icon || "file-text"] || "📄";

// ── MAIN COMPONENT ─────────────────────────────────────────────
export default function FizibiliteEditor({ projectId }: { projectId: string }) {
  const sk = `fiz5_${projectId}`;

  // Resolve project name from the list stored by ProjeListesi
  const projectName = (() => {
    if (typeof window === "undefined") return "";
    try {
      const list = JSON.parse(localStorage.getItem("proje_liste_v1") || "[]");
      return list.find((p: { id: string; name: string }) => p.id === projectId)?.name || "";
    } catch { return ""; }
  })();

  const [nodes, setNodes] = useState<FizNode[]>(() => {
    if (typeof window === "undefined") return deepClone(INITIAL_NODES);
    try { const s = localStorage.getItem(`${sk}_n`); return s ? JSON.parse(s) : deepClone(INITIAL_NODES); }
    catch { return deepClone(INITIAL_NODES); }
  });

  const [contents, setContents] = useState<Contents>(() => {
    if (typeof window === "undefined") return {};
    try {
      const s = localStorage.getItem(`${sk}_c`);
      if (s) return JSON.parse(s);
      if (isBigadicProject(projectId)) {
        const imported = deepClone(bigadicData.contents as Contents);
        Object.entries(imported).forEach(([key, value]) => {
          if (!Array.isArray(value) && value?.html) value.html = sanitizeExportHtml(value.html);
        });
        return imported;
      }
      return {};
    } catch {
      if (isBigadicProject(projectId)) {
        const imported = deepClone(bigadicData.contents as Contents);
        Object.entries(imported).forEach(([key, value]) => {
          if (!Array.isArray(value) && value?.html) value.html = sanitizeExportHtml(value.html);
        });
        return imported;
      }
      return {};
    }
  });

  const [openNodes, setOpenNodes] = useState<Set<string>>(() => {
    const top = new Set(INITIAL_NODES.map(n => n.id));
    if (typeof window === "undefined") return top;
    try { const s = localStorage.getItem(`${sk}_o`); return s ? new Set(JSON.parse(s)) : top; }
    catch { return top; }
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("text");
  const [isDirty, setIsDirty] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Değişiklik yok");
  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [addingTo, setAddingTo] = useState<string | null | false>(false);
  const [newLabel, setNewLabel] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [baFilter, setBaFilter] = useState("all");
  const [baData, setBaData] = useState<Record<string, NodeMeta>>({});
  const [baGlobal, setBaGlobal] = useState({ assignee: "", startDate: "", dueDate: "" });
  const [baSelected, setBaSelected] = useState<Set<string>>(new Set());

  const flatNodes = flattenNodes(nodes);
  const isAllExpanded = openNodes.size >= flatNodes.length;

  const toggleAll = () => {
    if (isAllExpanded) {
      setOpenNodes(new Set(INITIAL_NODES.map(n => n.id)));
    } else {
      setOpenNodes(new Set(flatNodes.map(n => n.id)));
    }
  };

  const rteRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const activePath = activeId ? findPath(nodes, activeId) : null;
  const activeNode = activePath ? activePath[activePath.length - 1] : null;

  const getNodeContent = (id: string): NodeContent => (contents[id] as NodeContent) || {};
  const getDefs = (): DefinitionEntry[] => (contents["__definitions"] as DefinitionEntry[]) || [];

  const markDirty = useCallback(() => setIsDirty(true), []);

  const patchContent = useCallback((id: string, patch: Partial<NodeContent>) => {
    setContents(prev => ({ ...prev, [id]: { ...(prev[id] as NodeContent), ...patch } }));
    setIsDirty(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(`${sk}_c`, JSON.stringify(contents));
        localStorage.setItem(`${sk}_n`, JSON.stringify(nodes));
        localStorage.setItem(`${sk}_o`, JSON.stringify([...openNodes]));
        setIsDirty(false);
        setStatusMsg("Kaydedildi ✓");
        setTimeout(() => setStatusMsg("Değişiklik yok"), 2000);
      } catch { setStatusMsg("Kayıt hatası!"); }
    }, 800);
    return () => clearTimeout(t);
  }, [isDirty, contents, nodes, openNodes]);

  // Populate RTE when node/tab changes
  useEffect(() => {
    if (activeTab === "text" && activeId && rteRef.current) {
      rteRef.current.innerHTML = getNodeContent(activeId).html || "";
    }
  }, [activeId, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeId || !nodes.length) return;
    const firstNodeId = nodes[0]?.children?.[0]?.id || nodes[0]?.id;
    if (firstNodeId) setActiveId(firstNodeId);
  }, [activeId, nodes]);


  // Focus rename input
  useEffect(() => {
    if (renamingId) setTimeout(() => renameRef.current?.focus(), 0);
  }, [renamingId]);

  // ── Node ops ──
  const selectNode = (id: string) => {
    const node = findNode(nodes, id);
    if (!node) return;
    setActiveId(id);
    if (node.isToc) setActiveTab("toc");
    else if (node.isDefinitions) setActiveTab("definitions");
    else setActiveTab("text");
  };

  const toggle = (id: string) => setOpenNodes(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const expandAll = toggleAll;

  const startRename = (node: FizNode) => { setRenamingId(node.id); setRenameVal(node.label); };

  const commitRename = () => {
    if (renamingId && renameVal.trim()) { setNodes(p => renameNode(p, renamingId, renameVal.trim())); setIsDirty(true); }
    setRenamingId(null);
  };

  const deleteNode = (id: string) => {
    const node = findNode(nodes, id);
    if (!node) return;
    const msg = node.children?.length
      ? `"${node.label}" ve tüm alt başlıkları silinecek. Emin misiniz?`
      : `"${node.label}" silinecek. Emin misiniz?`;
    if (!confirm(msg)) return;
    setNodes(p => removeNode(p, id));
    if (activeId === id) setActiveId(null);
    setIsDirty(true);
  };

  const doAddNode = (parentId: string | null) => {
    if (!newLabel.trim()) return;
    const parent = parentId ? findNode(nodes, parentId) : null;
    const newNode: FizNode = {
      id: `custom_${Date.now()}`,
      label: newLabel.trim(),
      level: parent ? parent.level + 1 : 0,
      icon: "file-text", hint: "", children: [], isCustom: true,
    };
    setNodes(p => addChild(p, parentId, newNode));
    setOpenNodes(p => { const n = new Set(p); if (parentId) n.add(parentId); n.add(newNode.id); return n; });
    setNewLabel(""); setAddingTo(false);
    setIsDirty(true);
    selectNode(newNode.id);
  };

  // ── Definitions ──
  const addDef = (type: "tanim" | "kisaltma") => {
    const defs = getDefs();
    const entry: DefinitionEntry = { id: `def_${Date.now()}`, type, term: "", desc: "" };
    setContents(p => ({ ...p, __definitions: [...defs, entry] }));
    setIsDirty(true);
  };

  const updateDef = (id: string, field: "term" | "desc", val: string) => {
    setContents(p => ({ ...p, __definitions: getDefs().map(d => d.id === id ? { ...d, [field]: val } : d) }));
    setIsDirty(true);
  };

  const deleteDef = (id: string) => {
    setContents(p => ({ ...p, __definitions: getDefs().filter(d => d.id !== id) }));
    setIsDirty(true);
  };

  // ── Bulk Assign Modal ──
  const openModal = () => {
    const flat = flattenNodes(nodes);
    const data: Record<string, NodeMeta> = {};
    flat.forEach(n => { data[n.id] = { ...(getNodeContent(n.id).meta || {}) }; });
    setBaData(data); setBaGlobal({ assignee: "", startDate: "", dueDate: "" }); setBaSelected(new Set());
    setShowModal(true);
  };

  const saveModal = () => {
    setContents(prev => {
      const next = { ...prev };
      Object.entries(baData).forEach(([id, meta]) => {
        next[id] = { ...(next[id] as NodeContent), meta };
      });
      return next;
    });
    setIsDirty(true); setShowModal(false);
  };

  const applyBaGlobal = () => {
    const targets = baSelected.size > 0 ? [...baSelected] : Object.keys(baData);
    setBaData(prev => {
      const next = { ...prev };
      targets.forEach(id => {
        next[id] = {
          assignee: baGlobal.assignee || next[id]?.assignee || "",
          startDate: baGlobal.startDate || next[id]?.startDate || "",
          dueDate: baGlobal.dueDate || next[id]?.dueDate || "",
        };
      });
      return next;
    });
  };


  const manualSave = () => {
    try {
      localStorage.setItem(`${sk}_c`, JSON.stringify(contents));
      localStorage.setItem(`${sk}_n`, JSON.stringify(nodes));
      localStorage.setItem(`${sk}_o`, JSON.stringify([...openNodes]));
      setIsDirty(false); setStatusMsg("Kaydedildi ✓");
      setTimeout(() => setStatusMsg("Değişiklik yok"), 2000);
    } catch { setStatusMsg("Kayıt hatası!"); }
  };

  const execCmd = (cmd: string) => {
    if (cmd.startsWith("formatBlock_")) document.execCommand("formatBlock", false, cmd.split("_")[1]);
    else document.execCommand(cmd, false, undefined);
    rteRef.current?.focus();
  };

  const handleRteInput = () => {
    if (activeId && rteRef.current) patchContent(activeId, { html: rteRef.current.innerHTML });
  };

  // ── Export Logic ──
  const generateExportHtml = () => {
    const flatNodes = flattenNodes(nodes);
    let html = `
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; line-height: 1.8; color: #333; padding: 20px; max-width: 900px; margin: 0 auto; text-align: justify; text-justify: inter-word; }
        h1 { color: #111; text-align: center; margin-bottom: 24px; font-size: 28px; border-bottom: 2px solid #eee; padding-bottom: 8px; font-weight: 700; }
        h2 { color: #1a1b26; margin-top: 24px; margin-bottom: 12px; font-size: 22px; border-bottom: 1px solid #eee; padding-bottom: 4px; font-weight: 600; }
        h3 { color: #1a1b26; margin-top: 18px; margin-bottom: 10px; font-size: 18px; font-weight: 600; }
        h4, h5, h6 { color: #333; margin-top: 14px; margin-bottom: 8px; font-size: 15px; font-weight: 600; }
        .meta { font-size: 12px; color: #555; background: #f8fafc; padding: 10px 15px; border-left: 3px solid #6366f1; margin-bottom: 20px; border-radius: 0 4px 4px 0; }
        .meta div { margin-bottom: 4px; }
        .meta div:last-child { margin-bottom: 0; }
        .content { margin-bottom: 30px; text-align: justify; text-justify: inter-word; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
        th { background-color: #f1f5f9; font-weight: 600; }
      </style>
      <h1>${projectName || "Proje Çıktısı"}</h1>
    `;

    flatNodes.forEach(node => {
      if (node.isToc) return;
      
      const level = node.level + 2; 
      const HeadingTag = `h${Math.min(level, 6)}`;
      const icon = node.level === 0 ? ni(node.icon) : "";
      
      html += `<${HeadingTag}>${icon} ${node.label}</${HeadingTag}>`;
      
      const content = contents[node.id] as NodeContent;
      if (content) {
        if (content.meta?.assignee || content.meta?.startDate || content.meta?.dueDate) {
          html += `<div class="meta">`;
          if (content.meta.assignee) html += `<div><strong>Görevli:</strong> ${content.meta.assignee}</div>`;
          if (content.meta.startDate) html += `<div><strong>Başlangıç:</strong> ${content.meta.startDate}</div>`;
          if (content.meta.dueDate) html += `<div><strong>Bitiş:</strong> ${content.meta.dueDate}</div>`;
          html += `</div>`;
        }
        
        if (content.html && content.html.trim() !== '<p><br></p>') {
          const cleaned = sanitizeExportHtml(content.html);
          if (cleaned) html += `<div class="content">${cleaned}</div>`;
        }
        
        if (content.form && Object.keys(content.form).length > 0) {
           html += `<table><tbody>`;
           Object.entries(content.form).forEach(([key, val]) => {
             if(val) html += `<tr><td style="width:35%"><strong>${key}</strong></td><td>${val}</td></tr>`;
           });
           html += `</tbody></table>`;
        }

        if (content.tables && Object.keys(content.tables).length > 0) {
           Object.entries(content.tables).forEach(([tid, tableData]) => {
             const tDef = TABLES[tid];
             if (tDef && Object.keys(tableData).length > 0) {
               html += `<div style="margin-bottom:8px;font-weight:bold;font-size:13px">${tDef.title}</div><table><tbody>`;
               Object.entries(tableData).forEach(([rowKey, val]) => {
                 if(val) html += `<tr><td style="width:50%">${rowKey}</td><td>${val}</td></tr>`;
               });
               html += `</tbody></table>`;
             }
           });
        }
      }
      
      if (node.isDefinitions) {
        const defs = getDefs();
        if (defs.length > 0) {
          html += `<table><thead><tr><th>Tür</th><th>Terim / Kısaltma</th><th>Açıklama</th></tr></thead><tbody>`;
          defs.forEach(d => {
            html += `<tr><td>${d.type === 'tanim' ? 'Tanım' : 'Kısaltma'}</td><td>${d.term}</td><td>${d.desc}</td></tr>`;
          });
          html += `</tbody></table>`;
        }
      }
    });

    return html;
  };

  const exportToPdf = () => {
    const htmlContent = generateExportHtml();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Lütfen pop-up engelleyiciyi kapatın.');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${projectName || "PDF Çıktısı"}</title></head><body>${htmlContent}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const exportToWord = () => {
    const htmlContent = generateExportHtml();
    const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const postHtml = "</body></html>";
    const html = preHtml + htmlContent + postHtml;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (projectName || "Proje") + '.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Filtered tree ──
  const baFilteredNodes = (() => {
    const flat = flattenNodes(nodes);
    return flat.filter(n => {
      if (baFilter === "all") return true;
      if (baFilter === "unassigned") return !baData[n.id]?.assignee;
      return n.level === Number(baFilter);
    });
  })();

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full -m-4 bg-slate-50 dark:bg-slate-950 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      {/* ── TopBar ── */}
      <div className="h-14 flex items-center gap-3 px-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-sm z-10" style={{ alignItems: "center" }}>
        <Link
          href="/proje-yonetimi"
          className="flex items-center justify-center w-7 h-7 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors flex-shrink-0"
          title="Proje listesine dön"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-violet-600 rounded-md flex items-center justify-center flex-shrink-0">
          <FileText className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
            {projectName || "Fizibilite Etüdü Editörü"}
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">EK K-1 Format</div>
        </div>
        <div className="flex-1" />
        <Button size="xs" variant="outline" onClick={toggleAll} iconLeft={isAllExpanded ? <ChevronRight className="rotate-90 w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}>
          {isAllExpanded ? "Tümünü Kapat" : "Tümünü Aç"}
        </Button>
        <Button size="xs" variant="outline" onClick={openModal} iconLeft={<Users className="w-3.5 h-3.5" />}>
          Görev Ata
        </Button>
        <Button size="xs" variant="outline" onClick={exportToWord} iconLeft={<Download className="w-3.5 h-3.5" />}>
          Word İndir
        </Button>
        <Button size="xs" variant="outline" onClick={exportToPdf} iconLeft={<Printer className="w-3.5 h-3.5" />}>
          PDF Yazdır
        </Button>
        <Button size="xs" variant={isDirty ? "primary" : "success"} onClick={manualSave} iconLeft={<Save className="w-3.5 h-3.5" />}>
          Kaydet
        </Button>
      </div>

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Tree Sidebar ── */}
        <aside className="w-[360px] flex flex-col bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0">
          <div className="p-4 pb-3">
            <div className="relative">
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Başlık ara..."
                iconLeft={<Search className="w-4 h-4" />}
                className="!text-xs h-9 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2 pr-2 scrollbar-thin">
            {nodes.filter(n => nodeMatchesSearch(n, search)).map(node => (
              <TreeNodeItem
                key={node.id}
                node={node}
                depth={0}
                activeId={activeId}
                openNodes={openNodes}
                renamingId={renamingId}
                renameVal={renameVal}
                renameRef={renameRef}
                contents={contents}
                search={search}
                addingTo={addingTo}
                newLabel={newLabel}
                onSelect={selectNode}
                onToggle={toggle}
                onRenameStart={startRename}
                onRenameChange={setRenameVal}
                onRenameCommit={commitRename}
                onDelete={deleteNode}
                onAddChild={id => { setAddingTo(id); setNewLabel(""); }}
                onNewLabelChange={setNewLabel}
                onAddConfirm={doAddNode}
                onAddCancel={() => setAddingTo(false)}
              />
            ))}
          </div>

          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 flex gap-2 bg-slate-50/50 dark:bg-slate-800/20">
            <Button
              onClick={() => { setAddingTo(null); setNewLabel(""); }}
              className="flex-1 font-semibold"
              variant="outline"
              size="xs"
              iconLeft={<Plus className="w-3 h-3" />}
            >
              Yeni Başlık
            </Button>
            <Button onClick={toggleAll} variant="outline" size="xs" title={isAllExpanded ? "Tümünü Kapat" : "Tümünü Aç"}>
              {isAllExpanded ? "−" : "＋"}
            </Button>
          </div>

          {addingTo === null && (
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 border-t border-blue-100 dark:border-blue-900 flex gap-2">
              <Input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") doAddNode(null); if (e.key === "Escape") setAddingTo(false); }}
                placeholder="Ana başlık adı..."
                autoFocus
                className="!text-xs"
              />
              <Button onClick={() => doAddNode(null)} variant="primary" size="xs">＋</Button>
              <Button onClick={() => setAddingTo(false)} variant="ghost" size="xs">✕</Button>
            </div>
          )}
        </aside>

        {/* ── Editor Panel ── */}
        {!activeNode ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="text-5xl opacity-20">📄</div>
            <div className="text-base font-semibold text-slate-400">Bir başlık seçin</div>
            <div className="text-sm text-slate-400">Sol panelden bir bölüm seçerek içerik ekleyebilirsiniz</div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Compact Header Area */}
            <div className="px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 flex items-center justify-between gap-6">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white tracking-tight leading-tight truncate max-w-[55%]">{cleanLabel(activeNode.label)}</h2>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                {activePath?.map((p, i) => (
                  <React.Fragment key={p.id}>
                    {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />}
                    <span className={clsx(
                      "text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded",
                      i === activePath.length - 1 
                        ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 ring-1 ring-blue-100 dark:ring-blue-800/50" 
                        : "text-slate-400 dark:text-slate-500"
                    )}>
                      {p.label}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Premium Task Meta Bar */}
            <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 flex gap-6 items-center flex-shrink-0 overflow-x-auto scrollbar-none">
              {([
                { key: "assignee" as const, label: "Görevli / Sorumlu", type: "text", ph: "Ad Soyad veya Birim", icon: <Users className="w-3.5 h-3.5" /> },
                { key: "startDate" as const, label: "Başlangıç Tarihi", type: "date", ph: "", icon: <CalendarDays className="w-3.5 h-3.5" /> },
                { key: "dueDate" as const, label: "Bitiş Tarihi", type: "date", ph: "", icon: <CalendarDays className="w-3.5 h-3.5" /> },
              ] as const).map(f => (
                <div key={f.key} className="flex flex-col gap-1.5 min-w-[240px]">
                  <div className="flex items-center gap-1.5 ml-0.5">
                    <span className="text-blue-500 dark:text-blue-400">{f.icon}</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{f.label}</span>
                  </div>
                  <Input
                    type={f.type}
                    value={getNodeContent(activeId!).meta?.[f.key] || ""}
                    onChange={e => patchContent(activeId!, { meta: { ...getNodeContent(activeId!).meta, [f.key]: e.target.value } })}
                    placeholder={f.ph}
                    className="!text-xs font-semibold h-9"
                  />
                </div>
              ))}
            </div>

            {/* Horizontal Tabs Migration */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <Tabs
                variant="filled"
                className="flex-1 min-h-0 overflow-hidden"
                activeKey={activeTab}
                onChange={setActiveTab}
                items={(() => {
                  const items: TabItem[] = [];
                  if (!activeNode) return items;

                  // 1. Text / Toc / Definitions
                  if (activeNode.isToc) {
                    items.push({ 
                      key: "toc", 
                      label: "İçindekiler", 
                      icon: <span>📋</span>,
                      content: (
                        <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col m-8">
                          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">📑 Otomatik İçindekiler</span>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => { /* No-op: automatic re-render on state changes */ }}
                            >↻ Listeyi Yenile</Button>
                          </div>
                          <div key={`toc-body-${activeId}`} className="flex-1 p-8 outline-none text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 overflow-y-auto">
                            {renderTocNodes(nodes)}
                          </div>
                        </div>
                      )
                    });
                  } else if (activeNode.isDefinitions) {
                    items.push({ 
                      key: "definitions", 
                      label: "Tanım ve Kısaltmalar", 
                      icon: <span>📖</span>,
                      content: (
                        <div key="definitions-root" className="flex-1 min-h-0 p-8 max-w-5xl w-full mx-auto overflow-hidden flex flex-col">
                          <div className="flex gap-2 mb-6 flex-shrink-0">
                            <Button onClick={() => addDef("tanim")} variant="outline" size="sm" iconLeft={<Plus className="w-4 h-4" />}>Tanım Ekle</Button>
                            <Button onClick={() => addDef("kisaltma")} variant="outline" size="sm" iconLeft={<Plus className="w-4 h-4" />}>Kısaltma Ekle</Button>
                          </div>
                          <div className="flex-1 min-h-0 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-auto">
                              <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10">
                                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
                                    <th className="px-5 py-3.5 text-left w-24">Tür</th>
                                    <th className="px-5 py-3.5 text-left">Terim / Kısaltma</th>
                                    <th className="px-5 py-3.5 text-left">Açıklama</th>
                                    <th className="px-4 py-3.5 w-12" />
                                  </tr>
                                </thead>
                                <tbody>
                                  {getDefs().length === 0 ? (
                                    <tr>
                                      <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-4">
                                          <span className="text-6xl opacity-20">📖</span>
                                          <div className="text-sm font-bold text-slate-500">Henüz tanım eklenmedi</div>
                                        </div>
                                      </td>
                                    </tr>
                                  ) : (
                                    getDefs().map(d => (
                                      <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-5 py-3">
                                          <span className={clsx("inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider", d.type === "tanim" ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300" : "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300")}>
                                            {d.type === "tanim" ? "Tanım" : "Kısaltma"}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2"><Input value={d.term} onChange={e => updateDef(d.id, "term", e.target.value)} className="!text-xs font-semibold bg-transparent border-transparent focus:border-blue-500" /></td>
                                        <td className="px-3 py-2"><Input value={d.desc} onChange={e => updateDef(d.id, "desc", e.target.value)} className="!text-xs bg-transparent border-transparent focus:border-blue-500" /></td>
                                        <td className="px-4 py-2 text-center"><IconButton variant="delete" icon={<Trash2 className="w-4 h-4" />} onClick={() => deleteDef(d.id)} /></td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )
                    });
                  } else {
                    items.push({ 
                      key: "text", 
                      label: "Metin", 
                      icon: <span>✏️</span>,
                      content: (
                        <div key="text-root" className="flex-1 min-h-0 p-8 max-w-5xl w-full mx-auto flex flex-col">
                          <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col">
                            <RteToolbar execCmd={execCmd} rteRef={rteRef} />
                            <div ref={rteRef} contentEditable suppressContentEditableWarning onInput={handleRteInput} onKeyDown={e => { if (e.key === "Tab") { e.preventDefault(); document.execCommand("insertText", false, "    "); } }} className="flex-1 p-8 outline-none text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 overflow-y-auto rte-body" />
                          </div>
                        </div>
                      )
                    });
                  }

                  // 2. Form Fields
                  if (activeNode.formFields?.length) {
                    items.push({
                      key: "form",
                      label: "Form Alanları",
                      icon: <span>☰</span>,
                      content: (
                        <div className="flex-1 min-h-0 overflow-y-auto p-8 max-w-4xl w-full mx-auto">
                          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                            {activeNode.formFields.map((field, i) => (
                              <div key={field} className={clsx("grid", i < activeNode.formFields!.length - 1 && "border-b border-slate-100 dark:border-slate-800/50")} style={{ gridTemplateColumns: "240px 1fr" }}>
                                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 flex items-center leading-relaxed">{field}</div>
                                <Input value={getNodeContent(activeId!).form?.[field] || ""} onChange={e => patchContent(activeId!, { form: { ...getNodeContent(activeId!).form, [field]: e.target.value } })} className="!text-sm font-medium bg-transparent border-transparent focus:bg-blue-50/50 dark:focus:bg-blue-900/10" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    });
                  }

                  // 3. Tables
                  activeNode.tables?.forEach(tid => {
                    const t = TABLES[tid];
                    if (t) {
                      const short = t.title.replace(/\(TL\)/g, "").replace(/Tablo\s*\d+\.\s*/, "").trim();
                      items.push({
                        key: `t_${tid}`,
                        label: short.length > 32 ? short.slice(0, 30) + "…" : short,
                        icon: <span>⊞</span>,
                        content: (
                          <TablePanel key={tid} def={t} data={getNodeContent(activeId!).tables?.[tid] || {}} onCellChange={(key, val) => patchContent(activeId!, { tables: { ...getNodeContent(activeId!).tables, [tid]: { ...getNodeContent(activeId!).tables?.[tid], [key]: val } } })} />
                        )
                      });
                    }
                  });

                  return items;
                })()}
              />
            </div>

            {/* Status Bar */}
            <div className="px-7 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 flex-shrink-0">
              <div className={clsx("w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors", isDirty ? "bg-amber-400" : "bg-emerald-400")} />
              <span className="text-xs text-slate-400">{statusMsg}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bulk Assign Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-md shadow-2xl w-[760px] max-w-[94vw] max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <Users className="w-5 h-5 text-violet-600" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex-1">Toplu Görev Atama</h3>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {/* Global apply */}
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md mb-4 items-center">
                <span className="text-xs font-semibold text-slate-500">Seçilenlere uygula:</span>
                <input type="text" value={baGlobal.assignee} onChange={e => setBaGlobal(p => ({ ...p, assignee: e.target.value }))} placeholder="Görevli adı..." className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 flex-1 min-w-28 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300" />
                <input type="date" value={baGlobal.startDate} onChange={e => setBaGlobal(p => ({ ...p, startDate: e.target.value }))} className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300" />
                <input type="date" value={baGlobal.dueDate} onChange={e => setBaGlobal(p => ({ ...p, dueDate: e.target.value }))} className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300" />
                <Button onClick={applyBaGlobal} variant="primary" size="xs">Uygula</Button>
              </div>
              {/* Filters */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[["all", "Tüm Görevler"], ["0", "Ana Başlıklar"], ["1", "Alt Başlıklar"], ["2", "Alt-Alt Başlıklar"], ["unassigned", "Atanmamışlar"]].map(([v, l]) => (
                  <Button key={v} onClick={() => setBaFilter(v)} variant={baFilter === v ? "primary" : "outline"} size="xs">{l}</Button>
                ))}
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="px-2 py-2 w-8">
                      <input type="checkbox" onChange={e => setBaSelected(e.target.checked ? new Set(baFilteredNodes.map(n => n.id)) : new Set())} className="w-3.5 h-3.5 cursor-pointer" />
                    </th>
                    <th className="px-3 py-2 text-left">Görev / Bölüm</th>
                    <th className="px-2 py-2 text-left w-36">Görevli</th>
                    <th className="px-2 py-2 text-left w-28">Başlangıç</th>
                    <th className="px-2 py-2 text-left w-28">Bitiş</th>
                  </tr>
                </thead>
                <tbody>
                  {baFilteredNodes.map(n => (
                    <tr key={n.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-2 py-1.5 text-center">
                        <input type="checkbox" checked={baSelected.has(n.id)} onChange={() => setBaSelected(p => { const nx = new Set(p); nx.has(n.id) ? nx.delete(n.id) : nx.add(n.id); return nx; })} className="w-3.5 h-3.5 cursor-pointer" />
                      </td>
                      <td className="px-3 py-1.5">
                        <span style={{ paddingLeft: `${n.level * 14}px` }} className={clsx("text-slate-600 dark:text-slate-400", n.level === 0 && "font-bold text-slate-800 dark:text-slate-200")}>
                          {ni(n.icon)} {n.label}
                        </span>
                      </td>
                      <td className="px-1.5 py-1">
                        <input type="text" value={baData[n.id]?.assignee || ""} onChange={e => setBaData(p => ({ ...p, [n.id]: { ...p[n.id], assignee: e.target.value } }))} placeholder="—" className="w-full px-2 py-1 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-md text-xs focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none bg-transparent text-slate-700 dark:text-slate-300" />
                      </td>
                      <td className="px-1.5 py-1">
                        <input type="date" value={baData[n.id]?.startDate || ""} onChange={e => setBaData(p => ({ ...p, [n.id]: { ...p[n.id], startDate: e.target.value } }))} className="w-full px-2 py-1 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-md text-xs focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none bg-transparent text-slate-700 dark:text-slate-300" />
                      </td>
                      <td className="px-1.5 py-1">
                        <input type="date" value={baData[n.id]?.dueDate || ""} onChange={e => setBaData(p => ({ ...p, [n.id]: { ...p[n.id], dueDate: e.target.value } }))} className="w-full px-2 py-1 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-md text-xs focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none bg-transparent text-slate-700 dark:text-slate-300" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={() => setShowModal(false)} variant="outline">Kapat</Button>
              <Button onClick={saveModal} variant="primary" iconLeft={<Save className="w-4 h-4" />}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RTE Toolbar ─────────────────────────────────────────────────
function RteToolbar({ execCmd, rteRef }: { execCmd: (cmd: string) => void; rteRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="flex flex-wrap gap-0.5 p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-b-0 rounded-t-md items-center">
      {[
        { cmd: "undo", label: "↩", tip: "Geri Al" },
        { cmd: "redo", label: "↪", tip: "Yeniden Yap" },
        null,
        { cmd: "bold", label: "B", tip: "Kalın", bold: true },
        { cmd: "italic", label: "I", tip: "İtalik", italic: true },
        { cmd: "underline", label: "U", tip: "Altı Çizili", underline: true },
        { cmd: "strikeThrough", label: "S", tip: "Üstü Çizili", strike: true },
        null,
        "heading",
        null,
        { cmd: "insertUnorderedList", label: "≡•", tip: "Madde Listesi" },
        { cmd: "insertOrderedList", label: "≡1", tip: "Numaralı Liste" },
        { cmd: "indent", label: "→|", tip: "Girinti Artır" },
        { cmd: "outdent", label: "|←", tip: "Girinti Azalt" },
        null,
        { cmd: "justifyLeft", label: "⬡L", tip: "Sola Hizala" },
        { cmd: "justifyCenter", label: "⬡C", tip: "Ortaya Hizala" },
        { cmd: "justifyRight", label: "⬡R", tip: "Sağa Hizala" },
        null,
        { cmd: "formatBlock_blockquote", label: "\" \"", tip: "Alıntı" },
        { cmd: "removeFormat", label: "Tx", tip: "Formatı Temizle" },
      ].map((t, i) => {
        if (t === null) return <span key={i} className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 self-center flex-shrink-0" />;
        if (t === "heading") return (
          <Select
            key={i}
            options={[
              { label: "Normal", value: "" },
              { label: "Başlık 1", value: "h1" },
              { label: "Başlık 2", value: "h2" },
              { label: "Başlık 3", value: "h3" },
            ]}
            onChange={e => { if (e.target.value) document.execCommand("formatBlock", false, e.target.value); else document.execCommand("formatBlock", false, "p"); rteRef.current?.focus(); }}
            className="!h-7 !py-0 !text-[10px] w-28"
          />
        );
        const tool = t as { cmd: string; label: string; tip: string; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean };
        return (
          <button key={i} title={tool.tip} onMouseDown={e => { e.preventDefault(); execCmd(tool.cmd); }}
            className={clsx("min-w-[28px] h-7 px-2 text-xs border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-all",
              tool.bold && "font-bold", tool.italic && "italic", tool.underline && "underline", tool.strike && "line-through"
            )}
          >
            {tool.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Table Panel ─────────────────────────────────────────────────
function TablePanel({ def, data, onCellChange }: {
  def: TableDef;
  data: Record<string, string>;
  onCellChange: (key: string, val: string) => void;
}) {
  return (
    <div className="flex-1 overflow-auto p-5">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b-2 border-blue-500 inline-block pb-1.5 mb-2">{def.title}</h3>
      {def.note && <p className="text-xs text-slate-400 italic mb-3">{def.note}</p>}
      <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
        <table className="border-collapse bg-white dark:bg-slate-900 text-xs" style={{ minWidth: "500px", width: "100%" }}>
          <thead>
            <tr className="bg-blue-50 dark:bg-blue-950/60">
              {def.cols.map((col, i) => (
                <th key={i} className="px-3 py-2.5 text-left font-semibold text-slate-700 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-700 border-r border-slate-200 dark:border-slate-700 last:border-r-0 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {def.yearTable ? (
              <>
                {def.years?.map(yr => (
                  <tr key={yr} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-1.5 bg-blue-50/60 dark:bg-blue-950/30 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">{yr}</td>
                    {def.cols.slice(1).map((_, ci) => {
                      const key = `${yr}_${ci + 1}`;
                      return (
                        <td key={ci} className="border-r border-slate-100 dark:border-slate-800 last:border-r-0 p-0">
                          <input type="text" value={data[key] || ""} onChange={e => onCellChange(key, e.target.value)} placeholder="—" className="w-full min-w-20 px-2.5 py-2 bg-transparent outline-none focus:bg-blue-50 dark:focus:bg-blue-950/30 text-slate-700 dark:text-slate-300 transition-colors" />
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {def.footer?.map(fl => (
                  <tr key={fl} className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <td className="px-3 py-1.5 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">{fl}</td>
                    {def.cols.slice(1).map((_, ci) => {
                      const key = `footer_${fl}_${ci + 1}`;
                      return (
                        <td key={ci} className="border-r border-slate-100 dark:border-slate-800 last:border-r-0 p-0">
                          <input type="text" value={data[key] || ""} onChange={e => onCellChange(key, e.target.value)} placeholder="—" className="w-full min-w-20 px-2.5 py-2 bg-transparent outline-none focus:bg-blue-50 dark:focus:bg-blue-950/30 text-slate-700 dark:text-slate-300 font-semibold transition-colors" />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ) : (
              def.rows?.map((row, ri) => {
                if (row.section && !row.bold) return (
                  <tr key={ri} className="bg-blue-50/60 dark:bg-blue-950/30">
                    <td colSpan={def.cols.length} className="px-3 py-2 font-bold text-slate-700 dark:text-slate-300">{row.label}</td>
                  </tr>
                );
                return (
                  <tr key={ri} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className={clsx("px-3 py-1.5 border-r border-slate-200 dark:border-slate-700 whitespace-normal min-w-36 max-w-52 leading-relaxed", row.bold ? "font-bold text-slate-800 dark:text-slate-200 bg-blue-50/40 dark:bg-blue-950/20" : "text-slate-600 dark:text-slate-400")}>
                      {row.label}
                    </td>
                    {def.cols.slice(1).map((_, ci) => {
                      const key = `${ri}_${ci + 1}`;
                      return (
                        <td key={ci} className="border-r border-slate-100 dark:border-slate-800 last:border-r-0 p-0">
                          {row.tall ? (
                            <textarea value={data[key] || ""} onChange={e => onCellChange(key, e.target.value)} placeholder="—" className="w-full min-w-20 min-h-16 px-2.5 py-2 bg-transparent outline-none focus:bg-blue-50 dark:focus:bg-blue-950/30 text-xs text-slate-700 dark:text-slate-300 resize-none transition-colors" />
                          ) : (
                            <input type="text" value={data[key] || ""} onChange={e => onCellChange(key, e.target.value)} placeholder="—" className="w-full min-w-20 px-2.5 py-2 bg-transparent outline-none focus:bg-blue-50 dark:focus:bg-blue-950/30 text-xs text-slate-700 dark:text-slate-300 transition-colors" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tree Node Item ───────────────────────────────────────────────
interface TreeNodeProps {
  node: FizNode;
  depth: number;
  activeId: string | null;
  openNodes: Set<string>;
  renamingId: string | null;
  renameVal: string;
  renameRef: React.RefObject<HTMLInputElement | null>;
  contents: Contents;
  search: string;
  addingTo: string | null | false;
  newLabel: string;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRenameStart: (node: FizNode) => void;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
  onNewLabelChange: (v: string) => void;
  onAddConfirm: (parentId: string) => void;
  onAddCancel: () => void;
}

function TreeNodeItem(props: TreeNodeProps) {
  const { node, depth, activeId, openNodes, renamingId, renameVal, renameRef, contents, search } = props;
  const isActive = node.id === activeId;
  const isOpen = openNodes.has(node.id);
  const hasChildren = (node.children?.length || 0) > 0;
  const isRenaming = renamingId === node.id;

  const meta = ((contents[node.id] as NodeContent)?.meta) || {};
  const c = contents[node.id] as NodeContent | undefined;
  const hasContent = !!(c?.html?.trim() && c.html !== "<p></p>") || !!(c?.form && Object.values(c.form).some(v => v?.trim()));
  const hasTableData = !!(c?.tables && Object.values(c.tables).some(t => Object.values(t).some(v => v?.trim())));

  const filteredChildren = search
    ? (node.children || []).filter(ch => nodeMatchesSearch(ch, search))
    : (node.children || []);

  return (
    <div>
    <div className="relative">
      {/* Hierarchy Lines */}
      {depth > 0 && (
        <div 
          className="absolute border-l border-slate-200 dark:border-slate-800" 
          style={{ 
            left: `${depth * 16 - 8}px`, 
            top: 0, 
            bottom: hasChildren && isOpen ? '0' : '50%',
            height: hasChildren && isOpen ? '100%' : '50%'
          }} 
        />
      )}
      {depth > 0 && (
        <div 
          className="absolute border-t border-slate-200 dark:border-slate-800" 
          style={{ 
            left: `${depth * 16 - 8}px`, 
            top: '50%', 
            width: '8px'
          }} 
        />
      )}

      <div
        className={clsx(
          "flex items-center gap-1.5 cursor-pointer group relative transition-all select-none py-1 pr-2 rounded-md mx-2 mb-0.5",
          isActive 
            ? "bg-blue-50/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" 
            : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
        )}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => props.onSelect(node.id)}
      >
        {/* Active Indicator Accent */}
        {isActive && (
          <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
        )}

        {/* Toggle chevron */}
        <span
          onClick={e => { e.stopPropagation(); if (hasChildren) props.onToggle(node.id); }}
          className={clsx(
            "w-5 h-5 flex items-center justify-center flex-shrink-0 transition-all rounded hover:bg-slate-200 dark:hover:bg-slate-700", 
            !hasChildren && "opacity-0 pointer-events-none"
          )}
        >
          <ChevronRight className={clsx("w-3.5 h-3.5 transition-transform text-slate-400", isOpen && hasChildren && "rotate-90")} />
        </span>

        {/* Icon (Only for Headers) */}
        {depth === 0 && (
          <span className="text-sm w-5 flex-shrink-0 text-center">{ni(node.icon)}</span>
        )}

        {/* Label or rename */}
        {isRenaming ? (
          <input
            ref={renameRef}
            type="text"
            value={renameVal}
            onChange={e => props.onRenameChange(e.target.value)}
            onBlur={props.onRenameCommit}
            onKeyDown={e => { if (e.key === "Enter") props.onRenameCommit(); if (e.key === "Escape") { props.onRenameChange(node.label); props.onRenameCommit(); } }}
            onClick={e => e.stopPropagation()}
            className="flex-1 min-w-0 px-1.5 py-0.5 text-xs border border-blue-400 rounded-md outline-none bg-white shadow-sm"
          />
        ) : (
          <span className={clsx(
            "flex-1 min-w-0 py-1 text-[12.5px] truncate leading-tight",
            isActive ? "font-bold" : "font-medium",
            depth === 0 && !isActive && "text-slate-800 dark:text-slate-200",
          )}>
            {node.label}
            {node.tables && node.tables.length > 0 && (
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 text-[9px] font-black ml-1.5 align-middle shadow-sm ring-1 ring-blue-200 dark:ring-blue-800">
                T
              </span>
            )}
            {hasContent && (
              <span 
                className={clsx(
                  "inline-block w-1.5 h-1.5 rounded-full ml-1.5 align-middle flex-shrink-0",
                  hasTableData ? "bg-blue-400" : "bg-emerald-400"
                )} 
                title={hasTableData ? "Veri girilmiş tablo içeriyor" : "Metin içeriği mevcut"}
              />
            )}
          </span>
        )}

        {/* Assignee badge */}
        {meta.assignee && !isRenaming && (
          <span className={clsx("text-[9px] px-1.5 py-0.5 rounded-md font-medium flex-shrink-0 max-w-[50px] truncate", meta.dueDate ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300" : "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300")}>
            {meta.assignee.split(" ")[0]}
          </span>
        )}

        {/* Actions */}
        {!isRenaming && (
          <div className="hidden group-hover:flex items-center gap-0 ml-0.5 flex-shrink-0">
            <IconButton icon={<Plus className="w-3 h-3" />} onClick={e => { e.stopPropagation(); props.onAddChild(node.id); }} title="Alt başlık ekle" className="!w-6 !h-6" />
            <IconButton icon={<Pencil className="w-3 h-3" />} onClick={e => { e.stopPropagation(); props.onRenameStart(node); }} title="Yeniden adlandır" className="!w-6 !h-6" />
            <IconButton variant="delete" icon={<Trash2 className="w-3 h-3" />} onClick={e => { e.stopPropagation(); props.onDelete(node.id); }} title="Sil" className="!w-6 !h-6" />
          </div>
        )}
      </div>

      {/* Add child bar */}
      {props.addingTo === node.id && (
        <div className="flex gap-1.5 px-2 py-2 bg-blue-50 dark:bg-blue-950/40 border-y border-blue-100 dark:border-blue-900">
          <input
            type="text"
            value={props.newLabel}
            onChange={e => props.onNewLabelChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") props.onAddConfirm(node.id); if (e.key === "Escape") props.onAddCancel(); }}
            placeholder="Alt başlık adı..."
            autoFocus
            className="flex-1 px-2 py-1 text-xs border border-blue-200 dark:border-blue-800 rounded-md outline-none focus:border-blue-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          />
          <button onClick={() => props.onAddConfirm(node.id)} className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">＋</button>
          <button onClick={props.onAddCancel} className="px-2 py-1 text-xs text-slate-500 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors">✕</button>
        </div>
      )}

      {/* Children */}
      {hasChildren && isOpen && (
        <div className="mt-0.5">
          {filteredChildren.map(child => (
            <TreeNodeItem key={child.id} {...props} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
