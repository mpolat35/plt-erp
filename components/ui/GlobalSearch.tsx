"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, LayoutDashboard, FileText, Clock,
  Package, Users, Settings, ArrowRight, UserCheck, Hash,
  FolderKanban, Palette, Activity, Shuffle, SlidersHorizontal
} from "lucide-react";
import clsx from "clsx";

interface SearchItem {
  id: string; title: string; subtitle?: string;
  category: "Sayfa" | "Personel" | "Modül" | "Proje";
  href: string; icon: React.ElementType;
  iconColor: string; iconBg: string; keywords?: string[];
}

const PAGES: SearchItem[] = [
  { id: "page-dashboard",    title: "Dashboard",        subtitle: "Ana yönetim paneli",               category: "Sayfa",   href: "/dashboard",         icon: LayoutDashboard, iconColor: "text-blue-600 dark:text-blue-400",    iconBg: "bg-blue-50 dark:bg-blue-950",    keywords: ["ana","panel","genel","bakış"]           },
  { id: "page-fatura",       title: "Fatura",           subtitle: "Fatura yönetimi ve takibi",        category: "Modül",   href: "/fatura",             icon: FileText,        iconColor: "text-blue-600 dark:text-blue-400",    iconBg: "bg-blue-50 dark:bg-blue-950",    keywords: ["invoice","ödeme","kesim"]               },
  { id: "page-fatura-urunler", title: "Hizmet ve Ürünler", subtitle: "Fatura › Kalem/Ürün Katalog Yönetimi", category: "Modül", href: "/fatura/urunler", icon: Package, iconColor: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-50 dark:bg-blue-950", keywords: ["ürün","hizmet","fiyat","stok","katalog"] },
  { id: "page-pdks",         title: "PDKS",             subtitle: "Personel devam kontrol sistemi",   category: "Modül",   href: "/pdks",               icon: Clock,           iconColor: "text-violet-600 dark:text-violet-400",iconBg: "bg-violet-50 dark:bg-violet-950",keywords: ["devam","yoklama","giriş","çıkış"]        },
  { id: "page-pdks-personel",title: "Personel Listesi", subtitle: "PDKS › Tüm personeli görüntüle",  category: "Sayfa",   href: "/pdks/personeller",   icon: Users,           iconColor: "text-violet-600 dark:text-violet-400",iconBg: "bg-violet-50 dark:bg-violet-950",keywords: ["çalışan","personel","staff","employee"]  },
  { id: "page-pdks-devam",   title: "Devam Bilgileri",  subtitle: "PDKS › Günlük devam durumu",        category: "Sayfa",   href: "/pdks/devam",         icon: Activity,        iconColor: "text-violet-600 dark:text-violet-400",iconBg: "bg-violet-50 dark:bg-violet-950",keywords: ["devam","yoklama","puantaj"]                  },
  { id: "page-pdks-hareket", title: "Hareket Bilgileri",subtitle: "PDKS › Günlük hareket kayıtları",   category: "Sayfa",   href: "/pdks/hareketler",    icon: Shuffle,         iconColor: "text-violet-600 dark:text-violet-400",iconBg: "bg-violet-50 dark:bg-violet-950",keywords: ["hareket","giriş","çıkış","kayıt"]              },
  { id: "page-pdks-tanimlar",title: "Tanımlamalar",     subtitle: "PDKS › Sistem tanımlamaları",       category: "Sayfa",   href: "/pdks/tanimlamalar",  icon: SlidersHorizontal,iconColor: "text-violet-600 dark:text-violet-400",iconBg: "bg-violet-50 dark:bg-violet-950",keywords: ["tanım","ayarlar","vardiya","tatil"]            },
  { id: "page-pdks-raporlar",title: "PDKS Raporlar",    subtitle: "PDKS › Devam ve mesai raporları",  category: "Sayfa",   href: "/pdks/raporlar",      icon: Clock,           iconColor: "text-violet-600 dark:text-violet-400",iconBg: "bg-violet-50 dark:bg-violet-950",keywords: ["rapor","mesai","devam"]                  },
  { id: "page-stok",         title: "Stok Sayım",       subtitle: "Yakında aktif olacak",             category: "Modül",   href: "/stok",               icon: Package,         iconColor: "text-emerald-600 dark:text-emerald-400",iconBg:"bg-emerald-50 dark:bg-emerald-950",keywords: ["depo","envanter","stok"]              },
  { id: "page-abone",        title: "Abone Yönetimi",   subtitle: "Yakında aktif olacak",             category: "Modül",   href: "/abone",              icon: Users,           iconColor: "text-amber-600 dark:text-amber-400",  iconBg: "bg-amber-50 dark:bg-amber-950",  keywords: ["müşteri","abonelik","subscription"]      },
  { id: "page-ayarlar",      title: "Ayarlar",          subtitle: "Sistem ayarları",                  category: "Sayfa",   href: "/ayarlar",            icon: Settings,        iconColor: "text-slate-600 dark:text-slate-400",  iconBg: "bg-slate-100 dark:bg-slate-800", keywords: ["settings","config","yapılandırma"]       },
  { id: "page-ayarlar-ui",   title: "UI Komponentleri", subtitle: "Ayarlar › Tasarım Sistemi",        category: "Sayfa",   href: "/ayarlar/ui-components", icon: Palette,      iconColor: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-50 dark:bg-violet-950", keywords: ["ui","tasarım","bileşen","buton","input","badge","avatar","alert","kart","card","tablo","tabs","select","toggle","stat","empty"] },
  { id: "page-proje-yonetimi", title: "Proje Yönetimi", subtitle: "Fizibilite etütleri ve dosyalar",category: "Modül",   href: "/proje-yonetimi",     icon: FolderKanban,  iconColor: "text-blue-600 dark:text-blue-400",     iconBg: "bg-blue-50 dark:bg-blue-950",    keywords: ["proje","fizibilite","yönetim","etüt"]      },
  { id: "page-sistem-tanimlamalar", title: "Sistem Tanımlamaları", subtitle: "Sistem alt tanımlamaları", category: "Modül", href: "/tanimlamalar", icon: SlidersHorizontal, iconColor: "text-slate-600 dark:text-slate-400", iconBg: "bg-slate-100 dark:bg-slate-800", keywords: ["sistem", "tanımlamalar", "ayarlar"] },
  { id: "page-sistem-rol-yetki", title: "Rol-Yetki", subtitle: "Sistem › Tanımlamalar › Rol ve Yetki", category: "Sayfa", href: "/tanimlamalar/rol-yetki", icon: UserCheck, iconColor: "text-slate-600 dark:text-slate-400", iconBg: "bg-slate-100 dark:bg-slate-800", keywords: ["rol", "yetki", "izin"] },
  { id: "page-sistem-kullanici", title: "Kullanıcı Tanımları", subtitle: "Sistem › Tanımlamalar › Kullanıcı", category: "Sayfa", href: "/tanimlamalar/kullanici", icon: Users, iconColor: "text-slate-600 dark:text-slate-400", iconBg: "bg-slate-100 dark:bg-slate-800", keywords: ["kullanıcı", "user", "hesap"] },
];

const PERSONNEL: SearchItem[] = [
  { id:"p1", title:"Mehmet Kaya",   subtitle:"Muhasebe Müdürü · Muhasebe",         category:"Personel", href:"/pdks/personeller", icon:UserCheck, iconColor:"text-blue-600 dark:text-blue-400",    iconBg:"bg-blue-50 dark:bg-blue-950",    keywords:["muhasebe"]          },
  { id:"p2", title:"Ayşe Demir",    subtitle:"IK Uzmanı · İnsan Kaynakları",       category:"Personel", href:"/pdks/personeller", icon:UserCheck, iconColor:"text-violet-600 dark:text-violet-400",iconBg:"bg-violet-50 dark:bg-violet-950",keywords:["ik","insan kaynakları"]},
  { id:"p3", title:"Can Öztürk",    subtitle:"Kıdemli Geliştirici · Yazılım",      category:"Personel", href:"/pdks/personeller", icon:UserCheck, iconColor:"text-emerald-600 dark:text-emerald-400",iconBg:"bg-emerald-50 dark:bg-emerald-950",keywords:["yazılım","developer"]},
  { id:"p4", title:"Zeynep Arslan", subtitle:"Satış Temsilcisi · Satış",           category:"Personel", href:"/pdks/personeller", icon:UserCheck, iconColor:"text-blue-500 dark:text-blue-400",    iconBg:"bg-blue-50 dark:bg-blue-950",    keywords:["satış"]             },
  { id:"p5", title:"Ali Çelik",     subtitle:"Lojistik Koordinatör · Lojistik",   category:"Personel", href:"/pdks/personeller", icon:UserCheck, iconColor:"text-slate-600 dark:text-slate-400",  iconBg:"bg-slate-100 dark:bg-slate-800", keywords:["lojistik"]          },
  { id:"p6", title:"Fatma Yıldız",  subtitle:"Muhasebe Uzmanı · Muhasebe",         category:"Personel", href:"/pdks/personeller", icon:UserCheck, iconColor:"text-pink-600 dark:text-pink-400",    iconBg:"bg-pink-50 dark:bg-pink-950",    keywords:["muhasebe"]          },
  { id:"p7", title:"Burak Şahin",   subtitle:"Frontend Geliştirici · Yazılım",     category:"Personel", href:"/pdks/personeller", icon:UserCheck, iconColor:"text-amber-600 dark:text-amber-400",  iconBg:"bg-amber-50 dark:bg-amber-950",  keywords:["yazılım","frontend"] },
  { id:"p8", title:"Merve Koç",     subtitle:"Satış Müdürü · Satış",              category:"Personel", href:"/pdks/personeller", icon:UserCheck, iconColor:"text-teal-600 dark:text-teal-400",    iconBg:"bg-teal-50 dark:bg-teal-950",    keywords:["satış"]             },
];

const CATEGORY_ORDER: SearchItem["category"][] = ["Sayfa", "Modül", "Proje", "Personel"];

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-sm px-0.5 not-italic font-medium">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface GlobalSearchProps { open: boolean; onClose: () => void; }

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router   = useRouter();
  const [query, setQuery]       = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [dynamicProjects, setDynamicProjects] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      try {
        const s = localStorage.getItem("proje_liste_v1");
        if (s) {
          const projects: any[] = JSON.parse(s);
          const mapped: SearchItem[] = projects.map((p) => ({
            id: `dyn-proj-${p.id}`,
            title: p.name,
            subtitle: `İdare: ${p.idare || "Bilinmiyor"}`,
            category: "Proje",
            href: `/proje-yonetimi/${p.id}`,
            icon: FolderKanban,
            iconColor: "text-blue-600 dark:text-blue-400",
            iconBg: "bg-blue-50 dark:bg-blue-950",
            keywords: [p.idare, "proje", "fizibilite", p.status || ""],
          }));
          setDynamicProjects(mapped);
        }
      } catch (e) {
        console.error("Projeler arama sistemine eklenemedi:", e);
      }
    }
  }, [open]);

  const allItems = [...PAGES, ...PERSONNEL, ...dynamicProjects];

  const results = query.trim()
    ? allItems.filter((item) => {
        const q = query.toLowerCase();
        return item.title.toLowerCase().includes(q) ||
               item.subtitle?.toLowerCase().includes(q) ||
               item.keywords?.some((k) => k.toLowerCase().includes(q));
      })
    : PAGES.slice(0, 6);

  const grouped  = CATEGORY_ORDER.reduce<Record<string, SearchItem[]>>((acc, cat) => {
    const items = results.filter((r) => r.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const flatList = CATEGORY_ORDER.flatMap((cat) => grouped[cat] ?? []);

  const navigate = useCallback((item: SearchItem) => { router.push(item.href); onClose(); }, [router, onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape")    { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, flatList.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && flatList[activeIdx]) navigate(flatList[activeIdx]);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, flatList, activeIdx, navigate, onClose]);

  useEffect(() => { setActiveIdx(0); }, [query]);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(""); setActiveIdx(0); }
  }, [open]);
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm z-50 gs-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-[12vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4 gs-modal">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-slate-950/60 border border-slate-200 dark:border-slate-700 overflow-hidden">

          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Sayfa, modül veya personel ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors text-slate-500 dark:text-slate-400 flex-shrink-0">
                <X className="w-3 h-3" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-lg px-2 py-1 ml-1 flex-shrink-0">
              ESC
            </kbd>
          </div>

          {/* Sonuçlar */}
          <div ref={listRef} className="overflow-y-auto max-h-[400px] py-2">
            {flatList.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                  <Hash className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Sonuç bulunamadı</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">&quot;{query}&quot; için eşleşme yok</p>
                </div>
              </div>
            ) : (
              <>
                {!query && (
                  <p className="px-4 pb-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Hızlı Erişim
                  </p>
                )}
                {CATEGORY_ORDER.map((cat) => {
                  const items = grouped[cat];
                  if (!items) return null;
                  const catStartIdx = flatList.findIndex((x) => x.category === cat);
                  return (
                    <div key={cat}>
                      {query && (
                        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {cat}
                        </p>
                      )}
                      {items.map((item, i) => {
                        const globalIdx = catStartIdx + i;
                        const isActive  = globalIdx === activeIdx;
                        return (
                          <button key={item.id} data-idx={globalIdx}
                            onClick={() => navigate(item)}
                            onMouseEnter={() => setActiveIdx(globalIdx)}
                            className={clsx(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              isActive
                                ? "bg-blue-50 dark:bg-blue-950/60"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                          >
                            <div className={clsx("w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", item.iconBg)}>
                              <item.icon className={clsx("w-4 h-4", item.iconColor)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={clsx("text-sm font-medium truncate", isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300")}>
                                {highlight(item.title, query)}
                              </p>
                              {item.subtitle && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                  {highlight(item.subtitle, query)}
                                </p>
                              )}
                            </div>
                            {isActive && <ArrowRight className="w-4 h-4 text-blue-400 dark:text-blue-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center gap-4">
            {[
              { keys: ["↑", "↓"], label: "Gezin" },
              { keys: ["↵"],      label: "Aç"    },
              { keys: ["ESC"],    label: "Kapat" },
            ].map(({ keys, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                {keys.map((k) => (
                  <kbd key={k} className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded px-1.5 py-0.5 font-mono">
                    {k}
                  </kbd>
                ))}
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
