const fs = require('fs');
const sections = JSON.parse(fs.readFileSync('scripts/pdf_sections.json', 'utf8'));
const headingToId = {
  'i. Temel Proje Verileri': 'a_i',
  'ii. Amaç ve Gerekçe': 'a_ii',
  'iii. Yapılan İşin Tanımı': 'a_iii',
  'iv. Uzun ve Kısa Dönemli Amaçlarla İlişkisi': 'a_iv',
  'v. Finansman Kaynağı ve Planı': 'a_v',
  'vi. Proje Analiz Sonuçları': 'a_vi',
  'vii.Etüt Bilgileri': 'a_vii',
  'vii. Etüt Bilgileri': 'a_vii',
  'i. Projenin Hedef Kitlesi': 'b_i',
  'c. Projenin Tanımı ve Kapsamı': 'c_tanimi',
  'd. Fizibilite Etüdü Analiz Sonuçları': 'd_analiz',
  'e. Projenin Etkileri': 'e_etkiler',
  '1.1. Projenin Politika Dökümanlarına Uygunluğu': 's1_1',
  '1.2. Kurumsal Yapılar ve Yasal Mevzuat': 's1_2',
  '1.2.1. Organize Sanayi Bölgeleri Tanımı': 's1_2_1',
  '1.2.2. Türkiye’de Organize Sanayi Bölgeleri': 's1_2_2',
  '1.2.3. Türkiye’de Tarıma Dayalı İhtisas Organize Sanayi Bölgeleri': 's1_2_3',
  '1.2.4. Organize Sanayi Bölgeleri ve Yasal Mevzuat': 's1_2_4',
  '1.2.5. Organize Sanayi Bölgelerinin Kuruluş Aşamaları': 's1_2_5',
  '1.2.6. Tarıma Dayalı İhtisas Organize Sanayi Bölgeleri Uygulama Yönetmeliği': 's1_2_6',
  '1.2.7. İhtisas OSB’ler': 's1_2_7',
  '1.2.8. Tarıma Dayalı İhtisas Organize Sanayi Bölgeleri': 's1_2_8',
  '1.2.9. Jeotermal Seracılık ile İlgili Mevzuat': 's1_2_9',
  '1.3. Projenin Diğer Kurumların Projeleri İle İlişkisi': 's1_3',
  '1.3.1. Proje İle Eşzamanlı Götürülmesi Gereken Diğer Kurumların Projeleri': 's1_3_1',
  '1.3.2. Projede Başka Kurumların Projeleri ile Fiziki Çakışma Oluşmamasına Yönelik Tedbirler': 's1_3_2',
  '1.4. Proje İle İlgili Geçmişte Yapılmış Etüt Araştırma ve Diğer Çalışmalar': 's1_4',
  '1.4.1. Proje Fikrinin Ortaya Çıkışı': 's1_4_1',
  '1.5. Proje İhtiyacı/Talebi': 's1_5',
  '1.6. Proje Alternatifleri': 's1_7',
  '1.6.1. Projesiz Durum': 's1_7_1',
  '1.6.2. Bakım Onarım veya Tevsii Yatırımı': 's1_7_2',
  '1.6.3. En İyi İkinci Alternatif': 's1_7_3',
  '1.6.4. En İyi Alternatif (Tercih edilen alternatif)': 's1_7_4',
  '1.7. Teknoloji ve Tasarım': 's1_8',
  '1.7.1. Seralarda Kullanım Koşulları': 's1_8_1',
  '2.1. Fiziksel ve Coğrafi Özellikler': 's2_1',
  '2.2. Ekonomik ve Fiziksel Altyapı': 's2_2',
  '2.3. Sosyal Altyapı ve Sosyal Etkiler': 's2_3',
  '2.4. Çevresel Etkiler': 's2_4',
  '2.5. Alternatifler, Yer Seçimi ve Arazi Maliyeti': 's2_5',
  '3.1. Varsayımlar': 's3_1',
  '3.2. Talep Tahmin Yöntemi': 's3_2',
  '3.3. Talep Analizi': 's3_3',
  '3.4. Talep Tahmin Sonuçları': 's3_4',
  '3.5. Kapasite Seçimi': 's3_5',
  '4.1 Sabit Sermaye Yatırım Tutarı': 's4_1',
  '4.2. İşletme Sermayesi': 's4_3',
  '4.2.1. İnsan Gücü İhtiyaci ve Tahmini Giderler': 's4_3_1',
  '4.2.2. Üretimin ve/veya Hizmetin Fiyatlandırılması': 's4_3_2',
  '4.3. Toplam Yatırım Tutarı ve Yıllara Dağılımı': 's4_4',
  '5.1. Finansman Öngörüsü': 's5_1',
  '5.2. Finansman İhtiyacı ve Kaynakları': 's5_2',
  '5.3. Finansman Koşulları ve Sermaye Maliyeti': 's5_3',
  '6.1. Ticari Analiz ile İlgili Temel Varsayımlar': 's6_1',
  '6.2. Ticari Faydalar ve Maliyetler': 's6_2',
  '6.3. Ticari Nakit Akış Tablosu': 's6_3',
  '6.4. Ticari Fayda Maliyet Analizi': 's6_4',
  '7.1. Ekonomik Faydalar ve Maliyetler': 's7_1',
  '7.2. Ekonomik Fayda Maliyet Analizi': 's7_2',
  '7.3. Maliyet Etkinlik Analizi': 's7_3',
  '8.1. Duyarlılık Analizi': 's8_1',
  '8.2. Proje İle İlgili Riskler ve Etkiler': 's8_2',
  '8.3. Temel Risklerle İlgili Risk Azaltma Tedbirleri': 's8_3',
  '9.1. Çevresel Etkilerin Ön Değerlendirmesi': 's9_1',
  '9.2. Çevresel Riskler ve Azaltma Tedbirleri': 's9_2',
  '10.1. Projenin Sosyal Etkileri': 's10_1',
  '10.2. Projenin Toplumsal Gruplara Etkisi': 's10_2',
  '10.3. Bölgesel Düzeydeki Etkisi': 's10_3',
  '11.1. Proje Yürütücüsü Kuruluş ve Teknik Kapasitesi': 's11_1',
  '11.2. Proje Organizasyonu ve Yönetim': 's11_2',
  '11.3. Proje Uygulama Planı ve Kritik Aşamalar': 's11_3',
  '12.1. Projenin Ticari ve Ekonomik Yapılabilirliği İle İlgili Sonuçlar': 's12_1',
  '12.2. Projenin Sürdürülebilirliği': 's12_2',
  '12.3. Projeye İlişkin Temel Riskler': 's12_3',
};

function escape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function linesToHtml(lines) {
  const filtered = lines.filter(l => !/^[-]{5}Page/.test(l) && !/^\d+$/.test(l));
  return '<div>' + filtered.map(l => escape(l.trim()).replace(/\s{2,}/g, ' ')).join('<br/>') + '</div>';
}

const contents = {};
for (const section of sections) {
  const id = headingToId[section.heading];
  if (!id) continue;
  contents[id] = { html: linesToHtml(section.content) };
}

fs.writeFileSync('components/proje-yonetimi/bigadic-fizibilite.json', JSON.stringify({ contents }, null, 2), 'utf8');
console.log('Generated components/proje-yonetimi/bigadic-fizibilite.json with', Object.keys(contents).length, 'entries.');
