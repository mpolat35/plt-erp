import FizibiliteEditor from "@/components/proje-yonetimi/FizibiliteEditor";

export default async function ProjeDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FizibiliteEditor projectId={id} />;
}
