import {
  TrendingUp, Users, FileText, Clock,
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
} from "lucide-react";

const stats = [
  { title: "Toplam Fatura",  value: "₺284.500", change: "+12.5%", trend: "up",   sub: "Bu ay",           icon: FileText,   color: "blue"    },
  { title: "Aktif Personel", value: "142",       change: "+3",     trend: "up",   sub: "Bugün giriş",     icon: Users,      color: "violet"  },
  { title: "Ortalama Mesai", value: "8.4 saat",  change: "-0.2",   trend: "down", sub: "Günlük ort.",     icon: Clock,      color: "emerald" },
  { title: "Aylık Büyüme",   value: "%18.2",     change: "+2.1%",  trend: "up",   sub: "Geçen aya göre",  icon: TrendingUp, color: "blue"    },
];

const recentActivity = [
  { user: "Mehmet Kaya",   action: "PDKS girişi yaptı",           time: "2 dk önce",  avatar: "MK", color: "blue"    },
  { user: "Ayşe Demir",    action: "Fatura #1042 oluşturuldu",    time: "15 dk önce", avatar: "AD", color: "violet"  },
  { user: "Can Öztürk",    action: "İzin talebi gönderildi",      time: "1 sa önce",  avatar: "CÖ", color: "emerald" },
  { user: "Zeynep Arslan", action: "PDKS çıkışı yaptı",           time: "2 sa önce",  avatar: "ZA", color: "blue"    },
  { user: "Ali Çelik",     action: "Fatura #1041 onaylandı",      time: "3 sa önce",  avatar: "AÇ", color: "violet"  },
];

const modules = [
  { name: "Fatura Yönetimi", desc: "Fatura oluştur, takip et, raporla", status: "active", href: "/dashboard/fatura" },
  { name: "PDKS",            desc: "Personel devam ve mesai kontrolü",   status: "active", href: "/dashboard/pdks"   },
  { name: "Stok Sayım",      desc: "Envanter ve stok yönetimi",          status: "soon",   href: "#"                 },
  { name: "Abone Yönetimi",  desc: "Müşteri ve abonelik takibi",         status: "soon",   href: "#"                 },
];

const iconColorMap: Record<string, string> = {
  blue:    "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  violet:  "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
};

const avatarColorMap: Record<string, string> = {
  blue:    "from-blue-400 to-blue-600",
  violet:  "from-violet-400 to-violet-600",
  emerald: "from-emerald-400 to-emerald-600",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-all hover:shadow-sm
                                             dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center ${iconColorMap[stat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <button className="text-slate-300 hover:text-slate-500 dark:text-slate-700 dark:hover:text-slate-400 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{stat.title}</div>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === "up"
                    ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                    : <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />}
                  <span className={`text-xs font-medium ${stat.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{stat.sub}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alt Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modüller */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Yüklü Modüller</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Aktif ve planlanan modüller</p>
            </div>
            <div className="p-3 space-y-1">
              {modules.map((mod) => (
                <a key={mod.name} href={mod.href}
                  className={`flex items-center justify-between p-3 rounded-md transition-all group ${mod.status === "active" ? "hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{mod.name}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{mod.desc}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 ml-3 ${
                    mod.status === "active"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  }`}>
                    {mod.status === "active" ? "Aktif" : "Yakında"}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Son Aktiviteler</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Sistemdeki son hareketler</p>
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                Tümünü gör
              </button>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={`w-9 h-9 bg-gradient-to-br ${avatarColorMap[item.color]} rounded-md flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-semibold">{item.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.user}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{item.action}</div>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
