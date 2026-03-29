"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Map, Check, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { INITIAL_ILCELER, INITIAL_ILLER, INITIAL_ULKELER, type Ilce, type Il, type Ulke } from "@/lib/data/yerBilgileriData";
import clsx from "clsx";

const STORAGE_KEY_ILCELER = "ilceler_liste_v1";
const STORAGE_KEY_ILLER   = "iller_liste_v1";
const STORAGE_KEY_ULKELER = "ulkeler_liste_v1";

type DurumFilter = "tumu" | "aktif" | "pasif";

function Dropdown({
  label,
  open,
  onToggle,
  dropRef,
  children,
}: {
  label: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  dropRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex-shrink-0" ref={dropRef}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 h-8 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:border-blue-400 transition-colors"
      >
        {label}
        <ChevronDown className={clsx("w-3.5 h-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  );
}

export default function IlcelerYonetimi() {
  const [ilceler, setIlceler] = useState<Ilce[]>([]);
  const [iller, setIller]     = useState<Il[]>([]);
  const [ulkeler, setUlkeler] = useState<Ulke[]>([]);

  const [selectedUlkeId, setSelectedUlkeId] = useState("ulke_tr");
  const [selectedIlId,   setSelectedIlId]   = useState(""); // "" = Tümü

  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen]   = useState(false);
  const [filterAd, setFilterAd]       = useState(true);
  const [filterDurum, setFilterDurum] = useState<DurumFilter>("tumu");

  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [modalOpen, setModalOpen]     = useState(false);
  const [editingIlce, setEditingIlce] = useState<Ilce | null>(null);
  const [deletingIlce, setDeletingIlce] = useState<Ilce | null>(null);

  const [formAd, setFormAd]         = useState("");
  const [formIlId, setFormIlId]     = useState("il_06");
  const [formAktif, setFormAktif]   = useState(true);
  const [formError, setFormError]   = useState("");

  const [ulkeDrop, setUlkeDrop] = useState(false);
  const [ilDrop, setIlDrop]     = useState(false);
  const ulkeDropRef = useRef<HTMLDivElement>(null);
  const ilDropRef   = useRef<HTMLDivElement>(null);
  const filterRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const su = localStorage.getItem(STORAGE_KEY_ULKELER);
    setUlkeler(su ? JSON.parse(su) : INITIAL_ULKELER);

    const si = localStorage.getItem(STORAGE_KEY_ILLER);
    setIller(si ? JSON.parse(si) : INITIAL_ILLER);

    const sc = localStorage.getItem(STORAGE_KEY_ILCELER);
    if (sc) { try { setIlceler(JSON.parse(sc)); } catch { setIlceler(INITIAL_ILCELER); } }
    else { setIlceler(INITIAL_ILCELER); }
  }, []);

  const saveToStorage = (updated: Ilce[]) => {
    setIlceler(updated);
    localStorage.setItem(STORAGE_KEY_ILCELER, JSON.stringify(updated));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current   && !filterRef.current.contains(e.target as Node))   setFilterOpen(false);
      if (ulkeDropRef.current && !ulkeDropRef.current.contains(e.target as Node)) setUlkeDrop(false);
      if (ilDropRef.current   && !ilDropRef.current.contains(e.target as Node))   setIlDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Seçilen ülkeye ait iller
  const filteredIller = iller
    .filter((il) => il.ulkeId === selectedUlkeId && il.aktifMi)
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr"));

  // Ülke değişince il filtresini sıfırla (Tümü)
  useEffect(() => {
    setSelectedIlId("");
  }, [selectedUlkeId]);

  const selectedUlke = ulkeler.find((u) => u.id === selectedUlkeId);
  const selectedIl   = iller.find((il) => il.id === selectedIlId);

  // selectedIlId="" ise seçilen ülkenin tüm ilçelerini göster
  const illerOfUlke = iller.filter((il) => il.ulkeId === selectedUlkeId).map((il) => il.id);

  const filtered = ilceler.filter((ilce) => {
    if (selectedIlId === "") {
      if (!illerOfUlke.includes(ilce.ilId)) return false;
    } else {
      if (ilce.ilId !== selectedIlId) return false;
    }
    if (filterDurum === "aktif" && !ilce.aktifMi) return false;
    if (filterDurum === "pasif" && ilce.aktifMi)  return false;
    if (!search.trim()) return true;
    return filterAd && ilce.ad.toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [search, filterAd, filterDurum, selectedIlId]);

  const isFiltered = filterDurum !== "tumu" || !filterAd;

  const openAddModal = () => {
    setEditingIlce(null);
    setFormAd("");
    // Tümü seçiliyse modal'da ilk ili varsayılan yap
    setFormIlId(selectedIlId || filteredIller[0]?.id || "");
    setFormAktif(true);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (ilce: Ilce) => {
    setEditingIlce(ilce);
    setFormAd(ilce.ad);
    setFormIlId(ilce.ilId);
    setFormAktif(ilce.aktifMi);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingIlce(null); setFormError(""); };

  const handleSave = () => {
    const ad = formAd.trim();
    if (!ad) { setFormError("İlçe adı zorunludur."); return; }

    const duplicate = ilceler.find(
      (ilce) => ilce.ilId === formIlId &&
                ilce.ad.toLowerCase() === ad.toLowerCase() &&
                (!editingIlce || ilce.id !== editingIlce.id)
    );
    if (duplicate) { setFormError("Bu ile ait aynı isimde bir ilçe zaten mevcut."); return; }

    if (editingIlce) {
      saveToStorage(ilceler.map((ilce) =>
        ilce.id === editingIlce.id
          ? { ...ilce, ad, ilId: formIlId, aktifMi: formAktif }
          : ilce
      ));
    } else {
      saveToStorage([...ilceler, {
        id: "ilce_" + Date.now(),
        ilId: formIlId,
        ad,
        aktifMi: formAktif,
      }]);
    }
    closeModal();
  };

  // Modal'daki ülkeye göre il listesi
  const modalUlkeId = iller.find((il) => il.id === formIlId)?.ulkeId ?? selectedUlkeId;
  const modalIller  = iller
    .filter((il) => il.ulkeId === modalUlkeId && il.aktifMi)
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr"));

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex-wrap">

          {/* Ülke seçici */}
          <Dropdown
            label={
              <>
                <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {selectedUlke?.kod ?? "??"}
                </span>
                <span className="max-w-[100px] truncate">{selectedUlke?.ad ?? "Ülke"}</span>
              </>
            }
            open={ulkeDrop}
            onToggle={() => setUlkeDrop((v) => !v)}
            dropRef={ulkeDropRef}
          >
            {ulkeler
              .filter((u) => u.aktifMi)
              .sort((a, b) => a.ad.localeCompare(b.ad, "tr"))
              .map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => { setSelectedUlkeId(u.id); setUlkeDrop(false); }}
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors",
                    selectedUlkeId === u.id
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="font-mono text-[11px] font-semibold text-slate-400 w-6 flex-shrink-0">{u.kod}</span>
                  <span className="truncate">{u.ad}</span>
                  {selectedUlkeId === u.id && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                </button>
              ))}
          </Dropdown>

          {/* İl seçici */}
          <Dropdown
            label={
              <span className="max-w-[130px] truncate">
                {selectedIlId === "" ? "Tümü" : (selectedIl?.ad ?? "İl seçin")}
              </span>
            }
            open={ilDrop}
            onToggle={() => setIlDrop((v) => !v)}
            dropRef={ilDropRef}
          >
            {/* Tümü seçeneği */}
            <button
              type="button"
              onClick={() => { setSelectedIlId(""); setIlDrop(false); }}
              className={clsx(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors border-b border-slate-100 dark:border-slate-800",
                selectedIlId === ""
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <span className="font-mono text-[11px] font-semibold text-slate-400 w-8 flex-shrink-0">—</span>
              <span className="truncate">Tümü</span>
              {selectedIlId === "" && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
            </button>
            {filteredIller.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-400">Bu ülkeye ait il yok</p>
            ) : (
              filteredIller.map((il) => (
                <button
                  key={il.id}
                  type="button"
                  onClick={() => { setSelectedIlId(il.id); setIlDrop(false); }}
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors",
                    selectedIlId === il.id
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="font-mono text-[11px] font-semibold text-slate-400 w-8 flex-shrink-0">{il.plakaKodu}</span>
                  <span className="truncate">{il.ad}</span>
                  {selectedIlId === il.id && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                </button>
              ))
            )}
          </Dropdown>

          {/* Arama */}
          <div className="relative flex-1 min-w-[140px] max-w-sm" ref={filterRef}>
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
              <div className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
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
                      <input type="radio" name="ilce-durum" value={d} checked={filterDurum === d} onChange={() => setFilterDurum(d)} className="sr-only" />
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
                      onClick={() => { setFilterAd(true); setFilterDurum("tumu"); }}
                      className="w-full text-xs text-center text-blue-600 dark:text-blue-400 hover:underline py-0.5"
                    >
                      Filtreleri Sıfırla
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto hidden md:block">
            <Button onClick={openAddModal} variant="soft" size="sm" iconLeft={<Plus className="w-4 h-4" />}>
              Yeni İlçe Ekle
            </Button>
          </div>
          <button
            onClick={openAddModal}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
            title="Yeni İlçe Ekle"
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
                <Th>İlçe Adı</Th>
                <Th>Bağlı İl</Th>
                <Th align="center">Durum</Th>
                <Th align="right">İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.length === 0 ? (
                <Tr>
                  <Td colSpan={5} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Map className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 font-medium">
                        {selectedIl
                          ? `${selectedIl.ad} iline ait kayıtlı ilçe bulunamadı`
                          : "Önce bir il seçin"}
                      </p>
                    </div>
                  </Td>
                </Tr>
              ) : (
                paginated.map((ilce, i) => {
                  const il = iller.find((il) => il.id === ilce.ilId);
                  return (
                    <Tr key={ilce.id}>
                      <Td align="center">
                        <span className="inline-flex items-center justify-center min-w-[24px] px-1 h-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-md">
                          {(page - 1) * perPage + i + 1}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-normal text-slate-800 dark:text-slate-200">{ilce.ad}</span>
                      </Td>
                      <Td>
                        {il ? (
                          <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-mono text-[11px] text-slate-400">{il.plakaKodu}</span>
                            {il.ad}
                          </span>
                        ) : "—"}
                      </Td>
                      <Td align="center">
                        {ilce.aktifMi ? <Badge variant="emerald">Aktif</Badge> : <Badge variant="slate">Pasif</Badge>}
                      </Td>
                      <Td align="right">
                        <div className="irow">
                          <button className="ib ie" onClick={() => openEditModal(ilce)} title="Düzenle"><Pencil /></button>
                          <button className="ib id" onClick={() => setDeletingIlce(ilce)} title="Sil"><Trash2 /></button>
                        </div>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Map className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 font-medium">
                {selectedIl ? `${selectedIl.ad} iline ait kayıtlı ilçe bulunamadı` : "Önce bir il seçin"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.map((ilce, i) => {
                const il = iller.find((il) => il.id === ilce.ilId);
                return (
                  <div key={ilce.id} className="px-4 py-3.5 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-[22px] px-1 h-5 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded flex-shrink-0">
                      {(page - 1) * perPage + i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{ilce.ad}</p>
                      {il && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          <span className="font-mono">{il.plakaKodu}</span> — {il.ad}
                        </p>
                      )}
                    </div>
                    {ilce.aktifMi ? <Badge variant="emerald">Aktif</Badge> : <Badge variant="slate">Pasif</Badge>}
                    <div className="irow">
                      <button className="ib ie" onClick={() => openEditModal(ilce)} title="Düzenle"><Pencil /></button>
                      <button className="ib id" onClick={() => setDeletingIlce(ilce)} title="Sil"><Trash2 /></button>
                    </div>
                  </div>
                );
              })}
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
          title={editingIlce ? "İlçeyi Düzenle" : "Yeni İlçe Ekle"}
          onClose={closeModal}
          icon={<Map className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        />
        <Modal.Content className="space-y-5">
          <div>
            <Modal.Label>Bağlı İl</Modal.Label>
            <select
              value={formIlId}
              onChange={(e) => setFormIlId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 transition-all"
            >
              {modalIller.map((il) => (
                <option key={il.id} value={il.id}>{il.plakaKodu} — {il.ad}</option>
              ))}
            </select>
          </div>
          <div>
            <Modal.Label>İlçe Adı</Modal.Label>
            <Input
              value={formAd}
              onChange={(e) => { setFormAd(e.target.value); setFormError(""); }}
              placeholder="Örn: Çankaya"
              autoFocus
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
            disabled={!formAd.trim()}
            iconLeft={editingIlce ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {editingIlce ? "Güncelle" : "Oluştur"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal open={!!deletingIlce} onClose={() => setDeletingIlce(null)} size="sm" zIndex="z-[60]">
        <Modal.Header
          title="İlçeyi Sil"
          onClose={() => setDeletingIlce(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950"
        />
        <Modal.Content>
          {deletingIlce && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                <span className="font-semibold text-slate-800 dark:text-slate-200">"{deletingIlce.ad}"</span> ilçesini silmek istiyor musunuz?
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-md">
                <p className="text-xs text-amber-700 dark:text-amber-500">Bu işlem geri alınamaz.</p>
              </div>
            </>
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingIlce(null)}>Vazgeç</Button>
          <Button
            variant="danger"
            size="xs"
            onClick={() => {
              if (deletingIlce) {
                saveToStorage(ilceler.filter((ilce) => ilce.id !== deletingIlce.id));
                setDeletingIlce(null);
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
