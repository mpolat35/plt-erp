export type FaturaTipi =
  | "Alış"
  | "Satış"
  | "Alış İade"
  | "Satış İade"
  | "Tevkifatlı Alış"
  | "Tevkifatlı Satış"
  | "İhraç Kayıtlı Alış"
  | "İhraç Kayıtlı Satış";

export type FaturaTuru = "E-Fatura" | "E-Arşiv" | "Fatura (Eski Usül)";
export type FaturaSenaryo = "Temel Fatura" | "Ticari Fatura" | "E-Arşiv" | "Fatura (Eski Usül)";
export type OdemeDurumu = "Ödendi" | "Ödenecek";
export type IrsaliyeDurumu = "İrsaliyeli Fatura" | "İrsaliyesiz Fatura" | "Manuel İrsaliye";
export type FaturaDurumu = "Taslak" | "Hatalı" | "Gönderildi" | "İletildi" | "Kabul Edildi" | "İptal Edildi" | "Reddedildi";

export interface FaturaKalem {
  id: string;
  malHizmetId: string;
  miktar: number;
  birim: string;
  birimFiyat: number;
  iskontoYuzde?: number;
  kdvOrani: 0 | 1 | 10 | 20;
  digerVergiTuru?: string;
  digerVergiOrani?: number;
  toplamTutarTL: number;       // Saf tutar (iskonto/kdv hariç)
  toplamIskontoTL?: number;
  hesaplananKdvTL: number;
  tevkifatTuru?: string;       // Tevkifat var mı ve türü
  tevkifatOrani?: string;      // "1/10", "2/10", "9/10"
  hesaplananTevkifatTL?: number; // Tevkifat kesintisi tutarı
  vergilerDahilTutarTL: number;
}

export interface Fatura {
  id: string; // internal id
  faturaTipi: FaturaTipi;
  cariId: string;
  cariHesapKodu: string;
  faturaNo: string;
  faturaTuru: FaturaTuru;
  senaryo: FaturaSenaryo;
  faturaTarihi: string; // ISO date
  dovizTuru: string;
  dovizKuruTL: number;
  
  // Eski usul için
  seri?: string;
  no?: string;

  odemeDurumu: OdemeDurumu;
  vadeTarihi: string; // ISO date
  irsaliyeDurumu: IrsaliyeDurumu;
  irsaliyeNo?: string;
  irsaliyeTarihi?: string;

  kalemler: FaturaKalem[];

  // Dip Toplamlar
  genelToplamTutarTL: number; 
  genelToplamIskontoTL: number;
  genelKdvTL: number;
  genelVergilerDahilTutarTL: number;
  odenecekTutarTL: number;

  aciklama?: string;
  qrKodu?: string;
  ozellestirmeNo?: string;
  muhasebelestirildiMi: boolean;
  faturaDurumu: FaturaDurumu;
  
  kdvDagilimi?: Record<number, number>; // { 20: 15.5, 10: 2.1 } -> KDV oranına göre toplanmış tutarlar
}

// ----- MOCK VERİLER (Geçici) -----

export const MOCK_CARILER = [
  { id: "c1", unvan: "Erpa Teknoloji A.Ş.", tur: "Müşteri", hesapKodu: "120.01.001" },
  { id: "c2", unvan: "Dijitek Yazılım", tur: "Tedarikçi", hesapKodu: "320.01.005" },
  { id: "c3", unvan: "ABC Lojistik", tur: "Tedarikçi", hesapKodu: "320.01.006" },
  { id: "c4", unvan: "Mega Market A.Ş.", tur: "Müşteri", hesapKodu: "120.01.050" },
];

export interface UrunHizmet {
  id: string;
  ad: string;
  birim: string;
  kdvOrani: number;
  varsayilanFiyat: number;
  tevkifatUygulanirMi?: boolean;
  tevkifatOrani?: string;
}

export const MOCK_URUNLER: UrunHizmet[] = [
  { id: "u1", ad: "Danışmanlık Hizmeti", birim: "Saat", kdvOrani: 20, varsayilanFiyat: 1500, tevkifatUygulanirMi: true, tevkifatOrani: "9/10" },
  { id: "u2", ad: "Yazılım Lisansı (Yıllık)", birim: "Adet", kdvOrani: 20, varsayilanFiyat: 12000, tevkifatUygulanirMi: false },
  { id: "u3", ad: "Sunucu Bakım Bedeli", birim: "Ay", kdvOrani: 20, varsayilanFiyat: 4000, tevkifatUygulanirMi: false },
  { id: "u4", ad: "Temel İhtiyaç Gıda Paketi", birim: "Adet", kdvOrani: 1, varsayilanFiyat: 850, tevkifatUygulanirMi: false },
];
