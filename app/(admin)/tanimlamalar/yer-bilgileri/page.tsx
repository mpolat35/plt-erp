import { Page } from "@/components/ui/Page";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Globe, MapPin, Map, Home } from "lucide-react";
import UlkelerYonetimi from "@/components/tanimlamalar/UlkelerYonetimi";
import IllerYonetimi from "@/components/tanimlamalar/IllerYonetimi";
import IlcelerYonetimi from "@/components/tanimlamalar/IlcelerYonetimi";
import MahallelerYonetimi from "@/components/tanimlamalar/MahallelerYonetimi";

export default function YerBilgileriPage() {
  const tabItems: TabItem[] = [
    {
      key: "ulkeler",
      label: "Ülkeler",
      icon: <Globe />,
      content: (
        <div className="pt-2">
          <UlkelerYonetimi />
        </div>
      ),
    },
    {
      key: "iller",
      label: "İller",
      icon: <MapPin />,
      content: (
        <div className="pt-2">
          <IllerYonetimi />
        </div>
      ),
    },
    {
      key: "ilceler",
      label: "İlçeler",
      icon: <Map />,
      content: (
        <div className="pt-2">
          <IlcelerYonetimi />
        </div>
      ),
    },
    {
      key: "mahalleler",
      label: "Mahalleler",
      icon: <Home />,
      content: (
        <div className="pt-2">
          <MahallelerYonetimi />
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
