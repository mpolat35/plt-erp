"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import GlobalSearch from "@/components/ui/GlobalSearch";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useSidebar } from "./SidebarContext";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":          { title: "Dashboard",        subtitle: "Genel bakış ve özet bilgiler"          },
  "/pdks":               { title: "PDKS",              subtitle: "Personel devam kontrol sistemi"        },
  "/pdks/personeller":   { title: "Personel Listesi",  subtitle: "Tüm personelleri görüntüle ve yönet"  },
  "/pdks/devam":         { title: "Devam",             subtitle: "Giriş-çıkış takibi"                   },
  "/pdks/hareketler":    { title: "Hareket Bilgileri", subtitle: "Günlük hareket kayıtları"             },
  "/pdks/tanimlamalar":  { title: "Tanımlamalar",      subtitle: "Vardiya ve kural tanımlamaları"       },
  "/pdks/raporlar":      { title: "Raporlar",          subtitle: "Devam ve mesai raporları"             },
  "/fatura":             { title: "Fatura",              subtitle: "Fatura yönetimi ve takibi"            },
  "/ayarlar":            { title: "Ayarlar",             subtitle: "Sistem yapılandırması"                 },
  "/ayarlar/ui-components": { title: "UI Komponentleri",  subtitle: "Design system — tüm bileşenler"       },
  "/proje-yonetimi":     { title: "Proje Yönetimi",      subtitle: "Fizibilite etütleri ve proje dosyalarını yönetin" },
  "/tanimlamalar":       { title: "Sistem Tanımlamaları",subtitle: "Sistem ayarlarına ve tanımlamalarına ait ana ekran." },
  "/tanimlamalar/rol-yetki":{ title: "Rol & Yetki Tanımları", subtitle: "Sistemdeki yetkiler ve roller bu sayfadan yapılandırılacak." },
  "/tanimlamalar/kullanici":{ title: "Kullanıcı Tanımları", subtitle: "Kullanıcı yönetimi, hesap listeleme ve ekleme konfigürasyonları." },
  "/tanimlamalar/vergiler":{ title: "Vergiler", subtitle: "Gelir vergisi, damga vergisi ve KDV tevkifat oranları." },
  "/tanimlamalar/ucret-bilgileri":{ title: "Ücret Bilgileri", subtitle: "Asgari ücret ve maaş parametreleri yönetimi." },
  "/tanimlamalar/calisma-takvimi":{ title: "Çalışma Takvimi", subtitle: "Resmi tatiller ve idari izinlerin takibi." },
};

export default function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname] || { title: "Sayfa", subtitle: "" };
  const [searchOpen, setSearchOpen] = useState(false);
  const { toggle } = useSidebar();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 md:px-6 sticky top-0 z-10
                         dark:bg-slate-900 dark:border-slate-800">

        {/* Mobil: hamburger butonu */}
        <button
          onClick={toggle}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-2 flex-shrink-0"
          aria-label="Menüyü aç/kapat"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Sol: Sayfa başlığı */}
        <div className="w-36 md:w-48 flex-shrink-0">
          <h1 className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="hidden md:block text-xs text-slate-400 dark:text-slate-500 truncate">{page.subtitle}</p>
          )}
        </div>

        {/* Orta: Global Arama — mobilde gizli */}
        <div className="hidden md:flex flex-1 justify-center px-3 md:px-6">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 w-full max-w-md px-4 py-2.5 text-sm
                       bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300
                       rounded-md transition-all group
                       dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:border-slate-600"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
            <span className="flex-1 text-left text-slate-400 dark:text-slate-500">
              Sayfa, modül veya personel ara...
            </span>
            <kbd className="hidden sm:flex items-center gap-0.5 text-xs bg-white border border-slate-200 text-slate-400 rounded-lg px-1.5 py-0.5 flex-shrink-0
                           dark:bg-slate-900 dark:border-slate-600 dark:text-slate-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Sağ: Dark mode + Bildirim */}
        <div className="w-48 flex-shrink-0 flex items-center justify-end gap-2">
          <ThemeToggle />
          <button className="relative w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 text-slate-500
                             hover:text-slate-700 hover:bg-slate-50 transition-all
                             dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          </button>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
