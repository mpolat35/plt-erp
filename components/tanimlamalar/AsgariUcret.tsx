"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Calendar, Banknote, AlertCircle, ChevronRight, FileText
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import clsx from "clsx";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface AsgariUcretKaydi {
  id: string;
  yil: number;
  gecerlilikBaslangici: string; // "YYYY-MM-DD"
  gecerlilikBitisi: string;     // "YYYY-MM-DD", boş = süresiz
  brutUcret: number;
  aciklama: string;
  aktifMi: boolean;
}

// ── Initial Data ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "asgari_ucret_v1";

const INITIAL_DATA: AsgariUcretKaydi[] = [
  {
    id: "au_2024",
    yil: 2024,
    gecerlilikBaslangici: "2024-01-01",
    gecerlilikBitisi: "2024-12-31",
    brutUcret: 20002.50,
    aciklama: "2024 yılı asgari ücret tutarı",
    aktifMi: false,
  },
  { id: "asgari_2025_d", yil: 2025, gecerlilikBaslangici: "2025-01-01", gecerlilikBitisi: "2025-12-31", brutUcret: 26003.25, aciklama: "2025 yılı asgari ücret tutarı", aktifMi: false },
  { id: "asgari_2026_d", yil: 2026, gecerlilikBaslangici: "2026-01-01", gecerlilikBitisi: "2026-12-31", brutUcret: 35004.50, aciklama: "2026 yılı güncel asgari ücret tutarı", aktifMi: true },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `au_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function formatTL(val: number) {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + " ₺";
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AsgariUcret() {
  const [kayitlar, setKayitlar] = useState<AsgariUcretKaydi[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Kayıt modal
  const [kayitModalOpen, setKayitModalOpen] = useState(false);
  const [editingKayit, setEditingKayit] = useState<AsgariUcretKaydi | null>(null);
  const [deletingKayit, setDeletingKayit] = useState<AsgariUcretKaydi | null>(null);

  // Kayıt form
  const [formYil, setFormYil] = useState("");
  const [formBaslangic, setFormBaslangic] = useState("");
  const [formBitis, setFormBitis] = useState("");
  const [formBrutUcret, setFormBrutUcret] = useState("");
  const [formAciklama, setFormAciklama] = useState("");
  const [formAktif, setFormAktif] = useState(true);
  const [formErr, setFormErr] = useState("");

  // Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AsgariUcretKaydi[];
        setKayitlar(parsed);
        if (parsed.length > 0) {
          const sortedParsed = [...parsed].sort((a, b) => b.yil - a.yil);
          setSelectedId(sortedParsed[0].id);
        }
      } catch {
        setKayitlar(INITIAL_DATA);
        setSelectedId(INITIAL_DATA[INITIAL_DATA.length - 1].id);
      }
    } else {
      setKayitlar(INITIAL_DATA);
      setSelectedId(INITIAL_DATA[INITIAL_DATA.length - 1].id);
    }
  }, []);

  function persistAndSet(list: AsgariUcretKaydi[]) {
    setKayitlar(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  const selected = kayitlar.find((k) => k.id === selectedId) ?? null;
  const sorted = [...kayitlar].sort((a, b) => b.yil - a.yil || b.gecerlilikBaslangici.localeCompare(a.gecerlilikBaslangici));

  // ── Kayıt CRUD ──

  function openAddKayit() {
    setEditingKayit(null);
    setFormYil(String(new Date().getFullYear()));
    setFormBaslangic("");
    setFormBitis("");
    setFormBrutUcret("");
    setFormAciklama("");
    setFormAktif(true);
    setFormErr("");
    setKayitModalOpen(true);
  }

  function openEditKayit(k: AsgariUcretKaydi) {
    setEditingKayit(k);
    setFormYil(String(k.yil));
    setFormBaslangic(k.gecerlilikBaslangici);
    setFormBitis(k.gecerlilikBitisi ?? "");
    setFormBrutUcret(String(k.brutUcret));
    setFormAciklama(k.aciklama);
    setFormAktif(k.aktifMi);
    setFormErr("");
    setKayitModalOpen(true);
  }

  function saveKayit() {
    const yil = Number(formYil);
    const ucret = Number(formBrutUcret.replace(",", "."));

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
    if (isNaN(ucret) || ucret <= 0) {
      setFormErr("Geçerli bir brüt ücret girin");
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
              brutUcret: ucret,
              aciklama: formAciklama,
              aktifMi: formAktif,
            }
          : k
      );
      persistAndSet(updated);
    } else {
      const kayit: AsgariUcretKaydi = {
        id: uid(),
        yil,
        gecerlilikBaslangici: formBaslangic,
        gecerlilikBitisi: formBitis,
        brutUcret: ucret,
        aciklama: formAciklama,
        aktifMi: formAktif,
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

  const tabItems: TabItem[] = sorted.map((k) => ({
    key: k.id,
    label: (
      <div className="flex flex-col">
        <span className="font-semibold">{k.yil} Yılı</span>
        <span className="text-[10px] opacity-60 font-normal">
          {k.gecerlilikBaslangici} → {k.gecerlilikBitisi || "Süresiz"}
        </span>
      </div>
    ),
    icon: <Calendar />,
    badge: k.aktifMi ? "Aktif" : undefined,
    content: (
      <div className="flex flex-col min-w-0 h-full">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">{k.yil} Asgari Ücret Bilgileri</h2>
              <p className="text-xs text-slate-500 mt-0.5">{k.gecerlilikBaslangici} tarihinden itibaren geçerli.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditKayit(k)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeletingKayit(k)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm relative overflow-hidden text-center">
              <Badge variant={k.aktifMi ? "emerald" : "slate"} className="mb-4">
                {k.aktifMi ? "Güncel Veri" : "Arşiv Kaydı"}
              </Badge>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-2 block">Brüt Tutar</span>
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4 tabular-nums">
                {formatTL(k.brutUcret)}
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 w-fit mx-auto">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {k.gecerlilikBaslangici}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {k.gecerlilikBitisi || "Süresiz"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Açıklama</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {k.aciklama || "Bu dönem için açıklama bulunmuyor."}
                </p>
              </div>
              <div className="p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Hesaplama Notu</span>
                </div>
                <p className="text-[11px] text-blue-600/80 dark:text-blue-400 font-medium leading-relaxed">
                  Asgari ücret, SGK tavanı ve vergi dilimleri gibi birçok temel parametrenin hesaplanmasında baz alınır.
                </p>
              </div>
            </div>
          </div>
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

      {/* Kayıt Modalı */}
      <Modal open={kayitModalOpen} onClose={() => setKayitModalOpen(false)}>
        <Modal.Header
          title={editingKayit ? "Kayıt Düzenle" : "Yeni Asgari Ücret Kaydı"}
          onClose={() => setKayitModalOpen(false)}
          icon={<Plus className="w-4 h-4 text-blue-600" />}
        />
        <Modal.Content className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Modal.Label>Yıl</Modal.Label>
              <Input
                value={formYil}
                onChange={(e) => setFormYil(e.target.value)}
                type="number"
              />
            </div>
            <div>
              <Modal.Label>Brüt Ücret (₺)</Modal.Label>
              <Input
                value={formBrutUcret}
                onChange={(e) => setFormBrutUcret(e.target.value)}
                placeholder="0,00"
                type="number"
                step="0.01"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Modal.Label>Başlangıç Tarihi</Modal.Label>
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
          <Input
            value={formAciklama}
            onChange={(e) => setFormAciklama(e.target.value)}
            label="Açıklama"
          />
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-700">Bu kaydı aktif/güncel olarak işaretle</span>
            <button
              type="button"
              onClick={() => setFormAktif(!formAktif)}
              className={clsx(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                formAktif ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <span
                className={clsx(
                  "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm",
                  formAktif ? "translate-x-[18px]" : "translate-x-[2px]"
                )}
              />
            </button>
          </div>
          {formErr && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> {formErr}
            </div>
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setKayitModalOpen(false)}>
            Vazgeç
          </Button>
          <Button variant="primary" size="xs" onClick={saveKayit}>
            Kaydet
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Modalı */}
      <Modal open={!!deletingKayit} onClose={() => setDeletingKayit(null)} size="sm">
        <Modal.Header
          title="Kaydı Sil"
          onClose={() => setDeletingKayit(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500" />}
        />
        <Modal.Content>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            Bu döneme ait asgari ücret verisi silinecektir. Devam etmek istiyor musunuz?
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingKayit(null)}>
            İptal
          </Button>
          <Button variant="danger" size="xs" onClick={deleteKayit}>
            Evet, Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
