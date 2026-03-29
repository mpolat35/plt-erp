"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, TrendingUp, AlertCircle, Clock, ArrowUpDown } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

interface DovizItem {
  kod: string;
  isim: string;
  ingilizceIsim: string;
  birim: string;
  forexAlis: string;
  forexSatis: string;
  efektifAlis: string;
  efektifSatis: string;
}

interface ApiResponse {
  success: boolean;
  tarih?: string;
  bultenNo?: string;
  dovizler?: DovizItem[];
  error?: string;
}

type SortKey = "kod" | "isim" | "forexAlis" | "forexSatis";
type SortDir = "asc" | "desc";

const DOVIZ_ISIMLERI: Record<string, string> = {
  USD: "ABD Doları",
  EUR: "Euro",
  GBP: "İngiliz Sterlini",
  JPY: "Japon Yeni",
  CHF: "İsviçre Frangı",
  SEK: "İsveç Kronası",
  NOK: "Norveç Kronası",
  DKK: "Danimarka Kronası",
  CAD: "Kanada Doları",
  AUD: "Avustralya Doları",
  SAR: "Suudi Arabistan Riyali",
  KWD: "Kuveyt Dinarı",
  BGN: "Bulgar Levası",
  RON: "Rumen Leyi",
  RUB: "Rus Rublesi",
  IRR: "İran Riyali",
  CNY: "Çin Yuanı",
  PKR: "Pakistan Rupisi",
  QAR: "Katar Riyali",
  KRW: "Güney Kore Wonu",
  AZN: "Azerbaycan Manatı",
  AED: "BAE Dirhemi",
  DZD: "Cezayir Dinarı",
  EGP: "Mısır Poundu",
  HUF: "Macar Forinti",
  ILS: "İsrail Şekeli",
  INR: "Hint Rupisi",
  JOD: "Ürdün Dinarı",
  LYD: "Libya Dinarı",
  MAD: "Fas Dirhemi",
  MYR: "Malezya Ringgiti",
  MXN: "Meksika Pesosu",
  NGN: "Nijerya Nairası",
  PLN: "Polonya Zlotisi",
  BRL: "Brezilya Reali",
  SGD: "Singapur Doları",
  THB: "Tayland Bahtı",
  TND: "Tunus Dinarı",
  UAH: "Ukrayna Grivnası",
};

function formatKur(val: string): string {
  if (!val || val === "") return "—";
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export default function DovizKurlari() {
  const [data, setData]         = useState<ApiResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [search, setSearch]     = useState("");
  const [sortKey, setSortKey]   = useState<SortKey>("kod");
  const [sortDir, setSortDir]   = useState<SortDir>("asc");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/doviz");
      const json = await res.json() as ApiResponse;
      setData(json);
      if (json.success) setFetchedAt(new Date());
    } catch {
      setData({ success: false, error: "Sunucuya bağlanılamadı." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const dovizler = (data?.dovizler ?? []).map((d) => ({
    ...d,
    turkceIsim: DOVIZ_ISIMLERI[d.kod] ?? d.isim,
  }));

  const filtered = dovizler.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return d.kod.toLowerCase().includes(q) ||
           d.turkceIsim.toLowerCase().includes(q) ||
           d.ingilizceIsim.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    let va: string | number = "";
    let vb: string | number = "";
    if (sortKey === "kod")      { va = a.kod;      vb = b.kod; }
    if (sortKey === "isim")     { va = a.turkceIsim; vb = b.turkceIsim; }
    if (sortKey === "forexAlis") { va = parseFloat(a.forexAlis) || 0; vb = parseFloat(b.forexAlis) || 0; }
    if (sortKey === "forexSatis") { va = parseFloat(a.forexSatis) || 0; vb = parseFloat(b.forexSatis) || 0; }
    if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb as string, "tr") : (vb as string).localeCompare(va, "tr");
    return sortDir === "asc" ? va - (vb as number) : (vb as number) - va;
  });

  function SortTh({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <th
        onClick={() => handleSort(k)}
        className={clsx(
          "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap transition-colors",
          active
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        )}
      >
        <span className="flex items-center gap-1">
          {label}
          <ArrowUpDown className={clsx("w-3 h-3", active ? "opacity-100" : "opacity-30")} />
          {active && <span className="text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>}
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-4">

      {/* Başlık kartı */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              T.C. Merkez Bankası Döviz Kurları
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {data?.tarih && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Kur tarihi: <strong className="text-slate-700 dark:text-slate-300">{data.tarih}</strong>
                </span>
              )}
              {data?.bultenNo && (
                <span className="text-xs text-slate-400">· Bülten: {data.bultenNo}</span>
              )}
              {fetchedAt && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {fetchedAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} güncellendi
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={fetchData}
          disabled={loading}
          variant="outline"
          size="sm"
          iconLeft={<RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />}
        >
          {loading ? "Yükleniyor…" : "Yenile"}
        </Button>
      </div>

      {/* Hata */}
      {data && !data.success && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-md">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Veri çekilemedi</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{data.error}</p>
          </div>
        </div>
      )}

      {/* Tablo */}
      {(loading || (data?.success && sorted.length > 0)) && (
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">

          {/* Arama */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Döviz kodu veya adıyla ara…"
              className="flex-1 max-w-sm pl-3 pr-3 py-1.5 text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 transition-all"
            />
            {data?.dovizler && (
              <span className="text-xs text-slate-400 ml-auto">
                {sorted.length} / {data.dovizler.length} döviz
              </span>
            )}
          </div>

          {/* Masaüstü tablo */}
          <div className="hidden md:block overflow-x-auto">
            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-slate-50 dark:border-slate-800/60 animate-pulse">
                    <div className="w-12 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="w-40 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="w-8 h-4 bg-slate-100 dark:bg-slate-800 rounded ml-auto" />
                    <div className="w-24 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="w-24 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="w-24 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="w-24 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th align="center" className="w-12">#</Th>
                    <SortTh label="Kod" k="kod" />
                    <SortTh label="Döviz Adı" k="isim" />
                    <Th className="w-16">Birim</Th>
                    <SortTh label="Forex Alış" k="forexAlis" />
                    <SortTh label="Forex Satış" k="forexSatis" />
                    <Th>Efektif Alış</Th>
                    <Th>Efektif Satış</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sorted.length === 0 ? (
                    <Tr>
                      <Td colSpan={8} align="center" className="py-10">
                        <p className="text-slate-400 text-sm">Arama sonucu bulunamadı</p>
                      </Td>
                    </Tr>
                  ) : (
                    sorted.map((d, i) => (
                      <Tr key={d.kod}>
                        <Td align="center">
                          <span className="inline-flex items-center justify-center min-w-[24px] px-1 h-6 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-md">
                            {i + 1}
                          </span>
                        </Td>
                        <Td>
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold tracking-widest">
                            {d.kod}
                          </span>
                        </Td>
                        <Td>
                          <div>
                            <p className="text-sm text-slate-800 dark:text-slate-200">{d.turkceIsim}</p>
                            {d.ingilizceIsim && d.ingilizceIsim !== d.turkceIsim && (
                              <p className="text-xs text-slate-400 dark:text-slate-500">{d.ingilizceIsim}</p>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <Badge variant="slate">{d.birim}</Badge>
                        </Td>
                        <Td>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                            {formatKur(d.forexAlis)}
                          </span>
                        </Td>
                        <Td>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                            {formatKur(d.forexSatis)}
                          </span>
                        </Td>
                        <Td>
                          <span className="text-sm text-slate-600 dark:text-slate-300 tabular-nums">
                            {formatKur(d.efektifAlis)}
                          </span>
                        </Td>
                        <Td>
                          <span className="text-sm text-slate-600 dark:text-slate-300 tabular-nums">
                            {formatKur(d.efektifSatis)}
                          </span>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            )}
          </div>

          {/* Mobil kartlar */}
          <div className="md:hidden">
            {loading ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="px-4 py-3.5 animate-pulse space-y-2">
                    <div className="flex gap-2">
                      <div className="w-12 h-5 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="w-32 h-5 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="flex gap-4">
                      <div className="w-24 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="w-24 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {sorted.map((d) => (
                  <div key={d.kod} className="px-4 py-3.5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold tracking-widest flex-shrink-0">
                        {d.kod}
                      </span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{d.turkceIsim}</span>
                      <Badge variant="slate" className="ml-auto flex-shrink-0">{d.birim}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">F. Alış</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">{formatKur(d.forexAlis)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">F. Satış</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">{formatKur(d.forexSatis)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">E. Alış</span>
                        <span className="text-slate-600 dark:text-slate-400 tabular-nums">{formatKur(d.efektifAlis)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">E. Satış</span>
                        <span className="text-slate-600 dark:text-slate-400 tabular-nums">{formatKur(d.efektifSatis)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
