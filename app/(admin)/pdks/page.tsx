import { Users, Clock, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import { Page } from "@/components/ui/Page";

const stats = [
  { title: "Toplam Personel", value: "148", icon: Users,     color: "blue"    },
  { title: "Bugün Giriş",     value: "132", icon: UserCheck, color: "emerald" },
  { title: "Giriş Yapmayan",  value: "16",  icon: UserX,     color: "red"     },
  { title: "Ort. Mesai",      value: "8.4s", icon: Clock,    color: "violet"  },
];

const subMenus = [
  { name: "Personel Listesi",   href: "/pdks/personeller",  desc: "Tüm personelleri görüntüle"       },
  { name: "Devam",              href: "/pdks/devam",         desc: "Giriş-çıkış takibi"               },
  { name: "Hareket Bilgileri",  href: "/pdks/hareketler",    desc: "Günlük hareket kayıtları"         },
  { name: "Tanımlamalar",       href: "/pdks/tanimlamalar",  desc: "Vardiya ve kural tanımlamaları"   },
  { name: "Raporlar",           href: "/pdks/raporlar",      desc: "Devam ve mesai raporları"         },
];

const iconColorMap: Record<string, string> = {
  blue:    "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  red:     "bg-red-50 text-red-500 dark:bg-red-950 dark:text-red-400",
  violet:  "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
};

export default function PDKSPage() {
  return (
    <Page
      title="Personel Devam Kontrol Sistemi"
      description="Personel giriş çıkış takibi, vardiya ve raporlama yönetimi."
      icon={Clock}
    >
      <div className="space-y-6">
      {/* İstatistikler */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-white rounded-2xl p-5 border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 ${iconColorMap[s.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.title}</div>
            </div>
          );
        })}
      </div>

      {/* Alt Menüler */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">PDKS Modülü</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Personel devam kontrol sistemi alt bölümleri</p>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {subMenus.map((item) => (
            <Link key={item.name} href={item.href}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.name}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.desc}</div>
              </div>
              <span className="text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors text-lg">→</span>
            </Link>
          ))}
        </div>
      </div>
      </div>
    </Page>
  );
}
