"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Package, SlidersHorizontal, Check } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { MOCK_URUNLER, type UrunHizmet } from "./types";
import clsx from "clsx";

const BIRIM_OPTIONS = [
  { label: "Adet", value: "Adet" },
  { label: "Saat", value: "Saat" },
  { label: "Ay", value: "Ay" },
  { label: "Yıl", value: "Yıl" },
  { label: "Paket", value: "Paket" },
  { label: "Gün", value: "Gün" },
  { label: "Metre", value: "Metre" },
  { label: "Kg", value: "Kg" },
];

const KDV_OPTIONS = [
  { label: "%0", value: "0" },
  { label: "%1", value: "1" },
  { label: "%10", value: "10" },
  { label: "%20", value: "20" },
];

const TEVKIFAT_OPTIONS = [
  { label: "Seçiniz", value: "" },
  { label: "1/10", value: "1/10" },
  { label: "2/10", value: "2/10" },
  { label: "3/10", value: "3/10" },
  { label: "4/10", value: "4/10" },
  { label: "5/10", value: "5/10" },
  { label: "7/10", value: "7/10" },
  { label: "9/10", value: "9/10" },
];

const STORAGE_KEY = "urunler_liste_v1";

type TevkifatFilter = "tumu" | "var" | "yok";

function kdvBadgeVariant(oran: number): "blue" | "amber" | "emerald" | "slate" {
  if (oran === 20) return "blue";
  if (oran === 10) return "amber";
  if (oran === 1) return "emerald";
  return "slate";
}

export default function UrunlerListe() {
  const [items, setItems] = useState<UrunHizmet[]>([]);
  const [search, setSearch] = useState("");

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterAd, setFilterAd] = useState(true);
  const [filterTevkifat, setFilterTevkifat] = useState<TevkifatFilter>("tumu");
  const filterRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UrunHizmet | null>(null);
  const [deletingItem, setDeletingItem] = useState<UrunHizmet | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<UrunHizmet>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { setItems(MOCK_URUNLER); }
    } else {
      setItems(MOCK_URUNLER);
    }
  }, []);

  const saveToStorage = (updated: UrunHizmet[]) => {
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

  const filteredItems = items.filter(u => {
    if (filterTevkifat === "var" && !u.tevkifatUygulanirMi) return false;
    if (filterTevkifat === "yok" && u.tevkifatUygulanirMi) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return filterAd && u.ad.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredItems.length / perPage);
  const paginatedItems = filteredItems.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [search, filterAd, filterTevkifat]);

  const isFiltered = filterTevkifat !== "tumu" || !filterAd;

  const openNew = () => {
    setFormData({ ad: "", birim: "Adet", kdvOrani: 20, varsayilanFiyat: 0, tevkifatUygulanirMi: false, tevkifatOrani: "" });
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (u: UrunHizmet) => {
    setFormData({ ...u });
    setEditingItem(u);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    if (!formData.ad?.trim()) return;

    if (editingItem) {
      saveToStorage(items.map(i => i.id === editingItem.id ? { ...i, ...formData } as UrunHizmet : i));
    } else {
      const newItem: UrunHizmet = {
        id: "u" + Date.now().toString(),
        ad: formData.ad || "",
        birim: formData.birim || "Adet",
        kdvOrani: formData.kdvOrani ?? 0,
        varsayilanFiyat: formData.varsayilanFiyat ?? 0,
        tevkifatUygulanirMi: formData.tevkifatUygulanirMi,
        tevkifatOrani: formData.tevkifatOrani,
      };
      saveToStorage([...items, newItem]);
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    saveToStorage(items.filter(i => i.id !== deletingItem.id));
    setDeletingItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 max-w-sm" ref={filterRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara..."
              className="w-full pl-10 pr-9 py-2 text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setFilterOpen(v => !v)}
              title="Filtre seçenekleri"
              className={clsx(
                "absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded transition-colors",
                isFiltered ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isFiltered && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />}
            </button>

            {filterOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Arama Alanları</p>
                  <label className="flex items-center gap-2 cursor-pointer group py-0.5">
                    <span className={clsx(
                      "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                      filterAd ? "bg-blue-500 border-blue-500" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                    )}>
                      {filterAd && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </span>
                    <input type="checkbox" checked={filterAd} onChange={() => setFilterAd(v => !v)} className="sr-only" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Hizmet / Ürün Adı</span>
                  </label>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800" />

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Tevkifat</p>
                  {(["tumu", "var", "yok"] as TevkifatFilter[]).map(d => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer group py-0.5">
                      <span className={clsx(
                        "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
                        filterTevkifat === d ? "bg-blue-500 border-blue-500" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                      )}>
                        {filterTevkifat === d && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                      <input type="radio" name="tevkifat" value={d} checked={filterTevkifat === d} onChange={() => setFilterTevkifat(d)} className="sr-only" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {d === "tumu" ? "Tümü" : d === "var" ? "Tevkifatlı" : "Tevkifatsız"}
                      </span>
                    </label>
                  ))}
                </div>

                {isFiltered && (
                  <>
                    <div className="border-t border-slate-100 dark:border-slate-800" />
                    <button
                      onClick={() => { setFilterAd(true); setFilterTevkifat("tumu"); }}
                      className="w-full text-xs text-center text-blue-600 dark:text-blue-400 hover:underline py-0.5"
                    >
                      Filtreleri Sıfırla
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <Button onClick={openNew} variant="soft" size="sm" iconLeft={<Plus className="w-4 h-4" />}>
              Yeni Kart Ekle
            </Button>
          </div>
          <button
            onClick={openNew}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
            title="Yeni Kart Ekle"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <Thead>
              <Tr>
                <Th align="center" className="w-16">#</Th>
                <Th>Hizmet / Ürün Adı</Th>
                <Th align="center">Birim</Th>
                <Th align="right">Varsayılan Fiyat</Th>
                <Th align="center">KDV</Th>
                <Th align="center">Tevkifat</Th>
                <Th align="right">İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.length === 0 ? (
                <Tr>
                  <Td colSpan={7} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Package className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 font-medium">Kayıtlı hizmet veya ürün bulunamadı</p>
                    </div>
                  </Td>
                </Tr>
              ) : (
                paginatedItems.map((u, i) => (
                  <Tr key={u.id}>
                    <Td align="center">
                      <span className="inline-flex items-center justify-center min-w-[24px] px-1 h-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-md">
                        {(page - 1) * perPage + i + 1}
                      </span>
                    </Td>
                    <Td>
                      <div className="text-slate-800 dark:text-slate-200">{u.ad}</div>
                    </Td>
                    <Td align="center">
                      <span className="text-slate-800 dark:text-slate-200">{u.birim}</span>
                    </Td>
                    <Td align="right">
                      <span className="text-slate-800 dark:text-slate-200">
                        {new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(u.varsayilanFiyat)} TL
                      </span>
                    </Td>
                    <Td align="center">
                      <Badge variant={kdvBadgeVariant(u.kdvOrani)}>%{u.kdvOrani}</Badge>
                    </Td>
                    <Td align="center">
                      {u.tevkifatUygulanirMi ? (
                        <Badge variant="amber">Var ({u.tevkifatOrani})</Badge>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600">—</span>
                      )}
                    </Td>
                    <Td align="right">
                      <div className="irow">
                        <button className="ib ie" onClick={() => openEdit(u)} title="Düzenle">
                          <Pencil />
                        </button>
                        <button className="ib id" onClick={() => setDeletingItem(u)} title="Sil">
                          <Trash2 />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Package className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 font-medium">Kayıtlı hizmet veya ürün bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedItems.map((u, i) => (
                <div key={u.id} className="px-4 py-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-[22px] px-1 h-5 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded flex-shrink-0">
                      {(page - 1) * perPage + i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{u.ad}</span>
                    <Badge variant={kdvBadgeVariant(u.kdvOrani)}>%{u.kdvOrani}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{u.birim}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(u.varsayilanFiyat)} TL
                    </span>
                    {u.tevkifatUygulanirMi && (
                      <>
                        <span>·</span>
                        <Badge variant="amber">Tevkifat {u.tevkifatOrani}</Badge>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-end pt-0.5">
                    <div className="irow">
                      <button className="ib ie" onClick={() => openEdit(u)} title="Düzenle"><Pencil /></button>
                      <button className="ib id" onClick={() => setDeletingItem(u)} title="Sil"><Trash2 /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredItems.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            perPage={perPage}
            onChange={setPage}
            onPerPageChange={setPerPage}
          />
        )}
      </div>

      {/* Ekle / Düzenle Modal */}
      <Modal open={modalOpen} onClose={closeModal}>
        <Modal.Header
          title={editingItem ? "Hizmet / Ürün Düzenle" : "Yeni Hizmet veya Ürün"}
          onClose={closeModal}
          icon={<Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        />
        <Modal.Content className="space-y-4">
          <div>
            <Modal.Label>Hizmet / Ürün Adı</Modal.Label>
            <Input
              placeholder="Örn: Danışmanlık Hizmeti"
              value={formData.ad || ""}
              onChange={e => setFormData({ ...formData, ad: e.target.value })}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Modal.Label>Birim</Modal.Label>
              <Select
                options={BIRIM_OPTIONS}
                value={formData.birim || "Adet"}
                onChange={e => setFormData({ ...formData, birim: e.target.value })}
              />
            </div>
            <div>
              <Modal.Label>Varsayılan Fiyat (TL)</Modal.Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.varsayilanFiyat?.toString() || ""}
                onChange={e => setFormData({ ...formData, varsayilanFiyat: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div>
            <Modal.Label>KDV Oranı</Modal.Label>
            <Select
              options={KDV_OPTIONS}
              value={formData.kdvOrani?.toString() || "20"}
              onChange={e => setFormData({ ...formData, kdvOrani: Number(e.target.value) })}
            />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tevkifatUygulanirMi: !formData.tevkifatUygulanirMi })}
                className={clsx(
                  "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
                  formData.tevkifatUygulanirMi ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <span className={clsx(
                  "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm",
                  formData.tevkifatUygulanirMi ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {formData.tevkifatUygulanirMi
                  ? "Tevkifat Uygulanır"
                  : "Tevkifat Uygulanmaz"}
              </span>
            </div>
            {formData.tevkifatUygulanirMi && (
              <div>
                <Modal.Label>Tevkifat Oranı</Modal.Label>
                <Select
                  options={TEVKIFAT_OPTIONS}
                  value={formData.tevkifatOrani || ""}
                  onChange={e => setFormData({ ...formData, tevkifatOrani: e.target.value })}
                />
              </div>
            )}
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={closeModal}>İptal</Button>
          <Button
            variant="primary"
            size="xs"
            onClick={handleSave}
            disabled={!formData.ad?.trim()}
            iconLeft={editingItem ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {editingItem ? "Güncelle" : "Oluştur"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal open={!!deletingItem} onClose={() => setDeletingItem(null)} size="sm" zIndex="z-[60]">
        <Modal.Header
          title="Kaydı Sil"
          onClose={() => setDeletingItem(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950"
        />
        <Modal.Content>
          {deletingItem && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                <span className="font-semibold text-slate-800 dark:text-slate-200">"{deletingItem.ad}"</span> kaydını silmek istiyor musunuz?
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-md">
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  Bu işlem geri alınamaz ve kayıt kalıcı olarak sistemden kaldırılır.
                </p>
              </div>
            </>
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingItem(null)}>Vazgeç</Button>
          <Button
            variant="danger"
            size="xs"
            onClick={confirmDelete}
            iconLeft={<Trash2 className="w-3.5 h-3.5" />}
          >
            Kalıcı Olarak Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
