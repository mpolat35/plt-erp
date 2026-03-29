import { Page } from "@/components/ui/Page";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Layers, MapPin } from "lucide-react";
import DepartmanYonetimi from "@/components/tanimlamalar/DepartmanYonetimi";
import SubeYonetimi from "@/components/tanimlamalar/SubeYonetimi";

export default function OrganizasyonPage() {
  const tabItems: TabItem[] = [
    {
      key: "departman",
      label: "Departmanlar",
      icon: <Layers />,
      content: (
        <div className="pt-2">
          <DepartmanYonetimi />
        </div>
      ),
    },
    {
      key: "subeler",
      label: "Şubeler",
      icon: <MapPin />,
      content: (
        <div className="pt-2">
          <SubeYonetimi />
        </div>
      ),
    },
  ];

  return (
    <Page title="Organizasyon Tanımları" description="Kurum, departman ve şube gibi ortak organizasyon yapılarını yönetin." icon={<Layers />}>
      <div className="p-2">
        <Tabs items={tabItems} />
      </div>
    </Page>
  );
}
