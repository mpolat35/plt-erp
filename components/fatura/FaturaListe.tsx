"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, Search, Plus, Filter, Download, MoreVertical, 
  CheckCircle, Clock, AlertTriangle, FileCheck, XCircle, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import clsx from "clsx";
import type { Fatura } from "./types";
import { MOCK_CARILER } from "./types";

export default function FaturaListe() {
  const router = useRouter();
  const [faturaListesi, setFaturaListesi] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);

  // Arama / Filtreleme Stateleri
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadFaturalar = useCallback(() => {
    const saved = localStorage.getItem("faturalar_v1");
    if (saved) {
      try {
        setFaturaListesi(JSON.parse(saved));
      } catch (err) {}
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFaturalar();
    // router.refresh() sonrası component yeniden mount olduğunda da yakalar
    window.addEventListener("focus", loadFaturalar);
    return () => window.removeEventListener("focus", loadFaturalar);
  }, [loadFaturalar]);

  const getStatusBadge = (status: Fatura["faturaDurumu"]) => {
    switch (status) {
      case "Kabul Edildi": return <Badge variant="emerald"><CheckCircle className="w-3 h-3 mr-1" />Kabul Edildi</Badge>
      case "Taslak": return <Badge variant="amber"><Clock className="w-3 h-3 mr-1" />Taslak</Badge>
      case "Gönderildi": return <Badge variant="blue"><FileCheck className="w-3 h-3 mr-1" />Gönderildi</Badge>
      case "Hatalı": return <Badge variant="red"><AlertTriangle className="w-3 h-3 mr-1" />Hatalı</Badge>
      case "İptal Edildi": return <Badge variant="slate"><XCircle className="w-3 h-3 mr-1" />İptal</Badge>
      default: return <Badge variant="slate">{status}</Badge>
    }
  };

  const handleMuhasebelestir = () => {
    if (selectedIds.length === 0) return;
    
    // Yalnızca seçili olanların Muhasebelestirildi statüsünü true yap.
    const updated = faturaListesi.map(f => {
      if (selectedIds.includes(f.id)) {
        return { ...f, muhasebelestirildiMi: true };
      }
      return f;
    });

    setFaturaListesi(updated);
    localStorage.setItem("faturalar_v1", JSON.stringify(updated));
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(f => f.id));
    }
  };

  const filteredList = faturaListesi.filter(f => {
    // Arama
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      // Cari unvanı bul
      const cari = MOCK_CARILER.find(c => c.id === f.cariId);
      const q = `${f.faturaNo} ${cari?.unvan || ""} ${f.faturaDurumu}`.toLowerCase();
      if (!q.includes(search)) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      
      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          
          {/* Arama Alanı */}
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Fatura No, Cari Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
               <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleMuhasebelestir} iconLeft={<FileCheck className="w-4 h-4" />}>
                Muhasebeleştir ({selectedIds.length})
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => router.push("/fatura/yeni")} iconLeft={<Plus className="w-4 h-4" />} className="flex-1 sm:flex-none justify-center">
              Yeni Ekle
            </Button>
          </div>

      </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900">
        <table className="w-full text-left border-collapse min-w-[800px] text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="p-3 w-10 text-center font-medium">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={filteredList.length > 0 && selectedIds.length === filteredList.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 font-semibold uppercase tracking-wider">Fatura No</th>
              <th className="p-3 font-semibold uppercase tracking-wider">Cari H.</th>
              <th className="p-3 font-semibold uppercase tracking-wider">Kayıt Tarihi</th>
              <th className="p-3 font-semibold uppercase tracking-wider text-right">Tutar</th>
              <th className="p-3 font-semibold uppercase tracking-wider">Tip / Tür</th>
              <th className="p-3 font-semibold uppercase tracking-wider">Durum</th>
              <th className="p-3 font-semibold uppercase tracking-wider">Mhsb?</th>
              <th className="p-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
             {loading ? (
               <tr><td colSpan={9} className="p-8 text-center text-slate-500">Yükleniyor...</td></tr>
             ) : filteredList.length === 0 ? (
               <tr>
                 <td colSpan={9} className="p-8">
                    <div className="flex flex-col items-center justify-center text-slate-400 text-sm">
                      <FileText className="w-10 h-10 mb-2 opacity-50" />
                      Kayıtlı fatura bulunamadı.
                    </div>
                 </td>
               </tr>
             ) : (
               filteredList.map((f) => {
                 const isSelected = selectedIds.includes(f.id);
                 const cari = MOCK_CARILER.find(c => c.id === f.cariId);
                 
                 return (
                   <tr key={f.id} className={clsx("hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group", isSelected && "bg-blue-50/50 dark:bg-blue-900/10")}>
                     <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isSelected}
                          onChange={() => toggleSelect(f.id)}
                        />
                     </td>
                     <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{f.faturaNo}</div>
                        <div className="text-[10px] text-slate-400">{f.faturaTarihi.split("T")[0]}</div>
                     </td>
                     <td className="p-3">
                        <div className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1">{cari?.unvan}</div>
                        <div className="text-[10px] text-slate-500">{f.cariHesapKodu}</div>
                     </td>
                     <td className="p-3 text-slate-600 dark:text-slate-400">
                        {new Date(f.faturaTarihi).toLocaleDateString('tr-TR')}
                     </td>
                     <td className="p-3 text-right">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: f.dovizTuru === "TL" ? "TRY" : (f.dovizTuru || "TRY") }).format(f.odenecekTutarTL)}
                        </div>
                     </td>
                     <td className="p-3">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{f.faturaTipi}</div>
                        <div className="text-[10px] text-slate-500">{f.faturaTuru}</div>
                     </td>
                     <td className="p-3">
                        {getStatusBadge(f.faturaDurumu)}
                     </td>
                     <td className="p-3">
                        {f.muhasebelestirildiMi ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-semibold tracking-wide dark:bg-emerald-900/30 dark:text-emerald-400">
                             <CheckCircle className="w-3 h-3" /> E.
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-semibold tracking-wide dark:bg-slate-800 dark:text-slate-400">
                             <RotateCcw className="w-3 h-3" /> H.
                          </span>
                        )}
                     </td>
                     <td className="p-3 text-right">
                        <Button variant="ghost" size="xs" onClick={() => router.push(`/fatura/${f.id}`)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Detay
                        </Button>
                     </td>
                   </tr>
                 )
               })
             )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
