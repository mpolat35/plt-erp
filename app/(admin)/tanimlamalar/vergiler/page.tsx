import { Page } from "@/components/ui/Page";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { TrendingUp, Stamp, Receipt } from "lucide-react";
import GelirVergisi from "@/components/tanimlamalar/GelirVergisi";
import DamgaVergisi from "@/components/tanimlamalar/DamgaVergisi";
import KdvTevkifat from "@/components/tanimlamalar/KdvTevkifat";

export default function VergilerPage() {
  const tabItems: TabItem[] = [
    {
      key: "gelir-vergisi",
      label: "Gelir Vergisi",
      icon: <TrendingUp />,
      content: (
        <div className="pt-2">
          <GelirVergisi />
        </div>
      ),
    },
    {
      key: "damga-vergisi",
      label: "Damga Vergisi",
      icon: <Stamp />,
      content: (
        <div className="pt-2">
          <DamgaVergisi />
        </div>
      ),
    },
    {
      key: "kdv-tevkifat",
      label: "KDV Tevkifat",
      icon: <Receipt />,
      content: (
        <div className="pt-2">
          <KdvTevkifat />
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
