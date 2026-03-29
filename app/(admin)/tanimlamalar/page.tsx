import { Page } from "@/components/ui/Page";
import { SlidersHorizontal } from "lucide-react";

export default function TanimlamalarPage() {
  return (
    <Page
      title="Sistem Tanımlamaları"
      description="Sistem ayarlarına ve tanımlamalarına ait ana ekran."
      icon={SlidersHorizontal}
    >
      <div className="text-sm text-slate-500">İçerik buraya gelecek...</div>
    </Page>
  );
}
