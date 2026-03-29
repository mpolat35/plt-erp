"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, CalendarDays, AlertCircle, ChevronRight, Search, 
  Palmtree, Flag, Coffee
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { IconButton, IconButtonRow } from "@/components/ui/IconButton";
import { Select } from "@/components/ui/Select";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import clsx from "clsx";

// ── Interfaces ────────────────────────────────────────────────────────────────

type TatilTuru = "Resmi Tatil" | "İdari İzin";

interface TakvimKaydi {
  id: string;
  yil: number;
  tarih: string; // "YYYY-MM-DD"
  ad: string;
  tur: TatilTuru;
  aciklama: string;
}

// ── Initial Data ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "calisma_takvimi_v1";

const INITIAL_DATA: TakvimKaydi[] = [
  { id: "h24_1",  yil: 2024, tarih: "2024-01-01", ad: "Yılbaşı", tur: "Resmi Tatil", aciklama: "Yeni yılın ilk günü" },
  { id: "h24_2",  yil: 2024, tarih: "2024-04-09", ad: "Ramazan Bayramı Arifesi", tur: "İdari İzin", aciklama: "Yarım gün idari izin" },
  { id: "h24_3",  yil: 2024, tarih: "2024-04-10", ad: "Ramazan Bayramı 1. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_4",  yil: 2024, tarih: "2024-04-11", ad: "Ramazan Bayramı 2. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_5",  yil: 2024, tarih: "2024-04-12", ad: "Ramazan Bayramı 3. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_6",  yil: 2024, tarih: "2024-04-23", ad: "Ulusal Egemenlik ve Çocuk Bayramı", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_7",  yil: 2024, tarih: "2024-05-01", ad: "Emek ve Dayanışma Günü", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_8",  yil: 2024, tarih: "2024-05-19", ad: "Atatürk'ü Anma, Gençlik ve Spor Bayramı", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_9",  yil: 2024, tarih: "2024-07-15", ad: "Demokrasi ve Milli Birlik Günü", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_10", yil: 2024, tarih: "2024-08-30", ad: "Zafer Bayramı", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_11", yil: 2024, tarih: "2024-10-29", ad: "Cumhuriyet Bayramı", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_kb0", yil: 2024, tarih: "2024-06-15", ad: "Kurban Bayramı Arifesi", tur: "İdari İzin", aciklama: "Yarım gün" },
  { id: "h24_kb1", yil: 2024, tarih: "2024-06-16", ad: "Kurban Bayramı 1. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_kb2", yil: 2024, tarih: "2024-06-17", ad: "Kurban Bayramı 2. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_kb3", yil: 2024, tarih: "2024-06-18", ad: "Kurban Bayramı 3. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h24_kb4", yil: 2024, tarih: "2024-06-19", ad: "Kurban Bayramı 4. Gün", tur: "Resmi Tatil", aciklama: "" },
  // 2026
  { id: "h26_1",   yil: 2026, tarih: "2026-01-01", ad: "Yılbaşı", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_rb0", yil: 2026, tarih: "2026-03-19", ad: "Ramazan Bayramı Arifesi", tur: "İdari İzin", aciklama: "" },
  { id: "h26_rb1", yil: 2026, tarih: "2026-03-20", ad: "Ramazan Bayramı 1. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_rb2", yil: 2026, tarih: "2026-03-21", ad: "Ramazan Bayramı 2. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_rb3", yil: 2026, tarih: "2026-03-22", ad: "Ramazan Bayramı 3. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_2",   yil: 2026, tarih: "2026-04-23", ad: "Ulusal Egemenlik ve Çocuk Bayramı", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_3",   yil: 2026, tarih: "2026-05-01", ad: "Emek ve Dayanışma Günü", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_4",   yil: 2026, tarih: "2026-05-19", ad: "Atatürk'ü Anma, Gençlik ve Spor Bayramı", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_kb0", yil: 2026, tarih: "2026-05-26", ad: "Kurban Bayramı Arifesi", tur: "İdari İzin", aciklama: "" },
  { id: "h26_kb1", yil: 2026, tarih: "2026-05-27", ad: "Kurban Bayramı 1. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_kb2", yil: 2026, tarih: "2026-05-28", ad: "Kurban Bayramı 2. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_kb3", yil: 2026, tarih: "2026-05-29", ad: "Kurban Bayramı 3. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_kb4", yil: 2026, tarih: "2026-05-30", ad: "Kurban Bayramı 4. Gün", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_5",   yil: 2026, tarih: "2026-07-15", ad: "Demokrasi ve Milli Birlik Günü", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_6",   yil: 2026, tarih: "2026-08-30", ad: "Zafer Bayramı", tur: "Resmi Tatil", aciklama: "" },
  { id: "h26_7",   yil: 2026, tarih: "2026-10-29", ad: "Cumhuriyet Bayramı", tur: "Resmi Tatil", aciklama: "" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getDayName(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", { weekday: "long" });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CalismaTakvimi() {
  const [kayitlar, setKayitlar] = useState<TakvimKaydi[]>([]);
  const [selectedYil, setSelectedYil] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKayit, setEditingKayit] = useState<TakvimKaydi | null>(null);
  const [deletingKayit, setDeletingKayit] = useState<TakvimKaydi | null>(null);

  // Form states
  const [formTarih, setFormTarih] = useState("");
  const [formAd, setFormAd] = useState("");
  const [formTur, setFormTur] = useState<TatilTuru>("Resmi Tatil");
  const [formAciklama, setFormAciklama] = useState("");
  const [formErr, setFormErr] = useState("");

  // Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setKayitlar(JSON.parse(saved));
      } catch {
        setKayitlar(INITIAL_DATA);
      }
    } else {
      setKayitlar(INITIAL_DATA);
    }
  }, []);

  function persistAndSet(list: TakvimKaydi[]) {
    setKayitlar(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  const yillar = Array.from(new Set(kayitlar.map(k => k.yil))).sort((a,b) => b-a);
  if (!yillar.includes(new Date().getFullYear())) {
    yillar.unshift(new Date().getFullYear());
  }

  const filteredKayitlar = kayitlar
    .filter(k => k.yil === selectedYil)
    .filter(k => k.ad.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.tarih.localeCompare(b.tarih));

  // CRUD
  function openAdd() {
    setEditingKayit(null);
    setFormTarih(`${selectedYil}-01-01`);
    setFormAd("");
    setFormTur("Resmi Tatil");
    setFormAciklama("");
    setFormErr("");
    setModalOpen(true);
  }

  function openEdit(k: TakvimKaydi) {
    setEditingKayit(k);
    setFormTarih(k.tarih);
    setFormAd(k.ad);
    setFormTur(k.tur);
    setFormAciklama(k.aciklama);
    setFormErr("");
    setModalOpen(true);
  }

  function handleSave() {
    if (!formTarih || !formAd) {
      setFormErr("Tarih ve ad alanları zorunludur");
      return;
    }

    const yil = new Date(formTarih).getFullYear();
    
    if (editingKayit) {
      const updated = kayitlar.map(k => k.id === editingKayit.id ? {
        ...k, tarih: formTarih, yil, ad: formAd, tur: formTur, aciklama: formAciklama
      } : k);
      persistAndSet(updated);
    } else {
      const yeni: TakvimKaydi = {
        id: uid(), yil, tarih: formTarih, ad: formAd, tur: formTur, aciklama: formAciklama
      };
      persistAndSet([...kayitlar, yeni]);
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (!deletingKayit) return;
    const updated = kayitlar.filter(k => k.id !== deletingKayit.id);
    persistAndSet(updated);
    setDeletingKayit(null);
  }

  const tabItems: TabItem[] = yillar.map((yil) => {
    const yilKayitlar = kayitlar.filter((k) => k.yil === yil);
    return {
      key: String(yil),
      label: (
        <div className="flex flex-col">
          <span className="font-semibold">{yil} Takvimi</span>
          <span className="text-[10px] opacity-60 font-normal">{yilKayitlar.length} tatil/izin günü</span>
        </div>
      ),
      icon: <CalendarDays />,
      content: (
        <div className="flex flex-col min-w-0 h-full">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">{yil} Çalışma Takvimi</h2>
                <p className="text-xs text-slate-500 mt-0.5">{yilKayitlar.length} tatil/izin günü tanımlı.</p>
              </div>
              <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden md:block" />
              <div className="hidden md:flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Toplam Tatil</span>
                  <span className="text-sm font-bold text-blue-600">
                    {yilKayitlar.filter((k) => k.tur === "Resmi Tatil").length} Gün
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400">İdari İzin</span>
                  <span className="text-sm font-bold text-violet-600">
                    {yilKayitlar.filter((k) => k.tur === "İdari İzin").length} Gün
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tatil ara..."
                  className="pl-9 h-9 w-48 text-xs"
                />
              </div>
              <Button size="sm" onClick={openAdd}>
                <Plus className="w-4 h-4 mr-1.5" />
                Yeni Ekle
              </Button>
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            {filteredKayitlar.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <CalendarDays className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-sm">Aranan kriterlere uygun veya tanımlı kayıt bulunmuyor.</p>
              </div>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th className="w-40">Tarih</Th>
                    <Th className="w-32">Gün</Th>
                    <Th>Tatil / İzin Adı</Th>
                    <Th className="w-64">Tür</Th>
                    <Th className="w-24 text-right">İşlemler</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredKayitlar.map((k) => (
                    <Tr key={k.id}>
                      <Td className="font-medium text-slate-700 dark:text-slate-200">{formatDate(k.tarih)}</Td>
                      <Td className="text-slate-500 text-xs">{getDayName(k.tarih)}</Td>
                      <Td>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{k.ad}</div>
                          {k.aciklama && <div className="text-[10px] text-slate-400 mt-0.5">{k.aciklama}</div>}
                        </div>
                      </Td>
                      <Td>
                        <Badge variant={k.tur === "Resmi Tatil" ? "blue" : "violet"}>
                          {k.tur === "Resmi Tatil" ? (
                            <Flag className="w-3 h-3 mr-1" />
                          ) : (
                            <Coffee className="w-3 h-3 mr-1" />
                          )}
                          {k.tur}
                        </Badge>
                      </Td>
                      <Td className="text-right">
                        <IconButtonRow>
                          <IconButton
                            variant="edit"
                            icon={<Pencil />}
                            onClick={() => openEdit(k)}
                            title="Düzenle"
                          />
                          <IconButton
                            variant="delete"
                            icon={<Trash2 />}
                            onClick={() => setDeletingKayit(k)}
                            title="Sil"
                          />
                        </IconButtonRow>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm text-xs">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Flag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Resmi Tatil</p>
                  <p className="text-slate-500">Yasal olarak tatil olan günler.</p>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm text-xs">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Palmtree className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">İdari İzin</p>
                  <p className="text-slate-500">Kurum veya devlet idari kararı ile tatil olan günler.</p>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm text-xs">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Bilgi</p>
                  <p className="text-slate-500">Haftalık çalışma saatleri bu takvime göre hesaplanır.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="h-full flex flex-col">
      <Tabs
        orientation="vertical"
        variant="default"
        items={tabItems}
        activeKey={String(selectedYil)}
        onChange={(key) => setSelectedYil(Number(key))}
      />

      {/* Modal: Ekle/Düzenle */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header
          title={editingKayit ? "Kaydı Güncelle" : "Yeni Tatil/İzin Ekle"}
          onClose={() => setModalOpen(false)}
          icon={<CalendarDays className="w-4 h-4 text-blue-600" />}
        />
        <Modal.Content className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Modal.Label>Tarih *</Modal.Label>
              <Input type="date" value={formTarih} onChange={(e) => setFormTarih(e.target.value)} />
            </div>
            <div>
              <Modal.Label>Tür *</Modal.Label>
              <Select
                value={formTur}
                onChange={(e) => setFormTur(e.target.value as TatilTuru)}
                options={[
                  { label: "Resmi Tatil", value: "Resmi Tatil" },
                  { label: "İdari İzin", value: "İdari İzin" },
                ]}
              />
            </div>
          </div>
          <div>
            <Modal.Label>Tatil / İzin Adı *</Modal.Label>
            <Input value={formAd} onChange={(e) => setFormAd(e.target.value)} placeholder="Örn: Cumhuriyet Bayramı" />
          </div>
          <div>
            <Modal.Label>Açıklama</Modal.Label>
            <Input value={formAciklama} onChange={(e) => setFormAciklama(e.target.value)} placeholder="Ek bilgiler..." />
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

      {/* Modal: Silme */}
      <Modal open={!!deletingKayit} onClose={() => setDeletingKayit(null)} size="sm">
        <Modal.Header
          title="Kaydı Sil"
          onClose={() => setDeletingKayit(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500" />}
        />
        <Modal.Content>
          <p className="text-sm text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-800 dark:text-slate-200">{deletingKayit?.ad}</span> kaydı takvimden
            silinecektir. Devam etmek istiyor musunuz?
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
