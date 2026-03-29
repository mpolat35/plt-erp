"use client";

import { Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { FaturaKalem } from "./types";
import { MOCK_URUNLER } from "./types";
import clsx from "clsx";

const generateId = () => Math.random().toString(36).substring(2, 9);

interface Props {
  kalemler: FaturaKalem[];
  onChange: (kalemler: FaturaKalem[]) => void;
  dovizTuru: string;
}

export default function FaturaKalemleri({ kalemler, onChange, dovizTuru }: Props) {
  const addRow = () => {
    const defaultUrun = MOCK_URUNLER[0];
    const y: FaturaKalem = {
      id: generateId(),
      malHizmetId: defaultUrun.id,
      miktar: 1,
      birim: defaultUrun.birim,
      birimFiyat: defaultUrun.varsayilanFiyat,
      iskontoYuzde: 0,
      kdvOrani: defaultUrun.kdvOrani as any,
      toplamTutarTL: defaultUrun.varsayilanFiyat,
      hesaplananKdvTL: defaultUrun.varsayilanFiyat * (defaultUrun.kdvOrani / 100),
      vergilerDahilTutarTL: defaultUrun.varsayilanFiyat * (1 + defaultUrun.kdvOrani / 100),
      tevkifatTuru: defaultUrun.tevkifatUygulanirMi ? "Evet" : "Hayır",
      tevkifatOrani: defaultUrun.tevkifatOrani || "",
    };
    onChange([...kalemler, y]);
  };

  const removeRow = (id: string) => {
    onChange(kalemler.filter((k) => k.id !== id));
  };

  const updateRow = (id: string, updates: Partial<FaturaKalem>) => {
    const yeni = kalemler.map((k) => {
      if (k.id === id) {
        let updated = { ...k, ...updates };

        // Eğer ürün seçildiyse fiyatları vs oto ayarla
        if (updates.malHizmetId) {
          const urun = MOCK_URUNLER.find(u => u.id === updates.malHizmetId);
          if (urun) {
            updated.birim = urun.birim;
            updated.birimFiyat = urun.varsayilanFiyat;
            updated.kdvOrani = urun.kdvOrani as any;
            updated.tevkifatTuru = urun.tevkifatUygulanirMi ? "Evet" : "Hayır";
            updated.tevkifatOrani = urun.tevkifatOrani || "";
          }
        }

        // Matematik:
        const miktar = updated.miktar || 0;
        const bFiyat = updated.birimFiyat || 0;
        const iskYuzde = updated.iskontoYuzde || 0;
        const kdvYuzde = updated.kdvOrani || 0;
        
        let brüt = miktar * bFiyat;
        let iskontoTutarı = (brüt * iskYuzde) / 100;
        let safTutar = brüt - iskontoTutarı;
        let kdvTutarı = (safTutar * kdvYuzde) / 100;

        // ek vergi varsa
        let ekVergiOrani = updated.digerVergiOrani || 0;
        let ekVergiTutari = (safTutar * ekVergiOrani) / 100;

        // Tevkifat hesaplaması
        let tevkifatKesintisi = 0;
        if (updated.tevkifatTuru === "Evet" && updated.tevkifatOrani) {
          const [pay, payda] = updated.tevkifatOrani.split("/").map(Number);
          if (pay && payda && payda !== 0) {
            tevkifatKesintisi = kdvTutarı * (pay / payda);
          }
        }

        updated.toplamTutarTL = safTutar;
        updated.toplamIskontoTL = iskontoTutarı;
        updated.hesaplananKdvTL = kdvTutarı;
        updated.hesaplananTevkifatTL = tevkifatKesintisi;
        updated.vergilerDahilTutarTL = safTutar + kdvTutarı + ekVergiTutari - tevkifatKesintisi;

        return updated;
      }
      return k;
    });
    onChange(yeni);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-2">
         <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
           <Tag className="w-4 h-4 text-blue-500" /> Mal / Hizmet Kalemleri
         </h4>
         <Button variant="soft" size="xs" onClick={addRow} iconLeft={<Plus className="w-3 h-3" />}>Satır Ekle</Button>
      </div>

      <div className="overflow-x-auto hide-scrollbar border border-slate-200 dark:border-slate-700/80 rounded bg-white dark:bg-slate-800">
        <table className="w-full text-left border-collapse text-xs min-w-[700px]">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/80">
            <tr>
              <th className="p-2 w-48 font-semibold">Stok / Hizmet</th>
              <th className="p-2 w-20 font-semibold text-right">Miktar</th>
              <th className="p-2 w-20 font-semibold text-center">Birim</th>
              <th className="p-2 w-28 font-semibold text-right">Br.Fiyat ({dovizTuru})</th>
              <th className="p-2 w-20 font-semibold text-right">İskonto (%)</th>
              <th className="p-2 w-24 font-semibold text-right">KDV (%)</th>
              <th className="p-2 w-32 font-semibold text-right">Tutar ({dovizTuru})</th>
              <th className="p-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {kalemler.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  Faturaya henüz kalem eklenmemiş. "Satır Ekle" butonunu kullanın.
                </td>
              </tr>
            ) : kalemler.map((kalem) => (
              <tr key={kalem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="p-2">
                  <select 
                    title="Mal / Hizmet Seçimi"
                    className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded px-2 py-1 outline-none focus:border-blue-500 dark:focus:border-blue-400"
                    value={kalem.malHizmetId}
                    onChange={(e) => updateRow(kalem.id, { malHizmetId: e.target.value })}
                  >
                    {MOCK_URUNLER.map(u => <option key={u.id} value={u.id}>{u.ad}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    title="Miktar"
                    type="number"
                    min="1"
                    className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded px-2 py-1 outline-none text-right focus:border-blue-500"
                    value={kalem.miktar}
                    onChange={(e) => updateRow(kalem.id, { miktar: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="p-2 text-center text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                  {kalem.birim}
                </td>
                <td className="p-2">
                  <input
                    title="Birim Fiyat"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded px-2 py-1 outline-none text-right focus:border-blue-500"
                    value={kalem.birimFiyat || ""}
                    onChange={(e) => updateRow(kalem.id, { birimFiyat: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="p-2">
                  <input
                    title="İskonto Yüzdesi"
                    type="number"
                    min="0"
                    max="100"
                    className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded px-2 py-1 outline-none text-right focus:border-blue-500"
                    value={kalem.iskontoYuzde || ""}
                    onChange={(e) => updateRow(kalem.id, { iskontoYuzde: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="p-2">
                  <select
                    title="KDV Oranı"
                    className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded px-2 py-1 outline-none text-right focus:border-blue-500"
                    value={kalem.kdvOrani.toString()}
                    onChange={(e) => updateRow(kalem.id, { kdvOrani: Number(e.target.value) as any })}
                  >
                    <option value="0">%0</option>
                    <option value="1">%1</option>
                    <option value="10">%10</option>
                    <option value="20">%20</option>
                  </select>
                </td>
                <td className="p-2 text-right">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2 }).format(kalem.vergilerDahilTutarTL)}
                  </div>
                  {kalem.hesaplananTevkifatTL ? (
                     <div className="text-[9px] text-orange-600 dark:text-orange-400">
                       Tevkifat: {kalem.tevkifatOrani} ({kalem.hesaplananTevkifatTL.toFixed(2)})
                     </div>
                  ) : null}
                  {(kalem.toplamIskontoTL || 0) > 0 && (
                     <div className="text-[9px] text-green-600 dark:text-green-400">-{new Intl.NumberFormat('tr-TR').format(kalem.toplamIskontoTL!)} İnd.</div>
                  )}
                </td>
                <td className="p-2 text-center">
                  <button 
                    onClick={() => removeRow(kalem.id)}
                    className="w-6 h-6 rounded flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
