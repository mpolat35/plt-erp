"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import clsx from "clsx";

interface Departman {
  id: string;
  ad: string;
  aciklama: string;
  kurumId?: string;
  kurumAd?: string;
  aktifMi: boolean;
}

interface StoredKurum {
  id: string;
  ad: string;
  aktifMi: boolean;
}

const STORAGE_KEY = "departmanlar_liste_v1";
const STORAGE_KURUMLAR = "kurumlar_liste_v1";

const INITIAL_DATA: Departman[] = [
  { id: "d1", ad: "Muhasebe", aciklama: "Finansal kayıtlar ve raporlamalar", kurumId: "k2", kurumAd: "Erpa Teknoloji A.Ş.", aktifMi: true },
  { id: "d2", ad: "İnsan Kaynakları", aciklama: "Personel yönetimi ve işe alım süreçleri", kurumId: "k2", kurumAd: "Erpa Teknoloji A.Ş.", aktifMi: true },
  { id: "d3", ad: "Yazılım", aciklama: "Ürün geliştirme ve sistem entegrasyonu", kurumId: "k2", kurumAd: "Erpa Teknoloji A.Ş.", aktifMi: true },
  { id: "d4", ad: "Satış", aciklama: "Müşteri kazanımı ve teklif yönetimi", kurumId: "k1", kurumAd: "Sağlık Bakanlığı", aktifMi: false },
];

type DurumFilter = "tumu" | "aktif" | "pasif";

export default function DepartmanYonetimi() {
  const [items, setItems] = useState<Departman[]>([]);
  const [kurumlar, setKurumlar] = useState<StoredKurum[]>([]);
  const [search, setSearch] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterAd, setFilterAd] = useState(true);
  const [filterAciklama, setFilterAciklama] = useState(true);
  const [filterKurum, setFilterKurum] = useState(true);
  const [filterDurum, setFilterDurum] = useState<DurumFilter>("tumu");
  const filterRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Departman | null>(null);
  const [deletingItem, setDeletingItem] = useState<Departman | null>(null);

  const [formAd, setFormAd] = useState("");
  const [formAciklama, setFormAciklama] = useState("");
  const [formKurumId, setFormKurumId] = useState("");
  const [formAktif, setFormAktif] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { setItems(INITIAL_DATA); }
    } else {
      setItems(INITIAL_DATA);
    }
  }, []);

  useEffect(() => {
    const savedKurumlar = localStorage.getItem(STORAGE_KURUMLAR);
    if (savedKurumlar) {
      try { setKurumlar(JSON.parse(savedKurumlar)); } catch { setKurumlar([]); }
    } else {
      setKurumlar([]);
    }
  }, []);

  const saveToStorage = (updated: Departman[]) => {
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredItems = items.filter((item) => {
    if (filterDurum === "aktif" && !item.aktifMi) return false;
    if (filterDurum === "pasif" && item.aktifMi) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const inAd = filterAd && item.ad.toLowerCase().includes(q);
    const inAciklama = filterAciklama && item.aciklama.toLowerCase().includes(q);
    const inKurum = filterKurum && (item.kurumAd ?? "").toLowerCase().includes(q);
    return inAd || inAciklama || inKurum;
  });

  const totalPages = Math.ceil(filteredItems.length / perPage);
  const paginatedItems = filteredItems.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [search, filterAd, filterAciklama, filterKurum, filterDurum]);

  const isFiltered = filterDurum !== "tumu" || !filterAd || !filterAciklama || !filterKurum;

  const openAdd = () => {
    setEditingItem(null);
    setFormAd("");
    setFormAciklama("");
    setFormKurumId("");
    setFormAktif(true);
    setModalOpen(true);
  };

  const openEdit = (item: Departman) => {
    setEditingItem(item);
    setFormAd(item.ad);
    setFormAciklama(item.aciklama);
    setFormKurumId(item.kurumId ?? "");
    setFormAktif(item.aktifMi);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    if (!formAd.trim()) return;
    const kurum = kurumlar.find((k) => k.id === formKurumId);
    const kurumAd = kurum ? kurum.ad : "";

    if (editingItem) {
      saveToStorage(items.map((item) => item.id === editingItem.id
        ? { ...item, ad: formAd.trim(), aciklama: formAciklama.trim(), kurumId: formKurumId || undefined, kurumAd: kurumAd || undefined, aktifMi: formAktif }
        : item
      ));
    } else {
      saveToStorage([...items, {
        id: "dm_" + Date.now().toString(),
        ad: formAd.trim(),
        aciklama: formAciklama.trim(),
        kurumId: formKurumId || undefined,
        kurumAd: kurumAd || undefined,
        aktifMi: formAktif,
      }] );
    }
    closeModal();
  };

  const handleDelete = (item: Departman) => {
    saveToStorage(items.filter((x) => x.id !== item.id));
    setDeletingItem(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Departman ve Birim Tanımları</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Kuruma bağlı departmanlarınızı burada oluşturun ve yönetin.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd}>Yeni Departman</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              placeholder="Departman, kurum veya açıklama ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-md bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder-slate-500"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button type="button" onClick={() => setFilterOpen((v) => !v)} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              Filtreler
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-2 w-64 p-4 rounded-2xl border bg-white shadow-lg dark:bg-slate-900 dark:border-slate-700">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={filterAd} onChange={() => setFilterAd((v) => !v)} className="form-checkbox" /> Ad
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={filterAciklama} onChange={() => setFilterAciklama((v) => !v)} className="form-checkbox" /> Açıklama
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={filterKurum} onChange={() => setFilterKurum((v) => !v)} className="form-checkbox" /> Kurum
                  </label>
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Durum</p>
                    {(["tumu", "aktif", "pasif"] as DurumFilter[]).map((d) => (
                      <label key={d} className="flex items-center gap-2 text-sm block">
                        <input type="radio" name="departman-durum" value={d} checked={filterDurum === d} onChange={() => setFilterDurum(d)} className="form-radio" />
                        {d === "tumu" ? "Tümü" : d === "aktif" ? "Aktif" : "Pasif"}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <Thead>
              <Tr>
                <Th>Departman</Th>
                <Th>Kurum</Th>
                <Th>Açıklama</Th>
                <Th>Durum</Th>
                <Th className="w-28">İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedItems.map((item) => (
                <Tr key={item.id}>
                  <Td>
                    <div className="font-medium text-slate-800 dark:text-slate-200">{item.ad}</div>
                  </Td>
                  <Td>{item.kurumAd || "—"}</Td>
                  <Td>{item.aciklama}</Td>
                  <Td>
                    <Badge variant={item.aktifMi ? "emerald" : "slate"}>
                      {item.aktifMi ? "Aktif" : "Pasif"}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingItem(item)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} totalItems={filteredItems.length} perPage={perPage} onChange={setPage} onPerPageChange={(n) => { setPerPage(n); setPage(1); }} perPageOptions={[5, 10, 20, 50]} />
      </div>

      <Modal open={modalOpen} onClose={closeModal}>
        <div className="space-y-4">
          <Input label="Departman adı" value={formAd} onChange={(e) => setFormAd(e.target.value)} placeholder="Muhasebe" />
          <Input label="Açıklama" value={formAciklama} onChange={(e) => setFormAciklama(e.target.value)} placeholder="Birim açıklaması" />
          <Select
            label="Kurum"
            value={formKurumId}
            onChange={(e) => setFormKurumId(e.target.value)}
            options={[{ label: "Seçiniz", value: "" }, ...kurumlar.filter((k) => k.aktifMi).map((k) => ({ label: k.ad, value: k.id }))]}
          />
          <div className="flex items-center gap-3">
            <input id="departman-aktif" type="checkbox" checked={formAktif} onChange={(e) => setFormAktif(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="departman-aktif" className="text-sm text-slate-600 dark:text-slate-300">Aktif</label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal}>İptal</Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(deletingItem)} onClose={() => setDeletingItem(null)}>
        <div className="space-y-4">
          <p>Bu departmanı silmek istediğinizden emin misiniz?</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeletingItem(null)}>İptal</Button>
            <Button variant="danger" onClick={() => deletingItem && handleDelete(deletingItem)}>Sil</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
