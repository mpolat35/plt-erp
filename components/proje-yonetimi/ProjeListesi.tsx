"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Search, FolderKanban,
  Trash2, Pencil, CalendarDays, Building2, X, Check, Eye
} from "lucide-react";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Page } from "@/components/ui/Page";

export interface Project {
  id: string;
  name: string;
  idare: string;
  startDate: string;
  endDate: string;
  status: "aktif" | "beklemede" | "tamamlandi" | "iptal";
}

const STATUS_CONFIG: Record<Project["status"], { label: string; cls: string }> = {
  aktif:       { label: "Aktif",       cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800" },
  beklemede:   { label: "Beklemede",   cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800" },
  tamamlandi:  { label: "Tamamlandı",  cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800" },
  iptal:       { label: "İptal",       cls: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800" },
};

const EMPTY_FORM: Omit<Project, "id"> = {
  name: "", idare: "", startDate: "", endDate: "", status: "aktif",
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "bigadic",
    name: "Balıkesir Bigadiç Jeotermal Kaynaklı Sera TDİOSB Fizibilite Raporu",
    idare: "Balıkesir Valiliği Yatırım İzleme ve Koordinasyon Başkanlığı",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "aktif",
  },
];

const SK = "proje_liste_v1";

function isBigadicProject(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const item = value as { id?: unknown; name?: unknown };
  const hasId = typeof item.id === "string" && item.id === "bigadic";
  const hasName = typeof item.name === "string" && /bigadi[cç]/i.test(item.name);
  return hasId || hasName;
}

function normalizeProjects(projects: unknown[]): Project[] {
  const filtered = projects.filter((item) => !isBigadicProject(item));
  return [DEFAULT_PROJECTS[0], ...filtered as Project[]];
}

function loadProjects(): Project[] {
  try {
    const s = localStorage.getItem(SK);
    if (!s) {
      saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) {
      saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    const normalized = normalizeProjects(parsed);
    if (normalized.length === 0) {
      saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    const savedText = JSON.stringify(parsed);
    const normalizedText = JSON.stringify(normalized);
    if (savedText !== normalizedText) {
      saveProjects(normalized);
    }
    return normalized;
  } catch {
    saveProjects(DEFAULT_PROJECTS);
    return DEFAULT_PROJECTS;
  }
}

function saveProjects(projects: Project[]) {
  try { localStorage.setItem(SK, JSON.stringify(projects)); } catch {}
}

function fmt(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

export default function ProjeListesi() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Project["status"] | "tumu">("tumu");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Project, "id">>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  useEffect(() => { setProjects(loadProjects()); }, []);

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.idare.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "tumu" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setForm(EMPTY_FORM); setErrors({}); setEditingId(null); setShowModal(true);
  };

  const openEdit = (p: Project) => {
    setForm({ name: p.name, idare: p.idare, startDate: p.startDate, endDate: p.endDate, status: p.status });
    setErrors({}); setEditingId(p.id); setShowModal(true);
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Proje adı zorunludur.";
    if (!form.idare.trim()) errs.idare = "İdare adı zorunludur.";
    if (!form.startDate) errs.startDate = "Başlangıç tarihi zorunludur.";
    if (!form.endDate) errs.endDate = "Bitiş tarihi zorunludur.";
    if (form.startDate && form.endDate && form.endDate < form.startDate) errs.endDate = "Bitiş tarihi başlangıçtan önce olamaz.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    let updated: Project[];
    if (editingId) {
      updated = projects.map(p => p.id === editingId ? { ...p, ...form } : p);
    } else {
      const newProject: Project = { id: `prj_${Date.now()}`, ...form };
      updated = [...projects, newProject];
    }
    setProjects(updated);
    saveProjects(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const p = projects.find(x => x.id === id);
    if (!p || !confirm(`"${p.name}" projesini silmek istediğinizden emin misiniz?`)) return;
    const updated = projects.filter(x => x.id !== id);
    setProjects(updated);
    saveProjects(updated);
  };

  const stats = {
    tumu: projects.length,
    aktif: projects.filter(p => p.status === "aktif").length,
    beklemede: projects.filter(p => p.status === "beklemede").length,
    tamamlandi: projects.filter(p => p.status === "tamamlandi").length,
    iptal: projects.filter(p => p.status === "iptal").length,
  };

  return (
    <Page>
      <div className="space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          ["tumu",       "Toplam",     "text-slate-700 dark:text-slate-300",  "bg-white dark:bg-slate-900"],
          ["aktif",      "Aktif",       "text-emerald-700 dark:text-emerald-400", "bg-emerald-50 dark:bg-emerald-950/50"],
          ["beklemede",  "Beklemede",   "text-amber-700 dark:text-amber-400",   "bg-amber-50 dark:bg-amber-950/50"],
          ["tamamlandi", "Tamamlandı",  "text-blue-700 dark:text-blue-400",     "bg-blue-50 dark:bg-blue-950/50"],
        ] as const).map(([key, label, textCls, bgCls]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key as typeof statusFilter)}
            className={clsx(
              "flex flex-col gap-1 p-4 rounded-md border text-left transition-all",
              bgCls,
              statusFilter === key
                ? "border-blue-400 ring-1 ring-blue-400/40"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            <span className={clsx("text-2xl font-bold", textCls)}>{stats[key]}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Proje veya idare ara..."
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-1.5">
              {(["tumu", "aktif", "beklemede", "tamamlandi", "iptal"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-medium rounded-md border transition-colors",
                    statusFilter === s
                      ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-700"
                      : "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  {s === "tumu" ? "Tümü" : STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={openCreate}
            variant="primary"
            size="sm"
            iconLeft={<Plus className="w-4 h-4" />}
          >
            Yeni Proje Ekle
          </Button>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <FolderKanban className="w-10 h-10 opacity-30" />
            <div className="text-base font-semibold text-slate-500 dark:text-slate-400">
              {projects.length === 0 ? "Henüz proje eklenmedi" : "Eşleşen proje bulunamadı"}
            </div>
            {projects.length === 0 && (
              <Button onClick={openCreate} className="mt-1" variant="outline" iconLeft={<Plus className="w-4 h-4" />}>
                İlk projeyi oluşturun
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Masaüstü tablo */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <th className="px-5 py-3 w-12 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proje Adı</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">İdaresi</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Başlangıç</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Bitiş</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Durum</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((p, i) => (
                    <tr key={p.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-2.5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                          {p.name}
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          {p.idare}
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          {fmt(p.startDate)}
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          {fmt(p.endDate)}
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className={clsx("inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border", STATUS_CONFIG[p.status].cls)}>
                          {STATUS_CONFIG[p.status].label}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="irow">
                          <Link href={`/proje-yonetimi/${p.id}`} className="ib iv" title="Detay">
                            <Eye />
                          </Link>
                          <button className="ib ie" onClick={() => openEdit(p)} title="Düzenle">
                            <Pencil />
                          </button>
                          <button className="ib id" onClick={() => handleDelete(p.id)} title="Sil">
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobil kart listesi */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((p, i) => (
                <div key={p.id} className="px-4 py-3.5 flex flex-col gap-2">
                  {/* Üst: sıra + proje adı + durum */}
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                      {p.name}
                    </span>
                    <span className={clsx("inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0", STATUS_CONFIG[p.status].cls)}>
                      {STATUS_CONFIG[p.status].label}
                    </span>
                  </div>

                  {/* İdare */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pl-6">
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                    {p.idare}
                  </div>

                  {/* Tarihler + işlemler */}
                  <div className="flex items-center justify-between pl-6">
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {fmt(p.startDate)}
                      </span>
                      <span>→</span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {fmt(p.endDate)}
                      </span>
                    </div>
                    <div className="irow">
                      <Link href={`/proje-yonetimi/${p.id}`} className="ib iv" title="Detay">
                        <Eye />
                      </Link>
                      <button className="ib ie" onClick={() => openEdit(p)} title="Düzenle">
                        <Pencil />
                      </button>
                      <button className="ib id" onClick={() => handleDelete(p.id)} title="Sil">
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filtered.length > 0 && (
          <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            {filtered.length} proje gösteriliyor{projects.length !== filtered.length ? ` (toplam ${projects.length})` : ""}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-md shadow-2xl w-[520px] max-w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950 rounded-md flex items-center justify-center flex-shrink-0">
                <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex-1">
                {editingId ? "Projeyi Düzenle" : "Yeni Proje Oluştur"}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pt-7 pb-7 space-y-5">
              <Field label="Proje Adı" required error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Projenin tam adını giriniz..."
                  className={clsx("w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300", errors.name ? "border-red-400 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500")}
                />
              </Field>

              <Field label="İdaresi" required error={errors.idare}>
                <input
                  type="text"
                  value={form.idare}
                  onChange={e => setForm(p => ({ ...p, idare: e.target.value }))}
                  placeholder="Sorumlu kurum / idare adı..."
                  className={clsx("w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300", errors.idare ? "border-red-400 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500")}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Başlangıç Tarihi" required error={errors.startDate}>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    className={clsx("w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300", errors.startDate ? "border-red-400 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500")}
                  />
                </Field>
                <Field label="Bitiş Tarihi" required error={errors.endDate}>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                    className={clsx("w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300", errors.endDate ? "border-red-400 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500")}
                  />
                </Field>
              </div>

              <Field label="Durum">
                <select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as Project["status"] }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <option value="aktif">Aktif</option>
                  <option value="beklemede">Beklemede</option>
                  <option value="tamamlandi">Tamamlandı</option>
                  <option value="iptal">İptal</option>
                </select>
              </Field>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={() => setShowModal(false)} variant="outline" size="xs">
                Vazgeç
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                size="xs"
                iconLeft={editingId
                  ? <Pencil className="w-3.5 h-3.5" />
                  : <Check className="w-3.5 h-3.5" />
                }
              >
                {editingId ? "Kaydet" : "Oluştur"}
              </Button>
            </div>
          </div>
        </div>
      )}

</div>
    </Page>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-normal text-slate-400 dark:text-slate-500 mb-1 pl-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  );
}
