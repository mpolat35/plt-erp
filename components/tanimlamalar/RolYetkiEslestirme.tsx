"use client";

import { useState, useEffect } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { 
  Search, Shield, Check, X, Users, Key, Copy, RotateCcw,
  ChevronDown, ChevronRight, Menu, Save, AlertCircle
} from "lucide-react";
import clsx from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs, type TabItem } from "@/components/ui/Tabs";

interface Role {
  id: string;
  ad: string;
  aciklama: string;
  aktifMi: boolean;
  kullaniciSayisi: number;
}
interface Yetki {
  id: string;
  ad: string;
  aciklama: string;
  aktifMi: boolean;
  rolSayisi: number;
}

const INITIAL_ROLES: Role[] = [
  { id: "r1", ad: "Sistem Yöneticisi", aciklama: "Tüm modüllere tam erişim", aktifMi: true, kullaniciSayisi: 2 },
  { id: "r2", ad: "İnsan Kaynakları", aciklama: "Özlük ve PDKS modüllerine erişim", aktifMi: true, kullaniciSayisi: 3 },
  { id: "r3", ad: "Proje Yöneticisi", aciklama: "Projeler, fizibilite modüllerine erişim", aktifMi: true, kullaniciSayisi: 8 },
  { id: "r4", ad: "Ön Muhasebe", aciklama: "Fatura kesimi, temel finansal veriler", aktifMi: false, kullaniciSayisi: 1 },
];

const INITIAL_YETKILER: Yetki[] = [
  { id: "y1", ad: "Görme", aciklama: "Kayıtları listeleme ve görme", aktifMi: true, rolSayisi: 4 },
  { id: "y2", ad: "Ekleme", aciklama: "Yeni kayıt oluşturma", aktifMi: true, rolSayisi: 3 },
  { id: "y3", ad: "Silme", aciklama: "Mevcut kayıtları silme", aktifMi: true, rolSayisi: 1 },
  { id: "y4", ad: "Onaylama", aciklama: "Süreçlerdeki kayıtları onaylama", aktifMi: true, rolSayisi: 2 },
  { id: "y5", ad: "Onaya Gönderme", aciklama: "Kayıtları onaya sunma", aktifMi: true, rolSayisi: 3 },
];

type Screen = { id: string; name: string };
type Module = { id: string; name: string; icon: string; screens: Screen[] };

const MODULES: Module[] = [
  { id: 'MOD-CORE', name: 'Sistem & Genel', icon: '🧩', screens: [
    { id: 'SCR-CORE-01', name: 'Kullanıcı Yönetimi' },
    { id: 'SCR-CORE-02', name: 'Rol Yönetimi' },
    { id: 'SCR-CORE-03', name: 'Parametreler' },
  ]},
  { id: 'MOD-FIN', name: 'Muhasebe & Finans', icon: '💰', screens: [
    { id: 'SCR-FIN-01', name: 'Cari Kartlar' },
    { id: 'SCR-FIN-02', name: 'Fatura (Gelen/Giden)' },
    { id: 'SCR-FIN-03', name: 'Banka Hareketleri' },
  ]},
  { id: 'MOD-HR', name: 'Personel & İK', icon: '👥', screens: [
    { id: 'SCR-HR-01', name: 'Personel Kartı' },
    { id: 'SCR-HR-02', name: 'PDKS' },
    { id: 'SCR-HR-03', name: 'İzin & Rapor' },
    { id: 'SCR-HR-04', name: 'Bordro' },
  ]},
  { id: 'MOD-PRC', name: 'Satınalma & Stok', icon: '📦', screens: [
    { id: 'SCR-PRC-01', name: 'Talep / İhtiyaç' },
    { id: 'SCR-PRC-02', name: 'Sipariş' },
    { id: 'SCR-PRC-03', name: 'Depo Hareketleri' },
  ]}
];

type MOCK_USER = { id: string; name: string; email: string; roleId: string; avatarBg: string };
const MOCK_USERS: MOCK_USER[] = [
  { id:"u1", name:"Ahmet Yılmaz", email:"ahmet@dijitek.com", roleId:"r1", avatarBg: "bg-blue-600" },
  { id:"u2", name:"Selin Demir", email:"selin@dijitek.com", roleId:"r1", avatarBg: "bg-rose-500" },
  { id:"u3", name:"Can Öztürk", email:"can@dijitek.com", roleId:"r2", avatarBg: "bg-emerald-600" },
  { id:"u4", name:"Derya Kaya", email:"derya@dijitek.com", roleId:"r3", avatarBg: "bg-purple-600" },
  { id:"u5", name:"Murat Acar", email:"murat@dijitek.com", roleId:"r4", avatarBg: "bg-amber-600" },
];

export default function RolYetkiEslestirme() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [yetkiler, setYetkiler] = useState<Yetki[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [searchRole, setSearchRole] = useState("");
  
  const [openTabs, setOpenTabs] = useState<"matrix" | "users">("matrix");
  const [openModules, setOpenModules] = useState<string[]>(MODULES.map(m => m.id));

  // matrixData[roleId][screenId][yetkiId] = boolean
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, Record<string, boolean>>>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // 1. Roles
    const savedRolesStr = localStorage.getItem("roller_liste_v1");
    let loadedRoles = INITIAL_ROLES;
    if (savedRolesStr) {
      const parsed = JSON.parse(savedRolesStr);
      if (parsed.length > 0) loadedRoles = parsed;
    }
    setRoles(loadedRoles);
    if (!activeRoleId && loadedRoles.length > 0) setActiveRoleId(loadedRoles[0].id);

    // 2. Yetkiler
    const savedYetkilerStr = localStorage.getItem("yetkiler_liste_v1");
    let loadedYetkiler = INITIAL_YETKILER;
    if (savedYetkilerStr) {
      const parsed = JSON.parse(savedYetkilerStr).filter((y: Yetki) => y.aktifMi);
      if (parsed.length > 0) loadedYetkiler = parsed;
    }
    setYetkiler(loadedYetkiler);

    // 3. Matrix Data
    const savedMatrix = localStorage.getItem("rol_yetki_matrix_v1");
    if (savedMatrix) {
      try { setMatrixData(JSON.parse(savedMatrix)); } catch {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeRole = roles.find(r => r.id === activeRoleId);
  const filteredRoles = roles.filter(r => r.ad.toLowerCase().includes(searchRole.toLowerCase()));
  const assignedUsers = MOCK_USERS.filter(u => u.roleId === activeRoleId);

  const toggleModuleAccordion = (modId: string) => {
    setOpenModules(prev => prev.includes(modId) ? prev.filter(x => x !== modId) : [...prev, modId]);
  };

  const getMatrixState = () => matrixData[activeRoleId || ""] || {};

  const toggleCheckbox = (screenId: string, yetkiId: string, value: boolean) => {
    if (!activeRoleId) return;
    setMatrixData(prev => {
      const RoleData = prev[activeRoleId] || {};
      const ScreenData = RoleData[screenId] || {};
      return { ...prev, [activeRoleId]: { ...RoleData, [screenId]: { ...ScreenData, [yetkiId]: value } } };
    });
    setHasChanges(true);
  };

  const setRowBulk = (screenId: string, value: boolean) => {
    if (!activeRoleId) return;
    setMatrixData(prev => {
      const RoleData = prev[activeRoleId] || {};
      const NewScreenData: Record<string, boolean> = {};
      yetkiler.forEach(y => { NewScreenData[y.id] = value; });
      return { ...prev, [activeRoleId]: { ...RoleData, [screenId]: NewScreenData } };
    });
    setHasChanges(true);
  };

  const setColBulk = (modId: string, yetkiId: string, value: boolean) => {
    if (!activeRoleId) return;
    const mod = MODULES.find(m => m.id === modId);
    if (!mod) return;
    setMatrixData(prev => {
      const RoleData = { ...(prev[activeRoleId] || {}) };
      mod.screens.forEach(screen => {
        const ScreenData = { ...(RoleData[screen.id] || {}) };
        ScreenData[yetkiId] = value;
        RoleData[screen.id] = ScreenData;
      });
      return { ...prev, [activeRoleId]: RoleData };
    });
    setHasChanges(true);
  };

  const setModuleBulk = (modId: string, value: boolean) => {
    if (!activeRoleId) return;
    const mod = MODULES.find(m => m.id === modId);
    if (!mod) return;
    setMatrixData(prev => {
      const RoleData = { ...(prev[activeRoleId] || {}) };
      mod.screens.forEach(screen => {
        const NewScreenData: Record<string, boolean> = {};
        yetkiler.forEach(y => { NewScreenData[y.id] = value; });
        RoleData[screen.id] = NewScreenData;
      });
      return { ...prev, [activeRoleId]: RoleData };
    });
    setHasChanges(true);
  };

  const setAllClear = () => {
    if (!activeRoleId) return;
    setMatrixData(prev => {
      const newData = { ...prev };
      delete newData[activeRoleId];
      return newData;
    });
    setHasChanges(true);
  };

  const setAllCheck = () => {
    if (!activeRoleId) return;
    const newRoleData: Record<string, Record<string, boolean>> = {};
    MODULES.forEach(m => {
      m.screens.forEach(s => {
        const sd: Record<string, boolean> = {};
        yetkiler.forEach(y => { sd[y.id] = true });
        newRoleData[s.id] = sd;
      });
    });
    setMatrixData(prev => ({ ...prev, [activeRoleId]: newRoleData }));
    setHasChanges(true);
  };

  const saveToStorage = () => {
    localStorage.setItem("rol_yetki_matrix_v1", JSON.stringify(matrixData));
    setHasChanges(false);
  };

  const tabItems: TabItem[] = filteredRoles.map((r) => ({
    key: r.id,
    label: (
      <div className="flex flex-col">
        <span className="font-semibold text-[13px]">{r.ad}</span>
        <span className="text-[10px] opacity-60 font-normal line-clamp-1">{r.aciklama || "-"}</span>
      </div>
    ),
    icon: <Shield className="w-4 h-4" />,
    content: (
      <div className="flex flex-col min-w-0 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-2 lg:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">{r.ad}</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={openTabs === "matrix" ? "primary" : "soft"}
              size="xs"
              onClick={() => setOpenTabs("matrix")}
              iconLeft={<Key className="w-3 h-3" />}
            >
              Matris
            </Button>
            <Button
              variant={openTabs === "users" ? "primary" : "soft"}
              size="xs"
              onClick={() => setOpenTabs("users")}
              iconLeft={<Users className="w-3 h-3" />}
            >
              Kullanıcılar <span className="ml-1 opacity-70 text-[10px]">({MOCK_USERS.filter((u) => u.roleId === r.id).length})</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900/30">
          {openTabs === "matrix" && (
            <div className="p-3 lg:p-4 flex flex-col gap-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 py-1.5 px-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 font-medium tracking-tight">Eşleştirmeleri hızlı araçlarla yönetebilirsiniz.</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="xs" onClick={setAllClear} iconLeft={<RotateCcw className="w-3 h-3" />}>
                    Temizle
                  </Button>
                  <Button variant="soft" size="xs" onClick={setAllCheck} iconLeft={<Check className="w-3 h-3" />}>
                    Tümünü Seç
                  </Button>
                </div>
              </div>

              {yetkiler.length === 0 ? (
                <div className="text-center p-6 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200">
                  Yetki tanımı yok. "Yetkiler" sekmesinden yetki ekleyin.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {MODULES.map((mod) => {
                    const isOpen = openModules.includes(mod.id);
                    const handleToggle = () => toggleModuleAccordion(mod.id);

                    const actions = (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModuleBulk(mod.id, true);
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                          title="Modülü Seç"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModuleBulk(mod.id, false);
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                          title="Modülü Temizle"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    );

                    return (
                      <Accordion
                        key={mod.id}
                        title={mod.name}
                        icon={<span className="text-sm">{mod.icon}</span>}
                        isOpen={isOpen}
                        onToggle={handleToggle}
                        actions={actions}
                      >
                        <table className="w-full text-left border-collapse min-w-max text-xs">
                          <thead>
                            <tr>
                              <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 p-1.5 px-3 border-b border-r border-slate-200 dark:border-slate-700 w-48 border-l-0">
                                Ekran / Menü
                              </th>
                              {yetkiler.map((y) => (
                                <th
                                  key={y.id}
                                  className="p-1 px-2 border-b border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center relative group min-w-[70px]"
                                >
                                  <div className="font-semibold text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                                    {y.ad}
                                  </div>
                                  <div className="flex items-center justify-center gap-0.5 mt-0.5 opacity-0 group-hover:opacity-100">
                                    <button
                                      onClick={() => setColBulk(mod.id, y.id, true)}
                                      className="w-4 h-4 text-emerald-600 hover:bg-slate-100 rounded flex justify-center items-center"
                                    >
                                      <Check className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={() => setColBulk(mod.id, y.id, false)}
                                      className="w-4 h-4 text-rose-600 hover:bg-slate-100 rounded flex justify-center items-center"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </th>
                              ))}
                              <th className="p-1.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center w-12 text-[10px] font-bold text-slate-500">
                                Satır
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {mod.screens.map((scr) => (
                              <tr key={scr.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
                                <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 dark:bg-slate-800/90 dark:group-hover:bg-slate-700/50 p-1.5 px-3 border-b border-r border-slate-100 dark:border-slate-700/50">
                                  <div className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{scr.name}</div>
                                </td>
                                {yetkiler.map((y) => {
                                  const roleMap = matrixData[r.id] || {};
                                  const isChecked = roleMap[scr.id]?.[y.id] || false;
                                  return (
                                    <td key={y.id} className="p-1.5 border-b border-r border-slate-100 dark:border-slate-700/50 text-center">
                                      <input
                                        type="checkbox"
                                        className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 cursor-pointer"
                                        checked={isChecked}
                                        onChange={(e) => toggleCheckbox(scr.id, y.id, e.target.checked)}
                                      />
                                    </td>
                                  );
                                })}
                                <td className="p-1 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 text-center">
                                  <div className="flex justify-center items-center opacity-0 group-hover:opacity-100">
                                    <button
                                      onClick={() => setRowBulk(scr.id, true)}
                                      className="w-5 h-5 flex justify-center items-center text-emerald-600 hover:bg-white rounded border border-transparent hover:border-slate-200"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setRowBulk(scr.id, false)}
                                      className="w-5 h-5 flex justify-center items-center text-rose-600 hover:bg-white rounded border border-transparent hover:border-slate-200"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Accordion>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {openTabs === "users" && (
            <div className="p-4">
              <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="p-2.5 px-3 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Role Atanan Personeller</h3>
                </div>
                {MOCK_USERS.filter((u) => u.roleId === r.id).length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">Bu role atanmış personel yok.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                    {MOCK_USERS.filter((u) => u.roleId === r.id).map((u) => (
                      <div key={u.id} className="flex gap-2 items-center p-2 rounded border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20">
                        <div
                          className={clsx(
                            "w-8 h-8 rounded-full flex justify-center items-center text-white font-bold text-[10px] shadow-sm",
                            u.avatarBg
                          )}
                        >
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 leading-tight">{u.name}</div>
                          <div className="text-[10px] text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Save Action */}
        {openTabs === "matrix" && hasChanges && activeRoleId === r.id && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white rounded-md px-4 py-2 shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-5 z-[60]">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold">Değişiklikler kaydedilmedi</span>
            </div>
            <Button variant="primary" size="xs" onClick={saveToStorage}>
              Kaydet
            </Button>
          </div>
        )}
      </div>
    ),
  }));

  return (
    <div className="h-[calc(100vh-140px)] min-h-[600px] bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium"
            placeholder="Rol ara..."
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Tabs
          orientation="vertical"
          variant="default"
          items={tabItems}
          activeKey={activeRoleId ?? undefined}
          onChange={setActiveRoleId}
        />
      </div>
    </div>
  );
}
