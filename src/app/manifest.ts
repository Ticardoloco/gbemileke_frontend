import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gbemileke Tradomedical Hospital",
    short_name: "Gbemileke",
    description: "Holistic Care Rooted in Tradition. Book appointments, order herbal remedies, and manage your health care.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#025a2b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}