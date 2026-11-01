import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Veyra — Every guest. Every moment.",
    short_name: "Veyra",
    description: "Invitations, RSVPs and smarter event planning.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F8F5EF",
    theme_color: "#163D34",
    icons: [
      {
        src: "/brand/veyra-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/veyra-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/veyra-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
