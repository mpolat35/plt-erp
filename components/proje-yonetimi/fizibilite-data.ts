export interface FizNode {
  id: string;
  label: string;
  level: number;
  icon?: string;
  hint?: string;
  children?: FizNode[];
  formFields?: string[];
  tables?: string[];
  isToc?: boolean;
  isDefinitions?: boolean;
  isCustom?: boolean;
}

export interface TableRowDef {
  label: string;
  bold?: boolean;
  section?: boolean;
  tall?: boolean;
}

export interface TableDef {
  title: string;
  note?: string;
  cols: string[];
  rows?: TableRowDef[];
  yearTable?: boolean;
  years?: string[];
  footer?: string[];
}

export const INITIAL_NODES: FizNode[] = [
  {
    id: "cover", label: "EK K-1 Fizibilite Etüdü Formatı", level: 0, icon: "file-text", hint: "",
    children: [
      { id: "toc", label: "İçindekiler", level: 1, icon: "list-numbers", hint: "Belgenin içindekiler tablosunu buraya düzenleyebilirsiniz.", isToc: true, children: [] },
      { id: "tanim", label: "Tanım ve Kısaltmalar", level: 1, icon: "book-open", hint: "Belgede kullanılan tüm terim ve kısaltmaların açıklamalarını buraya ekleyin.", isDefinitions: true, children: [] },
    ],
  },
  {
    id: "ozet", label: "Proje Özeti", level: 0, icon: "folder-open", hint: "Tüm projeler için doldurulacaktır.",
    children: [
      {
        id: "a_kimlik", label: "a. Proje Kimlik Kartı", level: 1, icon: "identification-card", hint: "Projeye ait temel kimlik bilgilerinin yer aldığı bölümdür.",
        formFields: ["Proje Adı / Yatırım Programı Proje No", "Sektör / Alt Sektör", "Proje Sahibi Kuruluş", "Uygulama Yeri", "Uygulayıcı Birim", "Maliyet ve Temel Kalemler", "Planlanan Çıktılar", "Genel Takvim ve Başlama-Bitiş Tarihi"],
        children: [
          { id: "a_i", label: "i. Temel Proje Verileri", level: 2, icon: "table", hint: "Projeye ait temel verilerin girildiği bölümdür.", formFields: ["Proje Adı / Yatırım Programı Proje No", "Sektör / Alt Sektör", "Proje Sahibi Kuruluş", "Uygulama Yeri", "Uygulayıcı Birim", "Maliyet ve Temel Kalemler", "Planlanan Çıktılar", "Genel Takvim ve Başlama-Bitiş Tarihi"], children: [] },
          { id: "a_ii", label: "ii. Amaç ve Gerekçe (Azami 50 Kelime)", level: 2, icon: "target", hint: "Azami 50 kelime ile projenin amacı ve gerekçesi açıklanacaktır.", children: [] },
          { id: "a_iii", label: "iii. Yapılan İş Tanımı (Azami 50 Kelime)", level: 2, icon: "wrench", hint: "Azami 50 kelime ile yapılacak işin tanımı yazılacaktır.", children: [] },
          { id: "a_iv", label: "iv. Uzun ve Kısa Dönemli Amaçlarla İlişki", level: 2, icon: "link", hint: "Kalkınma Planı, Ulusal Strateji Belgeleri, Stratejik Plan vb. ile ilişki kurulacaktır.", children: [] },
          { id: "a_v", label: "v. Finansman Kaynağı ve Planı", level: 2, icon: "currency-circle-dollar", hint: "Projenin finansman kaynakları ve planı özetlenecektir.", children: [] },
          { id: "a_vi", label: "vi. Proje Analiz Sonuçları", level: 2, icon: "chart-bar", hint: "Alternatiflerin karşılaştırılmasına ilişkin analiz sonuçları.", tables: ["tbl_analiz"], children: [] },
          { id: "a_vii", label: "vii. Etüt Bilgileri", level: 2, icon: "info", hint: "Etüdü hazırlayan birim ve yetkili kişi bilgileri.", formFields: ["Etüdü Hazırlayan Birim", "Etüdün Hazırlanış Tarihi", "Yetkili Kişi Adı-Soyadı", "İletişim Bilgileri (Telefon, E-posta)"], children: [] },
        ],
      },
      {
        id: "b_gerekcesi", label: "b. Projenin Gerekçesi", level: 1, icon: "note-pencil", hint: "Projenin hedef kitlenin hangi sorununu çözmeye yönelik tasarlandığı açıklanır.",
        children: [
          { id: "b_i", label: "i. Projenin Hedef Kitlesi", level: 2, icon: "users", hint: "Proje sonuçlarından en fazla etkilenen toplumsal kesim ifade edilir.", children: [] },
        ],
      },
      { id: "c_tanimi", label: "c. Projenin Tanımı ve Kapsamı", level: 1, icon: "frame-corners", hint: "Projenin genel amacı, türü, bileşenleri, büyüklüğü ve teknik içeriği yer alır.", children: [] },
      { id: "d_analiz", label: "d. Fizibilite Etüdü Analiz Sonuçları", level: 1, icon: "magnifying-glass-plus", hint: "Proje künyesinde yer verilen sonuçların yorumu ve seçilen alternatifin tercih edilme sebebi.", children: [] },
      { id: "e_etkiler", label: "e. Projenin Etkileri", level: 1, icon: "globe", hint: "Projenin kısa/orta ve uzun vadeli ekonomik, sosyal ve çevresel etkilerinin özeti.", children: [] },
    ],
  },
  {
    id: "s1", label: "1. Projenin Tanımı ve Kapsamı", level: 0, icon: "map-pin", hint: "Tüm projeler için doldurulacaktır.",
    children: [
      { id: "s1_1", label: "1.1 Projenin Politika Dokümanlarına Uygunluğu", level: 1, icon: "seal-check", hint: "Projenin kalkınma amaçlarına yönelik temel politika, plan ve program dokümanları ile ilişkisi kurulur.", children: [] },
      { id: "s1_2", label: "1.2 Kurumsal Yapılar ve Yasal Mevzuat", level: 1, icon: "scales", hint: "Projenin dayandığı yasal mevzuat ve varsa teşvikler belirtilir.", children: [] },
      { id: "s1_3", label: "1.3 Projenin Diğer Projelerle İlişkisi (Kurum İçi)", level: 1, icon: "buildings", hint: "Projenin geçmiş, yürüyen ve planlanan diğer projelerle ilişkisi.", children: [] },
      {
        id: "s1_4", label: "1.4 Projenin Diğer Kurumların Projeleriyle İlişkisi", level: 1, icon: "handshake", hint: "Başka yatırım projeleri ile ilişkinin kapsamlı biçimde anlatıldığı bölümdür.",
        children: [
          { id: "s1_4_1", label: "1.4.1 Eşzamanlı Götürülmesi Gereken Projeler", level: 2, icon: "timer", hint: "Başka bir yatırım projesine ihtiyaç olması durumunda bu bölüm doldurulur.", children: [] },
          { id: "s1_4_2", label: "1.4.2 Fiziki Çakışma Oluşmamasına Yönelik Tedbirler", level: 2, icon: "shield", hint: "Fiziki çakışma olmamasına yönelik alınan tedbirler belirtilir.", children: [] },
        ],
      },
      { id: "s1_5", label: "1.5 Geçmişte Yapılmış Etüt ve Araştırmalar", level: 1, icon: "flask", hint: "Projeyle ilgili geçmişte yapılmış etüt, araştırma ve diğer çalışmalar.", children: [] },
      { id: "s1_6", label: "1.6 Proje İhtiyacı / Talebi", level: 1, icon: "clipboard-text", hint: "Projeye duyulan ihtiyacın veya talebin analiz sonuçlarının özetlendiği bölümdür.", children: [] },
      {
        id: "s1_7", label: "1.7 Proje Alternatifleri", level: 1, icon: "arrows-split", hint: "En az aşağıdaki dört alternatife yer verilecektir.",
        children: [
          { id: "s1_7_1", label: "1.7.1 Projesiz Durum", level: 2, icon: "circle-dashed", hint: "Hâlihazırda proje konusu mal/hizmet ihtiyacının nasıl sağlandığı belirtilir.", children: [] },
          { id: "s1_7_2", label: "1.7.2 Bakım Onarım veya Tevsii Yatırımı", level: 2, icon: "hammer", hint: "Bakım-onarım veya tevsii yatırımları ile temel hedeflere ulaşmak için gereken asgari müdahale.", children: [] },
          { id: "s1_7_3", label: "1.7.3 En İyi İkinci Alternatif", level: 2, icon: "medal", hint: "Tercih edilen alternatiften sonra gelen proje alternatifine dair bilgiler.", children: [] },
          { id: "s1_7_4", label: "1.7.4 En İyi Alternatif (Tercih edilen)", level: 2, icon: "trophy", hint: "Yapılması planlanan alternatife dair bilgiler yer verilir.", children: [] },
        ],
      },
      { id: "s1_8", label: "1.8 Teknoloji ve Tasarım", level: 1, icon: "gear-six", hint: "Projede kullanılmak üzere seçilen teknolojinin özellikleri ve tasarımı anlatılacaktır.", children: [] },
    ],
  },
  {
    id: "s2", label: "2. Yer Seçimi ve Arazi Maliyeti", level: 0, icon: "map-trifold", hint: "Tüm projeler için doldurulacaktır.",
    children: [
      { id: "s2_1", label: "2.1 Fiziksel ve Coğrafi Özellikler", level: 1, icon: "mountains", hint: "Yatırım yapılacak bölgenin coğrafi yerleşimi, iklimi ve toprak yapısı.", children: [] },
      { id: "s2_2", label: "2.2 Ekonomik ve Fiziksel Altyapı", level: 1, icon: "crane", hint: "Hammadde kaynaklarına erişilebilirlik, pazara yakınlık, işgücü piyasası bilgileri.", children: [] },
      { id: "s2_3", label: "2.3 Sosyal Altyapı ve Sosyal Etkiler", level: 1, icon: "person-arms-spread", hint: "Yatırım yapılacak bölgenin nüfus, istihdam, gelir dağılımı bilgileri.", children: [] },
      { id: "s2_4", label: "2.4 Çevresel Etkiler", level: 1, icon: "leaf", hint: "Yer seçimi kararını etkileyen çevresel faktörler ve yer seçiminin gerekçesi.", children: [] },
      { id: "s2_5", label: "2.5 Alternatifler, Yer Seçimi ve Arazi Maliyeti", level: 1, icon: "house-line", hint: "Yer alternatifleri belirlenecek, seçilen ve seçim sebebi anlatılacaktır.", children: [] },
    ],
  },
  {
    id: "s3", label: "3. Talep Tahmini ve Kapasite Seçimi", level: 0, icon: "chart-line", hint: "Tüm projeler için doldurulacaktır.",
    children: [
      { id: "s3_1", label: "3.1 Varsayımlar", level: 1, icon: "chat-dots", hint: "Talep tahminine dair ulusal ve bölgesel düzeyde varsayımlar.", children: [] },
      { id: "s3_2", label: "3.2 Talep Tahmin Yöntemi", level: 1, icon: "trend-down", hint: "Seçilen talep tahmin yöntemi ve metodolojisi ifade edilir.", children: [] },
      { id: "s3_3", label: "3.3 Talep Analizi", level: 1, icon: "magnifying-glass", hint: "Talep tahmin yöntemine göre talep analizinin yapıldığı bölümdür.", children: [] },
      { id: "s3_4", label: "3.4 Talep Tahmin Sonuçları", level: 1, icon: "trend-up", hint: "Yapılan talep analizinin sonuçlarının ortaya konulduğu bölümdür.", children: [] },
      { id: "s3_5", label: "3.5 Kapasite Seçimi", level: 1, icon: "sliders", hint: "Tahmin edilen talep düzeyine uygun olarak seçilen proje kapasitesi.", children: [] },
    ],
  },
  {
    id: "s4", label: "4. Yatırım Tutarı", level: 0, icon: "money", hint: "Tüm projeler için doldurulacaktır.",
    children: [
      { id: "s4_1", label: "4.1 Sabit Sermaye Yatırım Tutarı", level: 1, icon: "bank", hint: "Sabit yatırım tutarını oluşturan ana kalemler tabloda belirtilecektir.", children: [] },
      { id: "s4_2", label: "4.2 Arazi Bedeli / Kamulaştırma Bedeli", level: 1, icon: "folder-simple", hint: "Arazi maliyeti olarak kamulaştırma bedelleri belirtilmelidir.", children: [] },
      { id: "s4_3", label: "4.3 İşletme Sermayesi", level: 1, icon: "credit-card", hint: "Yatırımın mal veya hizmet üretebilmesi için gereken kaynaklar.", children: [] },
      { id: "s4_4", label: "4.4 Toplam Yatırım Tutarı ve Yıllara Dağılımı", level: 1, icon: "calendar-dots", hint: "Toplam yatırım tutarı ve yıllara göre dağılımı.", tables: ["tbl_yatirim"], children: [] },
    ],
  },
  {
    id: "s5", label: "5. Projenin Finansmanı ve Finansal Analiz", level: 0, icon: "piggy-bank", hint: "Tüm projeler için doldurulacaktır.",
    children: [
      { id: "s5_1", label: "5.1 Finansman Öngörüsü", level: 1, icon: "binoculars", hint: "Projenin finansmanı için öngörülen finansman kaynaklarının belirtildiği bölümdür.", children: [] },
      { id: "s5_2", label: "5.2 Finansman İhtiyacı ve Kaynakları", level: 1, icon: "arrows-left-right", hint: "Yatırımın finansman ihtiyaçları ve kaynakları.", tables: ["tbl_finansman"], children: [] },
      { id: "s5_3", label: "5.3 Finansman Koşulları ve Sermaye Maliyeti", level: 1, icon: "percent", hint: "Öz kaynak/yabancı kaynak koşulları değerlendirilecektir.", children: [] },
      { id: "s5_4", label: "5.4 Finansman Tablosu ve Finansal Oranlar Analizi", level: 1, icon: "chart-pie", hint: "Finansal Oranlar Analizi (FOA) kendi mali tabloları olan kuruluşlarca yapılacaktır.", children: [] },
    ],
  },
  {
    id: "s6", label: "6. Ticari Analiz", level: 0, icon: "storefront", hint: "Projenin gerçekleşmesi ile üretilecek mal/hizmetin ticari satışının söz konusu olduğu projelerde.",
    children: [
      { id: "s6_1", label: "6.1 Ticari Analiz İle İlgili Temel Varsayımlar", level: 1, icon: "chat-dots", hint: "İskonto oranı, ekonomik ömür, hurda değer, yenileme yatırımları ve enflasyon artış oranı.", children: [] },
      { id: "s6_2", label: "6.2 Ticari Faydalar ve Maliyetler", level: 1, icon: "scales", hint: "Proje konusu yatırımın işletme döneminde oluşturacağı fayda ve maliyetler.", tables: ["tbl_isletme"], children: [] },
      { id: "s6_3", label: "6.3 Ticari Nakit Akış Tablosu", level: 1, icon: "arrows-down-up", hint: "Yıllar itibariyle nakit giriş ve çıkışlarının karşılaştırıldığı tablo.", tables: ["tbl_nakit"], children: [] },
      { id: "s6_4", label: "6.4 Ticari Fayda Maliyet Analizi (NBD, İKO, GÖS)", level: 1, icon: "ruler", hint: "Net Bugünkü Değer (NBD) ve İç Karlılık Oranı (İKO) hesaplamaları.", tables: ["tbl_nbd", "tbl_iko"], children: [] },
    ],
  },
  {
    id: "s7", label: "7. Ekonomik Analiz", level: 0, icon: "trend-down", hint: "Tüm projeler için doldurulacaktır.",
    children: [
      { id: "s7_1", label: "7.1 Ekonomik Analiz İle İlgili Temel Varsayımlar", level: 1, icon: "chat-dots", hint: "Ekonomik analizin temelini oluşturan varsayımlar ve dayandıkları gerekçeler.", children: [] },
      { id: "s7_2", label: "7.2 Ekonomik Faydalar ve Maliyetler", level: 1, icon: "globe-hemisphere-west", hint: "Ekonomik analizde kullanılan faydalar ve maliyetler.", tables: ["tbl_ekon_nakit"], children: [] },
      { id: "s7_3", label: "7.3 Ekonomik Fayda Maliyet Analizi", level: 1, icon: "chart-bar", hint: "Net bugünkü değer, iç karlılık oranı, geri ödeme süresi.", children: [] },
      { id: "s7_4", label: "7.4 Maliyet Etkinlik Analizi", level: 1, icon: "target", hint: "Fayda maliyet analizi yapılması mümkün olmayan projeler bu yöntemle analiz edilecektir.", children: [] },
      { id: "s7_5", label: "7.5 Diğer Ekonomik Analiz Ölçütleri", level: 1, icon: "flask", hint: "Ekonomik büyüme, istihdam, bölgesel gelişme, katma değer etkisi.", children: [] },
    ],
  },
  {
    id: "s8", label: "8. Risk Analizi", level: 0, icon: "warning", hint: "Tüm projeler için doldurulacaktır.",
    children: [
      { id: "s8_1", label: "8.1 Duyarlılık Analizi", level: 1, icon: "broadcast", hint: "Hangi risklerin proje çıktıları üzerinde en çok etki yaratacağını belirlemek amacıyla kullanılan analiz.", children: [] },
      { id: "s8_2", label: "8.2 Proje İle İlgili Riskler ve Etkiler", level: 1, icon: "dice-five", hint: "Projede başarısızlığa yol açabilecek temel riskler ve muhtemel etkiler.", children: [] },
      { id: "s8_3", label: "8.3 Risk Azaltma Tedbirleri", level: 1, icon: "shield-check", hint: "Tanımlanan risklerin olasılıklarını azaltmak amacıyla belirlenecek tedbirler.", children: [] },
    ],
  },
  {
    id: "s9", label: "9. Çevresel Analiz", level: 0, icon: "leaf", hint: "Tüm projeler için doldurulacaktır.",
    children: [
      { id: "s9_1", label: "9.1 Çevresel Etkilerin Ön Değerlendirmesi", level: 1, icon: "plant", hint: "Projenin çevreye olabilecek olumlu veya olumsuz tüm etkileri değerlendirilir.", children: [] },
      { id: "s9_2", label: "9.2 Çevresel Riskler ve Azaltma Tedbirleri", level: 1, icon: "recycle", hint: "Projenin çevreye vereceği olumsuz etkilerin en aza indirilmesi için önerilen tedbirler.", children: [] },
    ],
  },
  {
    id: "s10", label: "10. Sosyal Analiz", level: 0, icon: "users-three", hint: "Parasallaştırılamayan sosyal etkilere sahip projeler için.",
    children: [
      { id: "s10_1", label: "10.1 Projenin Sosyal Etkileri", level: 1, icon: "heart", hint: "Projenin oluşturması beklenen olumlu ve olumsuz sosyal etkilerine yer verilecektir.", children: [] },
      { id: "s10_2", label: "10.2 Projenin Toplumsal Gruplara Etkisi", level: 1, icon: "person-arms-spread", hint: "Toplumsal grupların projeden nasıl etkileneceği belirtilecektir.", children: [] },
      { id: "s10_3", label: "10.3 Bölgesel Düzeydeki Etkisi", level: 1, icon: "city", hint: "Projenin bölgesel kalkınma hususunda öngörülen etkiler.", children: [] },
    ],
  },
  {
    id: "s11", label: "11. Proje Yönetimi ve Uygulama Programı", level: 0, icon: "calendar-check", hint: "Tüm projeler için doldurulacaktır.",
    children: [
      { id: "s11_1", label: "11.1 Proje Yürütücüsü Kuruluş ve Teknik Kapasitesi", level: 1, icon: "office-chair", hint: "Proje yürütücüsü kuruluş ve birim hakkındaki bilgiler ile tecrübeler.", children: [] },
      { id: "s11_2", label: "11.2 Proje Organizasyonu ve Yönetim", level: 1, icon: "user-gear", hint: "Projenin yatırım ve işletme dönemi için organizasyon ve insan kaynakları planlaması.", children: [] },
      { id: "s11_3", label: "11.3 Proje Uygulama Planı ve Kritik Aşamalar", level: 1, icon: "map-pin-line", hint: "Proje takvimi, faaliyetlerin zaman çizelgesine dönüştürülmesidir.", children: [] },
    ],
  },
  {
    id: "s12", label: "12. Sonuç", level: 0, icon: "check-circle", hint: "Tüm projeler için doldurulacaktır.",
    children: [
      { id: "s12_1", label: "12.1 Projenin Ticari ve Ekonomik Yapılabilirliği", level: 1, icon: "clipboard-text", hint: "Projenin ticari ve ekonomik yapılabilirliğine dair hesaplamaların toplu sonuçları.", children: [] },
      { id: "s12_2", label: "12.2 Projenin Sürdürülebilirliği", level: 1, icon: "infinity", hint: "Yatırımın planlanan ömrü boyunca faaliyetlerinin devam edebilmesinin koşulları.", children: [] },
      { id: "s12_3", label: "12.3 Projeye İlişkin Temel Riskler", level: 1, icon: "warning-octagon", hint: "Projenin geleceği için risk teşkil eden oluşumlar ve önlenmesi için alınan tedbirler.", children: [] },
    ],
  },
  {
    id: "s13", label: "13. Ekler", level: 0, icon: "paperclip", hint: "Belgeye ek olarak sunulacak raporlar bu bölümde listelenecektir.",
    children: [
      { id: "s13_1", label: "Ek-1: Çevresel Etki Değerlendirme (ÇED) Raporu", level: 1, icon: "plant", hint: "ÇED raporu belge ekinde sunulacaktır.", children: [] },
      { id: "s13_2", label: "Ek-2: Diğer Destek Etütler", level: 1, icon: "folder", hint: "Diğer destek etütler belge ekinde sunulacaktır.", children: [] },
      { id: "s13_3", label: "Ek-3: Etüt Proje, Ön Fizibilite Etüdü", level: 1, icon: "file", hint: "Etüt proje, ön fizibilite etüdü belge ekinde sunulacaktır.", children: [] },
    ],
  },
];

export const TABLES: Record<string, TableDef> = {
  tbl_analiz: {
    title: "Tablo: Proje Analiz Sonuçları — Alternatiflerin Karşılaştırılması",
    cols: ["", "Projesiz Durum", "Bakım Onarım / Tevsii", "Seçilen İkinci Alternatif", "Seçilen Alternatif"],
    rows: [
      { label: "Yatırım Tutarı" },
      { label: "Net Bugünkü Değer (Ticari/Ekonomik)" },
      { label: "İç Karlılık Oranı (Ticari/Ekonomik)" },
      { label: "Geri Ödeme Süresi (Ticari/Ekonomik)" },
      { label: "Fayda/Maliyet Oranı (Ticari)" },
      { label: "Fayda/Maliyet Oranı (Ekonomik)" },
      { label: "Parasallaştırılamayan Önemli Fayda ve Maliyetler", tall: true },
      { label: "Rakamsallaştırılamayan Önemli Hususlar", tall: true },
    ],
  },
  tbl_yatirim: {
    title: "Tablo 3. Toplam Yatırım Tutarı ve Yıllara Dağılımı",
    note: "İç Para = Yerli para birimi cinsinden harcamalar  |  Dış Para = Döviz cinsinden harcamalar",
    cols: ["Harcama Kalemleri", "1. Yıl İç Para", "1. Yıl Dış Para", "n. Yıl İç Para", "n. Yıl Dış Para", "TOPLAM"],
    rows: [
      { label: "A. Arsa Bedeli", bold: true },
      { label: "B. Sabit Tesis Yatırımı", bold: true, section: true },
      { label: "1. Etüd ve Proje" },
      { label: "2. Teknik Yardım ve Lisans" },
      { label: "3. İnşaat İşleri" },
      { label: "4. Makine ve Donanım" },
      { label: "5. Taşıma ve Sigorta" },
      { label: "6. İthalat ve Gümrükleme" },
      { label: "7. Montaj Giderleri" },
      { label: "8. Genel Giderler" },
      { label: "9. Taşıt ve Demirbaşlar" },
      { label: "10. İşletmeye Alma Giderleri" },
      { label: "11. Beklenmeyen Giderler" },
      { label: "Sabit Yatırım Tutarı (A+B)", bold: true },
      { label: "C. İşletme Sermayesi İhtiyacı", bold: true },
      { label: "Toplam Yatırım Tutarı (A+B+C)", bold: true },
    ],
  },
  tbl_finansman: {
    title: "Tablo 4. Finansman İhtiyacı ve Kaynakları",
    cols: ["", "1. Yıl İç Para", "1. Yıl Dış Para", "n. Yıl İç Para", "n. Yıl Dış Para", "TOPLAM"],
    rows: [
      { label: "FİNANSMAN İHTİYACI", section: true },
      { label: "Sabit Tesis Yatırımı" },
      { label: "Finansman Giderleri" },
      { label: "Sabit Yatırım Toplamı", bold: true },
      { label: "İşletme Sermayesi Yatırımı", bold: true },
      { label: "TOPLAM FİNANSMAN İHTİYACI", bold: true },
      { label: "FİNANSMAN KAYNAKLARI", section: true },
      { label: "Öz Kaynaklar" },
      { label: "Yabancı Kaynaklar" },
      { label: "TOPLAM FİNANSMAN KAYNAKLARI", bold: true },
    ],
  },
  tbl_isletme: {
    title: "Tablo 5. İşletme Gelir ve Giderleri Tablosu",
    cols: ["", "1. Yıl", "2. Yıl", "3. Yıl", "4. Yıl", "n. Yıl"],
    rows: [
      { label: "Kapasite Kullanım Oranı (%)", bold: true },
      { label: "1. İşletme Gelirleri" },
      { label: "2. Üretim Giderleri" },
      { label: "3. Amortisman" },
      { label: "4. Finansman Giderleri" },
      { label: "5. Satış Giderleri" },
      { label: "6. Brüt Kar (1-2-3-4-5)", bold: true },
      { label: "7. Matrahtan İndirilecekler" },
      { label: "8. Vergi Matrahı (6-7)", bold: true },
      { label: "9. Vergi ve Stopajlar" },
      { label: "10. Net Kar (6-9)", bold: true },
      { label: "11. Temettüler (Dağıtılacak Karlar)" },
      { label: "12. Kullanılabilir Kar (10-11)", bold: true },
    ],
  },
  tbl_nakit: {
    title: "Tablo 6. Ticari Nakit Akış Tablosu (TL)",
    cols: ["", "1. Yıl", "2. Yıl", "3. Yıl", "4. Yıl", "n. Yıl"],
    rows: [
      { label: "A. Nakit Girişleri", section: true },
      { label: "- İşletme Gelirleri" },
      { label: "- Diğer Nakit Girişleri" },
      { label: "B. Nakit Çıkışları", section: true },
      { label: "- Yatırım Harcamaları" },
      { label: "- İşletme Giderleri" },
      { label: "- Borç Anapara Geri Ödemeleri" },
      { label: "- Vergi ve Stopaj" },
      { label: "- Dağıtılan Kar Payları" },
      { label: "Nakit Farkı — Nakit Akımı (A-B)", bold: true },
    ],
  },
  tbl_nbd: {
    title: "Tablo 7. Net Bugünkü Değer Tablosu (TL)",
    cols: ["Yıl", "Sabit Yatırım Tutarı", "İşletme Sermayesi Yatırımı", "Vergi Öncesi Kar", "Amortisman", "Vergi ve Fon Kesintileri", "Faiz", "Net Nakit Akımı", "İskonto Oranı (%)", "İskonto Edilmiş Net Nakit Akımı"],
    yearTable: true,
    years: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "n"],
    footer: ["TOPLAM / NBD"],
  },
  tbl_iko: {
    title: "Tablo 8. İç Karlılık Oranı Tablosu (TL)",
    cols: ["Yıl", "Sabit Yatırım Tutarı", "İşletme Sermayesi Yatırımı", "Vergi Öncesi Kar", "Amortisman", "Vergi ve Fon Kesintileri", "Faiz", "Net Nakit Akımı", "İskonto Oranı (%)", "İskonto Edilmiş Net Nakit Akımı"],
    yearTable: true,
    years: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "n"],
    footer: ["TOPLAM", "İKO (%)"],
  },
  tbl_ekon_nakit: {
    title: "Tablo 9. Ekonomik Nakit Akış Tablosu (TL)",
    cols: ["", "1. Yıl", "2. Yıl", "3. Yıl", "4. Yıl", "n. Yıl"],
    rows: [
      { label: "A. Projenin Faydaları", section: true },
      { label: "- Doğrudan Faydalar" },
      { label: "- Dolaylı Faydalar" },
      { label: "- Parasallaştırılamayan Önemli Faydalar", tall: true },
      { label: "B. Projenin Maliyetleri", section: true },
      { label: "- Yatırım Harcamaları" },
      { label: "- İşletme Giderleri" },
      { label: "- Finansman Maliyeti" },
      { label: "- Olumsuz Etkiler / Dışsallıklar", tall: true },
      { label: "Net Ekonomik Fayda (A-B)", bold: true },
    ],
  },
};
