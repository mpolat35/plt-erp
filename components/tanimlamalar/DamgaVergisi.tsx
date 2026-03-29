"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, ChevronRight,
  Calendar, AlertCircle, FileText, Hash
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

type OranTuru = "binde" | "maktu";

interface DamgaVergisiKalemi {
  id: string;
  sira: number;
  kategori: string;
  belgeAdi: string;
  oranTuru: OranTuru;
  oran: number; // binde: ör. 9.48 → binde 9,48 | maktu: TL tutarı
}

interface DamgaVergisiKaydi {
  id: string;
  yil: number;
  gecerlilikBaslangici: string;
  gecerlilikBitisi: string;
  aciklama: string;
  aktifMi: boolean;
  kalemler: DamgaVergisiKalemi[];
}

// ── Initial Data ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "damga_vergisi_v1";

const KATEGORILER = [
  "Akitlerle İlgili Kağıtlar",
  "Kararlar ve Mazbatalar",
  "Ticari İşlemlerde Kullanılan Kağıtlar",
  "Makbuzlar ve Diğer Kağıtlar",
  "Resmi Daireler Arası",
];

const INITIAL_DATA: DamgaVergisiKaydi[] = [
  {
    id: "dv_2024",
    yil: 2024,
    gecerlilikBaslangici: "2024-01-01",
    gecerlilikBitisi: "2024-12-31",
    aciklama: "2024 yılı damga vergisi oranları",
    aktifMi: false,
    kalemler: [
      { id: "dv24_01", sira: 1,  kategori: "Akitlerle İlgili Kağıtlar",             belgeAdi: "Mukaveleneme (sözleşme)",                    oranTuru: "binde", oran: 9.48  },
      { id: "dv24_02", sira: 2,  kategori: "Akitlerle İlgili Kağıtlar",             belgeAdi: "Kira sözleşmesi",                            oranTuru: "binde", oran: 1.89  },
      { id: "dv24_03", sira: 3,  kategori: "Akitlerle İlgili Kağıtlar",             belgeAdi: "Taahhütname",                                oranTuru: "binde", oran: 9.48  },
      { id: "dv24_04", sira: 4,  kategori: "Akitlerle İlgili Kağıtlar",             belgeAdi: "Rehin senedi",                               oranTuru: "binde", oran: 9.48  },
      { id: "dv24_05", sira: 5,  kategori: "Akitlerle İlgili Kağıtlar",             belgeAdi: "Hisse senedi devir senedi",                  oranTuru: "binde", oran: 1.89  },
      { id: "dv24_06", sira: 6,  kategori: "Kararlar ve Mazbatalar",                belgeAdi: "İhale kararları",                            oranTuru: "binde", oran: 5.69  },
      { id: "dv24_07", sira: 7,  kategori: "Kararlar ve Mazbatalar",                belgeAdi: "Ticaret sicili kararları",                   oranTuru: "binde", oran: 5.69  },
      { id: "dv24_08", sira: 8,  kategori: "Ticari İşlemlerde Kullanılan Kağıtlar", belgeAdi: "Maaş, ücret, gündelik ödemelere ait pusula", oranTuru: "binde", oran: 7.59  },
      { id: "dv24_09", sira: 9,  kategori: "Ticari İşlemlerde Kullanılan Kağıtlar", belgeAdi: "Beyanname (gümrük idarelerine verilen)",      oranTuru: "binde", oran: 9.48  },
      { id: "dv24_10", sira: 10, kategori: "Makbuzlar ve Diğer Kağıtlar",           belgeAdi: "Makbuzlar (genel)",                          oranTuru: "binde", oran: 9.48  },
      { id: "dv24_11", sira: 11, kategori: "Makbuzlar ve Diğer Kağıtlar",           belgeAdi: "Akreditif mektupları",                       oranTuru: "binde", oran: 9.48  },
      { id: "dv24_12", sira: 12, kategori: "Resmi Daireler Arası",                  belgeAdi: "Resmi daireler arası yazışmalar",             oranTuru: "maktu", oran: 0     },
    ],
  },
  {
    id: "dv_2025",
    yil: 2025,
    gecerlilikBaslangici: "2025-01-01",
    gecerlilikBitisi: "2025-12-31",
    aciklama: "2025 yılı damga vergisi oranları",
    aktifMi: true,
    kalemler: [
      { id: "dv25_01", sira: 1,  kategori: "Akitlerle İlgili Kağıtlar",             belgeAdi: "Mukaveleneme (sözleşme)",                    oranTuru: "binde", oran: 9.48  },
      { id: "dv25_02", sira: 2,  kategori: "Akitlerle İlgili Kağıtlar",             belgeAdi: "Kira sözleşmesi",                            oranTuru: "binde", oran: 1.89  },
      { id: "dv25_03", sira: 3,  kategori: "Akitlerle İlgili Kağıtlar",             belgeAdi: "Taahhütname",                                oranTuru: "binde", oran: 9.48  },
      { id: "dv25_04", sira: 4,  kategori: "Akitlerle İlgili Kağıtlar",             belgeAdi: "Rehin senedi",                               oranTuru: "binde", oran: 9.48  },
      { id: "dv25_05", sira: 5,  kategori: "Akitlerle İlgili Kağıtlar",             belgeAdi: "Hisse senedi devir senedi",                  oranTuru: "binde", oran: 1.89  },
      { id: "dv25_06", sira: 6,  kategori: "Kararlar ve Mazbatalar",                belgeAdi: "İhale kararları",                            oranTuru: "binde", oran: 5.69  },
      { id: "dv25_07", sira: 7,  kategori: "Kararlar ve Mazbatalar",                belgeAdi: "Ticaret sicili kararları",                   oranTuru: "binde", oran: 5.69  },
      { id: "dv25_08", sira: 8,  kategori: "Ticari İşlemlerde Kullanılan Kağıtlar", belgeAdi: "Maaş, ücret, gündelik ödemelere ait pusula", oranTuru: "binde", oran: 7.59  },
      { id: "dv25_09", sira: 9,  kategori: "Ticari İşlemlerde Kullanılan Kağıtlar", belgeAdi: "Beyanname (gümrük idarelerine verilen)",      oranTuru: "binde", oran: 9.48  },
      { id: "dv25_10", sira: 10, kategori: "Makbuzlar ve Diğer Kağıtlar",           belgeAdi: "Makbuzlar (genel)",                          oranTuru: "binde", oran: 9.48  },
      { id: "dv25_11", sira: 11, kategori: "Makbuzlar ve Diğer Kağıtlar",           belgeAdi: "Akreditif mektupları",                       oranTuru: "binde", oran: 9.48  },
      { id: "dv25_12", sira: 12, kategori: "Resmi Daireler Arası",                  belgeAdi: "Resmi daireler arası yazışmalar",             oranTuru: "maktu", oran: 0     },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `dv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function formatOran(kalem: DamgaVergisiKalemi) {
  if (kalem.oranTuru === "maktu") {
    return kalem.oran === 0
      ? "İstisna"
      : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(kalem.oran) + " ₺";
  }
  return `‰ ${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(kalem.oran)}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DamgaVergisi() {
  const [kayitlar, setKayitlar] = useState<DamgaVergisiKaydi[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Dönem modal
  const [donemModalOpen, setDonemModalOpen] = useState(false);
  const [editingDonem, setEditingDonem] = useState<DamgaVergisiKaydi | null>(null);
  const [deletingDonem, setDeletingDonem] = useState<DamgaVergisiKaydi | null>(null);

  // Dönem form
  const [formYil, setFormYil] = useState("");
  const [formBaslangic, setFormBaslangic] = useState("");
  const [formBitis, setFormBitis] = useState("");
  const [formAciklama, setFormAciklama] = useState("");
  const [formAktif, setFormAktif] = useState(true);
  const [formErr, setFormErr] = useState("");

  // Kalem modal
  const [kalemModalOpen, setKalemModalOpen] = useState(false);
  const [editingKalem, setEditingKalem] = useState<DamgaVergisiKalemi | null>(null);
  const [deletingKalem, setDeletingKalem] = useState<DamgaVergisiKalemi | null>(null);

  // Kalem form
  const [kFormKategori, setKFormKategori] = useState("");
  const [kFormBelgeAdi, setKFormBelgeAdi] = useState("");
  const [kFormOranTuru, setKFormOranTuru] = useState<OranTuru>("binde");
  const [kFormOran, setKFormOran] = useState("");
  const [kFormErr, setKFormErr] = useState("");

  // Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DamgaVergisiKaydi[];
        setKayitlar(parsed);
        const s = [...parsed].sort((a, b) => b.yil - a.yil);
        if (s.length > 0) setSelectedId(s[0].id);
      } catch {
        setKayitlar(INITIAL_DATA);
        setSelectedId(INITIAL_DATA[INITIAL_DATA.length - 1].id);
      }
    } else {
      setKayitlar(INITIAL_DATA);
      setSelectedId(INITIAL_DATA[INITIAL_DATA.length - 1].id);
    }
  }, []);

  function persist(list: DamgaVergisiKaydi[]) {
    setKayitlar(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  const selected = kayitlar.find((k) => k.id === selectedId) ?? null;
  const sorted = [...kayitlar].sort((a, b) => b.yil - a.yil);

  // ── Dönem CRUD ──

  function openAddDonem() {
    setEditingDonem(null);
    setFormYil("");
    setFormBaslangic("");
    setFormBitis("");
    setFormAciklama("");
    setFormAktif(true);
    setFormErr("");
    setDonemModalOpen(true);
  }

  function openEditDonem(k: DamgaVergisiKaydi) {
    setEditingDonem(k);
    setFormYil(String(k.yil));
    setFormBaslangic(k.gecerlilikBaslangici);
    setFormBitis(k.gecerlilikBitisi ?? "");
    setFormAciklama(k.aciklama);
    setFormAktif(k.aktifMi);
    setFormErr("");
    setDonemModalOpen(true);
  }

  function saveDonem() {
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
    const duplicate = kayitlar.find((k) => k.yil === yil && k.id !== editingDonem?.id);
    if (duplicate) {
      setFormErr(`${yil} yılına ait kayıt zaten mevcut`);
      return;
    }

    if (editingDonem) {
      persist(kayitlar.map((k) =>
        k.id === editingDonem.id
          ? { ...k, yil, gecerlilikBaslangici: formBaslangic, gecerlilikBitisi: formBitis, aciklama: formAciklama, aktifMi: formAktif }
          : k
      ));
    } else {
      const kayit: DamgaVergisiKaydi = {
        id: uid(), yil,
        gecerlilikBaslangici: formBaslangic,
        gecerlilikBitisi: formBitis,
        aciklama: formAciklama,
        aktifMi: formAktif,
        kalemler: [],
      };
      persist([...kayitlar, kayit]);
      setSelectedId(kayit.id);
    }
    setDonemModalOpen(false);
  }

  function deleteDonem() {
    if (!deletingDonem) return;
    const updated = kayitlar.filter((k) => k.id !== deletingDonem.id);
    persist(updated);
    if (selectedId === deletingDonem.id) {
      const remaining = [...updated].sort((a, b) => b.yil - a.yil);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
    setDeletingDonem(null);
  }

  // ── Kalem CRUD ──

  function openAddKalem() {
    setEditingKalem(null);
    setKFormKategori("");
    setKFormBelgeAdi("");
    setKFormOranTuru("binde");
    setKFormOran("");
    setKFormErr("");
    setKalemModalOpen(true);
  }

  function openEditKalem(kalem: DamgaVergisiKalemi) {
    setEditingKalem(kalem);
    setKFormKategori(kalem.kategori);
    setKFormBelgeAdi(kalem.belgeAdi);
    setKFormOranTuru(kalem.oranTuru);
    setKFormOran(String(kalem.oran));
    setKFormErr("");
    setKalemModalOpen(true);
  }

  function saveKalem() {
    if (!selected) return;
    if (!kFormKategori.trim()) { setKFormErr("Kategori zorunludur"); return; }
    if (!kFormBelgeAdi.trim()) { setKFormErr("Belge adı zorunludur"); return; }
    const oran = Number(kFormOran);
    if (isNaN(oran) || oran < 0) { setKFormErr("Oran geçersiz"); return; }
    if (kFormOranTuru === "binde" && oran >= 1000) { setKFormErr("Binde oran 1000'den küçük olmalı"); return; }

    if (editingKalem) {
      persist(kayitlar.map((k) =>
        k.id === selected.id
          ? {
              ...k,
              kalemler: k.kalemler.map((item) =>
                item.id === editingKalem.id
                  ? { ...item, kategori: kFormKategori.trim(), belgeAdi: kFormBelgeAdi.trim(), oranTuru: kFormOranTuru, oran }
                  : item
              ),
            }
          : k
      ));
    } else {
      const newKalem: DamgaVergisiKalemi = {
        id: uid(),
        sira: selected.kalemler.length + 1,
        kategori: kFormKategori.trim(),
        belgeAdi: kFormBelgeAdi.trim(),
        oranTuru: kFormOranTuru,
        oran,
      };
      persist(kayitlar.map((k) =>
        k.id === selected.id ? { ...k, kalemler: [...k.kalemler, newKalem] } : k
      ));
    }
    setKalemModalOpen(false);
  }

  function deleteKalem() {
    if (!selected || !deletingKalem) return;
    persist(kayitlar.map((k) =>
      k.id === selected.id
        ? {
            ...k,
            kalemler: k.kalemler
              .filter((item) => item.id !== deletingKalem.id)
              .map((item, i) => ({ ...item, sira: i + 1 })),
          }
        : k
    ));
    setDeletingKalem(null);
  }

  // Kalemler gruplandırılmış
  const groupedKalemler = selected
    ? selected.kalemler
        .slice()
        .sort((a, b) => a.sira - b.sira)
        .reduce<Record<string, DamgaVergisiKalemi[]>>((acc, item) => {
          if (!acc[item.kategori]) acc[item.kategori] = [];
          acc[item.kategori].push(item);
          return acc;
        }, {})
    : {};

  // ── Render ──

  const tabItems: TabItem[] = sorted.map((k) => {
    // Kategoriye göre kalemleri grupla
    const grouped = k.kalemler
      .slice()
      .sort((a, b) => a.sira - b.sira)
      .reduce<Record<string, DamgaVergisiKalemi[]>>((acc, item) => {
        if (!acc[item.kategori]) acc[item.kategori] = [];
        acc[item.kategori].push(item);
        return acc;
      }, {});

    return {
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
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {k.yil} Yılı Damga Vergisi Oranları
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
                {k.gecerlilikBitisi ? ` – ${k.gecerlilikBitisi}` : " (süresiz)"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => openEditDonem(k)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Düzenle
              </button>
              <button
                onClick={() => setDeletingDonem(k)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Sil
              </button>
            </div>
          </div>

          {/* Kalemler */}
          <div className="flex-1 overflow-auto pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {k.kalemler.length} kalem tanımlı
              </span>
              <Button size="sm" onClick={openAddKalem}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Kalem Ekle
              </Button>
            </div>

            {k.kalemler.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Bu dönem için henüz kalem tanımlanmamış.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped).map(([kategori, items]) => (
                  <div key={kategori}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Hash className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {kategori}
                      </span>
                    </div>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th className="w-10 text-center">#</Th>
                          <Th>Belge / İşlem Türü</Th>
                          <Th className="w-28">Oran Türü</Th>
                          <Th className="w-32">Oran</Th>
                          <Th className="w-20">İşlemler</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {items.map((kalem) => (
                          <Tr key={kalem.id}>
                            <Td className="text-center">
                              <span className="text-xs text-slate-500">{kalem.sira}</span>
                            </Td>
                            <Td>
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {kalem.belgeAdi}
                              </span>
                            </Td>
                            <Td>
                              <span className={clsx(
                                "text-xs px-2 py-0.5 rounded-md font-medium",
                                kalem.oranTuru === "binde"
                                  ? "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                              )}>
                                {kalem.oranTuru === "binde" ? "Binde" : "Maktu"}
                              </span>
                            </Td>
                            <Td>
                              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {formatOran(kalem)}
                              </span>
                            </Td>
                            <Td>
                              <IconButtonRow>
                                <IconButton
                                  variant="edit"
                                  icon={<Pencil />}
                                  onClick={() => openEditKalem(kalem)}
                                  title="Düzenle"
                                />
                                <IconButton
                                  variant="delete"
                                  icon={<Trash2 />}
                                  onClick={() => setDeletingKalem(kalem)}
                                  title="Sil"
                                />
                              </IconButtonRow>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end mb-4">
        <Button size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={openAddDonem}>
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

      {/* ── Dönem Modal ── */}
      <Modal open={donemModalOpen} onClose={() => setDonemModalOpen(false)}>
        <Modal.Header
          title={editingDonem ? "Dönemi Düzenle" : "Yeni Dönem Ekle"}
          onClose={() => setDonemModalOpen(false)}
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
              <Input value={formBaslangic} onChange={(e) => setFormBaslangic(e.target.value)} type="date" />
            </div>
            <div>
              <Modal.Label>Bitiş Tarihi</Modal.Label>
              <Input value={formBitis} onChange={(e) => setFormBitis(e.target.value)} type="date" />
            </div>
          </div>
          <div>
            <Modal.Label>Açıklama</Modal.Label>
            <Input value={formAciklama} onChange={(e) => setFormAciklama(e.target.value)} placeholder="Kısa açıklama..." />
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
          <Button variant="outline" size="xs" onClick={() => setDonemModalOpen(false)}>İptal</Button>
          <Button variant="primary" size="xs" onClick={saveDonem}>{editingDonem ? "Kaydet" : "Ekle"}</Button>
        </Modal.Footer>
      </Modal>

      {/* ── Kalem Modal ── */}
      <Modal open={kalemModalOpen} onClose={() => setKalemModalOpen(false)}>
        <Modal.Header
          title={editingKalem ? "Kalemi Düzenle" : "Yeni Kalem Ekle"}
          onClose={() => setKalemModalOpen(false)}
          icon={<FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        />
        <Modal.Content className="space-y-4">
          <div>
            <Modal.Label>Kategori *</Modal.Label>
            <select
              value={kFormKategori}
              onChange={(e) => setKFormKategori(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              <option value="">Kategori seçin...</option>
              {KATEGORILER.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
              <option value="__diger">Diğer</option>
            </select>
            {kFormKategori === "__diger" && (
              <Input
                className="mt-2"
                value=""
                onChange={(e) => setKFormKategori(e.target.value)}
                placeholder="Kategori adı girin..."
              />
            )}
          </div>
          <div>
            <Modal.Label>Belge / İşlem Adı *</Modal.Label>
            <Input
              value={kFormBelgeAdi}
              onChange={(e) => setKFormBelgeAdi(e.target.value)}
              placeholder="ör. Kira sözleşmesi"
            />
          </div>
          <div>
            <Modal.Label>Oran Türü *</Modal.Label>
            <div className="flex gap-3">
              {(["binde", "maktu"] as OranTuru[]).map((tur) => (
                <button
                  key={tur}
                  type="button"
                  onClick={() => setKFormOranTuru(tur)}
                  className={clsx(
                    "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
                    kFormOranTuru === tur
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-500"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {tur === "binde" ? "Binde (‰)" : "Maktu (₺)"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Modal.Label>
              {kFormOranTuru === "binde" ? "Binde Değeri (ör: 9.48)" : "Maktu Tutar (₺, 0 = İstisna)"}
            </Modal.Label>
            <Input
              value={kFormOran}
              onChange={(e) => setKFormOran(e.target.value)}
              placeholder={kFormOranTuru === "binde" ? "9.48" : "0"}
              type="number"
              step="0.01"
            />
          </div>
          {kFormErr && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600 dark:text-red-400">{kFormErr}</span>
            </div>
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setKalemModalOpen(false)}>İptal</Button>
          <Button variant="primary" size="xs" onClick={saveKalem}>{editingKalem ? "Kaydet" : "Ekle"}</Button>
        </Modal.Footer>
      </Modal>

      {/* ── Dönem Silme Onayı ── */}
      <Modal open={!!deletingDonem} onClose={() => setDeletingDonem(null)} size="sm" zIndex="z-[60]">
        <Modal.Header
          title="Dönemi Sil"
          onClose={() => setDeletingDonem(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950"
        />
        <Modal.Content>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{deletingDonem?.yil}</span>{" "}
            dönemine ait tüm kalemler de silinecektir. Bu işlem geri alınamaz.
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingDonem(null)}>Vazgeç</Button>
          <Button variant="danger" size="xs" onClick={deleteDonem}>Sil</Button>
        </Modal.Footer>
      </Modal>

      {/* ── Kalem Silme Onayı ── */}
      <Modal open={!!deletingKalem} onClose={() => setDeletingKalem(null)} size="sm" zIndex="z-[60]">
        <Modal.Header
          title="Kalemi Sil"
          onClose={() => setDeletingKalem(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950"
        />
        <Modal.Content>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {deletingKalem?.belgeAdi}
            </span>{" "}
            kalemi silinecektir. Bu işlem geri alınamaz.
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingKalem(null)}>Vazgeç</Button>
          <Button variant="danger" size="xs" onClick={deleteKalem}>Sil</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
