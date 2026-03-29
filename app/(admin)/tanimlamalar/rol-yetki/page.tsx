import { Page } from "@/components/ui/Page";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { UserCheck, Shield, Key, Award } from "lucide-react";
import RolYonetimi from "@/components/tanimlamalar/RolYonetimi";
import YetkiYonetimi from "@/components/tanimlamalar/YetkiYonetimi";
import UnvanYonetimi from "@/components/tanimlamalar/UnvanYonetimi";
import RolYetkiEslestirme from "@/components/tanimlamalar/RolYetkiEslestirme";

export default function RolYetkiPage() {
  const tabItems: TabItem[] = [
    {
      key: "roller",
      label: "Roller",
      icon: <UserCheck />,
      content: (
        <div className="pt-2">
          <RolYonetimi />
        </div>
      ),
    },
    {
      key: "yetkiler",
      label: "Yetkiler",
      icon: <Shield />,
      content: (
        <div className="pt-2">
          <YetkiYonetimi />
        </div>
      ),
    },
    {
      key: "unvanlar",
      label: "Unvanlar",
      icon: <Award />,
      content: (
        <div className="pt-2">
          <UnvanYonetimi />
        </div>
      ),
    },
    {
      key: "eslestirme",
      label: "Rol & Yetki Eşleştirmesi",
      icon: <Key />,
      content: (
        <div className="pt-2">
          <RolYetkiEslestirme />
        </div>
      ),
    },
  ];

  return (
    <Page>
      <div className="p-2">
        <Tabs items={tabItems} variant="filled" />
      </div>
    </Page>
  );
}
