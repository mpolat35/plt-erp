"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Calendar, ShieldCheck, AlertCircle, ChevronRight, Users, Building2,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import clsx from "clsx";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface SgkKaydi {
  id: string;
  yil: number;
  gecerlilikBaslangici: string;
  gecerlilikBitisi: string;
  aktifMi: boolean;
  // İşçi Payları
  isciUvsk: number;        // Malullük, Yaşlılık ve Ölüm (%9)
  isciGss: number;         // Genel Sağlık Sigortası (%5)
  isciIssizlik: number;    // %1
  // İşveren Payları
  isverenUvsk: number;     // %11
  isverenGss: number;      // %7.5
  isverenKvsk: number;     // Kısa Vadeli Sigorta Kolları (%2)
  isverenIssizlik: number; // %2
  aciklama: string;
}

// ── Initial Data ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "sgk_oranlari_v2";

const INITIAL_DATA: SgkKaydi[] = [
  {
    id: "sgk_2024_d",
    yil: 2024,
    gecerlilikBaslangici: "2024-01-01",
    gecerlilikBitisi: "2024-12-31",
    aktifMi: false,
    isciUvsk: 9,
    isciGss: 5,
    isciIssizlik: 1,
    isverenUvsk: 11,
    isverenGss: 7.5,
    isverenKvsk: 2.25,
    isverenIssizlik: 2,
    aciklama: "2024 yılı standart SGK oranları (%2.25 KVSK)",
  },
  {
    id: "sgk_2025_d",
    yil: 2025,
    gecerlilikBaslangici: "2025-01-01",
    gecerlilikBitisi: "2025-12-31",
    aktifMi: false,
    isciUvsk: 9,
    isciGss: 5,
    isciIssizlik: 1,
    isverenUvsk: 11,
    isverenGss: 7.5,
    isverenKvsk: 2.25,
    isverenIssizlik: 2,
    aciklama: "2025 yılı Ocak ayı itibariyle geçerli oranlar (%2.25 KVSK)",
  },
  {
    id: "sgk_2026_d",
    yil: 2026,
    gecerlilikBaslangici: "2026-01-01",
    gecerlilikBitisi: "2026-12-31",
    aktifMi: true,
    isciUvsk: 9,
    isciGss: 5,
    isciIssizlik: 1,
    isverenUvsk: 11,
    isverenGss: 7.5,
    isverenKvsk: 2.25,
    isverenIssizlik: 2,
    aciklama: "2026 yılı standart SGK oranları",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `sgk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SgkOranlari() {
  const [kayitlar, setKayitlar] = useState<SgkKaydi[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKayit, setEditingKayit] = useState<SgkKaydi | null>(null);
  const [deletingKayit, setDeletingKayit] = useState<SgkKaydi | null>(null);

  // Form states
  const [formYil, setFormYil] = useState("");
  const [formBaslangic, setFormBaslangic] = useState("");
  const [formBitis, setFormBitis] = useState("");
  const [formIsciUvsk, setFormIsciUvsk] = useState("9");
  const [formIsciGss, setFormIsciGss] = useState("5");
  const [formIsciIssizlik, setFormIsciIssizlik] = useState("1");
  const [formIsverenUvsk, setFormIsverenUvsk] = useState("11");
  const [formIsverenGss, setFormIsverenGss] = useState("7.5");
  const [formIsverenKvsk, setFormIsverenKvsk] = useState("2");
  const [formIsverenIssizlik, setFormIsverenIssizlik] = useState("2");
  const [formAciklama, setFormAciklama] = useState("");
  const [formAktif, setFormAktif] = useState(true);
  const [formErr, setFormErr] = useState("");

  // Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SgkKaydi[];
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

  function persistAndSet(list: SgkKaydi[]) {
    setKayitlar(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  const selected = kayitlar.find((k) => k.id === selectedId) ?? null;
  const sorted = [...kayitlar].sort((a, b) => b.yil - a.yil || b.gecerlilikBaslangici.localeCompare(a.gecerlilikBaslangici));

  // CRUD
  function openAdd() {
    setEditingKayit(null);
    setFormYil(String(new Date().getFullYear()));
    setFormBaslangic("");
    setFormBitis("");
    setFormIsciUvsk("9");
    setFormIsciGss("5");
    setFormIsciIssizlik("1");
    setFormIsverenUvsk("11");
    setFormIsverenGss("7.5");
    setFormIsverenKvsk("2.25");
    setFormIsverenIssizlik("2");
    setFormAciklama("");
    setFormAktif(true);
    setFormErr("");
    setModalOpen(true);
  }

  function openEdit(k: SgkKaydi) {
    setEditingKayit(k);
    setFormYil(String(k.yil));
    setFormBaslangic(k.gecerlilikBaslangici);
    setFormBitis(k.gecerlilikBitisi);
    setFormIsciUvsk(String(k.isciUvsk));
    setFormIsciGss(String(k.isciGss));
    setFormIsciIssizlik(String(k.isciIssizlik));
    setFormIsverenUvsk(String(k.isverenUvsk));
    setFormIsverenGss(String(k.isverenGss));
    setFormIsverenKvsk(String(k.isverenKvsk));
    setFormIsverenIssizlik(String(k.isverenIssizlik));
    setFormAciklama(k.aciklama);
    setFormAktif(k.aktifMi);
    setFormErr("");
    setModalOpen(true);
  }

  function handleSave() {
    const yil = Number(formYil);
    if (isNaN(yil) || yil < 2000 || yil > 2100) { setFormErr("Geçerli bir yıl girin"); return; }
    if (!formBaslangic) { setFormErr("Başlangıç tarihi zorunludur"); return; }
    
    const iUv = Number(formIsciUvsk.replace(",", "."));
    const iGs = Number(formIsciGss.replace(",", "."));
    const iIs = Number(formIsciIssizlik.replace(",", "."));
    const vUv = Number(formIsverenUvsk.replace(",", "."));
    const vGs = Number(formIsverenGss.replace(",", "."));
    const vKv = Number(formIsverenKvsk.replace(",", "."));
    const vIs = Number(formIsverenIssizlik.replace(",", "."));

    if (isNaN(iUv) || iUv < 0 || iUv > 100) { setFormErr("Geçerli oran (işçi UVSK) girin"); return; }
    if (isNaN(vUv) || vUv < 0 || vUv > 100) { setFormErr("Geçerli oran (işveren UVSK) girin"); return; }

    if (editingKayit) {
      const updated = kayitlar.map(k => k.id === editingKayit.id ? {
        ...k, yil, gecerlilikBaslangici: formBaslangic, gecerlilikBitisi: formBitis,
        isciUvsk: iUv, isciGss: iGs, isciIssizlik: iIs, 
        isverenUvsk: vUv, isverenGss: vGs, isverenKvsk: vKv, isverenIssizlik: vIs,
        aciklama: formAciklama, aktifMi: formAktif
      } : k);
      persistAndSet(updated);
    } else {
      const yeni: SgkKaydi = {
        id: uid(), yil, gecerlilikBaslangici: formBaslangic, gecerlilikBitisi: formBitis,
        isciUvsk: iUv, isciGss: iGs, isciIssizlik: iIs, 
        isverenUvsk: vUv, isverenGss: vGs, isverenKvsk: vKv, isverenIssizlik: vIs,
        aciklama: formAciklama, aktifMi: formAktif
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

  // Toplamlar
  const totalIsci = selected ? (selected.isciUvsk + selected.isciGss + selected.isciIssizlik) : 0;
  const totalIsveren = selected ? (selected.isverenUvsk + selected.isverenGss + selected.isverenKvsk + selected.isverenIssizlik) : 0;

  const tabItems: TabItem[] = sorted.map((k) => ({
    key: k.id,
    label: (
      <div className="flex flex-col">
        <span className="font-semibold">{k.yil} Oranları</span>
        <span className="text-[10px] opacity-60 font-normal">
          {k.gecerlilikBaslangici} → {k.gecerlilikBitisi || "Süresiz"}
        </span>
      </div>
    ),
    icon: <Calendar />,
    badge: k.aktifMi ? "Aktif" : undefined,
    content: (
      <div className="flex flex-col min-w-0">
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                {k.yil} SGK Detaylı Oranları
              </h2>
              {k.aktifMi ? <Badge variant="emerald">Aktif</Badge> : <Badge variant="slate">Pasif</Badge>}
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-7">{k.aciklama || "Açıklama belirtilmemiş"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEdit(k)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 transition-colors bg-white dark:bg-slate-900"
            >
              <Pencil className="w-3.5 h-3.5" /> Güncelle
            </button>
            <button
              onClick={() => setDeletingKayit(k)}
              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-8 space-y-8 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* İşçi Kısmı */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-6 py-4 bg-blue-50/50 dark:bg-blue-900/20 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    İşçi Payları
                  </span>
                  <p className="text-[10px] text-slate-500">Maaşından kesilen yasal paylar</p>
                </div>
              </div>
              <div className="p-6 space-y-4 flex-1">
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      UVSK (Malullük, Yaşlılık, Ölüm)
                    </span>
                    <Info className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-900/50 px-3 py-1 rounded-lg tabular-nums">
                    %{k.isciUvsk.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      GSS (Genel Sağlık Sigortası)
                    </span>
                    <Info className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-900/50 px-3 py-1 rounded-lg tabular-nums">
                    %{k.isciGss.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">İşsizlik Sigortası</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-900/50 px-3 py-1 rounded-lg tabular-nums">
                    %{k.isciIssizlik.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mx-6 mb-6 p-4 rounded-xl bg-blue-600 flex justify-between items-center shadow-md">
                <span className="text-xs font-bold text-blue-100 uppercase">Toplam İşçi Kesintisi</span>
                <span className="text-xl font-black text-white tabular-nums">
                  %{(k.isciUvsk + k.isciGss + k.isciIssizlik).toFixed(2)}
                </span>
              </div>
            </div>

            {/* İşveren Kısmı */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-6 py-4 bg-indigo-50/50 dark:bg-indigo-900/20 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-sm">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    İşveren Payları
                  </span>
                  <p className="text-[10px] text-slate-500">İşveren adına ödenen ek primler</p>
                </div>
              </div>
              <div className="p-6 space-y-4 flex-1">
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      UVSK (Malullük, Yaşlılık, Ölüm)
                    </span>
                    <Info className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50 px-3 py-1 rounded-lg tabular-nums">
                    %{k.isverenUvsk.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      GSS (Genel Sağlık Sigortası)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50 px-3 py-1 rounded-lg tabular-nums">
                    %{k.isverenGss.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      KVSK (Kısa Vadeli Sigorta Kolları)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50 px-3 py-1 rounded-lg tabular-nums">
                    %{k.isverenKvsk.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">İşsizlik Sigortası</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50 px-3 py-1 rounded-lg tabular-nums">
                    %{k.isverenIssizlik.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mx-6 mb-6 p-4 rounded-xl bg-indigo-600 flex justify-between items-center shadow-md">
                <span className="text-xs font-bold text-indigo-100 uppercase">Toplam İşveren Payı</span>
                <span className="text-xl font-black text-white tabular-nums">
                  %{(k.isverenUvsk + k.isverenGss + k.isverenKvsk + k.isverenIssizlik).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Bordro Hesaplama Bilgisi</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
              <div className="space-y-3">
                <p className="font-semibold text-slate-700 dark:text-slate-300">UVSK: Uzun Vadeli Sigorta Kolları</p>
                <p className="text-slate-500">
                  Çalışanın emeklilik haklarını ve yaşlılık sigortasını finanse eden temel fondur. Türkiye
                  standartlarında toplam %20 olup, bunun %9'u çalışan, %11'i işveren tarafından karşılanır.
                </p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">GSS: Genel Sağlık Sigortası</p>
                <p className="text-slate-500">
                  Sağlık hizmetlerinden yararlanmayı sağlar. Toplam %12.5 olup, %5 işçi, %7.5 işveren payıdır.
                </p>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-slate-700 dark:text-slate-300">KVSK: Kısa Vadeli Sigorta Kolları</p>
                <p className="text-slate-500">
                  İş kazası, meslek hastalığı, hastalık ve analık gibi durumları kapsar. İşyerinin tehlike sınıfına göre
                  eskiden değişse de günümüzde genellikle %2 olarak uygulanır (Tamamı işveren).
                </p>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 mt-2">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>GENEL TOPLAM YÜKÜ</span>
                    <span>%{((k.isciUvsk + k.isciGss + k.isciIssizlik) + (k.isverenUvsk + k.isverenGss + k.isverenKvsk + k.isverenIssizlik)).toFixed(2)}</span>
                  </div>
                </div>
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

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header
          title={editingKayit ? "Detaylı Oranları Güncelle" : "Yeni Detaylı Oran Girişi"}
          onClose={() => setModalOpen(false)}
          icon={<ShieldCheck className="w-4 h-4 text-blue-600" />}
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
              <Modal.Label>Başlangıç Tarihi</Modal.Label>
              <Input
                value={formBaslangic}
                onChange={(e) => setFormBaslangic(e.target.value)}
                type="date"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-4">
                İşçi Payları (%)
              </span>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  value={formIsciUvsk}
                  onChange={(e) => setFormIsciUvsk(e.target.value)}
                  label="UVSK"
                  placeholder="9"
                />
                <Input
                  value={formIsciGss}
                  onChange={(e) => setFormIsciGss(e.target.value)}
                  label="GSS"
                  placeholder="5"
                />
                <Input
                  value={formIsciIssizlik}
                  onChange={(e) => setFormIsciIssizlik(e.target.value)}
                  label="İşsizlik"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-4">
                İşveren Payları (%)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input
                  value={formIsverenUvsk}
                  onChange={(e) => setFormIsverenUvsk(e.target.value)}
                  label="UVSK"
                  placeholder="11"
                />
                <Input
                  value={formIsverenGss}
                  onChange={(e) => setFormIsverenGss(e.target.value)}
                  label="GSS"
                  placeholder="7.5"
                />
                <Input
                  value={formIsverenKvsk}
                  onChange={(e) => setFormIsverenKvsk(e.target.value)}
                  label="KVSK"
                  placeholder="2"
                />
                <Input
                  value={formIsverenIssizlik}
                  onChange={(e) => setFormIsverenIssizlik(e.target.value)}
                  label="İşsizlik"
                  placeholder="2"
                />
              </div>
            </div>
          </div>

          <Input
            value={formAciklama}
            onChange={(e) => setFormAciklama(e.target.value)}
            label="Açıklama"
            placeholder="Örn: 2025 Standart Bordro Oranları"
          />
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-700">Bu dönem için oranları aktif et</span>
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
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> {formErr}
            </div>
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setModalOpen(false)}>
            İptal
          </Button>
          <Button variant="primary" size="xs" onClick={handleSave}>
            Kaydet ve Uygula
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onayı */}
      <Modal open={!!deletingKayit} onClose={() => setDeletingKayit(null)} size="sm">
        <Modal.Header
          title="Kaydı Sil"
          onClose={() => setDeletingKayit(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500" />}
        />
        <Modal.Content>
          <p className="text-sm text-slate-500">
            Bu döneme ait tüm detaylı SGK oranları silinecektir. Emin misiniz?
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingKayit(null)}>
            Vazgeç
          </Button>
          <Button variant="danger" size="xs" onClick={handleDelete}>
            Evet, Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
