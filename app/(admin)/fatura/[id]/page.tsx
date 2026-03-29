import { Page } from "@/components/ui/Page";
import FaturaDetay from "@/components/fatura/FaturaDetay";

export default function FaturaDetayPage({ params }: { params: { id: string } }) {
  return (
    <Page>
      <FaturaDetay id={params.id} />
    </Page>
  );
}
