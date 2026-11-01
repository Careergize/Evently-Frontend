import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";
const inter = localFont({
  src: "./fonts/Inter.woff2",
  variable: "--font-ui",
  display: "swap",
  weight: "100 900",
});
const playfair = localFont({
  src: "./fonts/PlayfairDisplay.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "400 900",
});
const siteUrl = process.env.SITE_URL;
export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "Veyra | Invitations, RSVPs & Smarter Event Planning",
    template: "%s | Veyra",
  },
  description:
    "Create beautiful event invitations, track guest attendance, manage RSVPs, and plan celebrations confidently with Veyra.",
  applicationName: "Veyra",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/brand/veyra-icon.svg", type: "image/svg+xml" },
      { url: "/brand/veyra-icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: "/brand/veyra-apple-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Veyra",
    title: "Veyra — Every guest. Every moment.",
    description:
      "Beautiful invitations, effortless RSVPs, and smarter event planning—all in one place.",
    ...(siteUrl
      ? {
          url: siteUrl,
          images: [
            {
              url: "/brand/veyra-social.png",
              width: 1200,
              height: 630,
              alt: "Veyra — Every guest. Every moment.",
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "Veyra — Every guest. Every moment.",
    description: "Celebrate more. Worry less.",
    ...(siteUrl ? { images: ["/brand/veyra-social.png"] } : {}),
  },
};
export const viewport: Viewport = {
  themeColor: "#163D34",
  width: "device-width",
  initialScale: 1,
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
