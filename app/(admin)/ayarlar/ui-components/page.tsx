"use client";

import { useState } from "react";
import {
  Plus, Download, Search, Mail, Eye, Trash2,
  CheckCircle, Bell, Users, TrendingUp, FileText,
  AlertTriangle, Info, Clock, Settings, BarChart2,
} from "lucide-react";

import { Button }     from "@/components/ui/Button";
import { Badge }      from "@/components/ui/Badge";
import { Input }      from "@/components/ui/Input";
import { Select }     from "@/components/ui/Select";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { StatCard }   from "@/components/ui/StatCard";
import { Avatar }     from "@/components/ui/Avatar";
import { Alert }      from "@/components/ui/Alert";
import { Toggle }     from "@/components/ui/Toggle";
import { Pagination } from "@/components/ui/Pagination";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Tabs }       from "@/components/ui/Tabs";
import { Page }       from "@/components/ui/Page";
import { IconButton, IconButtonRow } from "@/components/ui/IconButton";
import { Pencil } from "lucide-react";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function CodeSnippet({ code }: { code: string }) {
  return (
    <pre className="mt-3 px-4 py-3 bg-slate-900 dark:bg-slate-950 text-slate-300 text-xs rounded-md overflow-x-auto border border-slate-800">
      <code>{code}</code>
    </pre>
  );
}

function ShowRow({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800">
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="p-4 flex flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  );
}

export default function UIComponentsPage() {
  const [page, setPage]           = useState(1);
  const [perPage, setPerPage]     = useState(10);
  const [alertOpen, setAlertOpen] = useState(true);

  return (
    <Page
      title="UI Komponent Kütüphanesi"
      description="Tüm UI bileşenleri burada tanımlanır. İlgili sayfalar bu bileşenleri içe aktararak kullanır."
      action={<Badge variant="violet" dot>Design System</Badge>}
      className="max-w-4xl"
    >
      <div className="space-y-10 pb-16">

      {/* ── Button ── */}
      <Section title="Button" subtitle="components/ui/Button.tsx">
        <ShowRow label="Variants">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </ShowRow>
        <ShowRow label="Sizes">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </ShowRow>
        <ShowRow label="With Icons">
          <Button iconLeft={<Plus className="w-4 h-4" />}>Yeni Ekle</Button>
          <Button variant="outline" iconLeft={<Download className="w-4 h-4" />}>Dışa Aktar</Button>
          <Button variant="ghost" iconRight={<Eye className="w-4 h-4" />}>Görüntüle</Button>
          <Button variant="danger" iconLeft={<Trash2 className="w-4 h-4" />} size="sm">Sil</Button>
        </ShowRow>
        <ShowRow label="States">
          <Button loading>Kaydediliyor...</Button>
          <Button disabled>Devre Dışı</Button>
          <Button variant="outline" disabled>Devre Dışı</Button>
        </ShowRow>
        <CodeSnippet code={`<Button variant="primary" iconLeft={<Plus className="w-4 h-4" />}>Yeni Ekle</Button>
<Button variant="outline" loading>Kaydediliyor...</Button>`} />
      </Section>

      {/* ── IconButton ── */}
      <Section title="IconButton" subtitle="components/ui/IconButton.tsx">
        <ShowRow label="Action Buttons (Circular)">
          <IconButtonRow>
            <IconButton variant="view"    icon={<Eye className="w-4 h-4" />}    title="Görüntüle" />
            <IconButton variant="edit"    icon={<Pencil className="w-4 h-4" />} title="Düzenle" />
            <IconButton variant="delete"  icon={<Trash2 className="w-3.5 h-3.5" />} title="Sil" />
            <IconButton variant="ok"      icon={<CheckCircle className="w-4 h-4" />} title="Onayla" />
            <IconButton variant="warning" icon={<AlertTriangle className="w-4 h-4" />} title="Uyarı" />
            <IconButton variant="purple"  icon={<Bell className="w-4 h-4" />} title="Bildirim" />
          </IconButtonRow>
        </ShowRow>
        <CodeSnippet code={`<IconButtonRow>
  <IconButton variant="edit"   icon={<Pencil />} title="Düzenle" />
  <IconButton variant="delete" icon={<Trash2 />} title="Sil" />
</IconButtonRow>`} />
      </Section>

      {/* ── Badge ── */}
      <Section title="Badge" subtitle="components/ui/Badge.tsx">
        <ShowRow label="Variants">
          <Badge variant="blue">Blue</Badge>
          <Badge variant="violet">Violet</Badge>
          <Badge variant="emerald">Emerald</Badge>
          <Badge variant="amber">Amber</Badge>
          <Badge variant="red">Red</Badge>
          <Badge variant="slate">Slate</Badge>
        </ShowRow>
        <ShowRow label="With Dot">
          <Badge variant="blue"    dot>Aktif</Badge>
          <Badge variant="emerald" dot>Çevrimiçi</Badge>
          <Badge variant="amber"   dot>Beklemede</Badge>
          <Badge variant="red"     dot>Devre Dışı</Badge>
          <Badge variant="slate"   dot>Taslak</Badge>
        </ShowRow>
        <CodeSnippet code={`<Badge variant="emerald" dot>Aktif</Badge>
<Badge variant="red">Devamsız</Badge>`} />
      </Section>

      {/* ── Input & Select ── */}
      <Section title="Input & Select" subtitle="components/ui/Input.tsx · components/ui/Select.tsx">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="E-posta"      placeholder="ornek@sirket.com" iconLeft={<Mail className="w-4 h-4" />} />
          <Input label="Şifre"        placeholder="••••••••"         type="password" />
          <Input label="Arama"        placeholder="Ara..."           iconLeft={<Search className="w-4 h-4" />} hint="En az 3 karakter girin" />
          <Input label="Hatalı Alan"  placeholder="değer"            error="Bu alan zorunludur" />
          <Select label="Departman" options={[
            { value: "",          label: "Seçiniz..."  },
            { value: "muhasebe",  label: "Muhasebe"    },
            { value: "yazilim",   label: "Yazılım"     },
            { value: "satis",     label: "Satış"       },
          ]} />
          <Select label="Durum" hint="Personelin mevcut durumu" options={[
            { value: "aktif",    label: "Aktif"    },
            { value: "izinli",   label: "İzinli"   },
            { value: "devamsiz", label: "Devamsız" },
          ]} />
        </div>
        <CodeSnippet code={`<Input label="E-posta" placeholder="ornek@sirket.com" iconLeft={<Mail />} />
<Select label="Departman" options={[{ value: "muhasebe", label: "Muhasebe" }]} />`} />
      </Section>

      {/* ── MultiSelect ── */}
      <Section title="MultiSelect" subtitle="components/ui/MultiSelect.tsx">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MultiSelect
            label="Departmanlar"
            hint="Birden fazla departman seçebilirsiniz"
            options={[
              { value: "muhasebe", label: "Muhasebe"        },
              { value: "ik",       label: "İnsan Kaynakları", description: "IK ekibi" },
              { value: "yazilim",  label: "Yazılım",          description: "Geliştirme ekibi" },
              { value: "satis",    label: "Satış"            },
              { value: "lojistik", label: "Lojistik"         },
            ]}
          />
          <MultiSelect
            label="Durum Filtresi"
            hint="Birden fazla durum seçebilirsiniz"
            searchable={false}
            options={[
              { value: "aktif",    label: "Aktif"    },
              { value: "izinli",   label: "İzinli"   },
              { value: "devamsiz", label: "Devamsız" },
            ]}
          />
        </div>
        <CodeSnippet code={`<MultiSelect
  label="Departmanlar"
  options={[
    { value: "muhasebe", label: "Muhasebe" },
    { value: "yazilim",  label: "Yazılım", description: "Geliştirme ekibi" },
  ]}
  onChange={(vals) => console.log(vals)}
  searchable
/>`} />
      </Section>

      {/* ── Tabs ── */}
      <Section title="Tabs" subtitle="components/ui/Tabs.tsx">

        {/* Yatay — Default */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Yatay · Default</span>
          </div>
          <div className="p-4">
            <Tabs
              orientation="horizontal"
              variant="default"
              items={[
                { key: "genel",    label: "Genel",    badge: 3,  content: <p className="text-sm text-slate-600 dark:text-slate-400 pt-1">Genel bilgiler içeriği.</p> },
                { key: "detay",    label: "Detay",               content: <p className="text-sm text-slate-600 dark:text-slate-400 pt-1">Detay içeriği.</p> },
                { key: "raporlar", label: "Raporlar",             content: <p className="text-sm text-slate-600 dark:text-slate-400 pt-1">Raporlar içeriği.</p> },
                { key: "pasif",    label: "Pasif",    disabled: true, content: <></> },
              ]}
            />
          </div>
        </div>

        {/* Yatay — Filled */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Yatay · Filled</span>
          </div>
          <div className="p-4">
            <Tabs
              orientation="horizontal"
              variant="filled"
              items={[
                { key: "ozet",    label: "Özet",    icon: <FileText className="w-4 h-4" />,   content: <p className="text-sm text-slate-600 dark:text-slate-400 pt-1">Özet içeriği.</p> },
                { key: "mesai",   label: "Mesai",   icon: <Clock className="w-4 h-4" />,      content: <p className="text-sm text-slate-600 dark:text-slate-400 pt-1">Mesai detayları.</p> },
                { key: "ayarlar", label: "Ayarlar", icon: <Settings className="w-4 h-4" />,   content: <p className="text-sm text-slate-600 dark:text-slate-400 pt-1">Ayarlar içeriği.</p> },
              ]}
            />
          </div>
        </div>

        {/* Yatay — Pills */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Yatay · Pills</span>
          </div>
          <div className="p-4">
            <Tabs
              orientation="horizontal"
              variant="pills"
              items={[
                { key: "haftalik", label: "Haftalık", content: <p className="text-sm text-slate-600 dark:text-slate-400 pt-1">Haftalık görünüm.</p> },
                { key: "aylik",    label: "Aylık",    content: <p className="text-sm text-slate-600 dark:text-slate-400 pt-1">Aylık görünüm.</p>    },
                { key: "yillik",   label: "Yıllık",   content: <p className="text-sm text-slate-600 dark:text-slate-400 pt-1">Yıllık görünüm.</p>   },
              ]}
            />
          </div>
        </div>

        {/* Dikey — Default */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Dikey · Default</span>
          </div>
          <div className="p-4">
            <Tabs
              orientation="vertical"
              variant="default"
              items={[
                { key: "profil",   label: "Profil",   icon: <Users className="w-4 h-4" />,     content: <p className="text-sm text-slate-600 dark:text-slate-400">Profil bilgileri içeriği.</p>  },
                { key: "raporlar", label: "Raporlar", icon: <BarChart2 className="w-4 h-4" />,  content: <p className="text-sm text-slate-600 dark:text-slate-400">Raporlar içeriği.</p>          },
                { key: "ayarlar",  label: "Ayarlar",  icon: <Settings className="w-4 h-4" />,   content: <p className="text-sm text-slate-600 dark:text-slate-400">Ayarlar içeriği.</p>           },
              ]}
            />
          </div>
        </div>

        {/* Dikey — Filled */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Dikey · Filled</span>
          </div>
          <div className="p-4">
            <Tabs
              orientation="vertical"
              variant="filled"
              items={[
                { key: "genel",   label: "Genel",   badge: 2, content: <p className="text-sm text-slate-600 dark:text-slate-400">Genel ayarlar.</p>  },
                { key: "guvenlik",label: "Güvenlik",           content: <p className="text-sm text-slate-600 dark:text-slate-400">Güvenlik ayarları.</p> },
                { key: "bildirim",label: "Bildirim",           content: <p className="text-sm text-slate-600 dark:text-slate-400">Bildirim tercihleri.</p> },
              ]}
            />
          </div>
        </div>

        <CodeSnippet code={`import { Tabs } from "@/components/ui/Tabs";

// Yatay - Filled
<Tabs orientation="horizontal" variant="filled" items={[
  { key: "genel", label: "Genel", icon: <FileText className="w-4 h-4" />, content: <div>İçerik</div> },
  { key: "detay", label: "Detay", badge: 3, content: <div>İçerik</div> },
]} />

// Dikey - Default
<Tabs orientation="vertical" variant="default" items={[
  { key: "profil",  label: "Profil",  icon: <Users className="w-4 h-4" />, content: <div>İçerik</div> },
  { key: "ayarlar", label: "Ayarlar", icon: <Settings className="w-4 h-4" />, content: <div>İçerik</div> },
]} />`} />
      </Section>

      {/* ── Avatar ── */}
      <Section title="Avatar" subtitle="components/ui/Avatar.tsx">
        <ShowRow label="Colors">
          <Avatar initials="MK" color="blue"    />
          <Avatar initials="AD" color="violet"  />
          <Avatar initials="CÖ" color="emerald" />
          <Avatar initials="ZA" color="amber"   />
          <Avatar initials="FY" color="pink"    />
          <Avatar initials="BŞ" color="teal"    />
          <Avatar initials="MK" color="orange"  />
          <Avatar initials="AÇ" color="slate"   />
        </ShowRow>
        <ShowRow label="Sizes">
          <Avatar initials="AY" size="xs" />
          <Avatar initials="AY" size="sm" />
          <Avatar initials="AY" size="md" />
          <Avatar initials="AY" size="lg" />
          <Avatar initials="AY" size="xl" />
        </ShowRow>
        <CodeSnippet code={`<Avatar initials="MK" color="blue" size="md" />`} />
      </Section>

      {/* ── Toggle ── */}
      <Section title="Toggle" subtitle="components/ui/Toggle.tsx">
        <ShowRow label="Variants">
          <Toggle defaultChecked label="Bildirimler" hint="E-posta bildirimleri al" />
          <Toggle label="Karanlık Mod" size="sm" />
          <Toggle defaultChecked={true} label="Aktif" />
          <Toggle disabled label="Devre Dışı" />
        </ShowRow>
        <CodeSnippet code={`<Toggle defaultChecked label="Bildirimler" hint="E-posta bildirimleri al" onChange={(val) => console.log(val)} />`} />
      </Section>

      {/* ── Alert ── */}
      <Section title="Alert" subtitle="components/ui/Alert.tsx">
        <div className="space-y-3">
          <Alert variant="info"    title="Bilgi">Sistem güncellemesi 23:00&apos;da yapılacaktır.</Alert>
          <Alert variant="success" title="Başarılı">Personel kaydı başarıyla oluşturuldu.</Alert>
          <Alert variant="warning" title="Uyarı">Bu işlem geri alınamaz, devam etmek istiyor musunuz?</Alert>
          <Alert variant="error"   title="Hata">Bağlantı hatası. Lütfen tekrar deneyin.</Alert>
          {alertOpen && (
            <Alert variant="info" title="Kapatılabilir Alert" onClose={() => setAlertOpen(false)}>
              Bu alert kapatma butonuna sahip.
            </Alert>
          )}
        </div>
        <CodeSnippet code={`<Alert variant="success" title="Başarılı">Kayıt oluşturuldu.</Alert>
<Alert variant="error" onClose={() => setOpen(false)}>Bir hata oluştu.</Alert>`} />
      </Section>

      {/* ── StatCard ── */}
      <Section title="StatCard" subtitle="components/ui/StatCard.tsx">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Toplam Fatura"  value="₺284.500" icon={FileText}    color="blue"    change="+12.5%" trend="up"   trendLabel="Bu ay"    />
          <StatCard title="Aktif Personel" value="142"      icon={Users}       color="violet"  change="+3"     trend="up"   trendLabel="Bugün"    />
          <StatCard title="Ort. Mesai"     value="8.4 sa"   icon={TrendingUp}  color="emerald" change="-0.2"   trend="down" trendLabel="Günlük"   />
          <StatCard title="Büyüme"         value="%18.2"    icon={CheckCircle} color="blue"    change="+2.1%"  trend="up"   trendLabel="Geçen ay" />
        </div>
        <CodeSnippet code={`<StatCard title="Aktif Personel" value="142" icon={Users} color="violet" change="+3" trend="up" trendLabel="Bugün" />`} />
      </Section>

      {/* ── Card ── */}
      <Section title="Card" subtitle="components/ui/Card.tsx">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Basit Kart" subtitle="Başlık ve alt başlık" />
            <CardBody><p className="text-sm text-slate-500 dark:text-slate-400">Kart içeriği buraya gelir.</p></CardBody>
          </Card>
          <Card>
            <CardHeader title="Action'lı Kart" subtitle="Sağ üstte buton var" action={<Button size="xs" variant="outline">Düzenle</Button>} />
            <CardBody><p className="text-sm text-slate-500 dark:text-slate-400">İçerik alanı.</p></CardBody>
            <CardFooter>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost">İptal</Button>
                <Button size="sm">Kaydet</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        <CodeSnippet code={`<Card>
  <CardHeader title="Başlık" subtitle="Alt başlık" action={<Button size="xs">Düzenle</Button>} />
  <CardBody>İçerik</CardBody>
  <CardFooter>Footer</CardFooter>
</Card>`} />
      </Section>

      {/* ── Table ── */}
      <Section title="Table" subtitle="components/ui/Table.tsx">
        <Card>
          <CardHeader title="Örnek Tablo" subtitle="Table, Thead, Tbody, Th, Td, Tr bileşenleri" />
          <Table>
            <Thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <Th>Ad Soyad</Th>
                <Th>Departman</Th>
                <Th>Durum</Th>
                <Th align="right">Mesai</Th>
              </tr>
            </Thead>
            <Tbody>
              {[
                { name: "Mehmet Kaya",   dept: "Muhasebe",         status: "Aktif",    hours: "9s 13d", v: "emerald" as const },
                { name: "Ayşe Demir",    dept: "İnsan Kaynakları", status: "Aktif",    hours: "9s 15d", v: "emerald" as const },
                { name: "Can Öztürk",    dept: "Yazılım",          status: "İzinli",   hours: "—",      v: "blue"    as const },
                { name: "Zeynep Arslan", dept: "Satış",            status: "Devamsız", hours: "—",      v: "red"     as const },
              ].map((r) => (
                <Tr key={r.name}>
                  <Td><span className="font-medium text-slate-800 dark:text-slate-200">{r.name}</span></Td>
                  <Td>{r.dept}</Td>
                  <Td><Badge variant={r.v} dot>{r.status}</Badge></Td>
                  <Td align="right"><span className="font-medium">{r.hours}</span></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
        <CodeSnippet code={`<Table>
  <Thead><tr><Th>İsim</Th><Th>Durum</Th></tr></Thead>
  <Tbody>
    <Tr><Td>Mehmet Kaya</Td><Td><Badge variant="emerald">Aktif</Badge></Td></Tr>
  </Tbody>
</Table>`} />
      </Section>

      {/* ── Pagination ── */}
      <Section title="Pagination" subtitle="components/ui/Pagination.tsx">
        <Card>
          <Pagination
            page={page}
            totalPages={5}
            totalItems={47}
            perPage={perPage}
            onChange={setPage}
            onPerPageChange={setPerPage}
            perPageOptions={[5, 10, 20, 50]}
          />
        </Card>
        <CodeSnippet code={`const [page, setPage]       = useState(1);
const [perPage, setPerPage] = useState(10);

<Pagination
  page={page}
  totalPages={5}
  totalItems={47}
  perPage={perPage}
  onChange={setPage}
  onPerPageChange={setPerPage}
  perPageOptions={[5, 10, 20, 50]}
/>`} />
      </Section>

      {/* ── EmptyState ── */}
      <Section title="EmptyState" subtitle="components/ui/EmptyState.tsx">
        <Card>
          <EmptyState
            icon={Bell}
            title="Bildirim yok"
            description="Henüz herhangi bir bildiriminiz bulunmuyor."
            action={<Button variant="outline" size="sm">Yenile</Button>}
          />
        </Card>
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="Sonuç bulunamadı"
            description="Arama kriterlerinize uygun kayıt bulunamadı."
            action={<Button size="sm" iconLeft={<Info className="w-4 h-4" />}>Filtreleri Temizle</Button>}
          />
        </Card>
        <CodeSnippet code={`<EmptyState
  icon={Bell}
  title="Bildirim yok"
  description="Henüz bildirim bulunmuyor."
  action={<Button size="sm">Yenile</Button>}
/>`} />
      </Section>

      </div>
    </Page>
  );
}
