"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Building2, Check, SlidersHorizontal } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import clsx from "clsx";

interface KurumTuruItem {
  id: string;
  ad: string;
  aciklama: string;
  aktifMi: boolean;
}

const STORAGE_KEY = "kurum_turu_liste_v1";

const INITIAL_DATA: KurumTuruItem[] = [
  { id: "kt1", ad: "Kamu Kurumu", aciklama: "Devlet ve kamu kuruluşları", aktifMi: true },
  { id: "kt2", ad: "Özel Sektör", aciklama: "Özel şirket ve kuruluşlar", aktifMi: true },
  { id: "kt3", ad: "Sivil Toplum Kuruluşu", aciklama: "Dernek, vakıf ve STK'lar", aktifMi: true },
  { id: "kt4", ad: "Üniversite / Eğitim", aciklama: "Üniversite ve eğitim kurumları", aktifMi: false },
];

type DurumFilter = "tumu" | "aktif" | "pasif";

export default function KurumTuru() {
  const [items, setItems] = useState<KurumTuruItem[]>([]);
  const [search, setSearch] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterAd, setFilterAd] = useState(true);
  const [filterAciklama, setFilterAciklama] = useState(true);
  const [filterDurum, setFilterDurum] = useState<DurumFilter>("tumu");
  const filterRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KurumTuruItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<KurumTuruItem | null>(null);

  const [formAd, setFormAd] = useState("");
  const [formAciklama, setFormAciklama] = useState("");
  const [formAktif, setFormAktif] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { setItems(INITIAL_DATA); }
    } else {
      setItems(INITIAL_DATA);
    }
  }, []);

  const saveToStorage = (updated: KurumTuruItem[]) => {
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

  const filteredItems = items.filter(r => {
    if (filterDurum === "aktif" && !r.aktifMi) return false;
    if (filterDurum === "pasif" && r.aktifMi) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const inAd = filterAd && r.ad.toLowerCase().includes(q);
    const inAciklama = filterAciklama && r.aciklama.toLowerCase().includes(q);
    return inAd || inAciklama;
  });

  const totalPages = Math.ceil(filteredItems.length / perPage);
  const paginatedItems = filteredItems.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [search, filterAd, filterAciklama, filterDurum]);

  const isFiltered = filterDurum !== "tumu" || !filterAd || !filterAciklama;

  const openAdd = () => {
    setEditingItem(null);
    setFormAd("");
    setFormAciklama("");
    setFormAktif(true);
    setModalOpen(true);
  };

  const openEdit = (item: KurumTuruItem) => {
    setEditingItem(item);
    setFormAd(item.ad);
    setFormAciklama(item.aciklama);
    setFormAktif(item.aktifMi);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    if (!formAd.trim()) return;
    if (editingItem) {
      saveToStorage(items.map(r => r.id === editingItem.id ? { ...r, ad: formAd, aciklama: formAciklama, aktifMi: formAktif } : r));
    } else {
      const newItem: KurumTuruItem = {
        id: "kt_" + Date.now().toString(),
        ad: formAd,
        aciklama: formAciklama,
        aktifMi: formAktif,
      };
      saveToStorage([...items, newItem]);
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    saveToStorage(items.filter(r => r.id !== deletingItem.id));
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
                    <span className="text-sm text-slate-700 dark:text-slate-300">Tür Adı</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group py-0.5">
                    <span className={clsx(
                      "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                      filterAciklama ? "bg-blue-500 border-blue-500" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                    )}>
                      {filterAciklama && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </span>
                    <input type="checkbox" checked={filterAciklama} onChange={() => setFilterAciklama(v => !v)} className="sr-only" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Açıklama</span>
                  </label>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800" />

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Durum</p>
                  {(["tumu", "aktif", "pasif"] as DurumFilter[]).map(d => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer group py-0.5">
                      <span className={clsx(
                        "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
                        filterDurum === d ? "bg-blue-500 border-blue-500" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                      )}>
                        {filterDurum === d && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                      <input type="radio" name="kurum-turu-durum" value={d} checked={filterDurum === d} onChange={() => setFilterDurum(d)} className="sr-only" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {d === "tumu" ? "Tümü" : d === "aktif" ? "Aktif" : "Pasif"}
                      </span>
                    </label>
                  ))}
                </div>

                {isFiltered && (
                  <>
                    <div className="border-t border-slate-100 dark:border-slate-800" />
                    <button
                      onClick={() => { setFilterAd(true); setFilterAciklama(true); setFilterDurum("tumu"); }}
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
            <Button onClick={openAdd} variant="soft" size="sm" iconLeft={<Plus className="w-4 h-4" />}>
              Yeni Tür Ekle
            </Button>
          </div>
          <button
            onClick={openAdd}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
            title="Yeni Tür Ekle"
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
                <Th>Kurum Türü Adı</Th>
                <Th>Açıklama</Th>
                <Th align="center">Durum</Th>
                <Th align="right">İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.length === 0 ? (
                <Tr>
                  <Td colSpan={5} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 font-medium">Kayıtlı kurum türü bulunamadı</p>
                    </div>
                  </Td>
                </Tr>
              ) : (
                paginatedItems.map((item, i) => (
                  <Tr key={item.id}>
                    <Td align="center">
                      <span className="inline-flex items-center justify-center min-w-[24px] px-1 h-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-md">
                        {(page - 1) * perPage + i + 1}
                      </span>
                    </Td>
                    <Td>
                      <div className="font-normal text-slate-800 dark:text-slate-200">{item.ad}</div>
                    </Td>
                    <Td>
                      <div className="text-slate-500 max-w-sm truncate" title={item.aciklama}>
                        {item.aciklama || "-"}
                      </div>
                    </Td>
                    <Td align="center">
                      {item.aktifMi ? (
                        <Badge variant="emerald">Aktif</Badge>
                      ) : (
                        <Badge variant="slate">Pasif</Badge>
                      )}
                    </Td>
                    <Td align="right">
                      <div className="irow">
                        <button className="ib ie" onClick={() => openEdit(item)} title="Düzenle">
                          <Pencil />
                        </button>
                        <button className="ib id" onClick={() => setDeletingItem(item)} title="Sil">
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
              <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 font-medium">Kayıtlı kurum türü bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedItems.map((item, i) => (
                <div key={item.id} className="px-4 py-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-[22px] px-1 h-5 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded flex-shrink-0">
                      {(page - 1) * perPage + i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{item.ad}</span>
                    {item.aktifMi ? <Badge variant="emerald">Aktif</Badge> : <Badge variant="slate">Pasif</Badge>}
                  </div>
                  {item.aciklama && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.aciklama}</p>
                  )}
                  <div className="flex items-center justify-end pt-0.5">
                    <div className="irow">
                      <button className="ib ie" onClick={() => openEdit(item)} title="Düzenle"><Pencil /></button>
                      <button className="ib id" onClick={() => setDeletingItem(item)} title="Sil"><Trash2 /></button>
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
          title={editingItem ? "Kurum Türünü Düzenle" : "Yeni Kurum Türü Tanımla"}
          onClose={closeModal}
          icon={<Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        />
        <Modal.Content className="space-y-5">
          <div>
            <Modal.Label>Kurum Türü Adı</Modal.Label>
            <Input
              value={formAd}
              onChange={e => setFormAd(e.target.value)}
              placeholder="Örn: Kamu Kurumu"
              autoFocus
            />
          </div>
          <div>
            <Modal.Label>Açıklama</Modal.Label>
            <Input
              value={formAciklama}
              onChange={e => setFormAciklama(e.target.value)}
              placeholder="Bu kurum türü hakkında kısa bir açıklama"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormAktif(!formAktif)}
              className={clsx(
                "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
                formAktif ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span className={clsx(
                "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm",
                formAktif ? "translate-x-5" : "translate-x-0"
              )} />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {formAktif ? "Bu Tür Aktif (" : "Bu Tür Pasif ("}
              <span className={clsx("font-normal", formAktif ? "text-slate-500" : "text-slate-400")}>
                {formAktif ? "Sistemde kullanılabilir" : "Seçim listelerinde gizlenir"}
              </span>
              )
            </span>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={closeModal}>İptal</Button>
          <Button
            variant="primary"
            size="xs"
            onClick={handleSave}
            disabled={!formAd.trim()}
            iconLeft={editingItem ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {editingItem ? "Güncelle" : "Oluştur"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal open={!!deletingItem} onClose={() => setDeletingItem(null)} size="sm" zIndex="z-[60]">
        <Modal.Header
          title="Kurum Türünü Sil"
          onClose={() => setDeletingItem(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950"
        />
        <Modal.Content>
          {deletingItem && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                <span className="font-semibold text-slate-800 dark:text-slate-200">"{deletingItem.ad}"</span> kurum türünü silmek istiyor musunuz?
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
