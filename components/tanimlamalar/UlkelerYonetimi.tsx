"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Globe, Check, SlidersHorizontal } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { INITIAL_ULKELER, type Ulke } from "@/lib/data/yerBilgileriData";
import clsx from "clsx";

const STORAGE_KEY = "ulkeler_liste_v1";

type DurumFilter = "tumu" | "aktif" | "pasif";

export default function UlkelerYonetimi() {
  const [ulkeler, setUlkeler] = useState<Ulke[]>([]);
  const [search, setSearch] = useState("");

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterKod, setFilterKod] = useState(true);
  const [filterAd, setFilterAd] = useState(true);
  const [filterDurum, setFilterDurum] = useState<DurumFilter>("tumu");
  const filterRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUlke, setEditingUlke] = useState<Ulke | null>(null);
  const [deletingUlke, setDeletingUlke] = useState<Ulke | null>(null);

  // Form states
  const [formKod, setFormKod] = useState("");
  const [formAd, setFormAd] = useState("");
  const [formAktif, setFormAktif] = useState(true);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUlkeler(JSON.parse(saved));
      } catch {
        setUlkeler(INITIAL_ULKELER);
      }
    } else {
      setUlkeler(INITIAL_ULKELER);
    }
  }, []);

  const saveToStorage = (updated: Ulke[]) => {
    setUlkeler(updated);
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

  const filtered = ulkeler.filter((u) => {
    if (filterDurum === "aktif" && !u.aktifMi) return false;
    if (filterDurum === "pasif" && u.aktifMi) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (filterKod && u.kod.toLowerCase().includes(q)) ||
           (filterAd && u.ad.toLowerCase().includes(q));
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [search, filterKod, filterAd, filterDurum]);

  const isFiltered = filterDurum !== "tumu" || !filterKod || !filterAd;

  const openAddModal = () => {
    setEditingUlke(null);
    setFormKod("");
    setFormAd("");
    setFormAktif(true);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (u: Ulke) => {
    setEditingUlke(u);
    setFormKod(u.kod);
    setFormAd(u.ad);
    setFormAktif(u.aktifMi);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUlke(null);
    setFormError("");
  };

  const handleSave = () => {
    const kod = formKod.trim().toUpperCase();
    const ad = formAd.trim();
    if (!kod || !ad) { setFormError("Ülke kodu ve adı zorunludur."); return; }
    if (kod.length < 2) { setFormError("Ülke kodu en az 2 karakter olmalıdır."); return; }

    // Duplicate check
    const duplicate = ulkeler.find(
      (u) => u.kod === kod && (!editingUlke || u.id !== editingUlke.id)
    );
    if (duplicate) { setFormError(`"${kod}" kodu zaten kullanımda.`); return; }

    if (editingUlke) {
      saveToStorage(ulkeler.map((u) =>
        u.id === editingUlke.id ? { ...u, kod, ad, aktifMi: formAktif } : u
      ));
    } else {
      const newUlke: Ulke = {
        id: "ulke_" + Date.now(),
        kod,
        ad,
        aktifMi: formAktif,
      };
      saveToStorage([...ulkeler, newUlke]);
    }
    closeModal();
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
              onClick={() => setFilterOpen((v) => !v)}
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
                  {[
                    { label: "Ülke Kodu", value: filterKod, set: setFilterKod },
                    { label: "Ülke Adı", value: filterAd, set: setFilterAd },
                  ].map(({ label, value, set }) => (
                    <label key={label} className="flex items-center gap-2 cursor-pointer group py-0.5">
                      <span className={clsx(
                        "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                        value ? "bg-blue-500 border-blue-500" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                      )}>
                        {value && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </span>
                      <input type="checkbox" checked={value} onChange={() => set((v) => !v)} className="sr-only" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Durum</p>
                  {(["tumu", "aktif", "pasif"] as DurumFilter[]).map((d) => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer group py-0.5">
                      <span className={clsx(
                        "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
                        filterDurum === d ? "bg-blue-500 border-blue-500" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                      )}>
                        {filterDurum === d && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                      <input type="radio" name="durum" value={d} checked={filterDurum === d} onChange={() => setFilterDurum(d)} className="sr-only" />
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
                      onClick={() => { setFilterKod(true); setFilterAd(true); setFilterDurum("tumu"); }}
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
            <Button onClick={openAddModal} variant="soft" size="sm" iconLeft={<Plus className="w-4 h-4" />}>
              Yeni Ülke Ekle
            </Button>
          </div>
          <button
            onClick={openAddModal}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
            title="Yeni Ülke Ekle"
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
                <Th className="w-28">ISO Kodu</Th>
                <Th>Ülke Adı</Th>
                <Th align="center">Durum</Th>
                <Th align="right">İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.length === 0 ? (
                <Tr>
                  <Td colSpan={5} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Globe className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 font-medium">Kayıtlı ülke bulunamadı</p>
                    </div>
                  </Td>
                </Tr>
              ) : (
                paginated.map((u, i) => (
                  <Tr key={u.id}>
                    <Td align="center">
                      <span className="inline-flex items-center justify-center min-w-[24px] px-1 h-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-md">
                        {(page - 1) * perPage + i + 1}
                      </span>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold tracking-widest">
                        {u.kod}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-normal text-slate-800 dark:text-slate-200">{u.ad}</span>
                    </Td>
                    <Td align="center">
                      {u.aktifMi ? <Badge variant="emerald">Aktif</Badge> : <Badge variant="slate">Pasif</Badge>}
                    </Td>
                    <Td align="right">
                      <div className="irow">
                        <button className="ib ie" onClick={() => openEditModal(u)} title="Düzenle"><Pencil /></button>
                        <button className="ib id" onClick={() => setDeletingUlke(u)} title="Sil"><Trash2 /></button>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Globe className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 font-medium">Kayıtlı ülke bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.map((u, i) => (
                <div key={u.id} className="px-4 py-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-[22px] px-1 h-5 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded flex-shrink-0">
                      {(page - 1) * perPage + i + 1}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold tracking-widest flex-shrink-0">
                      {u.kod}
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{u.ad}</span>
                    {u.aktifMi ? <Badge variant="emerald">Aktif</Badge> : <Badge variant="slate">Pasif</Badge>}
                  </div>
                  <div className="flex items-center justify-end">
                    <div className="irow">
                      <button className="ib ie" onClick={() => openEditModal(u)} title="Düzenle"><Pencil /></button>
                      <button className="ib id" onClick={() => setDeletingUlke(u)} title="Sil"><Trash2 /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            perPage={perPage}
            onChange={setPage}
            onPerPageChange={setPerPage}
          />
        )}
      </div>

      {/* Ekle / Düzenle Modal */}
      <Modal open={modalOpen} onClose={closeModal}>
        <Modal.Header
          title={editingUlke ? "Ülkeyi Düzenle" : "Yeni Ülke Ekle"}
          onClose={closeModal}
          icon={<Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        />
        <Modal.Content className="space-y-5">
          <div>
            <Modal.Label>ISO Ülke Kodu</Modal.Label>
            <Input
              value={formKod}
              onChange={(e) => { setFormKod(e.target.value.toUpperCase().slice(0, 3)); setFormError(""); }}
              placeholder="Örn: TR, DE, US"
              autoFocus
            />
            <p className="mt-1 text-xs text-slate-400">ISO 3166-1 alpha-2 kodu (2 harf). Örn: TR, DE, US</p>
          </div>
          <div>
            <Modal.Label>Ülke Adı</Modal.Label>
            <Input
              value={formAd}
              onChange={(e) => { setFormAd(e.target.value); setFormError(""); }}
              placeholder="Örn: Türkiye"
            />
          </div>
          {formError && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md">
              <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>
            </div>
          )}
          <div className="flex items-center gap-3 pt-1">
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
              {formAktif ? "Aktif" : "Pasif"}
              <span className={clsx("ml-1 font-normal", formAktif ? "text-slate-500" : "text-slate-400")}>
                ({formAktif ? "Sistemde kullanılabilir" : "Seçim listelerinde gizlenir"})
              </span>
            </span>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={closeModal}>İptal</Button>
          <Button
            variant="primary"
            size="xs"
            onClick={handleSave}
            disabled={!formKod.trim() || !formAd.trim()}
            iconLeft={editingUlke ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {editingUlke ? "Güncelle" : "Oluştur"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal open={!!deletingUlke} onClose={() => setDeletingUlke(null)} size="sm" zIndex="z-[60]">
        <Modal.Header
          title="Ülkeyi Sil"
          onClose={() => setDeletingUlke(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950"
        />
        <Modal.Content>
          {deletingUlke && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                <span className="font-semibold text-slate-800 dark:text-slate-200">"{deletingUlke.ad}"</span> ülkesini silmek istiyor musunuz?
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-md">
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  Bu işlem geri alınamaz. Ülkeye bağlı il ve ilçe kayıtları etkilenebilir.
                </p>
              </div>
            </>
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingUlke(null)}>Vazgeç</Button>
          <Button
            variant="danger"
            size="xs"
            onClick={() => {
              if (deletingUlke) {
                saveToStorage(ulkeler.filter((u) => u.id !== deletingUlke.id));
                setDeletingUlke(null);
              }
            }}
            iconLeft={<Trash2 className="w-3.5 h-3.5" />}
          >
            Kalıcı Olarak Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
