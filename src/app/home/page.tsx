import AppContainer from "@/components/AppContainer";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return <AppContainer user={session?.user}></AppContainer>;
}
