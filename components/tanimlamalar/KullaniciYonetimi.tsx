"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Users, Check, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { MultiSelect } from "@/components/ui/MultiSelect";
import clsx from "clsx";

// ─── Tipler ──────────────────────────────────────────────────────────────────

interface Kullanici {
  id: string;
  ad: string;
  soyad: string;
  sicilNo?: string;
  eposta: string;
  telefon?: string;
  unvan?: string;
  kurumId: string;
  kurumAd: string;
  roller: { id: string; ad: string }[];
  aktifMi: boolean;
}

interface StoredKurum {
  id: string;
  ad: string;
  aktifMi: boolean;
}

interface StoredRol {
  id: string;
  ad: string;
  aktifMi: boolean;
}

interface StoredUnvan {
  id: string;
  kod?: string;
  ad: string;
  aktifMi: boolean;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const SK_USERS    = "kullanicilar_liste_v1";
const SK_KURUMLAR = "kurumlar_liste_v1";
const SK_ROLLER   = "roller_liste_v1";
const SK_UNVANLAR = "unvanlar_liste_v1";

const INITIAL_USERS: Kullanici[] = [
  {
    id: "u1", ad: "Ahmet", soyad: "Yılmaz", sicilNo: "SIC-001",
    eposta: "ahmet.yilmaz@erpa.com.tr", telefon: "0532 111 22 33",
    unvan: "Yazılım Geliştirici", kurumId: "k1", kurumAd: "Sağlık Bakanlığı",
    roller: [{ id: "r1", ad: "Sistem Yöneticisi" }], aktifMi: true,
  },
  {
    id: "u2", ad: "Fatma", soyad: "Kaya",
    eposta: "fatma.kaya@erpa.com.tr", telefon: "0533 222 33 44",
    unvan: "Proje Koordinatörü", kurumId: "k2", kurumAd: "Erpa Teknoloji A.Ş.",
    roller: [{ id: "r2", ad: "İnsan Kaynakları" }, { id: "r3", ad: "Proje Yöneticisi" }], aktifMi: true,
  },
  {
    id: "u3", ad: "Mehmet", soyad: "Demir", sicilNo: "SIC-003",
    eposta: "mehmet.demir@erpa.com.tr",
    unvan: "Muhasebe Uzmanı", kurumId: "k2", kurumAd: "Erpa Teknoloji A.Ş.",
    roller: [{ id: "r4", ad: "Ön Muhasebe" }], aktifMi: false,
  },
];

// ─── Yardımcı: Roller çok seçimli dropdown ────────────────────────────────

interface RolSeciciProps {
  available: StoredRol[];
  selected: { id: string; ad: string }[];
  onChange: (roles: { id: string; ad: string }[]) => void;
}

function RolSecici({ available, selected, onChange }: RolSeciciProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (rol: StoredRol) => {
    const exists = selected.find(r => r.id === rol.id);
    if (exists) {
      onChange(selected.filter(r => r.id !== rol.id));
    } else {
      onChange([...selected, { id: rol.id, ad: rol.ad }]);
    }
  };

  const remove = (id: string) => onChange(selected.filter(r => r.id !== id));

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setOpen(v => !v)}
        className={clsx(
          "min-h-[38px] w-full px-3 py-1.5 text-sm rounded-md border cursor-pointer transition-all flex flex-wrap gap-1.5 items-center",
          "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
          open && "border-blue-400 ring-2 ring-blue-500/20"
        )}
      >
        {selected.length === 0 ? (
          <span className="text-slate-400 dark:text-slate-500 text-sm select-none py-0.5">Rol seçiniz...</span>
        ) : (
          selected.map(r => (
            <span
              key={r.id}
              className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-md"
            >
              {r.ad}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); remove(r.id); }}
                className="hover:text-blue-900 dark:hover:text-blue-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
        <ChevronDown className={clsx("w-4 h-4 text-slate-400 ml-auto flex-shrink-0 transition-transform", open && "rotate-180")} />
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-40 py-1 max-h-48 overflow-y-auto">
          {available.length === 0 ? (
            <p className="text-xs text-slate-400 px-3 py-2">Aktif rol bulunamadı</p>
          ) : available.map(rol => {
            const isSelected = !!selected.find(r => r.id === rol.id);
            return (
              <button
                key={rol.id}
                type="button"
                onClick={() => toggle(rol)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <span className={clsx(
                  "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                  isSelected ? "bg-blue-500 border-blue-500" : "border-slate-300 dark:border-slate-600"
                )}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </span>
                <span className={clsx("flex-1", isSelected ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-600 dark:text-slate-400")}>
                  {rol.ad}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500",   "bg-violet-500", "bg-emerald-500",
  "bg-amber-500",  "bg-rose-500",   "bg-cyan-500",
  "bg-indigo-500", "bg-teal-500",   "bg-orange-500", "bg-pink-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ ad, soyad, size = "md" }: { ad: string; soyad: string; size?: "sm" | "md" }) {
  const initials = `${ad.charAt(0)}${soyad.charAt(0)}`.toUpperCase();
  const color = getAvatarColor(ad + soyad);
  const sizeClass = size === "sm" ? "w-7 h-7 text-[11px]" : "w-8 h-8 text-xs";
  return (
    <span className={clsx("inline-flex items-center justify-center rounded-full text-white font-semibold flex-shrink-0 select-none", color, sizeClass)}>
      {initials}
    </span>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

type DurumFilter = "tumu" | "aktif" | "pasif";

export default function KullaniciYonetimi() {
  const [items, setItems] = useState<Kullanici[]>([]);
  const [kurumlar, setKurumlar] = useState<StoredKurum[]>([]);
  const [roller, setRoller] = useState<StoredRol[]>([]);
  const [unvanlar, setUnvanlar] = useState<StoredUnvan[]>([]);

  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterAd, setFilterAd] = useState(true);
  const [filterEposta, setFilterEposta] = useState(true);
  const [filterDurum, setFilterDurum] = useState<DurumFilter>("tumu");
  const [filterKurumIds, setFilterKurumIds] = useState<string[]>([]);
  const [filterUnvanlar, setFilterUnvanlar] = useState<string[]>([]);
  const [filterRolIds, setFilterRolIds] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Kullanici | null>(null);
  const [deletingItem, setDeletingItem] = useState<Kullanici | null>(null);

  // Form
  const [fAd, setFAd] = useState("");
  const [fSoyad, setFSoyad] = useState("");
  const [fSicilNo, setFSicilNo] = useState("");
  const [fEposta, setFEposta] = useState("");
  const [fTelefon, setFTelefon] = useState("");
  const [fUnvan, setFUnvan] = useState("");
  const [fKurumId, setFKurumId] = useState("");
  const [fRoller, setFRoller] = useState<{ id: string; ad: string }[]>([]);
  const [fAktif, setFAktif] = useState(true);

  // Storage yükle
  useEffect(() => {
    const savedUsers = localStorage.getItem(SK_USERS);
    if (savedUsers) {
      try { setItems(JSON.parse(savedUsers)); } catch { setItems(INITIAL_USERS); }
    } else {
      setItems(INITIAL_USERS);
    }

    const savedKurumlar = localStorage.getItem(SK_KURUMLAR);
    if (savedKurumlar) {
      try { setKurumlar(JSON.parse(savedKurumlar)); } catch { setKurumlar([]); }
    }

    const savedRoller = localStorage.getItem(SK_ROLLER);
    if (savedRoller) {
      try { setRoller(JSON.parse(savedRoller)); } catch { setRoller([]); }
    }

    const savedUnvanlar = localStorage.getItem(SK_UNVANLAR);
    if (savedUnvanlar) {
      try { setUnvanlar(JSON.parse(savedUnvanlar)); } catch { setUnvanlar([]); }
    }
  }, []);

  // Modal açıldığında güncel verileri çek
  const refreshDropdowns = () => {
    const k = localStorage.getItem(SK_KURUMLAR);
    if (k) { try { setKurumlar(JSON.parse(k)); } catch { /* ignore */ } }
    const r = localStorage.getItem(SK_ROLLER);
    if (r) { try { setRoller(JSON.parse(r)); } catch { /* ignore */ } }
    const u = localStorage.getItem(SK_UNVANLAR);
    if (u) { try { setUnvanlar(JSON.parse(u)); } catch { /* ignore */ } }
  };

  const saveToStorage = (updated: Kullanici[]) => {
    setItems(updated);
    localStorage.setItem(SK_USERS, JSON.stringify(updated));
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredItems = items.filter(u => {
    if (filterDurum === "aktif" && !u.aktifMi) return false;
    if (filterDurum === "pasif" && u.aktifMi) return false;
    if (filterKurumIds.length > 0 && !filterKurumIds.includes(u.kurumId)) return false;
    if (filterUnvanlar.length > 0 && !filterUnvanlar.includes(u.unvan ?? "")) return false;
    if (filterRolIds.length > 0 && !u.roller.some(r => filterRolIds.includes(r.id))) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const inAd = filterAd && (`${u.ad} ${u.soyad}`).toLowerCase().includes(q);
    const inEposta = filterEposta && u.eposta.toLowerCase().includes(q);
    return inAd || inEposta;
  });

  const totalPages = Math.ceil(filteredItems.length / perPage);
  const paginatedItems = filteredItems.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [search, filterAd, filterEposta, filterDurum, filterKurumIds, filterUnvanlar, filterRolIds]);

  const isFiltered = filterDurum !== "tumu" || !filterAd || !filterEposta || filterKurumIds.length > 0 || filterUnvanlar.length > 0 || filterRolIds.length > 0;

  const resetFilters = () => {
    setFilterAd(true); setFilterEposta(true); setFilterDurum("tumu");
    setFilterKurumIds([]); setFilterUnvanlar([]); setFilterRolIds([]);
  };

  const kurumOptions = [
    { label: "Seçiniz", value: "" },
    ...kurumlar.filter(k => k.aktifMi).map(k => ({ label: k.ad, value: k.id })),
  ];
  const unvanOptions = [
    { label: "Seçiniz", value: "" },
    ...unvanlar.filter(u => u.aktifMi).map(u => ({ label: u.kod ? `${u.kod} - ${u.ad}` : u.ad, value: u.ad })),
  ];
  const rolOptions = roller.filter(r => r.aktifMi);

  const openAdd = () => {
    refreshDropdowns();
    setEditingItem(null);
    setFAd(""); setFSoyad(""); setFSicilNo(""); setFEposta("");
    setFTelefon(""); setFUnvan(""); setFKurumId(""); setFRoller([]); setFAktif(true);
    setModalOpen(true);
  };

  const openEdit = (item: Kullanici) => {
    refreshDropdowns();
    setEditingItem(item);
    setFAd(item.ad); setFSoyad(item.soyad); setFSicilNo(item.sicilNo || "");
    setFEposta(item.eposta); setFTelefon(item.telefon || ""); setFUnvan(item.unvan || "");
    setFKurumId(item.kurumId); setFRoller(item.roller); setFAktif(item.aktifMi);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingItem(null); };

  const handleSave = () => {
    if (!fAd.trim() || !fSoyad.trim() || !fEposta.trim()) return;
    const kurum = kurumlar.find(k => k.id === fKurumId);
    const payload: Kullanici = {
      id: editingItem?.id ?? "usr_" + Date.now(),
      ad: fAd.trim(), soyad: fSoyad.trim(),
      sicilNo: fSicilNo.trim() || undefined,
      eposta: fEposta.trim(),
      telefon: fTelefon.trim() || undefined,
      unvan: fUnvan.trim() || undefined,
      kurumId: fKurumId,
      kurumAd: kurum?.ad ?? "",
      roller: fRoller,
      aktifMi: fAktif,
    };
    if (editingItem) {
      saveToStorage(items.map(i => i.id === editingItem.id ? payload : i));
    } else {
      saveToStorage([...items, payload]);
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
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative flex-1 max-w-sm" ref={filterRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ara..."
              className="w-full pl-10 pr-10 py-2 text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setFilterOpen(v => !v)}
              className={clsx(
                "absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded transition-colors",
                filterOpen
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                  : isFiltered
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {isFiltered && !filterOpen && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />}
            </button>

            {filterOpen && (
              <div className="absolute left-0 top-full mt-2 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Başlık */}
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Filtreler</span>
                    {isFiltered && (
                      <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full leading-none">Aktif</span>
                    )}
                  </div>
                  {isFiltered && (
                    <button
                      onClick={resetFilters}
                      className="text-[11px] text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" /> Sıfırla
                    </button>
                  )}
                </div>

                <div className="p-3 space-y-3">
                  {/* Arama Alanları */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Arama Alanları</p>
                    <div className="flex gap-1.5">
                      {[
                        { label: "Ad Soyad", value: filterAd, set: setFilterAd },
                        { label: "E-Posta", value: filterEposta, set: setFilterEposta },
                      ].map(f => (
                        <button
                          key={f.label}
                          type="button"
                          onClick={() => f.set(v => !v)}
                          className={clsx(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all",
                            f.value
                              ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                          )}
                        >
                          <span className={clsx(
                            "w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                            f.value ? "bg-blue-500 border-blue-500" : "border-slate-300 dark:border-slate-600"
                          )}>
                            {f.value && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                          </span>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Durum */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Durum</p>
                    <div className="flex gap-1.5">
                      {(["tumu", "aktif", "pasif"] as DurumFilter[]).map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setFilterDurum(d)}
                          className={clsx(
                            "flex-1 py-1.5 rounded-md border text-xs font-medium transition-all",
                            filterDurum === d
                              ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300"
                          )}
                        >
                          {d === "tumu" ? "Tümü" : d === "aktif" ? "Aktif" : "Pasif"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kurum */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Kurum</p>
                    <MultiSelect
                      compact
                      placeholder="Tüm kurumlar"
                      value={filterKurumIds}
                      onChange={setFilterKurumIds}
                      options={kurumlar.filter(k => k.aktifMi).map(k => ({ label: k.ad, value: k.id }))}
                    />
                  </div>

                  {/* Unvan */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Unvan</p>
                    <MultiSelect
                      compact
                      placeholder="Tüm unvanlar"
                      value={filterUnvanlar}
                      onChange={setFilterUnvanlar}
                      options={unvanlar.filter(u => u.aktifMi).map(u => ({ label: u.kod ? `${u.kod} - ${u.ad}` : u.ad, value: u.ad }))}
                    />
                  </div>

                  {/* Rol */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Rol</p>
                    <MultiSelect
                      compact
                      placeholder="Tüm roller"
                      value={filterRolIds}
                      onChange={setFilterRolIds}
                      options={roller.filter(r => r.aktifMi).map(r => ({ label: r.ad, value: r.id }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <Button onClick={openAdd} variant="soft" size="sm" iconLeft={<Plus className="w-4 h-4" />}>
              Yeni Kullanıcı Ekle
            </Button>
          </div>
          <button
            onClick={openAdd}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
            title="Yeni Kullanıcı Ekle"
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
                <Th>Ad Soyad</Th>
                <Th>E-Posta</Th>
                <Th>Kurum</Th>
                <Th>Unvan</Th>
                <Th>Roller</Th>
                <Th align="center">Durum</Th>
                <Th align="right">İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.length === 0 ? (
                <Tr>
                  <Td colSpan={8} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 font-medium">Kayıtlı kullanıcı bulunamadı</p>
                    </div>
                  </Td>
                </Tr>
              ) : paginatedItems.map((u, i) => (
                <Tr key={u.id}>
                  <Td align="center">
                    <span className="inline-flex items-center justify-center min-w-[24px] px-1 h-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-md">
                      {(page - 1) * perPage + i + 1}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar ad={u.ad} soyad={u.soyad} />
                      <div>
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{u.ad} {u.soyad}</div>
                        {u.sicilNo && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{u.sicilNo}</div>}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="text-slate-800 dark:text-slate-200">{u.eposta}</div>
                    {u.telefon && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{u.telefon}</div>}
                  </Td>
                  <Td>
                    <span className="text-slate-800 dark:text-slate-200">{u.kurumAd || "-"}</span>
                  </Td>
                  <Td>
                    <span className="text-slate-800 dark:text-slate-200">{u.unvan || "-"}</span>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {u.roller.length === 0 ? (
                        <span className="text-slate-400 dark:text-slate-600">—</span>
                      ) : u.roller.map(r => (
                        <Badge key={r.id} variant="blue" size="sm">{r.ad}</Badge>
                      ))}
                    </div>
                  </Td>
                  <Td align="center">
                    {u.aktifMi ? <Badge variant="emerald">Aktif</Badge> : <Badge variant="slate">Pasif</Badge>}
                  </Td>
                  <Td align="right">
                    <div className="irow">
                      <button className="ib ie" onClick={() => openEdit(u)} title="Düzenle"><Pencil /></button>
                      <button className="ib id" onClick={() => setDeletingItem(u)} title="Sil"><Trash2 /></button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 font-medium">Kayıtlı kullanıcı bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedItems.map((u, i) => (
                <div key={u.id} className="px-4 py-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-[22px] px-1 h-5 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded flex-shrink-0">
                      {(page - 1) * perPage + i + 1}
                    </span>
                    <Avatar ad={u.ad} soyad={u.soyad} size="sm" />
                    <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{u.ad} {u.soyad}</span>
                    {u.aktifMi ? <Badge variant="emerald">Aktif</Badge> : <Badge variant="slate">Pasif</Badge>}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                    <div>{u.eposta}</div>
                    {u.kurumAd && <div>{u.kurumAd}</div>}
                    {u.unvan && <div className="text-slate-400">{u.unvan}</div>}
                  </div>
                  {u.roller.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {u.roller.map(r => <Badge key={r.id} variant="blue" size="sm">{r.ad}</Badge>)}
                    </div>
                  )}
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
            page={page} totalPages={totalPages} totalItems={filteredItems.length}
            perPage={perPage} onChange={setPage} onPerPageChange={setPerPage}
          />
        )}
      </div>

      {/* Ekle / Düzenle Modal */}
      <Modal open={modalOpen} onClose={closeModal} size="xl">
        <Modal.Header
          title={editingItem ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Ekle"}
          onClose={closeModal}
          icon={<Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        />
        <Modal.Content className="space-y-4">

          {/* Ad / Soyad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Modal.Label>Adı *</Modal.Label>
              <Input value={fAd} onChange={e => setFAd(e.target.value)} placeholder="Ahmet" autoFocus />
            </div>
            <div>
              <Modal.Label>Soyadı *</Modal.Label>
              <Input value={fSoyad} onChange={e => setFSoyad(e.target.value)} placeholder="Yılmaz" />
            </div>
          </div>

          {/* E-Posta / Sicil No */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Modal.Label>E-Posta *</Modal.Label>
              <Input type="email" value={fEposta} onChange={e => setFEposta(e.target.value)} placeholder="ad.soyad@kurum.com" />
            </div>
            <div>
              <Modal.Label>Sicil No</Modal.Label>
              <Input value={fSicilNo} onChange={e => setFSicilNo(e.target.value)} placeholder="SIC-001" />
            </div>
          </div>

          {/* Telefon / Sicil No satırı zaten üstte; Kurum / Unvan */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Modal.Label>Telefon</Modal.Label>
              <Input type="tel" value={fTelefon} onChange={e => setFTelefon(e.target.value)} placeholder="0532 000 00 00" />
            </div>
            <div>
              <Modal.Label>Unvan</Modal.Label>
              <Select
                options={unvanOptions}
                value={fUnvan}
                onChange={e => setFUnvan(e.target.value)}
              />
            </div>
          </div>

          {/* Kurum */}
          <div>
            <Modal.Label>Kurum</Modal.Label>
            <Select
              options={kurumOptions}
              value={fKurumId}
              onChange={e => setFKurumId(e.target.value)}
            />
          </div>

          {/* Roller */}
          <div>
            <Modal.Label>Roller</Modal.Label>
            <RolSecici available={rolOptions} selected={fRoller} onChange={setFRoller} />
          </div>

          {/* Durum */}
          <div className="flex items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setFAktif(!fAktif)}
              className={clsx(
                "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
                fAktif ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span className={clsx(
                "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm",
                fAktif ? "translate-x-5" : "translate-x-0"
              )} />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {fAktif ? "Hesap Aktif (" : "Hesap Pasif ("}
              <span className={clsx("font-normal", fAktif ? "text-slate-500" : "text-slate-400")}>
                {fAktif ? "Kullanıcı sisteme giriş yapabilir" : "Giriş yapamaz, listede gizlenir"}
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
            disabled={!fAd.trim() || !fSoyad.trim() || !fEposta.trim()}
            iconLeft={editingItem ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {editingItem ? "Güncelle" : "Oluştur"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal open={!!deletingItem} onClose={() => setDeletingItem(null)} size="sm" zIndex="z-[60]">
        <Modal.Header
          title="Kullanıcıyı Sil"
          onClose={() => setDeletingItem(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950"
        />
        <Modal.Content>
          {deletingItem && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                <span className="font-semibold text-slate-800 dark:text-slate-200">"{deletingItem.ad} {deletingItem.soyad}"</span> kullanıcısını silmek istiyor musunuz?
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-md">
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  Bu işlem geri alınamaz ve kullanıcı kalıcı olarak sistemden kaldırılır.
                </p>
              </div>
            </>
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingItem(null)}>Vazgeç</Button>
          <Button variant="danger" size="xs" onClick={confirmDelete} iconLeft={<Trash2 className="w-3.5 h-3.5" />}>
            Kalıcı Olarak Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
