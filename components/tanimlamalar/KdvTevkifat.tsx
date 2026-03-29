"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, ChevronRight,
  Calendar, AlertCircle, Receipt, Hash
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

interface KdvTevkifatKalemi {
  id: string;
  sira: number;
  kategori: string;
  islemAdi: string;
  tevkifatOrani: string; // "2/10", "3/10", ... "9/10"
  kdvOrani: number;      // %, örn. 20
}

interface KdvTevkifatKaydi {
  id: string;
  yil: number;
  gecerlilikBaslangici: string;
  gecerlilikBitisi: string; // boş = süresiz
  aciklama: string;
  aktifMi: boolean;
  kalemler: KdvTevkifatKalemi[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "kdv_tevkifat_v1";

const TEVKIFAT_ORANLARI = ["1/10","2/10","3/10","4/10","5/10","6/10","7/10","8/10","9/10"];
const KDV_ORANLARI = [1, 10, 20];

const KATEGORILER = [
  "Hizmetler",
  "Teslimler",
  "Yapım ve İnşaat",
  "Temizlik ve Bakım",
  "İşgücü ve Güvenlik",
];

const INITIAL_DATA: KdvTevkifatKaydi[] = [
  {
    id: "kt_2023",
    yil: 2023,
    gecerlilikBaslangici: "2023-07-10",
    gecerlilikBitisi: "2024-12-31",
    aciklama: "7/7/2023 tarihli tebliğ ile güncellenen oranlar",
    aktifMi: false,
    kalemler: [
      { id: "kt23_01", sira: 1,  kategori: "Yapım ve İnşaat",      islemAdi: "Yapım işleri ve mühendislik-mimarlık-etüt-proje hizmetleri", tevkifatOrani: "4/10", kdvOrani: 20 },
      { id: "kt23_02", sira: 2,  kategori: "Hizmetler",             islemAdi: "Etüt, plan-proje, danışmanlık, denetim hizmetleri",          tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt23_03", sira: 3,  kategori: "Hizmetler",             islemAdi: "Makine, teçhizat ve taşıtlara bakım-onarım hizmetleri",      tevkifatOrani: "5/10", kdvOrani: 20 },
      { id: "kt23_04", sira: 4,  kategori: "Hizmetler",             islemAdi: "Yemek servisi ve organizasyon hizmetleri",                   tevkifatOrani: "5/10", kdvOrani: 20 },
      { id: "kt23_05", sira: 5,  kategori: "İşgücü ve Güvenlik",    islemAdi: "İşgücü temin hizmetleri",                                   tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt23_06", sira: 6,  kategori: "İşgücü ve Güvenlik",    islemAdi: "Özel güvenlik hizmetleri",                                  tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt23_07", sira: 7,  kategori: "Yapım ve İnşaat",       islemAdi: "Yapı denetim hizmetleri",                                   tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt23_08", sira: 8,  kategori: "Temizlik ve Bakım",     islemAdi: "Temizlik, çevre ve bahçe bakım hizmetleri",                  tevkifatOrani: "7/10", kdvOrani: 20 },
      { id: "kt23_09", sira: 9,  kategori: "Hizmetler",             islemAdi: "Servis taşımacılığı hizmeti",                               tevkifatOrani: "5/10", kdvOrani: 20 },
      { id: "kt23_10", sira: 10, kategori: "Hizmetler",             islemAdi: "Fason tekstil ve konfeksiyon işleri",                       tevkifatOrani: "7/10", kdvOrani: 20 },
      { id: "kt23_11", sira: 11, kategori: "Teslimler",             islemAdi: "Külçe metal teslimleri",                                    tevkifatOrani: "7/10", kdvOrani: 20 },
      { id: "kt23_12", sira: 12, kategori: "Teslimler",             islemAdi: "Bakır, çinko, alüminyum, kurşun ürünleri teslimi",          tevkifatOrani: "7/10", kdvOrani: 20 },
      { id: "kt23_13", sira: 13, kategori: "Teslimler",             islemAdi: "Metal, plastik, lastik, kâğıt, cam hurda ve atıkları",      tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt23_14", sira: 14, kategori: "Teslimler",             islemAdi: "Pamuk, tiftik, yün, yapağı, ham post ve deri teslimi",      tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt23_15", sira: 15, kategori: "Teslimler",             islemAdi: "Ağaç ve orman ürünleri teslimi",                            tevkifatOrani: "5/10", kdvOrani: 20 },
    ],
  },
  {
    id: "kt_2025",
    yil: 2025,
    gecerlilikBaslangici: "2025-01-01",
    gecerlilikBitisi: "",
    aciklama: "2025 yılı KDV tevkifat oranları (süresiz)",
    aktifMi: true,
    kalemler: [
      { id: "kt25_01", sira: 1,  kategori: "Yapım ve İnşaat",      islemAdi: "Yapım işleri ve mühendislik-mimarlık-etüt-proje hizmetleri", tevkifatOrani: "4/10", kdvOrani: 20 },
      { id: "kt25_02", sira: 2,  kategori: "Hizmetler",             islemAdi: "Etüt, plan-proje, danışmanlık, denetim hizmetleri",          tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt25_03", sira: 3,  kategori: "Hizmetler",             islemAdi: "Makine, teçhizat ve taşıtlara bakım-onarım hizmetleri",      tevkifatOrani: "5/10", kdvOrani: 20 },
      { id: "kt25_04", sira: 4,  kategori: "Hizmetler",             islemAdi: "Yemek servisi ve organizasyon hizmetleri",                   tevkifatOrani: "5/10", kdvOrani: 20 },
      { id: "kt25_05", sira: 5,  kategori: "İşgücü ve Güvenlik",    islemAdi: "İşgücü temin hizmetleri",                                   tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt25_06", sira: 6,  kategori: "İşgücü ve Güvenlik",    islemAdi: "Özel güvenlik hizmetleri",                                  tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt25_07", sira: 7,  kategori: "Yapım ve İnşaat",       islemAdi: "Yapı denetim hizmetleri",                                   tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt25_08", sira: 8,  kategori: "Temizlik ve Bakım",     islemAdi: "Temizlik, çevre ve bahçe bakım hizmetleri",                  tevkifatOrani: "7/10", kdvOrani: 20 },
      { id: "kt25_09", sira: 9,  kategori: "Hizmetler",             islemAdi: "Servis taşımacılığı hizmeti",                               tevkifatOrani: "5/10", kdvOrani: 20 },
      { id: "kt25_10", sira: 10, kategori: "Hizmetler",             islemAdi: "Fason tekstil ve konfeksiyon işleri",                       tevkifatOrani: "7/10", kdvOrani: 20 },
      { id: "kt25_11", sira: 11, kategori: "Teslimler",             islemAdi: "Külçe metal teslimleri",                                    tevkifatOrani: "7/10", kdvOrani: 20 },
      { id: "kt25_12", sira: 12, kategori: "Teslimler",             islemAdi: "Bakır, çinko, alüminyum, kurşun ürünleri teslimi",          tevkifatOrani: "7/10", kdvOrani: 20 },
      { id: "kt25_13", sira: 13, kategori: "Teslimler",             islemAdi: "Metal, plastik, lastik, kâğıt, cam hurda ve atıkları",      tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt25_14", sira: 14, kategori: "Teslimler",             islemAdi: "Pamuk, tiftik, yün, yapağı, ham post ve deri teslimi",      tevkifatOrani: "9/10", kdvOrani: 20 },
      { id: "kt25_15", sira: 15, kategori: "Teslimler",             islemAdi: "Ağaç ve orman ürünleri teslimi",                            tevkifatOrani: "5/10", kdvOrani: 20 },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `kt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function KdvTevkifat() {
  const [kayitlar, setKayitlar] = useState<KdvTevkifatKaydi[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Dönem modal
  const [donemModalOpen, setDonemModalOpen] = useState(false);
  const [editingDonem, setEditingDonem] = useState<KdvTevkifatKaydi | null>(null);
  const [deletingDonem, setDeletingDonem] = useState<KdvTevkifatKaydi | null>(null);

  // Dönem form
  const [formYil, setFormYil] = useState("");
  const [formBaslangic, setFormBaslangic] = useState("");
  const [formBitis, setFormBitis] = useState("");
  const [formAciklama, setFormAciklama] = useState("");
  const [formAktif, setFormAktif] = useState(true);
  const [formErr, setFormErr] = useState("");

  // Kalem modal
  const [kalemModalOpen, setKalemModalOpen] = useState(false);
  const [editingKalem, setEditingKalem] = useState<KdvTevkifatKalemi | null>(null);
  const [deletingKalem, setDeletingKalem] = useState<KdvTevkifatKalemi | null>(null);

  // Kalem form
  const [kFormKategori, setKFormKategori] = useState("");
  const [kFormKategoriOzel, setKFormKategoriOzel] = useState("");
  const [kFormIslemAdi, setKFormIslemAdi] = useState("");
  const [kFormTevkifat, setKFormTevkifat] = useState("9/10");
  const [kFormKdvOrani, setKFormKdvOrani] = useState(20);
  const [kFormErr, setKFormErr] = useState("");

  // Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as KdvTevkifatKaydi[];
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

  function persist(list: KdvTevkifatKaydi[]) {
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

  function openEditDonem(k: KdvTevkifatKaydi) {
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
    if (isNaN(yil) || yil < 2000 || yil > 2100) { setFormErr("Geçerli bir yıl girin (2000-2100)"); return; }
    if (!formBaslangic) { setFormErr("Başlangıç tarihi zorunludur"); return; }
    if (formBitis && formBitis <= formBaslangic) { setFormErr("Bitiş tarihi başlangıç tarihinden sonra olmalı"); return; }
    const dup = kayitlar.find((k) => k.yil === yil && k.id !== editingDonem?.id);
    if (dup) { setFormErr(`${yil} yılına ait kayıt zaten mevcut`); return; }

    if (editingDonem) {
      persist(kayitlar.map((k) =>
        k.id === editingDonem.id
          ? { ...k, yil, gecerlilikBaslangici: formBaslangic, gecerlilikBitisi: formBitis, aciklama: formAciklama, aktifMi: formAktif }
          : k
      ));
    } else {
      const kayit: KdvTevkifatKaydi = {
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
      const rem = [...updated].sort((a, b) => b.yil - a.yil);
      setSelectedId(rem.length > 0 ? rem[0].id : null);
    }
    setDeletingDonem(null);
  }

  // ── Kalem CRUD ──

  function openAddKalem() {
    setEditingKalem(null);
    setKFormKategori("");
    setKFormKategoriOzel("");
    setKFormIslemAdi("");
    setKFormTevkifat("9/10");
    setKFormKdvOrani(20);
    setKFormErr("");
    setKalemModalOpen(true);
  }

  function openEditKalem(kalem: KdvTevkifatKalemi) {
    setEditingKalem(kalem);
    const stdKat = KATEGORILER.includes(kalem.kategori);
    setKFormKategori(stdKat ? kalem.kategori : "__diger");
    setKFormKategoriOzel(stdKat ? "" : kalem.kategori);
    setKFormIslemAdi(kalem.islemAdi);
    setKFormTevkifat(kalem.tevkifatOrani);
    setKFormKdvOrani(kalem.kdvOrani);
    setKFormErr("");
    setKalemModalOpen(true);
  }

  function saveKalem() {
    if (!selected) return;
    const kategori = kFormKategori === "__diger" ? kFormKategoriOzel.trim() : kFormKategori;
    if (!kategori) { setKFormErr("Kategori zorunludur"); return; }
    if (!kFormIslemAdi.trim()) { setKFormErr("İşlem adı zorunludur"); return; }

    if (editingKalem) {
      persist(kayitlar.map((k) =>
        k.id === selected.id
          ? {
              ...k,
              kalemler: k.kalemler.map((item) =>
                item.id === editingKalem.id
                  ? { ...item, kategori, islemAdi: kFormIslemAdi.trim(), tevkifatOrani: kFormTevkifat, kdvOrani: kFormKdvOrani }
                  : item
              ),
            }
          : k
      ));
    } else {
      const newKalem: KdvTevkifatKalemi = {
        id: uid(),
        sira: selected.kalemler.length + 1,
        kategori,
        islemAdi: kFormIslemAdi.trim(),
        tevkifatOrani: kFormTevkifat,
        kdvOrani: kFormKdvOrani,
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

  const groupedKalemler = selected
    ? selected.kalemler
        .slice()
        .sort((a, b) => a.sira - b.sira)
        .reduce<Record<string, KdvTevkifatKalemi[]>>((acc, item) => {
          if (!acc[item.kategori]) acc[item.kategori] = [];
          acc[item.kategori].push(item);
          return acc;
        }, {})
    : {};

  // ── Render ──

  const tabItems: TabItem[] = sorted.map((k) => ({
    key: k.id,
    label: (
      <div className="flex flex-col">
        <span className="font-semibold">{k.yil} Yılı</span>
        <span className="text-[10px] opacity-60 font-normal">
          {k.gecerlilikBaslangici}
          {k.gecerlilikBitisi ? ` → ${k.gecerlilikBitisi}` : " → ∞"}
        </span>
      </div>
    ),
    icon: <Calendar className="w-4 h-4" />,
    badge: k.aktifMi ? "Aktif" : undefined,
    content: (
      <div className="flex flex-col min-w-0 h-full">
        <div className="flex items-start justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {k.yil} Yılı KDV Tevkifat Oranları
              </span>
              {k.aktifMi ? <Badge variant="emerald">Aktif</Badge> : <Badge variant="slate">Pasif</Badge>}
            </div>
            {k.aciklama && <p className="text-xs text-slate-400 mt-0.5 ml-6">{k.aciklama}</p>}
            <p className="text-xs text-slate-400 mt-0.5 ml-6">
              {k.gecerlilikBaslangici}
              {k.gecerlilikBitisi ? ` – ${k.gecerlilikBitisi}` : " – süresiz"}
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

        <div className="flex-1 overflow-auto p-4">
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
            <div className="text-center py-12 text-slate-400 text-sm">Bu dönem için henüz kalem tanımlanmamış.</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                k.kalemler
                  .slice()
                  .sort((a, b) => a.sira - b.sira)
                  .reduce<Record<string, KdvTevkifatKalemi[]>>((acc, item) => {
                    if (!acc[item.kategori]) acc[item.kategori] = [];
                    acc[item.kategori].push(item);
                    return acc;
                  }, {})
              ).map(([kategori, items]) => (
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
                        <Th>İşlem / Hizmet Türü</Th>
                        <Th className="w-28 text-center">KDV Oranı</Th>
                        <Th className="w-28 text-center">Tevkifat Oranı</Th>
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
                            <span className="text-sm text-slate-700 dark:text-slate-300">{kalem.islemAdi}</span>
                          </Td>
                          <Td className="text-center">
                            <span className="inline-flex items-center justify-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                              %{kalem.kdvOrani}
                            </span>
                          </Td>
                          <Td className="text-center">
                            <span className="inline-flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md font-mono">
                              {kalem.tevkifatOrani}
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
  }));

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-end">
        <Button size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={openAddDonem}>
          Yeni Dönem Ekle
        </Button>
      </div>

      <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Tabs
          orientation="vertical"
          variant="default"
          items={tabItems}
          activeKey={selectedId ?? undefined}
          onChange={setSelectedId}
        />
      </div>

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
            <Input value={formYil} onChange={(e) => setFormYil(e.target.value)} placeholder="2026" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Modal.Label>Başlangıç Tarihi *</Modal.Label>
              <Input value={formBaslangic} onChange={(e) => setFormBaslangic(e.target.value)} type="date" />
            </div>
            <div>
              <Modal.Label>Bitiş Tarihi <span className="text-slate-400 font-normal">(boş = süresiz)</span></Modal.Label>
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
          icon={<Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        />
        <Modal.Content className="space-y-4">
          <div>
            <Modal.Label>Kategori *</Modal.Label>
            <select
              value={kFormKategori}
              onChange={(e) => { setKFormKategori(e.target.value); setKFormKategoriOzel(""); }}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              <option value="">Kategori seçin...</option>
              {KATEGORILER.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
              <option value="__diger">Diğer (manuel giriş)</option>
            </select>
            {kFormKategori === "__diger" && (
              <Input
                className="mt-2"
                value={kFormKategoriOzel}
                onChange={(e) => setKFormKategoriOzel(e.target.value)}
                placeholder="Kategori adı girin..."
              />
            )}
          </div>
          <div>
            <Modal.Label>İşlem / Hizmet Adı *</Modal.Label>
            <Input
              value={kFormIslemAdi}
              onChange={(e) => setKFormIslemAdi(e.target.value)}
              placeholder="ör. İşgücü temin hizmetleri"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Modal.Label>KDV Oranı</Modal.Label>
              <div className="flex gap-2">
                {KDV_ORANLARI.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setKFormKdvOrani(o)}
                    className={clsx(
                      "flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                      kFormKdvOrani === o
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    %{o}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Modal.Label>Tevkifat Oranı</Modal.Label>
              <select
                value={kFormTevkifat}
                onChange={(e) => setKFormTevkifat(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                {TEVKIFAT_ORANLARI.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
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
            <span className="font-semibold text-slate-800 dark:text-slate-200">{deletingKalem?.islemAdi}</span>{" "}
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
