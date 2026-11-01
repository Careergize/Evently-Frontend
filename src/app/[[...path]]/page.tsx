import type { Metadata } from "next";
import Evently from "@/components/evently";
type Props = { params: Promise<{ path?: string[] }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = (await params).path || [];
  const privatePage = ["dashboard", "invite", "reset-password"].includes(
    path[0],
  );
  const titles: Record<string, string> = {
    login: "Sign in",
    register: "Create your account",
    "forgot-password": "Reset your password",
    "reset-password": "Choose a new password",
    dashboard: "Your workspace",
    invite: "You’re invited",
    partners: "For event professionals",
    privacy: "Privacy",
    terms: "Terms",
  };
  const siteUrl = process.env.SITE_URL;
  return {
    ...(path.length ? { title: titles[path[0]] || "Page" } : {}),
    ...(privatePage
      ? {
          robots: { index: false, follow: false },
          openGraph: {
            title: "A personal invitation from Veyra",
            description: "Every guest. Every moment.",
            images: [],
          },
          twitter: { card: "summary", title: "Veyra", images: [] },
        }
      : {}),
    ...(siteUrl && !privatePage
      ? {
          alternates: {
            canonical: new URL(
              path.length ? `/${path[0]}` : "/",
              siteUrl,
            ).toString(),
          },
        }
      : {}),
  };
}
export default async function Page({ params }: Props) {
  const path = (await params).path || [];
  const siteUrl = process.env.SITE_URL;
  const structured =
    !path.length && siteUrl
      ? {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Veyra",
          url: new URL("/", siteUrl).toString(),
          description: "Every guest. Every moment.",
        }
      : null;
  return (
    <>
      {structured && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structured).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <Evently path={path} />
    </>
  );
}
