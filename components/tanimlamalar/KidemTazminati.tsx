"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Calendar, Scale, AlertCircle, ChevronRight, TrendingUp, History
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import clsx from "clsx";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface KidemKaydi {
  id: string;
  yil: number;
  gecerlilikBaslangici: string;
  gecerlilikBitisi: string;
  tavanUcret: number;
  aciklama: string;
  aktifMi: boolean;
}

// ── Initial Data ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "kidem_tazminati_v1";

const INITIAL_DATA: KidemKaydi[] = [
  {
    id: "kt_2024_1",
    yil: 2024,
    gecerlilikBaslangici: "2024-01-01",
    gecerlilikBitisi: "2024-06-30",
    tavanUcret: 35058.58,
    aciklama: "2024 İlk 6 Ay Kıdem Tazminatı Tavanı",
    aktifMi: false,
  },
  {
    id: "kt_2024_2",
    yil: 2024,
    gecerlilikBaslangici: "2024-07-01",
    gecerlilikBitisi: "2024-12-31",
    tavanUcret: 41828.42,
    aciklama: "2024 İkinci 6 Ay Kıdem Tazminatı Tavanı",
    aktifMi: false,
  },
  {
    id: "kt_2025_d",
    yil: 2025,
    gecerlilikBaslangici: "2025-01-01",
    gecerlilikBitisi: "2025-06-30",
    tavanUcret: 52000.00,
    aciklama: "2025 Tahmini/Güncel Kıdem Tazminatı Tavanı",
    aktifMi: true,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `kt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function formatTL(val: number) {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + " ₺";
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function KidemTazminati() {
  const [kayitlar, setKayitlar] = useState<KidemKaydi[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKayit, setEditingKayit] = useState<KidemKaydi | null>(null);
  const [deletingKayit, setDeletingKayit] = useState<KidemKaydi | null>(null);

  // Form states
  const [formYil, setFormYil] = useState("");
  const [formBaslangic, setFormBaslangic] = useState("");
  const [formBitis, setFormBitis] = useState("");
  const [formTavan, setFormTavan] = useState("");
  const [formAciklama, setFormAciklama] = useState("");
  const [formAktif, setFormAktif] = useState(true);
  const [formErr, setFormErr] = useState("");

  // Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as KidemKaydi[];
        setKayitlar(parsed);
        if (parsed.length > 0) {
          const sortedParsed = [...parsed].sort((a, b) => b.gecerlilikBaslangici.localeCompare(a.gecerlilikBaslangici));
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

  function persistAndSet(list: KidemKaydi[]) {
    setKayitlar(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  const selected = kayitlar.find((k) => k.id === selectedId) ?? null;
  const sorted = [...kayitlar].sort((a, b) => b.gecerlilikBaslangici.localeCompare(a.gecerlilikBaslangici));

  // CRUD
  function openAdd() {
    setEditingKayit(null);
    setFormYil(String(new Date().getFullYear()));
    setFormBaslangic("");
    setFormBitis("");
    setFormTavan("");
    setFormAciklama("");
    setFormAktif(true);
    setFormErr("");
    setModalOpen(true);
  }

  function openEdit(k: KidemKaydi) {
    setEditingKayit(k);
    setFormYil(String(k.yil));
    setFormBaslangic(k.gecerlilikBaslangici);
    setFormBitis(k.gecerlilikBitisi);
    setFormTavan(String(k.tavanUcret));
    setFormAciklama(k.aciklama);
    setFormAktif(k.aktifMi);
    setFormErr("");
    setModalOpen(true);
  }

  function handleSave() {
    const yil = Number(formYil);
    const tavan = Number(formTavan.replace(",", "."));

    if (isNaN(yil) || yil < 2000 || yil > 2100) { setFormErr("Geçerli bir yıl girin"); return; }
    if (!formBaslangic) { setFormErr("Başlangıç tarihi zorunludur"); return; }
    if (isNaN(tavan) || tavan <= 0) { setFormErr("Geçerli bir tavan ücret girin"); return; }

    if (editingKayit) {
      const updated = kayitlar.map(k => k.id === editingKayit.id ? {
        ...k, yil, gecerlilikBaslangici: formBaslangic, gecerlilikBitisi: formBitis,
        tavanUcret: tavan, aciklama: formAciklama, aktifMi: formAktif
      } : k);
      persistAndSet(updated);
    } else {
      const yeni: KidemKaydi = {
        id: uid(), yil, gecerlilikBaslangici: formBaslangic, gecerlilikBitisi: formBitis,
        tavanUcret: tavan, aciklama: formAciklama, aktifMi: formAktif
      };
      persistAndSet([...kayitlar, yeni]);
      setSelectedId(yeni.id);
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (!deletingKayit) return;
    const updated = kayitlar.filter(k => k.id !== deletingKayit.id);
    persistAndSet(updated);
    if (selectedId === deletingKayit.id) {
      setSelectedId(updated.length > 0 ? updated[0].id : null);
    }
    setDeletingKayit(null);
  }

  const tabItems: TabItem[] = sorted.map((k) => ({
    key: k.id,
    label: (
      <div className="flex flex-col">
        <span className="font-semibold">{formatTL(k.tavanUcret)}</span>
        <span className="text-[10px] opacity-60 font-normal">
          {k.gecerlilikBaslangici} → {k.gecerlilikBitisi || "Süresiz"}
        </span>
      </div>
    ),
    icon: <History />,
    badge: k.aktifMi ? "Aktif" : undefined,
    content: (
      <div className="flex flex-col min-w-0 h-full">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Kıdem Tazminatı Tavan Ücreti</h2>
              <p className="text-xs text-slate-500 mt-0.5">{k.gecerlilikBaslangici} tarihinden itibaren geçerli.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEdit(k)}
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
                {k.aktifMi ? "Güncel Tavan" : "Arşiv Kaydı"}
              </Badge>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-2 block">
                Tavan Ücreti (Brüt)
              </span>
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4 tabular-nums">
                {formatTL(k.tavanUcret)}
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
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Açıklama</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {k.aciklama || "Dönem açıklaması bulunmuyor."}
                </p>
              </div>
              <div className="p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Hesaplama Notu</span>
                </div>
                <p className="text-[11px] text-blue-600/80 dark:text-blue-400 font-medium leading-relaxed">
                  Kıdem tazminatı hesaplanırken, çalışanın brüt maaşı bu tavanı aşamaz. Tavanı aşan kısım için kıdem
                  tazminatı ödenmez.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Genel Bilgi</h4>
              <div className="space-y-3 text-xs text-slate-500 leading-relaxed">
                <p>
                  Kıdem tazminatı tavanı, en yüksek devlet memuruna bir hizmet yılı için ödenecek azami emeklilik
                  ikramiyesi tutarını ifade eder.
                </p>
                <p>
                  Hazine ve Maliye Bakanlığı tarafından her yıl Ocak ve Temmuz aylarında olmak üzere iki kez yayımlanan
                  katsayılar ile belirlenir.
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
        <Button size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={openAdd}>
          Yeni Tavan Ekle
        </Button>
      </div>

      <Tabs
        orientation="vertical"
        variant="default"
        items={tabItems}
        activeKey={selectedId ?? undefined}
        onChange={setSelectedId}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header
          title={editingKayit ? "Tavan Bilgisini Güncelle" : "Yeni Tavan Girişi"}
          onClose={() => setModalOpen(false)}
          icon={<Scale className="w-4 h-4 text-blue-600" />}
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
              <Modal.Label>Tavan Ücret (Brüt)</Modal.Label>
              <Input
                value={formTavan}
                onChange={(e) => setFormTavan(e.target.value)}
                placeholder="0,00"
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
            placeholder="Örn: 2025 1. Dönem Tavanı"
          />
          <div className="flex items-center justify-between p-1">
            <span className="text-xs font-medium">Güncel kayıt olarak işaretle</span>
            <button
              type="button"
              onClick={() => setFormAktif(!formAktif)}
              className={clsx(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                formAktif ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span
                className={clsx(
                  "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                  formAktif ? "translate-x-[18px]" : "translate-x-[2px]"
                )}
              />
            </button>
          </div>
          {formErr && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{formErr}</div>
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setModalOpen(false)}>
            Vazgeç
          </Button>
          <Button variant="primary" size="xs" onClick={handleSave}>
            Kaydet
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal open={!!deletingKayit} onClose={() => setDeletingKayit(null)} size="sm">
        <Modal.Header
          title="Tavan Kaydını Sil"
          onClose={() => setDeletingKayit(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500" />}
        />
        <Modal.Content>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            Bu döneme ait kıdem tazminatı tavan ücreti silinecektir. Devam etmek istiyor musunuz?
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingKayit(null)}>
            İptal
          </Button>
          <Button variant="danger" size="xs" onClick={handleDelete}>
            Evet, Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
