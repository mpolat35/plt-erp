import { Page } from "@/components/ui/Page";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Building2, Layers } from "lucide-react";
import KurumTuru from "@/components/tanimlamalar/KurumTuru";
import Kurumlar from "@/components/tanimlamalar/Kurumlar";

export default function KurumPage() {
  const tabItems: TabItem[] = [
    {
      key: "kurum-turu",
      label: "Kurum Türü",
      icon: <Layers />,
      content: (
        <div className="pt-2">
          <KurumTuru />
        </div>
      ),
    },
    {
      key: "kurumlar",
      label: "Kurumlar",
      icon: <Building2 />,
      content: (
        <div className="pt-2">
          <Kurumlar />
        </div>
      ),
    },
  ];

  return (
    <Page>
      <div className="p-2">
        <Tabs items={tabItems} />
      </div>
    </Page>
  );
}
