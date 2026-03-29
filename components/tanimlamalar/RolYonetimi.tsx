"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Shield, Check, SlidersHorizontal } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import clsx from "clsx";

interface Role {
  id: string;
  ad: string;
  aciklama: string;
  aktifMi: boolean;
  kullaniciSayisi: number;
}

const STORAGE_KEY = "roller_liste_v1";

const INITIAL_ROLES: Role[] = [
  { id: "r1", ad: "Sistem Yöneticisi", aciklama: "Tüm sistem modüllerine ve ayarlarına tam erişim", aktifMi: true, kullaniciSayisi: 2 },
  { id: "r2", ad: "İnsan Kaynakları", aciklama: "Personel, özlük dosyaları ve PDKS modüllerine erişim", aktifMi: true, kullaniciSayisi: 3 },
  { id: "r3", ad: "Proje Yöneticisi", aciklama: "Projeler, fizibilite ve operasyon modüllerine erişim", aktifMi: true, kullaniciSayisi: 8 },
  { id: "r4", ad: "Ön Muhasebe", aciklama: "Fatura kesimi ve temel finansal verilere erişim", aktifMi: false, kullaniciSayisi: 1 },
];

type DurumFilter = "tumu" | "aktif" | "pasif";

export default function RolYonetimi() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterAd, setFilterAd] = useState(true);
  const [filterAciklama, setFilterAciklama] = useState(true);
  const [filterDurum, setFilterDurum] = useState<DurumFilter>("tumu");
  const filterRef = useRef<HTMLDivElement>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // Form states
  const [formAd, setFormAd] = useState("");
  const [formAciklama, setFormAciklama] = useState("");
  const [formAktif, setFormAktif] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRoles(JSON.parse(saved));
      } catch {
        setRoles(INITIAL_ROLES);
      }
    } else {
      setRoles(INITIAL_ROLES);
    }
  }, []);

  const saveToStorage = (updatedRoles: Role[]) => {
    setRoles(updatedRoles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoles));
  };

  // Dışarı tıklayınca dropdown kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredRoles = roles.filter(r => {
    // Durum filtresi
    if (filterDurum === "aktif" && !r.aktifMi) return false;
    if (filterDurum === "pasif" && r.aktifMi) return false;

    // Metin arama
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const inAd = filterAd && r.ad.toLowerCase().includes(q);
    const inAciklama = filterAciklama && r.aciklama.toLowerCase().includes(q);
    return inAd || inAciklama;
  });

  const totalPages = Math.ceil(filteredRoles.length / perPage);
  const paginatedRoles = filteredRoles.slice((page - 1) * perPage, page * perPage);

  // Arama veya filtre değiştiğinde 1. sayfaya dön
  useEffect(() => {
    setPage(1);
  }, [search, filterAd, filterAciklama, filterDurum]);

  const isFiltered = filterDurum !== "tumu" || !filterAd || !filterAciklama;

  const openAddModal = () => {
    setEditingRole(null);
    setFormAd("");
    setFormAciklama("");
    setFormAktif(true);
    setModalOpen(true);
  };

  const openEditModal = (r: Role) => {
    setEditingRole(r);
    setFormAd(r.ad);
    setFormAciklama(r.aciklama);
    setFormAktif(r.aktifMi);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRole(null);
  };

  const handleSave = () => {
    if (!formAd.trim()) return;

    if (editingRole) {
      // Güncelle
      const updated = roles.map(r => 
        r.id === editingRole.id ? { ...r, ad: formAd, aciklama: formAciklama, aktifMi: formAktif } : r
      );
      saveToStorage(updated);
    } else {
      // Yeni Ekle
      const newRole: Role = {
        id: "r_" + Date.now().toString(),
        ad: formAd,
        aciklama: formAciklama,
        aktifMi: formAktif,
        kullaniciSayisi: 0, // Yeni rolde 0 kullanıcı atanmış varsayılır
      };
      saveToStorage([...roles, newRole]);
    }
    closeModal();
  };

  const openDeleteModal = (r: Role) => {
    setDeletingRole(r);
  };

  const confirmDelete = () => {
    if (!deletingRole) return;
    // Eğer kullanıcıya atanmışsa silme işlemi yapılamaz
    if (deletingRole.kullaniciSayisi > 0) return;
    
    saveToStorage(roles.filter(x => x.id !== deletingRole.id));
    setDeletingRole(null);
  };

  return (
    <div className="space-y-4">
      {/* Tablo Araç Çubuğu (Toolbar) */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
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
            {/* Filtre ikonu */}
            <button
              type="button"
              onClick={() => setFilterOpen(v => !v)}
              title="Filtre seçenekleri"
              className={clsx(
                "absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded transition-colors",
                isFiltered
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isFiltered && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>

            {/* Filtre Dropdown */}
            {filterOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Arama Alanları */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Arama Alanları</p>
                  <label className="flex items-center gap-2 cursor-pointer group py-0.5">
                    <span className={clsx(
                      "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                      filterAd
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                    )}>
                      {filterAd && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </span>
                    <input type="checkbox" checked={filterAd} onChange={() => setFilterAd(v => !v)} className="sr-only" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Rol Adı</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group py-0.5">
                    <span className={clsx(
                      "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                      filterAciklama
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                    )}>
                      {filterAciklama && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </span>
                    <input type="checkbox" checked={filterAciklama} onChange={() => setFilterAciklama(v => !v)} className="sr-only" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Açıklama</span>
                  </label>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800" />

                {/* Durum Filtresi */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Durum</p>
                  {(["tumu", "aktif", "pasif"] as DurumFilter[]).map(d => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer group py-0.5">
                      <span className={clsx(
                        "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
                        filterDurum === d
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                      )}>
                        {filterDurum === d && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                      <input type="radio" name="durum" value={d} checked={filterDurum === d} onChange={() => setFilterDurum(d)} className="sr-only" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
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
          {/* Masaüstü: yazılı buton */}
          <div className="hidden md:block">
            <Button
              onClick={openAddModal}
              variant="soft"
              size="sm"
              iconLeft={<Plus className="w-4 h-4" />}
            >
              Yeni Rol Ekle
            </Button>
          </div>
          {/* Mobil: sadece ikon */}
          <button
            onClick={openAddModal}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
            title="Yeni Rol Ekle"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Tablo — masaüstü */}
        <div className="hidden md:block">
          <Table>
            <Thead>
              <Tr>
                <Th align="center" className="w-16">#</Th>
                <Th>Rol Adı</Th>
                <Th>Açıklama</Th>
                <Th align="center">Kullanıcı</Th>
                <Th align="center">Durum</Th>
                <Th align="right">İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRoles.length === 0 ? (
                <Tr>
                  <Td colSpan={6} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Shield className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 font-medium">Kayıtlı rol bulunamadı</p>
                    </div>
                  </Td>
                </Tr>
              ) : (
                paginatedRoles.map((r, i) => (
                  <Tr key={r.id}>
                    <Td align="center">
                      <span className="inline-flex items-center justify-center min-w-[24px] px-1 h-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-md">
                        {(page - 1) * perPage + i + 1}
                      </span>
                    </Td>
                    <Td>
                      <div className="font-normal text-slate-800 dark:text-slate-200">{r.ad}</div>
                    </Td>
                    <Td>
                      <div className="text-slate-500 shrink-0 max-w-sm truncate" title={r.aciklama}>
                        {r.aciklama || "-"}
                      </div>
                    </Td>
                    <Td align="center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                        {r.kullaniciSayisi}
                      </span>
                    </Td>
                    <Td align="center">
                      {r.aktifMi ? (
                        <Badge variant="emerald">Aktif</Badge>
                      ) : (
                        <Badge variant="slate">Pasif</Badge>
                      )}
                    </Td>
                    <Td align="right">
                      <div className="irow">
                        <button className="ib ie" onClick={() => openEditModal(r)} title="Düzenle">
                          <Pencil />
                        </button>
                        <button className="ib id" onClick={() => openDeleteModal(r)} title="Sil">
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

        {/* Kart görünümü — mobil */}
        <div className="md:hidden">
          {filteredRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Shield className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 font-medium">Kayıtlı rol bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRoles.map((r, i) => (
                <div key={r.id} className="px-4 py-3.5 flex flex-col gap-2">
                  {/* Üst satır: sıra no + rol adı + durum */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-[22px] px-1 h-5 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded flex-shrink-0">
                      {(page - 1) * perPage + i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                      {r.ad}
                    </span>
                    {r.aktifMi ? (
                      <Badge variant="emerald">Aktif</Badge>
                    ) : (
                      <Badge variant="slate">Pasif</Badge>
                    )}
                  </div>

                  {/* Açıklama */}
                  {r.aciklama && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {r.aciklama}
                    </p>
                  )}

                  {/* Alt satır: kullanıcı sayısı + işlemler */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                        {r.kullaniciSayisi}
                      </span>
                      <span>kullanıcı</span>
                    </div>
                    <div className="irow">
                      <button className="ib ie" onClick={() => openEditModal(r)} title="Düzenle">
                        <Pencil />
                      </button>
                      <button className="ib id" onClick={() => openDeleteModal(r)} title="Sil">
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredRoles.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredRoles.length}
            perPage={perPage}
            onChange={setPage}
            onPerPageChange={setPerPage}
          />
        )}
      </div>

      {/* Ekle/Düzenle Modal */}
      <Modal open={modalOpen} onClose={closeModal}>
        <Modal.Header
          title={editingRole ? "Tanımlı Rolü Düzenle" : "Yeni Sistem Rolü Tanımla"}
          onClose={closeModal}
          icon={<Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        />
        <Modal.Content className="space-y-5">
          <div>
            <Modal.Label>Rol Adı</Modal.Label>
            <Input
              value={formAd}
              onChange={e => setFormAd(e.target.value)}
              placeholder="Örn: Proje Sorumlusu"
              autoFocus
            />
          </div>
          <div>
            <Modal.Label>Açıklama</Modal.Label>
            <Input
              value={formAciklama}
              onChange={e => setFormAciklama(e.target.value)}
              placeholder="Bu rol kimlere atanır ve genel işlevi nedir?"
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
              {formAktif ? "Bu Rol Aktif (" : "Bu Rol Pasif ("}
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
            iconLeft={editingRole
              ? <Pencil className="w-3.5 h-3.5" />
              : <Plus className="w-3.5 h-3.5" />
            }
          >
            {editingRole ? "Güncelle" : "Oluştur"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal open={!!deletingRole} onClose={() => setDeletingRole(null)} size="sm" zIndex="z-[60]">
        <Modal.Header
          title="Rolü Sil"
          onClose={() => setDeletingRole(null)}
          icon={<Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950"
        />
        <Modal.Content>
          {deletingRole && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                <span className="font-semibold text-slate-800 dark:text-slate-200">"{deletingRole.ad}"</span> sistem rolünü silmek istiyor musunuz?
              </p>
              {deletingRole.kullaniciSayisi > 0 ? (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md">
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">Bu Rol Kullanımda!</p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    Şu anda sistemde <strong>{deletingRole.kullaniciSayisi} kullanıcı</strong> bu role atanmış durumda.
                    Silme işlemi yapabilmek için öncelikle bu kullanıcıların rollerini değiştirmeniz gerekmektedir.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-md">
                  <p className="text-xs text-amber-700 dark:text-amber-500">
                    Bu işlem geri alınamaz ve rol kalıcı olarak sistemden kaldırılır.
                  </p>
                </div>
              )}
            </>
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" size="xs" onClick={() => setDeletingRole(null)}>Vazgeç</Button>
          <Button
            variant="danger"
            size="xs"
            onClick={confirmDelete}
            disabled={deletingRole?.kullaniciSayisi > 0}
            iconLeft={<Trash2 className="w-3.5 h-3.5" />}
          >
            Kalıcı Olarak Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
