import { Page } from "@/components/ui/Page";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Banknote, ShieldCheck, Scale } from "lucide-react";
import AsgariUcret from "@/components/tanimlamalar/AsgariUcret";
import SgkOranlari from "@/components/tanimlamalar/SgkOranlari";
import KidemTazminati from "@/components/tanimlamalar/KidemTazminati";

export default function UcretBilgileriPage() {
  const tabItems: TabItem[] = [
    {
      key: "asgari-ucret",
      label: "Asgari Ücret",
      icon: <Banknote />,
      content: (
        <div className="pt-2">
          <AsgariUcret />
        </div>
      ),
    },
    {
      key: "sgk-oranlari",
      label: "SGK Oranları",
      icon: <ShieldCheck />,
      content: (
        <div className="pt-2">
          <SgkOranlari />
        </div>
      ),
    },
    {
      key: "kidem-tazminati",
      label: "Kıdem Tazminatı",
      icon: <Scale />,
      content: (
        <div className="pt-2">
          <KidemTazminati />
        </div>
      ),
    },
  ];

  return (
    <Page
        title="Ücret Bilgileri"
        description="Sistemdeki asgari ücret ve diğer ücret parametrelerinin tanımlandığı ekran."
    >
      <div className="p-2">
        <Tabs items={tabItems} />
      </div>
    </Page>
  );
}
