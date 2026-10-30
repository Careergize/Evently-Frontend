import Evently from "@/components/evently";
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  return <Evently path={(await params).path || []} />;
}
