"use client";
import { useState } from "react";
import {
  Search, Plus, MoreHorizontal, ChevronUp, ChevronDown,
  UserCheck, UserX, Clock, Download,
} from "lucide-react";
import clsx from "clsx";
import { Pagination } from "@/components/ui/Pagination";

type Status = "Aktif" | "İzinli" | "Devamsız";

interface Personnel {
  id: number; name: string; avatar: string; department: string;
  position: string; status: Status; entry: string; exit: string;
  workHours: string; phone: string; avatarColor: string;
}

const personnel: Personnel[] = [
  { id: 1, name: "Mehmet Kaya",   avatar: "MK", department: "Muhasebe",         position: "Muhasebe Müdürü",      status: "Aktif",    entry: "08:02", exit: "17:15", workHours: "9s 13d", phone: "0532 111 22 33", avatarColor: "from-blue-400 to-blue-600"       },
  { id: 2, name: "Ayşe Demir",    avatar: "AD", department: "İnsan Kaynakları",  position: "IK Uzmanı",            status: "Aktif",    entry: "08:45", exit: "18:00", workHours: "9s 15d", phone: "0533 222 33 44", avatarColor: "from-violet-400 to-violet-600"   },
  { id: 3, name: "Can Öztürk",    avatar: "CÖ", department: "Yazılım",           position: "Kıdemli Geliştirici",  status: "İzinli",   entry: "—",     exit: "—",     workHours: "—",      phone: "0534 333 44 55", avatarColor: "from-emerald-400 to-emerald-600" },
  { id: 4, name: "Zeynep Arslan", avatar: "ZA", department: "Satış",             position: "Satış Temsilcisi",     status: "Aktif",    entry: "09:00", exit: "18:00", workHours: "9s 0d",  phone: "0535 444 55 66", avatarColor: "from-blue-400 to-violet-500"     },
  { id: 5, name: "Ali Çelik",     avatar: "AÇ", department: "Lojistik",          position: "Lojistik Koordinatör", status: "Devamsız", entry: "—",     exit: "—",     workHours: "—",      phone: "0536 555 66 77", avatarColor: "from-slate-400 to-slate-600"     },
  { id: 6, name: "Fatma Yıldız",  avatar: "FY", department: "Muhasebe",          position: "Muhasebe Uzmanı",      status: "Aktif",    entry: "08:30", exit: "17:30", workHours: "9s 0d",  phone: "0537 666 77 88", avatarColor: "from-pink-400 to-rose-500"       },
  { id: 7, name: "Burak Şahin",   avatar: "BŞ", department: "Yazılım",           position: "Frontend Geliştirici", status: "Aktif",    entry: "09:15", exit: "18:30", workHours: "9s 15d", phone: "0538 777 88 99", avatarColor: "from-amber-400 to-orange-500"    },
  { id: 8, name: "Merve Koç",     avatar: "MK", department: "Satış",             position: "Satış Müdürü",         status: "Aktif",    entry: "08:00", exit: "17:45", workHours: "9s 45d", phone: "0539 888 99 00", avatarColor: "from-teal-400 to-cyan-500"       },
];

const statusConfig: Record<Status, { label: string; class: string; icon: typeof UserCheck }> = {
  Aktif:    { label: "Aktif",    class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", icon: UserCheck },
  İzinli:   { label: "İzinli",   class: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",             icon: Clock     },
  Devamsız: { label: "Devamsız", class: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",                 icon: UserX     },
};

const departments = ["Tümü", "Muhasebe", "İnsan Kaynakları", "Yazılım", "Satış", "Lojistik"];

export default function PersonnelListPage() {
  const [search, setSearch]             = useState("");
  const [selectedDept, setSelectedDept] = useState("Tümü");
  const [selectedStatus, setSelectedStatus] = useState<string>("Tümü");
  const [sortField, setSortField]       = useState<keyof Personnel | null>(null);
  const [sortDir, setSortDir]           = useState<"asc" | "desc">("asc");
  const [selected, setSelected]         = useState<number[]>([]);
  const [page, setPage]                 = useState(1);
  const [perPage, setPerPage]           = useState(5);

  const handleSort = (field: keyof Personnel) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const filtered = personnel
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        (p.name.toLowerCase().includes(q) || p.department.toLowerCase().includes(q) || p.position.toLowerCase().includes(q)) &&
        (selectedDept   === "Tümü" || p.department === selectedDept) &&
        (selectedStatus === "Tümü" || p.status === selectedStatus)
      );
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const av = a[sortField] as string, bv = b[sortField] as string;
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  const SortIcon = ({ field }: { field: keyof Personnel }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp   className={clsx("w-3 h-3 -mb-1", sortField === field && sortDir === "asc"  ? "text-blue-600 dark:text-blue-400" : "text-slate-300 dark:text-slate-600")} />
      <ChevronDown className={clsx("w-3 h-3",        sortField === field && sortDir === "desc" ? "text-blue-600 dark:text-blue-400" : "text-slate-300 dark:text-slate-600")} />
    </span>
  );

  return (
    <div className="space-y-5">

      {/* ── Üst Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Personel Listesi</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{filtered.length} personel bulundu</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white text-slate-600 rounded-md text-sm hover:bg-slate-50 transition-colors
                             dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            <Download className="w-4 h-4" /> Dışa Aktar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Personel Ekle
          </button>
        </div>
      </div>

      {/* ── Filtreler ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              placeholder="İsim, departman veya pozisyon ara..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-md bg-white text-slate-800 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all
                         dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-blue-500"
            />
          </div>
          <select
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white text-slate-600 cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all
                       dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:focus:border-blue-500"
          >
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white text-slate-600 cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all
                       dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:focus:border-blue-500"
          >
            {["Tümü", "Aktif", "İzinli", "Devamsız"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Tablo ── */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">

        {selected.length > 0 && (
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between dark:bg-blue-950/50 dark:border-blue-900">
            <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">{selected.length} personel seçildi</span>
            <div className="flex gap-2">
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium px-3 py-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors">
                Toplu İşlem
              </button>
              <button onClick={() => setSelected([])} className="text-xs text-slate-500 dark:text-slate-400 px-3 py-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                İptal
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="w-10 px-5 py-3.5">
                  <input type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 bg-white dark:bg-slate-700 focus:ring-blue-500/20 cursor-pointer"
                    checked={selected.length === paginated.length && paginated.length > 0}
                    onChange={() => selected.length === paginated.length ? setSelected([]) : setSelected(paginated.map((p) => p.id))}
                  />
                </th>
                {([["name", "Personel"], ["department", "Departman"]] as [keyof Personnel, string][]).map(([field, label]) => (
                  <th key={field} className="px-4 py-3.5 text-left">
                    <button onClick={() => handleSort(field)} className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200">
                      {label} <SortIcon field={field} />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3.5 text-left">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Durum</span>
                </th>
                <th className="px-4 py-3.5 text-left hidden md:table-cell">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giriş / Çıkış</span>
                </th>
                <th className="px-4 py-3.5 text-left hidden lg:table-cell">
                  <button onClick={() => handleSort("workHours")} className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200">
                    Çalışma <SortIcon field="workHours" />
                  </button>
                </th>
                <th className="px-4 py-3.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {paginated.map((person) => {
                const status     = statusConfig[person.status];
                const StatusIcon = status.icon;
                const isSelected = selected.includes(person.id);
                return (
                  <tr key={person.id} className={clsx("transition-colors group",
                    isSelected ? "bg-blue-50/60 dark:bg-blue-950/30" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                  )}>
                    <td className="px-5 py-4">
                      <input type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 bg-white dark:bg-slate-700 focus:ring-blue-500/20 cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleSelect(person.id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-md bg-gradient-to-br ${person.avatarColor} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-semibold">{person.avatar}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{person.name}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">{person.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{person.department}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.class}`}>
                        <StatusIcon className="w-3.5 h-3.5" />{status.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {person.entry !== "—" ? `${person.entry} → ${person.exit}` : <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className={clsx("text-sm", person.workHours !== "—" ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-300 dark:text-slate-600")}>
                        {person.workHours}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100
                                         dark:text-slate-600 dark:hover:text-slate-300 dark:hover:bg-slate-700">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination bileşeni ── */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          perPage={perPage}
          onChange={setPage}
          onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
          perPageOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}
