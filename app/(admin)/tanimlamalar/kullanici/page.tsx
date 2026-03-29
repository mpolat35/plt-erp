import { Page } from "@/components/ui/Page";
import { Users } from "lucide-react";
import KullaniciYonetimi from "@/components/tanimlamalar/KullaniciYonetimi";

export default function KullaniciPage() {
  return (
    <Page>
      <div className="p-2">
        <KullaniciYonetimi />
      </div>
    </Page>
  );
}
