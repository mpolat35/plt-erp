import Link from "next/link";
import { Palette, ArrowRight, Settings } from "lucide-react";
import { Card, CardBody } from "@/components/ui";
import { Page } from "@/components/ui/Page";

export default function AyarlarPage() {
  return (
    <Page
      title="Ayarlar"
      description="Sistem genel ayarları"
      icon={Settings}
      className="max-w-4xl"
    >
      <div className="space-y-6">
        <Card>
          <CardBody>
            <Link href="/ayarlar/ui-components"
              className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group -m-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950 rounded-md flex items-center justify-center">
                  <Palette className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">UI Komponentleri</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Butonlar, badge'ler, inputlar, kartlar ve tüm UI bileşenleri
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
            </Link>
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}
