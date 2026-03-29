import Link from "next/link";
import { Page } from "@/components/ui/Page";
import { SlidersHorizontal, Building2, Layers } from "lucide-react";

const cards = [
  {
    title: "Kurum Tanımları",
    description: "Kurum ve kurum türü tanımlamalarını yönetin.",
    href: "/tanimlamalar/kurum",
    icon: <Building2 className="w-5 h-5" />,
  },
  {

    title: "Organizasyon Tanımları",
    description: "Departman ve şube gibi kurum içi organizasyon yapılarını oluşturun.",
    href: "/tanimlamalar/organizasyon",
    icon: <Layers className="w-5 h-5" />,
  },
];

export default function TanimlamalarPage() {
  return (
    <Page
      title="Sistem Tanımlamaları"
      description="Sistem ayarlarına ve tanımlamalarına ait ana ekran."
      icon={SlidersHorizontal}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="block rounded-3xl border border-slate-200 bg-white p-6 hover:border-blue-300 transition-colors dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{card.description}</p>
                <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{card.title}</h3>
              </div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}
