import Nav from "@/components/Nav";
import ServerRedirectIfAuthenticated from "@/components/ServerRedirectIfAuthenticated";

export default async function Home() {
  return (
    <ServerRedirectIfAuthenticated>
      <div className="container min-h-dvh mx-auto px-4">
        <Nav />
      </div>
    </ServerRedirectIfAuthenticated>
  );
}
