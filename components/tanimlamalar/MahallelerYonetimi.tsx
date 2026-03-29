"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Home, Check, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  INITIAL_MAHALLELER, INITIAL_ILCELER, INITIAL_ILLER, INITIAL_ULKELER,
  type Mahalle, type Ilce, type Il, type Ulke,
} from "@/lib/data/yerBilgileriData";
import clsx from "clsx";

const STORAGE_KEY_MAH    = "mahalleler_liste_v1";
const STORAGE_KEY_ILCE   = "ilceler_liste_v1";
const STORAGE_KEY_IL     = "iller_liste_v1";
const STORAGE_KEY_ULKE   = "ulkeler_liste_v1";

type DurumFilter = "tumu" | "aktif" | "pasif";

function DropBtn({
  label, open, onToggle, dropRef, children,
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
        <ChevronDown className={clsx("w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  );
}

function DropItem({
  active, onClick, prefix, label,
}: {
  active: boolean;
  onClick: () => void;
  prefix?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors",
        active
          ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      )}
    >
      {prefix !== undefined && (
        <span className="font-mono text-[11px] font-semibold text-slate-400 w-8 flex-shrink-0">{prefix}</span>
      )}
      <span className="truncate flex-1">{label}</span>
      {active && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
    </button>
  );
}

export default function MahallelerYonetimi() {
  const [mahalleler, setMahalleler] = useState<Mahalle[]>([]);
  const [ilceler, setIlceler]       = useState<Ilce[]>([]);
  const [iller, setIller]           = useState<Il[]>([]);
  const [ulkeler, setUlkeler]       = useState<Ulke[]>([]);

  // Filtre seçimleri  "" = Hepsi
  const [selUlke, setSelUlke] = useState("");
  const [selIl,   setSelIl]   = useState("");
  const [selIlce, setSelIlce] = useState("");

  const [search, setSearch]         = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDurum, setFilterDurum] = useState<DurumFilter>("tumu");

  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [modalOpen, setModalOpen]         = useState(false);
  const [editingMah, setEditingMah]       = useState<Mahalle | null>(null);
  const [deletingMah, setDeletingMah]     = useState<Mahalle | null>(null);

  const [formAd, setFormAd]         = useState("");
  const [formIlceId, setFormIlceId] = useState("");
  const [formAktif, setFormAktif]   = useState(true);
  const [formError, setFormError]   = useState("");

  const [ulkeDrop, setUlkeDrop] = useState(false);
  const [ilDrop,   setIlDrop]   = useState(false);
  const [ilceDrop, setIlceDrop] = useState(false);
  const ulkeRef  = useRef<HTMLDivElement>(null);
  const ilRef    = useRef<HTMLDivElement>(null);
  const ilceRef  = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const su = localStorage.getItem(STORAGE_KEY_ULKE);
    setUlkeler(su ? JSON.parse(su) : INITIAL_ULKELER);
    const si = localStorage.getItem(STORAGE_KEY_IL);
    setIller(si ? JSON.parse(si) : INITIAL_ILLER);
    const sc = localStorage.getItem(STORAGE_KEY_ILCE);
    setIlceler(sc ? JSON.parse(sc) : INITIAL_ILCELER);
    const sm = localStorage.getItem(STORAGE_KEY_MAH);
    if (sm) { try { setMahalleler(JSON.parse(sm)); } catch { setMahalleler(INITIAL_MAHALLELER); } }
    else { setMahalleler(INITIAL_MAHALLELER); }
  }, []);

  const saveToStorage = (updated: Mahalle[]) => {
    setMahalleler(updated);
    localStorage.setItem(STORAGE_KEY_MAH, JSON.stringify(updated));
  };

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      [
        [ulkeRef, setUlkeDrop],
        [ilRef,   setIlDrop],
        [ilceRef, setIlceDrop],
        [filterRef, setFilterOpen],
      ].forEach(([ref, setter]) => {
        const r = ref as React.RefObject<HTMLDivElement | null>;
        const s = setter as React.Dispatch<React.SetStateAction<boolean>>;
        if (r.current && !r.current.contains(e.target as Node)) s(false);
      });
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Bağımlı listeler
  const illerOfUlke = (selUlke === ""
    ? iller
    : iller.filter((il) => il.ulkeId === selUlke)
  ).filter((il) => il.aktifMi).sort((a, b) => a.ad.localeCompare(b.ad, "tr"));

  const ilcelerOfIl = (selIl === ""
    ? ilceler.filter((ilce) =>
        selUlke === "" || illerOfUlke.some((il) => il.id === ilce.ilId)
      )
    : ilceler.filter((ilce) => ilce.ilId === selIl)
  ).filter((ilce) => ilce.aktifMi).sort((a, b) => a.ad.localeCompare(b.ad, "tr"));

  // Ülke değişince il ve ilçe sıfırla
  useEffect(() => {
    setSelIl("");
    setSelIlce("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selUlke]);

  // İl değişince ilçe sıfırla
  useEffect(() => { setSelIlce(""); }, [selIl]);

  const selUlkeObj = ulkeler.find((u) => u.id === selUlke);
  const selIlObj   = iller.find((il) => il.id === selIl);
  const selIlceObj = ilceler.find((ilce) => ilce.id === selIlce);

  // Gösterilecek ilçe id'lerini hesapla
  const ilceIdsInScope: string[] = selIlce !== ""
    ? [selIlce]
    : selIl !== ""
    ? ilceler.filter((ilce) => ilce.ilId === selIl).map((ilce) => ilce.id)
    : selUlke !== ""
    ? ilceler.filter((ilce) => illerOfUlke.some((il) => il.id === ilce.ilId)).map((ilce) => ilce.id)
    : ilceler.map((ilce) => ilce.id);

  const filtered = mahalleler.filter((mah) => {
    if (!ilceIdsInScope.includes(mah.ilceId)) return false;
    if (filterDurum === "aktif" && !mah.aktifMi) return false;
    if (filterDurum === "pasif" && mah.aktifMi)  return false;
    if (!search.trim()) return true;
    return mah.ad.toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [search, filterDurum, selIlce, selIl, selUlke]);

  const isFiltered = filterDurum !== "tumu";

  const openAddModal = () => {
    setEditingMah(null);
    setFormAd("");
    setFormIlceId(selIlce || ilcelerOfIl[0]?.id || "");
    setFormAktif(true);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (mah: Mahalle) => {
    setEditingMah(mah);
    setFormAd(mah.ad);
    setFormIlceId(mah.ilceId);
    setFormAktif(mah.aktifMi);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingMah(null); setFormError(""); };

  const handleSave = () => {
    const ad = formAd.trim();
    if (!ad)         { setFormError("Mahalle adı zorunludur."); return; }
    if (!formIlceId) { setFormError("Bağlı ilçe seçilmelidir."); return; }

    const duplicate = mahalleler.find(
      (m) => m.ilceId === formIlceId &&
             m.ad.toLowerCase() === ad.toLowerCase() &&
             (!editingMah || m.id !== editingMah.id)
    );
    if (duplicate) { setFormError("Bu ilçede aynı isimde mahalle zaten mevcut."); return; }

    if (editingMah) {
      saveToStorage(mahalleler.map((m) =>
        m.id === editingMah.id ? { ...m, ad, ilceId: formIlceId, aktifMi: formAktif } : m
      ));
    } else {
      saveToStorage([...mahalleler, { id: "mah_" + Date.now(), ilceId: formIlceId, ad, aktifMi: formAktif }]);
    }
    closeModal();
  };

  // Modal'daki ilçe listesi: formIlceId'nin bağlı olduğu ilden türet
  const formIlceObj = ilceler.find((ilce) => ilce.id === formIlceId);
  const formIlId    = formIlceObj?.ilId ?? selIl;
  const modalIlceler = ilceler
    .filter((ilce) => ilce.ilId === formIlId && ilce.aktifMi)
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr"));

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex-wrap">

          {/* Ülke */}
          <DropBtn
            label={
              selUlke === ""
                ? <span className="text-slate-500">Hepsi</span>
                : <><span className="font-mono text-xs font-semibold text-slate-500">{selUlkeObj?.kod}</span><span className="max-w-[90px] truncate">{selUlkeObj?.ad}</span></>
            }
            open={ulkeDrop} onToggle={() => setUlkeDrop((v) => !v)} dropRef={ulkeRef}
          >
            <div className="border-b border-slate-100 dark:border-slate-800">
              <DropItem active={selUlke === ""} onClick={() => { setSelUlke(""); setUlkeDrop(false); }} prefix="—" label="Hepsi" />
            </div>
            {ulkeler.filter((u) => u.aktifMi).sort((a, b) => a.ad.localeCompare(b.ad, "tr")).map((u) => (
              <DropItem key={u.id} active={selUlke === u.id} onClick={() => { setSelUlke(u.id); setUlkeDrop(false); }} prefix={u.kod} label={u.ad} />
            ))}
          </DropBtn>

          {/* İl */}
          <DropBtn
            label={
              selIl === ""
                ? <span className="text-slate-500">Hepsi</span>
                : <><span className="font-mono text-xs font-semibold text-slate-500">{selIlObj?.plakaKodu}</span><span className="max-w-[100px] truncate">{selIlObj?.ad}</span></>
            }
            open={ilDrop} onToggle={() => setIlDrop((v) => !v)} dropRef={ilRef}
          >
            <div className="border-b border-slate-100 dark:border-slate-800">
              <DropItem active={selIl === ""} onClick={() => { setSelIl(""); setIlDrop(false); }} prefix="—" label="Hepsi" />
            </div>
            {illerOfUlke.map((il) => (
              <DropItem key={il.id} active={selIl === il.id} onClick={() => { setSelIl(il.id); setIlDrop(false); }} prefix={il.plakaKodu} label={il.ad} />
            ))}
          </DropBtn>

          {/* İlçe */}
          <DropBtn
            label={<span className="max-w-[110px] truncate">{selIlce === "" ? "Hepsi" : (selIlceObj?.ad ?? "İlçe")}</span>}
            open={ilceDrop} onToggle={() => setIlceDrop((v) => !v)} dropRef={ilceRef}
          >
            {/* Tümü */}
            <div className="border-b border-slate-100 dark:border-slate-800">
              <DropItem active={selIlce === ""} onClick={() => { setSelIlce(""); setIlceDrop(false); }} prefix="—" label="Hepsi" />
            </div>
            {ilcelerOfIl.length === 0
              ? <p className="px-3 py-2 text-sm text-slate-400">İlçe bulunamadı</p>
              : ilcelerOfIl.map((ilce) => (
                  <DropItem key={ilce.id} active={selIlce === ilce.id} onClick={() => { setSelIlce(ilce.id); setIlceDrop(false); }} label={ilce.ad} />
                ))}
          </DropBtn>

          {/* Arama + Filtre */}
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
              <div className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
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
                      <input type="radio" name="mah-durum" value={d} checked={filterDurum === d} onChange={() => setFilterDurum(d)} className="sr-only" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {d === "tumu" ? "Tümü" : d === "aktif" ? "Aktif" : "Pasif"}
                      </span>
                    </label>
                  ))}
                </div>
                {isFiltered && (
                  <>
                    <div className="border-t border-slate-100 dark:border-slate-800" />
                    <button onClick={() => setFilterDurum("tumu")} className="w-full text-xs text-center text-blue-600 dark:text-blue-400 hover:underline py-0.5">
                      Filtreleri Sıfırla
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto hidden md:block">
            <Button onClick={openAddModal} variant="soft" size="sm" iconLeft={<Plus className="w-4 h-4" />}>
              Yeni Mahalle Ekle
            </Button>
          </div>
          <button onClick={openAddModal} className="md:hidden w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors" title="Yeni Mahalle Ekle">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <Thead>
              <Tr>
                <Th align="center" className="w-16">#</Th>
                <Th>Mahalle Adı</Th>
                <Th>Bağlı İlçe</Th>
                <Th>İl</Th>
                <Th align="center">Durum</Th>
                <Th align="right">İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.length === 0 ? (
                <Tr>
                  <Td colSpan={6} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Home className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 font-medium">Kayıtlı mahalle bulunamadı</p>
                    </div>
                  </Td>
                </Tr>
              ) : (
                paginated.map((mah, i) => {
                  const ilce = ilceler.find((ilce) => ilce.id === mah.ilceId);
                  const il   = iller.find((il) => il.id === ilce?.ilId);
                  return (
                    <Tr key={mah.id}>
                      <Td align="center">
                        <span className="inline-flex items-center justify-center min-w-[24px] px-1 h-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-md">
                          {(page - 1) * perPage + i + 1}
                        </span>
                      </Td>
                      <Td><span className="font-normal text-slate-800 dark:text-slate-200">{mah.ad}</span></Td>
                      <Td><span className="text-sm text-slate-600 dark:text-slate-300">{ilce?.ad ?? "—"}</span></Td>
                      <Td>
                        {il ? (
                          <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-mono text-[11px] text-slate-400">{il.plakaKodu}</span>
                            {il.ad}
                          </span>
                        ) : "—"}
                      </Td>
                      <Td align="center">
                        {mah.aktifMi ? <Badge variant="emerald">Aktif</Badge> : <Badge variant="slate">Pasif</Badge>}
                      </Td>
                      <Td align="right">
                        <div className="irow">
                          <button className="ib ie" onClick={() => openEditModal(mah)} title="Düzenle"><Pencil /></button>
                          <button className="ib id" onClick={() => setDeletingMah(mah)} title="Sil"><Trash2 /></button>
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
              <Home className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 font-medium">Kayıtlı mahalle bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.map((mah, i) => {
                const ilce = ilceler.find((ilce) => ilce.id === mah.ilceId);
                const il   = iller.find((il) => il.id === ilce?.ilId);
                return (
                  <div key={mah.id} className="px-4 py-3.5 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-[22px] px-1 h-5 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded flex-shrink-0">
                      {(page - 1) * perPage + i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{mah.ad}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        {ilce?.ad}{il ? ` · ${il.plakaKodu} ${il.ad}` : ""}
                      </p>
                    </div>
                    {mah.aktifMi ? <Badge variant="emerald">Aktif</Badge> : <Badge variant="slate">Pasif</Badge>}
                    <div className="irow">
                      <button className="ib ie" onClick={() => openEditModal(mah)} title="Düzenle"><Pencil /></button>
                      <button className="ib id" onClick={() => setDeletingMah(mah)} title="Sil"><Trash2 /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} perPage={perPage} onChange={setPage} onPerPageChange={setPerPage} />
        )}
      </div>

      {/* Ekle / Düzenle Modal */}
      <Modal open={modalOpen} onClose={closeModal}>
        <Modal.Header
          title={editingMah ? "Mahalleyi Düzenle" : "Yeni Mahalle Ekle"}
          onClose={closeModal}
          icon={<Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        />
        <Modal.Content className="space-y-5">
          <div>
            <Modal.Label>Bağlı İlçe</Modal.Label>
            <select
              value={formIlceId}
              onChange={(e) => { setFormIlceId(e.target.value); setFormError(""); }}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 transition-all"
            >
              {modalIlceler.length === 0 && <option value="">— İlçe bulunamadı —</option>}
              {modalIlceler.map((ilce) => (
                <option key={ilce.id} value={ilce.id}>{ilce.ad}</option>
              ))}
            </select>
          </div>
          <div>
            <Modal.Label>Mahalle Adı</Modal.Label>
            <Input
              value={formAd}
              onChange={(e) => { setFormAd(e.target.value); setFormError(""); }}
              placeholder="Örn: Alsancak"
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
              className={clsx("w-11 h-6 rounded-full transition-colors relative flex-shrink-0", formAktif ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700")}
            >
              <span className={clsx("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm", formAktif ? "translate-x-5" : "translate-x-0")} />
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
            variant="primary" size="xs" onClick={handleSave}
            disabled={!formAd.trim() || !formIlceId}
            iconLeft={editingMah ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {editingMah ? "Güncelle" : "Oluştur"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal open={!!deletingMah} onClose={() => setDeletingMah(null)} size="sm" zIndex="z-[60]">
        <Modal.Header
          title="Mahalleyi Sil"
          onClose={() => setDeletingMah(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950"
        />
        <Modal.Content>
          {deletingMah && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                <span className="font-semibold text-slate-800 dark:text-slate-200">"{deletingMah.ad}"</span> mahallesini silmek istiyor musunuz?
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-md">
                <p className="text-xs text-amber-700 dark:text-amber-500">Bu işlem geri alınamaz.</p>
              </div>
            </>
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingMah(null)}>Vazgeç</Button>
          <Button
            variant="danger" size="xs"
            onClick={() => {
              if (deletingMah) { saveToStorage(mahalleler.filter((m) => m.id !== deletingMah.id)); setDeletingMah(null); }
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
