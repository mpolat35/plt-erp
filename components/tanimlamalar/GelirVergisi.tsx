"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Check, X, ChevronRight,
  Calendar, Percent, TrendingUp, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { IconButton, IconButtonRow } from "@/components/ui/IconButton";
import clsx from "clsx";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface GelirVergisiDilimi {
  id: string;
  sira: number;
  altSinir: number;
  ustSinir: number | null; // null = sınırsız
  oran: number; // yüzde olarak, 15 = %15
}

interface GelirVergisiKaydi {
  id: string;
  yil: number;
  gecerlilikBaslangici: string; // "YYYY-MM-DD"
  gecerlilikBitisi: string;     // "YYYY-MM-DD", boş = süresiz
  aciklama: string;
  aktifMi: boolean;
  dilimler: GelirVergisiDilimi[];
}

// ── Initial Data ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "gelir_vergisi_v1";

const INITIAL_DATA: GelirVergisiKaydi[] = [
  {
    id: "gv_2024",
    yil: 2024,
    gecerlilikBaslangici: "2024-01-01",
    gecerlilikBitisi: "2024-12-31",
    aciklama: "2024 yılı gelir vergisi dilimleri",
    aktifMi: false,
    dilimler: [
      { id: "gv24_1", sira: 1, altSinir: 0,       ustSinir: 110000,  oran: 15 },
      { id: "gv24_2", sira: 2, altSinir: 110000,  ustSinir: 230000,  oran: 20 },
      { id: "gv24_3", sira: 3, altSinir: 230000,  ustSinir: 580000,  oran: 27 },
      { id: "gv24_4", sira: 4, altSinir: 580000,  ustSinir: 3000000, oran: 35 },
      { id: "gv24_5", sira: 5, altSinir: 3000000, ustSinir: null,    oran: 40 },
    ],
  },
  {
    id: "gv_2025",
    yil: 2025,
    gecerlilikBaslangici: "2025-01-01",
    gecerlilikBitisi: "2025-12-31",
    aciklama: "2025 yılı gelir vergisi dilimleri",
    aktifMi: true,
    dilimler: [
      { id: "gv25_1", sira: 1, altSinir: 0,       ustSinir: 158000,  oran: 15 },
      { id: "gv25_2", sira: 2, altSinir: 158000,  ustSinir: 382000,  oran: 20 },
      { id: "gv25_3", sira: 3, altSinir: 382000,  ustSinir: 940000,  oran: 27 },
      { id: "gv25_4", sira: 4, altSinir: 940000,  ustSinir: 4400000, oran: 35 },
      { id: "gv25_5", sira: 5, altSinir: 4400000, ustSinir: null,    oran: 40 },
    ]
  },
  {
    id: "gv_2026",
    yil: 2026,
    gecerlilikBaslangici: "2026-01-01",
    gecerlilikBitisi: "2026-12-31",
    aciklama: "2026 yılı güncel gelir vergisi dilimleri",
    aktifMi: true,
    dilimler: [
      { id: "gv26_1", sira: 1, altSinir: 0,       ustSinir: 230000,  oran: 15 },
      { id: "gv26_2", sira: 2, altSinir: 230000,  ustSinir: 580000,  oran: 20 },
      { id: "gv26_3", sira: 3, altSinir: 580000,  ustSinir: 1300000, oran: 27 },
      { id: "gv26_4", sira: 4, altSinir: 1300000, ustSinir: 5000000, oran: 35 },
      { id: "gv26_5", sira: 5, altSinir: 5000000, ustSinir: null,    oran: 40 },
    ]
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `gv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function formatTL(val: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(val) + " ₺";
}

// ── Dilim Row (inline editable) ───────────────────────────────────────────────

interface DilimRowProps {
  dilim: GelirVergisiDilimi;
  onUpdate: (d: GelirVergisiDilimi) => void;
  onDelete: (id: string) => void;
}

function DilimRow({ dilim, onUpdate, onDelete }: DilimRowProps) {
  const [editing, setEditing] = useState(false);
  const [altSinir, setAltSinir] = useState(String(dilim.altSinir));
  const [ustSinir, setUstSinir] = useState(dilim.ustSinir == null ? "" : String(dilim.ustSinir));
  const [oran, setOran] = useState(String(dilim.oran));
  const [err, setErr] = useState("");

  function saveDilim() {
    const alt = Number(altSinir);
    const ust = ustSinir === "" ? null : Number(ustSinir);
    const o = Number(oran);
    if (isNaN(alt) || alt < 0) { setErr("Alt sınır geçersiz"); return; }
    if (ust !== null && (isNaN(ust) || ust <= alt)) { setErr("Üst sınır alt sınırdan büyük olmalı"); return; }
    if (isNaN(o) || o <= 0 || o >= 100) { setErr("Oran 0-100 arasında olmalı"); return; }
    onUpdate({ ...dilim, altSinir: alt, ustSinir: ust, oran: o });
    setEditing(false);
    setErr("");
  }

  function cancelDilim() {
    setAltSinir(String(dilim.altSinir));
    setUstSinir(dilim.ustSinir == null ? "" : String(dilim.ustSinir));
    setOran(String(dilim.oran));
    setEditing(false);
    setErr("");
  }

  if (editing) {
    return (
      <Tr>
        <Td className="text-center text-slate-500 text-xs">{dilim.sira}</Td>
        <Td>
          <Input value={altSinir} onChange={(e) => setAltSinir(e.target.value)} className="h-7 text-xs w-28" />
        </Td>
        <Td>
          <Input value={ustSinir} onChange={(e) => setUstSinir(e.target.value)} placeholder="Sınırsız" className="h-7 text-xs w-28" />
        </Td>
        <Td>
          <div className="flex items-center gap-1">
            <Input value={oran} onChange={(e) => setOran(e.target.value)} className="h-7 text-xs w-16" />
            <span className="text-slate-400 text-xs">%</span>
          </div>
        </Td>
        <Td>
          <div className="flex flex-col gap-0.5">
            {err && <span className="text-xs text-red-500">{err}</span>}
            <div className="flex items-center gap-1">
              <button
                onClick={saveDilim}
                className="w-6 h-6 flex items-center justify-center rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={cancelDilim}
                className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Td>
      </Tr>
    );
  }

  return (
    <Tr>
      <Td className="text-center">
        <span className="text-xs text-slate-500">{dilim.sira}</span>
      </Td>
      <Td>
        <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
          {formatTL(dilim.altSinir)}
        </span>
      </Td>
      <Td>
        {dilim.ustSinir == null ? (
          <span className="text-xs text-slate-400 italic">Sınırsız</span>
        ) : (
          <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {formatTL(dilim.ustSinir)}
          </span>
        )}
      </Td>
      <Td>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
          <Percent className="w-3 h-3" />
          {dilim.oran}
        </span>
      </Td>
      <Td>
        <IconButtonRow>
          <IconButton
            variant="edit"
            icon={<Pencil />}
            onClick={() => setEditing(true)}
            title="Düzenle"
          />
          <IconButton
            variant="delete"
            icon={<Trash2 />}
            onClick={() => onDelete(dilim.id)}
            title="Sil"
          />
        </IconButtonRow>
      </Td>
    </Tr>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function GelirVergisi() {
  const [kayitlar, setKayitlar] = useState<GelirVergisiKaydi[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Kayıt modal
  const [kayitModalOpen, setKayitModalOpen] = useState(false);
  const [editingKayit, setEditingKayit] = useState<GelirVergisiKaydi | null>(null);
  const [deletingKayit, setDeletingKayit] = useState<GelirVergisiKaydi | null>(null);

  // Kayıt form
  const [formYil, setFormYil] = useState("");
  const [formBaslangic, setFormBaslangic] = useState("");
  const [formBitis, setFormBitis] = useState("");
  const [formAciklama, setFormAciklama] = useState("");
  const [formAktif, setFormAktif] = useState(true);
  const [formErr, setFormErr] = useState("");

  // Yeni dilim form
  const [dilimFormOpen, setDilimFormOpen] = useState(false);
  const [newAlt, setNewAlt] = useState("");
  const [newUst, setNewUst] = useState("");
  const [newOran, setNewOran] = useState("");
  const [newDilimErr, setNewDilimErr] = useState("");

  // Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GelirVergisiKaydi[];
        setKayitlar(parsed);
        if (parsed.length > 0) {
          const sortedParsed = [...parsed].sort((a, b) => b.yil - a.yil);
          setSelectedId(sortedParsed[0].id);
        }
      } catch {
        setKayitlar(INITIAL_DATA);
        setSelectedId(INITIAL_DATA[0].id);
      }
    } else {
      setKayitlar(INITIAL_DATA);
      setSelectedId(INITIAL_DATA[INITIAL_DATA.length - 1].id);
    }
  }, []);

  function persistAndSet(list: GelirVergisiKaydi[]) {
    setKayitlar(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  const selected = kayitlar.find((k) => k.id === selectedId) ?? null;
  const sorted = [...kayitlar].sort((a, b) => b.yil - a.yil);

  // ── Kayıt CRUD ──

  function openAddKayit() {
    setEditingKayit(null);
    setFormYil("");
    setFormBaslangic("");
    setFormBitis("");
    setFormAciklama("");
    setFormAktif(true);
    setFormErr("");
    setKayitModalOpen(true);
  }

  function openEditKayit(k: GelirVergisiKaydi) {
    setEditingKayit(k);
    setFormYil(String(k.yil));
    setFormBaslangic(k.gecerlilikBaslangici);
    setFormBitis(k.gecerlilikBitisi ?? "");
    setFormAciklama(k.aciklama);
    setFormAktif(k.aktifMi);
    setFormErr("");
    setKayitModalOpen(true);
  }

  function saveKayit() {
    const yil = Number(formYil);
    if (isNaN(yil) || yil < 2000 || yil > 2100) {
      setFormErr("Geçerli bir yıl girin (2000-2100)");
      return;
    }
    if (!formBaslangic) {
      setFormErr("Geçerlilik başlangıç tarihi zorunludur");
      return;
    }
    if (formBitis && formBitis <= formBaslangic) {
      setFormErr("Bitiş tarihi başlangıç tarihinden sonra olmalı");
      return;
    }
    const duplicate = kayitlar.find((k) => k.yil === yil && k.id !== editingKayit?.id);
    if (duplicate) {
      setFormErr(`${yil} yılına ait kayıt zaten mevcut`);
      return;
    }

    if (editingKayit) {
      const updated = kayitlar.map((k) =>
        k.id === editingKayit.id
          ? {
              ...k,
              yil,
              gecerlilikBaslangici: formBaslangic,
              gecerlilikBitisi: formBitis,
              aciklama: formAciklama,
              aktifMi: formAktif,
            }
          : k
      );
      persistAndSet(updated);
    } else {
      const kayit: GelirVergisiKaydi = {
        id: uid(),
        yil,
        gecerlilikBaslangici: formBaslangic,
        gecerlilikBitisi: formBitis,
        aciklama: formAciklama,
        aktifMi: formAktif,
        dilimler: [],
      };
      const updated = [...kayitlar, kayit];
      persistAndSet(updated);
      setSelectedId(kayit.id);
    }
    setKayitModalOpen(false);
  }

  function deleteKayit() {
    if (!deletingKayit) return;
    const updated = kayitlar.filter((k) => k.id !== deletingKayit.id);
    persistAndSet(updated);
    if (selectedId === deletingKayit.id) {
      const remaining = [...updated].sort((a, b) => b.yil - a.yil);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
    setDeletingKayit(null);
  }

  // ── Dilim CRUD ──

  function addDilim() {
    if (!selected) return;
    const alt = Number(newAlt);
    const ust = newUst === "" ? null : Number(newUst);
    const oran = Number(newOran);
    if (isNaN(alt) || alt < 0) { setNewDilimErr("Alt sınır geçersiz"); return; }
    if (ust !== null && (isNaN(ust) || ust <= alt)) { setNewDilimErr("Üst sınır alt sınırdan büyük olmalı"); return; }
    if (isNaN(oran) || oran <= 0 || oran >= 100) { setNewDilimErr("Oran 0-100 arasında olmalı"); return; }

    const newDilim: GelirVergisiDilimi = {
      id: uid(),
      sira: selected.dilimler.length + 1,
      altSinir: alt,
      ustSinir: ust,
      oran,
    };
    const updated = kayitlar.map((k) =>
      k.id === selected.id ? { ...k, dilimler: [...k.dilimler, newDilim] } : k
    );
    persistAndSet(updated);
    setNewAlt("");
    setNewUst("");
    setNewOran("");
    setNewDilimErr("");
    setDilimFormOpen(false);
  }

  function updateDilim(updatedDilim: GelirVergisiDilimi) {
    if (!selected) return;
    const newList = kayitlar.map((k) =>
      k.id === selected.id
        ? { ...k, dilimler: k.dilimler.map((d) => (d.id === updatedDilim.id ? updatedDilim : d)) }
        : k
    );
    persistAndSet(newList);
  }

  function deleteDilim(dilimId: string) {
    if (!selected) return;
    const newList = kayitlar.map((k) =>
      k.id === selected.id
        ? {
            ...k,
            dilimler: k.dilimler
              .filter((d) => d.id !== dilimId)
              .map((d, i) => ({ ...d, sira: i + 1 })),
          }
        : k
    );
    persistAndSet(newList);
  }

  // ── Render ──

  const tabItems: TabItem[] = sorted.map((k) => ({
    key: k.id,
    label: (
      <div className="flex flex-col">
        <span className="font-semibold">{k.yil}</span>
        <span className="text-[10px] opacity-60 font-normal">
          {k.gecerlilikBaslangici}
        </span>
      </div>
    ),
    icon: <Calendar />,
    badge: k.aktifMi ? "Aktif" : undefined,
    content: (
      <div className="flex flex-col min-w-0">
        {/* Sağ Panel Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {k.yil} Yılı Vergi Dilimleri
              </span>
              {k.aktifMi ? (
                <Badge variant="emerald">Aktif</Badge>
              ) : (
                <Badge variant="slate">Pasif</Badge>
              )}
            </div>
            {k.aciklama && (
              <p className="text-xs text-slate-400 mt-0.5 ml-6">{k.aciklama}</p>
            )}
            <p className="text-xs text-slate-400 mt-0.5 ml-6">
              {k.gecerlilikBaslangici}
              {k.gecerlilikBitisi
                ? ` – ${k.gecerlilikBitisi}`
                : " (süresiz)"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => openEditKayit(k)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Düzenle
            </button>
            <button
              onClick={() => setDeletingKayit(k)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Sil
            </button>
          </div>
        </div>

        {/* Dilimler Tablosu */}
        <div className="flex-1 overflow-auto pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {k.dilimler.length} dilim tanımlı
            </span>
            <Button
              size="sm"
              onClick={() => { setDilimFormOpen(true); setNewDilimErr(""); }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Dilim Ekle
            </Button>
          </div>

          {/* Yeni dilim formu */}
          {dilimFormOpen && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg">
              <div className="flex items-end gap-2 flex-wrap">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Alt Sınır (₺)</label>
                  <Input
                    value={newAlt}
                    onChange={(e) => setNewAlt(e.target.value)}
                    placeholder="0"
                    className="h-8 text-xs w-28"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Üst Sınır (₺)</label>
                  <Input
                    value={newUst}
                    onChange={(e) => setNewUst(e.target.value)}
                    placeholder="Sınırsız"
                    className="h-8 text-xs w-28"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Oran (%)</label>
                  <Input
                    value={newOran}
                    onChange={(e) => setNewOran(e.target.value)}
                    placeholder="15"
                    className="h-8 text-xs w-20"
                  />
                </div>
                <div className="flex items-center gap-1 pb-0.5">
                  <button
                    onClick={addDilim}
                    className="h-8 px-3 flex items-center gap-1 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Kaydet
                  </button>
                  <button
                    onClick={() => { setDilimFormOpen(false); setNewDilimErr(""); }}
                    className="h-8 px-3 flex items-center gap-1 rounded-lg bg-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
              {newDilimErr && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {newDilimErr}
                </div>
              )}
            </div>
          )}

          {k.dilimler.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Bu dönem için henüz vergi dilimi tanımlanmamış.
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th className="w-12 text-center">#</Th>
                  <Th>Alt Sınır</Th>
                  <Th>Üst Sınır</Th>
                  <Th>Vergi Oranı</Th>
                  <Th className="w-20">İşlemler</Th>
                </Tr>
              </Thead>
              <Tbody>
                {[...k.dilimler]
                  .sort((a, b) => a.sira - b.sira)
                  .map((d) => (
                    <DilimRow
                      key={d.id}
                      dilim={d}
                      onUpdate={updateDilim}
                      onDelete={deleteDilim}
                    />
                  ))}
              </Tbody>
            </Table>
          )}
        </div>
      </div>
    ),
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end mb-4">
        <Button size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={openAddKayit}>
          Yeni Dönem Ekle
        </Button>
      </div>
      <Tabs
        orientation="vertical"
        variant="default"
        items={tabItems}
        activeKey={selectedId ?? undefined}
        onChange={setSelectedId}
      />

      {/* ── Kayıt Modal ── */}
      <Modal open={kayitModalOpen} onClose={() => setKayitModalOpen(false)}>
        <Modal.Header
          title={editingKayit ? "Dönemi Düzenle" : "Yeni Dönem Ekle"}
          onClose={() => setKayitModalOpen(false)}
          icon={<Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        />
        <Modal.Content className="space-y-4">
          <div>
            <Modal.Label>Yıl *</Modal.Label>
            <Input
              value={formYil}
              onChange={(e) => setFormYil(e.target.value)}
              placeholder="2026"
              type="number"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Modal.Label>Başlangıç Tarihi *</Modal.Label>
              <Input
                value={formBaslangic}
                onChange={(e) => setFormBaslangic(e.target.value)}
                type="date"
              />
            </div>
            <div>
              <Modal.Label>Bitiş Tarihi</Modal.Label>
              <Input
                value={formBitis}
                onChange={(e) => setFormBitis(e.target.value)}
                type="date"
              />
            </div>
          </div>

          <div>
            <Modal.Label>Açıklama</Modal.Label>
            <Input
              value={formAciklama}
              onChange={(e) => setFormAciklama(e.target.value)}
              placeholder="Kısa açıklama..."
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Aktif</span>
            <button
              type="button"
              onClick={() => setFormAktif(!formAktif)}
              className={clsx(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                formAktif ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <span className={clsx(
                "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm",
                formAktif ? "translate-x-[18px]" : "translate-x-[2px]"
              )} />
            </button>
          </div>

          {formErr && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600 dark:text-red-400">{formErr}</span>
            </div>
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setKayitModalOpen(false)}>
            İptal
          </Button>
          <Button variant="primary" size="xs" onClick={saveKayit}>
            {editingKayit ? "Kaydet" : "Ekle"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Silme Onayı ── */}
      <Modal open={!!deletingKayit} onClose={() => setDeletingKayit(null)} size="sm" zIndex="z-[60]">
        <Modal.Header
          title="Dönemi Sil"
          onClose={() => setDeletingKayit(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950"
        />
        <Modal.Content>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {deletingKayit?.yil}
            </span>{" "}
            dönemine ait tüm vergi dilimleri de silinecektir. Bu işlem geri alınamaz.
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingKayit(null)}>
            Vazgeç
          </Button>
          <Button variant="danger" size="xs" onClick={deleteKayit}>
            Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
