const fs = require('fs');
const path = './pdf_out.txt';
const text = fs.readFileSync(path, 'utf8');
const lines = text.split(/\r?\n/);
const headings = [
  'PROJE ÖZETİ',
  'a. Proje Kimlik Kartı',
  'i. Temel Proje Verileri',
  'ii. Amaç ve Gerekçe',
  'iii. Yapılan İşin Tanımı',
  'iv. Uzun ve Kısa Dönemli Amaçlarla İlişkisi',
  'v. Finansman Kaynağı ve Planı',
  'vi. Proje Analiz Sonuçları',
  'vii.Etüt Bilgileri',
  'vii. Etüt Bilgileri',
  'b. Projenin Gerekçesi',
  'i. Projenin Hedef Kitlesi',
  'c. Projenin Tanımı ve Kapsamı',
  'd. Fizibilite Etüdü Analiz Sonuçları',
  'e. Projenin Etkileri',
  '1. PROJENİN TANIMI VE KAPSAMI',
  '1.1. Projenin Politika Dökümanlarına Uygunluğu',
  '1.2. Kurumsal Yapılar ve Yasal Mevzuat',
  '1.2.1. Organize Sanayi Bölgeleri Tanımı',
  '1.2.2. Türkiye’de Organize Sanayi Bölgeleri',
  '1.2.3. Türkiye’de Tarıma Dayalı İhtisas Organize Sanayi Bölgeleri',
  '1.2.4. Organize Sanayi Bölgeleri ve Yasal Mevzuat',
  '1.2.5. Organize Sanayi Bölgelerinin Kuruluş Aşamaları',
  '1.2.6. Tarıma Dayalı İhtisas Organize Sanayi Bölgeleri Uygulama Yönetmeliği',
  '1.2.7. İhtisas OSB’ler',
  '1.2.8. Tarıma Dayalı İhtisas Organize Sanayi Bölgeleri',
  '1.2.9. Jeotermal Seracılık ile İlgili Mevzuat',
  '1.3. Projenin Diğer Kurumların Projeleri İle İlişkisi',
  '1.3.1. Proje İle Eşzamanlı Götürülmesi Gereken Diğer Kurumların Projeleri',
  '1.3.2. Projede Başka Kurumların Projeleri ile Fiziki Çakışma Oluşmamasına Yönelik Tedbirler',
  '1.4. Proje İle İlgili Geçmişte Yapılmış Etüt Araştırma ve Diğer Çalışmalar',
  '1.4.1. Proje Fikrinin Ortaya Çıkışı',
  '1.5. Proje İhtiyacı/Talebi',
  '1.6. Proje Alternatifleri',
  '1.6.1. Projesiz Durum',
  '1.6.2. Bakım Onarım veya Tevsii Yatırımı',
  '1.6.3. En İyi İkinci Alternatif',
  '1.6.4. En İyi Alternatif (Tercih edilen alternatif)',
  '1.7. Teknoloji ve Tasarım',
  '1.7.1. Seralarda Kullanım Koşulları',
  '2. YER SEÇİMİ VE ARAZİ MALİYETİ',
  '2.1. Fiziksel ve Coğrafi Özellikler',
  '2.2. Ekonomik ve Fiziksel Altyapı',
  '2.3. Sosyal Altyapı ve Sosyal Etkiler',
  '2.4. Çevresel Etkiler',
  '2.5. Alternatifler, Yer Seçimi ve Arazi Maliyeti',
  '3. TALEP TAHMİNİ VE KAPASİTE SEÇİMİ',
  '3.1. Varsayımlar',
  '3.2. Talep Tahmin Yöntemi',
  '3.3. Talep Analizi',
  '3.4. Talep Tahmin Sonuçları',
  '3.5. Kapasite Seçimi',
  '4. YATIRIM TUTARI',
  '4.1 Sabit Sermaye Yatırım Tutarı',
  '4.2. İşletme Sermayesi',
  '4.2.1. İnsan Gücü İhtiyaci ve Tahmini Giderler',
  '4.2.2. Üretimin ve/veya Hizmetin Fiyatlandırılması',
  '4.3. Toplam Yatırım Tutarı ve Yıllara Dağılımı',
  '5. PROJENİN FİNANSMANI VE FİNANSAL ANALİZ',
  '5.1. Finansman Öngörüsü',
  '5.2. Finansman İhtiyacı ve Kaynakları',
  '5.3. Finansman Koşulları ve Sermaye Maliyeti',
  '6. TİCARİ ANALİZ',
  '6.1. Ticari Analiz ile İlgili Temel Varsayımlar',
  '6.2. Ticari Faydalar ve Maliyetler',
  '6.3. Ticari Nakit Akış Tablosu',
  '6.4. Ticari Fayda Maliyet Analizi',
  '7. EKONOMİK ANALİZ',
  '7.1. Ekonomik Faydalar ve Maliyetler',
  '7.2. Ekonomik Fayda Maliyet Analizi',
  '7.3. Maliyet Etkinlik Analizi',
  '8. RİSK ANALİZİ',
  '8.1. Duyarlılık Analizi',
  '8.2. Proje İle İlgili Riskler ve Etkiler',
  '8.3. Temel Risklerle İlgili Risk Azaltma Tedbirleri',
  '9. ÇEVRESEL ANALİZ',
  '9.1. Çevresel Etkilerin Ön Değerlendirmesi',
  '9.2. Çevresel Riskler ve Azaltma Tedbirleri',
  '10. SOSYAL ANALİZ',
  '10.1. Projenin Sosyal Etkileri',
  '10.2. Projenin Toplumsal Gruplara Etkisi',
  '10.3. Bölgesel Düzeydeki Etkisi',
  '11. PROJE YÖNETİMİ ve UYGULAMA PROGRAMI',
  '11.1. Proje Yürütücüsü Kuruluş ve Teknik Kapasitesi',
  '11.2. Proje Organizasyonu ve Yönetim',
  '11.3. Proje Uygulama Planı ve Kritik Aşamalar',
  '12. SONUÇ',
  '12.1. Projenin Ticari ve Ekonomik Yapılabilirliği İle İlgili Sonuçlar',
  '12.2. Projenin Sürdürülebilirliği',
  '12.3. Projeye İlişkin Temel Riskler'
];

const headingMap = headings.reduce((map, heading) => {
  map[heading.toUpperCase()] = heading;
  return map;
}, {});

const sections = [];
let current = null;
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  const upper = trimmed.toUpperCase();
  const heading = headingMap[upper] || headings.find(h => upper === h.toUpperCase());
  if (heading) {
    current = { heading, content: [] };
    sections.push(current);
    continue;
  }
  if (current) current.content.push(line);
}

fs.writeFileSync('scripts/pdf_sections.json', JSON.stringify(sections, null, 2), 'utf8');
console.log('Wrote scripts/pdf_sections.json', sections.length, 'section entries.');
