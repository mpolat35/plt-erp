import { Page } from "@/components/ui/Page";
import CalismaTakvimi from "@/components/tanimlamalar/CalismaTakvimi";

export default function CalismaTakvimiPage() {
  return (
    <Page
        title="Çalışma Takvimi"
        description="Resmi tatiller, dini bayramlar ve idari izinlerin yıl bazlı yönetildiği ekran."
    >
      <div className="p-2">
         <CalismaTakvimi />
      </div>
    </Page>
  );
}
