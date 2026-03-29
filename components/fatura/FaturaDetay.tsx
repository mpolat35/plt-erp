"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Save, ArrowLeft, RefreshCw, Layers, Calculator, Info, Clock } from "lucide-react";
import type { 
  Fatura, FaturaKalem, FaturaTipi, FaturaTuru, FaturaSenaryo, 
  OdemeDurumu, IrsaliyeDurumu 
} from "./types";
import { MOCK_CARILER } from "./types";
import FaturaKalemleri from "./FaturaKalemleri";

const generateId = () => Math.random().toString(36).substring(2, 9);
import clsx from "clsx";

export default function FaturaDetay({ id }: { id: string }) {
  const router = useRouter();
  const isNew = id === "yeni";

  const [activeTab, setActiveTab] = useState<"genel" | "odeme">("genel");
  const [loading, setLoading] = useState(true);

  // Fatura Form State
  const [fatura, setFatura] = useState<Partial<Fatura>>({
    faturaTipi: "Satış",
    faturaTuru: "E-Fatura",
    senaryo: "Ticari Fatura",
    dovizTuru: "TL",
    dovizKuruTL: 1,
    odemeDurumu: "Ödenecek",
    irsaliyeDurumu: "İrsaliyesiz Fatura",
    kalemler: [],
    faturaTarihi: new Date().toISOString().substring(0, 10),
    vadeTarihi: new Date().toISOString().substring(0, 10),
    faturaDurumu: "Taslak"
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isNew) {
      // Auto-generate fatura no if requested E-fatura
      setFatura(prev => ({...prev, faturaNo: "FTC2024" + Math.floor(Math.random() * 100000).toString().padStart(5, '0')}));
      setLoading(false);
      return;
    }

    const saved = localStorage.getItem("faturalar_v1");
    if (saved) {
      try {
        const faturalar: Fatura[] = JSON.parse(saved);
        const item = faturalar.find(x => x.id === id);
        if (item) setFatura(item);
      } catch (err) {}
    }
    setLoading(false);
  }, [id, isNew]);

  // Derived properties for UI
  const isEskiUsul = fatura.faturaTuru === "Fatura (Eski Usül)";
  const requiresİrsaliye = fatura.irsaliyeDurumu === "Manuel İrsaliye";
  
  // Calculate Totals automatically
  const hesaplananToplamlar = useMemo(() => {
    let genelToplamTutarTL = 0;
    let genelToplamIskontoTL = 0;
    let genelKdvTL = 0;
    let genelVergilerDahilTutarTL = 0;
    let kdvDagilimi: Record<number, number> = { 0:0, 1:0, 10:0, 20:0 };

    (fatura.kalemler || []).forEach(k => {
      genelToplamTutarTL += k.toplamTutarTL;
      genelToplamIskontoTL += k.toplamIskontoTL || 0;
      genelKdvTL += k.hesaplananKdvTL;
      genelVergilerDahilTutarTL += k.vergilerDahilTutarTL;
      
      const or = k.kdvOrani || 0;
      kdvDagilimi[or] = (kdvDagilimi[or] || 0) + k.hesaplananKdvTL;
    });

    return {
      genelToplamTutarTL,
      genelToplamIskontoTL,
      genelKdvTL,
      genelVergilerDahilTutarTL,
      kdvDagilimi
    };
  }, [fatura.kalemler]);

  const handleCariChange = (cariId: string) => {
    const cari = MOCK_CARILER.find(c => c.id === cariId);
    if (cari) {
      setFatura({ ...fatura, cariId, cariHesapKodu: cari.hesapKodu });
    }
  };

  const handleFaturaTipiChange = (tipe: FaturaTipi) => {
    setFatura(prev => ({ ...prev, faturaTipi: tipe, cariId: "", cariHesapKodu: "" }));
  };

  const gecerliCariler = useMemo(() => {
    if (fatura.faturaTipi?.includes("Satış")) return MOCK_CARILER.filter(c => c.tur === "Müşteri");
    if (fatura.faturaTipi?.includes("Alış")) return MOCK_CARILER.filter(c => c.tur === "Tedarikçi");
    return MOCK_CARILER;
  }, [fatura.faturaTipi]);

  const saveFatura = () => {
    // Validations
    const errors: string[] = [];
    if (!fatura.cariId) errors.push("Cari (Müşteri/Tedarikçi) seçimi zorunludur.");
    if (!fatura.faturaNo && !isEskiUsul) errors.push("Fatura numarası girilmelidir.");
    if ((fatura.kalemler?.length || 0) === 0) errors.push("En az 1 adet kalem girilmelidir.");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    const faturaKaydi: Fatura = {
      ...(fatura as Fatura),
      id: isNew ? generateId() : id,
      ...hesaplananToplamlar,
      odenecekTutarTL: hesaplananToplamlar.genelVergilerDahilTutarTL, // Varsayılan: Hepsi ödenecek. İlerde kaparo/peşinat vb ile düşebilir
      muhasebelestirildiMi: fatura.muhasebelestirildiMi || false,
    };

    const saved = localStorage.getItem("faturalar_v1");
    let faturalar: Fatura[] = [];
    if (saved) {
      try { faturalar = JSON.parse(saved); } catch (e) {}
    }

    if (isNew) {
      faturalar.push(faturaKaydi);
    } else {
      const idx = faturalar.findIndex(x => x.id === id);
      if (idx > -1) faturalar[idx] = faturaKaydi;
    }
    localStorage.setItem("faturalar_v1", JSON.stringify(faturalar));

    // Yönlendirme
    if (fatura.odemeDurumu === "Ödendi") {
      alert("Ödeme/Tahsilat ekranı tetiklendi (Simülasyon)");
    }
    window.location.href = "/fatura";
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <Button variant="outline" size="sm" onClick={() => router.push("/fatura")} iconLeft={<ArrowLeft className="w-4 h-4" />}>
          Geri Dön
        </Button>
        <Button variant="primary" size="sm" onClick={saveFatura} iconLeft={<Save className="w-4 h-4" />}>
          Kaydet
        </Button>
      </div>

      {/* ERROR ALERTS */}
      {validationErrors.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-md text-sm">
          <ul className="list-disc pl-5">
            {validationErrors.map((e,i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 text-sm">
        <button 
           className={clsx("pb-2 font-medium transition-colors border-b-2", activeTab === "genel" ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-slate-600 dark:text-slate-400")}
           onClick={() => setActiveTab("genel")}
        >
          Fatura Bilgileri
        </button>
        <button 
           className={clsx("pb-2 font-medium transition-colors border-b-2", activeTab === "odeme" ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-slate-600 dark:text-slate-400")}
           onClick={() => setActiveTab("odeme")}
        >
          Tahsilat / Ödeme Geçmişi
        </button>
      </div>

      {activeTab === "genel" && (
        <div className="flex flex-col gap-4">
          
          <Accordion title="1. Genel / Temel Bilgiler" icon={<Info className="w-4 h-4 text-slate-400" />} defaultOpen>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50">
               <Select
                 label="Fatura Tipi *"
                 value={fatura.faturaTipi}
                 onChange={(e) => handleFaturaTipiChange(e.target.value as any)}
                 options={[
                   {label: "Alış", value: "Alış"},
                   {label: "Satış", value: "Satış"},
                   {label: "Alış İade", value: "Alış İade"},
                   {label: "Satış İade", value: "Satış İade"},
                   {label: "Tevkifatlı Alış", value: "Tevkifatlı Alış"},
                   {label: "Tevkifatlı Satış", value: "Tevkifatlı Satış"}
                 ]}
               />

               <Select
                 label="Cari (Müşteri/Tedarikçi) *"
                 value={fatura.cariId || ""}
                 onChange={(e) => handleCariChange(e.target.value)}
                 options={[
                   {label: "Seçiniz...", value: ""},
                   ...gecerliCariler.map(c => ({label: c.unvan, value: c.id}))
                 ]}
               />

               <Input
                 label="Cari Hesap Kodu"
                 disabled
                 value={fatura.cariHesapKodu || ""}
                 className="bg-slate-50 dark:bg-slate-900/50"
                 readOnly
               />

               <div className="flex flex-col">
                 <div className="flex gap-2 items-end">
                   <div className="flex-1">
                     <Select
                       label="Döviz Türü *"
                       value={fatura.dovizTuru}
                       onChange={(e) => setFatura({...fatura, dovizTuru: e.target.value})}
                       options={[
                         {label: "TL", value: "TL"},
                         {label: "USD", value: "USD"},
                         {label: "EUR", value: "EUR"}
                       ]}
                     />
                   </div>
                   {fatura.dovizTuru !== "TL" && (
                     <div className="flex-1">
                       <Input
                         label="Kur"
                         type="number" step="0.0001"
                         value={fatura.dovizKuruTL || ""}
                         onChange={(e) => setFatura({...fatura, dovizKuruTL: Number(e.target.value)})}
                       />
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </Accordion>

          <Accordion title="2. Belge / Tür Bilgileri" icon={<Layers className="w-4 h-4 text-slate-400" />} defaultOpen>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50">
               <Select
                 label="Fatura Türü"
                 value={fatura.faturaTuru}
                 onChange={(e) => setFatura({...fatura, faturaTuru: e.target.value as FaturaTuru})}
                 options={[
                   {label: "E-Fatura", value: "E-Fatura"},
                   {label: "E-Arşiv", value: "E-Arşiv"},
                   {label: "Fatura (Eski Usül)", value: "Fatura (Eski Usül)"}
                 ]}
               />

               <Select
                 label="Senaryo"
                 value={fatura.senaryo}
                 onChange={(e) => setFatura({...fatura, senaryo: e.target.value as FaturaSenaryo})}
                 disabled={isEskiUsul || fatura.faturaTuru === "E-Arşiv"}
                 options={[
                   {label: "Temel Fatura", value: "Temel Fatura"},
                   {label: "Ticari Fatura", value: "Ticari Fatura"},
                   {label: "E-Arşiv", value: "E-Arşiv"},
                   {label: "Fatura (Eski Usül)", value: "Fatura (Eski Usül)"}
                 ]}
               />

               {!isEskiUsul ? (
                 <Input
                   label="Fatura No *"
                   value={fatura.faturaNo || ""}
                   onChange={(e) => setFatura({...fatura, faturaNo: e.target.value})}
                 />
               ) : (
                 <div className="flex gap-2 items-end">
                   <div className="w-1/3">
                     <Input
                       label="Seri"
                       value={fatura.seri || ""}
                       onChange={(e) => setFatura({...fatura, seri: e.target.value})}
                     />
                   </div>
                   <div className="flex-1">
                     <Input
                       label="Sıra No"
                       value={fatura.no || ""}
                       onChange={(e) => setFatura({...fatura, no: e.target.value})}
                     />
                   </div>
                 </div>
               )}

               <Input
                 label="Fatura Tarihi"
                 type="date"
                 value={fatura.faturaTarihi?.split("T")[0] || ""}
                 onChange={(e) => setFatura({...fatura, faturaTarihi: e.target.value})}
               />
            </div>
          </Accordion>

          <Accordion title="3. Operasyonel / Taşıma Bilgileri" icon={<RefreshCw className="w-4 h-4 text-slate-400" />}>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50">
               <div className="space-y-1">
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ödeme Durumu *</label>
                 <div className="flex gap-4 items-center h-[38px] px-3 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                   <label className="flex items-center gap-2 text-sm cursor-pointer">
                     <input type="radio" name="odemeD" className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" checked={fatura.odemeDurumu==="Ödendi"} onChange={()=>setFatura({...fatura, odemeDurumu: "Ödendi"})} /> Ödendi
                   </label>
                   <label className="flex items-center gap-2 text-sm cursor-pointer">
                     <input type="radio" name="odemeD" className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" checked={fatura.odemeDurumu==="Ödenecek"} onChange={()=>setFatura({...fatura, odemeDurumu: "Ödenecek"})} /> Ödenecek
                   </label>
                 </div>
               </div>

               <Input
                 label="Vade Tarihi *"
                 type="date"
                 value={fatura.vadeTarihi?.split("T")[0] || ""}
                 onChange={(e) => setFatura({...fatura, vadeTarihi: e.target.value})}
               />

               <Select
                 label="İrsaliye Durumu"
                 value={fatura.irsaliyeDurumu}
                 onChange={(e) => setFatura({...fatura, irsaliyeDurumu: e.target.value as IrsaliyeDurumu})}
                 options={[
                   {label: "İrsaliyeli Fatura", value: "İrsaliyeli Fatura"},
                   {label: "İrsaliyesiz Fatura", value: "İrsaliyesiz Fatura"},
                   {label: "Manuel İrsaliye (Elde Gir)", value: "Manuel İrsaliye"}
                 ]}
               />

               {requiresİrsaliye && (
                 <div className="flex gap-2 items-end">
                   <div className="flex-1">
                     <Input
                       label="İrsaliye No"
                       value={fatura.irsaliyeNo || ""}
                       onChange={(e) => setFatura({...fatura, irsaliyeNo: e.target.value})}
                     />
                   </div>
                   <div className="flex-1">
                     <Input
                       label="İrsaliye Tar."
                       type="date"
                       value={fatura.irsaliyeTarihi?.split("T")[0] || ""}
                       onChange={(e) => setFatura({...fatura, irsaliyeTarihi: e.target.value})}
                     />
                   </div>
                 </div>
               )}
            </div>
          </Accordion>

          <FaturaKalemleri 
            kalemler={fatura.kalemler || []} 
            onChange={(yeniKalemler) => setFatura({...fatura, kalemler: yeniKalemler})} 
            dovizTuru={fatura.dovizTuru || "TL"} 
          />

          {/* DİP TOPLAMLAR BÖLÜMÜ */}
          <div className="flex flex-col md:flex-row gap-4 mt-2">
            <div className="flex-1">
              <Textarea 
                label="Fatura Açıklaması / Not"
                className="w-full h-32 resize-none"
                placeholder={fatura.irsaliyeDurumu === "İrsaliyeli Fatura" ? "İrsaliye yerine geçer." : "Fatura ile ilgili belirteceğiniz açıklamalar..."}
                value={fatura.aciklama || ""}
                onChange={(e) => setFatura({...fatura, aciklama: e.target.value})}
              />
            </div>
            
            <div className="w-full md:w-80 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                <Calculator className="w-4 h-4 text-blue-500" /> Dip Toplamlar
              </h3>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Ara Toplam</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: fatura.dovizTuru === "TL" ? "TRY" : (fatura.dovizTuru || "TRY") }).format(hesaplananToplamlar.genelToplamTutarTL + hesaplananToplamlar.genelToplamIskontoTL)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span className="font-medium">İskonto Toplamı</span>
                <span>
                  -{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: fatura.dovizTuru === "TL" ? "TRY" : (fatura.dovizTuru || "TRY") }).format(hesaplananToplamlar.genelToplamIskontoTL)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Saf Tutar</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: fatura.dovizTuru === "TL" ? "TRY" : (fatura.dovizTuru || "TRY") }).format(hesaplananToplamlar.genelToplamTutarTL)}
                </span>
              </div>

              {[0, 1, 10, 20].map(oran => {
                const kdvTutari = hesaplananToplamlar.kdvDagilimi[oran];
                if (!kdvTutari) return null;
                return (
                  <div key={oran} className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">%{oran} KDV</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: fatura.dovizTuru === "TL" ? "TRY" : (fatura.dovizTuru || "TRY") }).format(kdvTutari)}
                    </span>
                  </div>
                )
              })}

              <div className="flex justify-between text-base border-t border-slate-200 dark:border-slate-700 pt-3">
                <span className="text-slate-800 dark:text-slate-200 font-bold">Vergiler Dahil Toplam</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: fatura.dovizTuru === "TL" ? "TRY" : (fatura.dovizTuru || "TRY") }).format(hesaplananToplamlar.genelVergilerDahilTutarTL)}
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === "odeme" && (
        <div className="p-6 text-center border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 border-dashed">
          {fatura.odemeDurumu === "Ödendi" ? (
             <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-1">Bu fatura ödendi olarak işaretlenmiş.</h3>
                <p className="text-slate-500 text-sm">"Tahsilat ve Ödeme" modülü entegre edildiğinde ödeme belgeleri burada listelenecektir.</p>
             </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-3">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-1">Ödeme Bekliyor</h3>
              <p className="text-slate-500 text-sm">Vade Tarihi: {fatura.vadeTarihi?.split("T")[0]}</p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
