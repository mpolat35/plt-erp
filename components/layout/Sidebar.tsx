"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Clock, Package, Users,
  Settings, Zap, ChevronRight, LogOut, LucideIcon,
  UserCheck, Activity, SlidersHorizontal, BarChart2,
  FolderKanban, X, Building2, Bell, Percent, Banknote, CalendarDays,
  TrendingUp, PanelLeftClose, Globe, CreditCard, ArrowLeftRight,
} from "lucide-react";
import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import { useSidebar } from "./SidebarContext";

interface NavChild  { name: string; href: string; icon: LucideIcon; }
interface NavItem   { name: string; href: string; icon: LucideIcon; badge?: string; comingSoon?: boolean; children?: NavChild[]; }
interface NavSection { label: string; items: NavItem[]; }

const navigation: NavSection[] = [
  {
    label: "Ana Menü",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Modüller",
    items: [
      {
        name: "Fatura",
        href: "/fatura",
        icon: FileText,
        children: [
          { name: "Fatura Listesi",    href: "/fatura",         icon: FileText },
          { name: "Hizmet ve Ürünler", href: "/fatura/urunler", icon: Package  },
        ],
      },
      {
        name: "PDKS",
        href: "/pdks",
        icon: Clock,
        children: [
          { name: "Genel Bakış",  href: "/pdks",               icon: BarChart2    },
          { name: "Devam",        href: "/pdks/devam",          icon: UserCheck    },
          { name: "Hareketler",   href: "/pdks/hareketler",     icon: ArrowLeftRight },
          { name: "Personeller",  href: "/pdks/personeller",    icon: Users        },
          { name: "Raporlar",     href: "/pdks/raporlar",       icon: TrendingUp   },
        ],
      },
      {
        name: "Proje Yönetimi",
        href: "/proje-yonetimi",
        icon: FolderKanban,
        children: [
          { name: "Projeler", href: "/proje-yonetimi", icon: FolderKanban },
          { name: "Aktivite", href: "/proje-yonetimi/aktivite", icon: Activity },
        ],
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      { name: "Ayarlar", href: "/ayarlar", icon: Settings },
      {
        name: "Tanımlamalar",
        href: "/tanimlamalar",
        icon: SlidersHorizontal,
        children: [
          { name: "Rol-Yetki",       href: "/tanimlamalar/rol-yetki",       icon: UserCheck      },
          { name: "Kurum",           href: "/tanimlamalar/kurum",            icon: Building2      },
          { name: "Organizasyon",    href: "/tanimlamalar/organizasyon",     icon: Layers         },
          { name: "Kullanıcı",       href: "/tanimlamalar/kullanici",        icon: Users          },
          { name: "Yer Bilgileri",   href: "/tanimlamalar/yer-bilgileri",    icon: Globe          },
          { name: "Döviz Kurları",   href: "/tanimlamalar/doviz-kurlari",    icon: TrendingUp     },
          { name: "Vergiler",        href: "/tanimlamalar/vergiler",         icon: Percent        },
          { name: "Ücret Bilgileri", href: "/tanimlamalar/ucret-bilgileri",  icon: CreditCard     },
          { name: "Çalışma Takvimi", href: "/tanimlamalar/calisma-takvimi",  icon: CalendarDays   },
        ],
      },
      {
        name: "Bildirim Modülü",
        href: "/bildirim",
        icon: Bell,
        children: [
          { name: "Bildirim Ayarları", href: "/bildirim/ayarlar", icon: Bell },
        ],
      },
    ],
  },
];

// ── Tooltip (fixed-position, overflow engeline takılmaz) ─────────────────────
function CollapsedTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [top, setTop] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        if (ref.current) {
          const r = ref.current.getBoundingClientRect();
          setTop(r.top + r.height / 2);
        }
      }}
      onMouseLeave={() => setTop(null)}
    >
      {children}
      {top !== null && (
        <div
          className="fixed z-[200] pointer-events-none"
          style={{ top, left: 68, transform: "translateY(-50%)" }}
        >
          <div className="bg-slate-800 dark:bg-slate-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg flex items-center gap-1.5">
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-slate-700" />
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close, collapsed, toggleCollapsed } = useSidebar();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => ({
    "/pdks":           pathname.startsWith("/pdks"),
    "/proje-yonetimi": pathname.startsWith("/proje-yonetimi"),
    "/tanimlamalar":   pathname.startsWith("/tanimlamalar"),
    "/fatura":         pathname.startsWith("/fatura"),
    "/bildirim":       pathname.startsWith("/bildirim"),
  }));

  useEffect(() => {
    ["/pdks", "/proje-yonetimi", "/tanimlamalar", "/fatura", "/bildirim"].forEach(prefix => {
      if (pathname.startsWith(prefix))
        setOpenMenus(prev => ({ ...prev, [prefix]: true }));
    });
  }, [pathname]);

  const toggleMenu = (href: string) =>
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }));

  const sidebarContent = (isCollapsed: boolean) => (
    <aside className={clsx(
      "h-full bg-white border-r border-slate-100 flex flex-col dark:bg-slate-900 dark:border-slate-800",
      "transition-all duration-300 overflow-hidden",
      isCollapsed ? "w-16" : "w-64",
    )}>
      {/* Logo */}
      <div className={clsx(
        "h-16 flex items-center border-b border-slate-100 dark:border-slate-800 flex-shrink-0",
        isCollapsed ? "justify-center px-0" : "justify-between px-4",
      )}>
        {isCollapsed ? (
          <button
            onClick={toggleCollapsed}
            title="Menüyü Genişlet"
            className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <Zap className="w-4 h-4 text-white" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">AdminPanel</span>
                <div className="text-xs text-slate-400 dark:text-slate-500 -mt-0.5">v2.0</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleCollapsed}
                title="Menüyü Daralt"
                className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
              <button
                onClick={close}
                className="md:hidden w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className={clsx(
        "flex-1 py-4 space-y-4 overflow-y-auto",
        isCollapsed ? "px-2" : "px-3",
      )}>
        {navigation.map((section) => (
          <div key={section.label}>
            {isCollapsed ? (
              <div className="border-t border-slate-100 dark:border-slate-800 mb-1 first:hidden" />
            ) : (
              <div className="px-3 mb-1.5">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
                  {section.label}
                </span>
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive      = pathname === item.href;
                const isParentActive = item.children
                  ? pathname.startsWith(item.href + "/") || pathname === item.href
                  : false;
                const isItemOpen    = openMenus[item.href] ?? false;
                const Icon          = item.icon;

                // ── Collapsed görünüm ──────────────────────────────────────
                if (isCollapsed) {
                  const iconActive = isActive || isParentActive;
                  const trigger = (
                    <div className={clsx(
                      "flex items-center justify-center w-full py-1.5 rounded-lg transition-all cursor-pointer",
                      iconActive
                        ? "bg-blue-50 dark:bg-blue-950"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}>
                      <div className={clsx(
                        "w-7 h-7 flex items-center justify-center rounded-md",
                        iconActive
                          ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                  );

                  return (
                    <CollapsedTooltip key={item.name} label={item.name}>
                      {item.children ? (
                        <button className="w-full" onClick={() => {}}>{trigger}</button>
                      ) : (
                        <Link href={item.comingSoon ? "#" : item.href} onClick={close}>
                          {trigger}
                        </Link>
                      )}
                    </CollapsedTooltip>
                  );
                }

                // ── Expanded görünüm ───────────────────────────────────────
                return (
                  <div key={item.name}>
                    {item.children ? (
                      <button
                        onClick={() => toggleMenu(item.href)}
                        className={clsx(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                          isParentActive
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                            isParentActive
                              ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                              : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-200",
                          )}>
                            <Icon className="w-4 h-4 flex-shrink-0" />
                          </div>
                          {item.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-medium dark:bg-emerald-950 dark:text-emerald-400">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={clsx(
                            "w-3.5 h-3.5 transition-transform duration-200",
                            isItemOpen ? "rotate-90" : "",
                            isParentActive ? "text-blue-400" : "text-slate-300 dark:text-slate-600",
                          )} />
                        </div>
                      </button>
                    ) : (
                      <Link
                        href={item.comingSoon ? "#" : item.href}
                        onClick={() => close()}
                        className={clsx(
                          "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                          isActive
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                            : item.comingSoon
                            ? "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                            isActive
                              ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                              : item.comingSoon
                              ? "bg-slate-50 text-slate-300 dark:bg-slate-900/50 dark:text-slate-600"
                              : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-200",
                          )}>
                            <Icon className="w-4 h-4 flex-shrink-0" />
                          </div>
                          {item.name}
                        </div>
                        {item.badge && (
                          <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-medium dark:bg-emerald-950 dark:text-emerald-400">
                            {item.badge}
                          </span>
                        )}
                        {item.comingSoon && (
                          <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-md dark:bg-slate-800 dark:text-slate-500">
                            Yakında
                          </span>
                        )}
                        {isActive && !item.badge && !item.comingSoon && (
                          <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </Link>
                    )}

                    {item.children && isItemOpen && (
                      <div className="mt-0.5 ml-4 pl-3 border-l border-slate-200 dark:border-slate-700 space-y-0.5">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              onClick={() => close()}
                              className={clsx(
                                "flex items-center gap-2.5 px-3 py-1 rounded-lg text-xs font-medium transition-all group",
                                isChildActive
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300",
                              )}
                            >
                              <div className={clsx(
                                "w-6 h-6 flex items-center justify-center rounded-md transition-colors",
                                isChildActive
                                  ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                                  : "text-slate-400 group-hover:bg-white group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-300",
                              )}>
                                <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                              </div>
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Kullanıcı */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
        {isCollapsed ? (
          <CollapsedTooltip label="Ahmet Yılmaz — Süper Admin">
            <div className="flex items-center justify-center py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">AY</span>
              </div>
            </div>
          </CollapsedTooltip>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">AY</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">Ahmet Yılmaz</div>
              <div className="text-xs text-slate-400 dark:text-slate-500 truncate">Süper Admin</div>
            </div>
            <LogOut className="w-4 h-4 text-slate-300 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400 transition-colors flex-shrink-0" />
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: statik sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        {sidebarContent(collapsed)}
      </div>

      {/* Mobil: overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={close} />
      )}

      {/* Mobil: drawer (her zaman expanded) */}
      <div className={clsx(
        "md:hidden fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}>
        {sidebarContent(false)}
      </div>
    </>
  );
}
