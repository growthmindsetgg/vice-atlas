import type { Metadata } from "next";

export const SITE_NAME = "Vice Atlas";
export const SITE_TAGLINE = "Interactive GTA 6 Map";
export const DEFAULT_DESCRIPTION =
  "The unofficial interactive GTA 6 map. Find every collectible, business, stunt jump, gang hideout, and easter egg in Vice City. Track your progress across the entire map.";

/**
 * Public site URL. Falls back to localhost in dev. Set NEXT_PUBLIC_SITE_URL in
 * Vercel (e.g. https://viceatlas.gg) so canonicals and OG image URLs resolve
 * to absolute production URLs.
 */
export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  return "http://localhost:3000";
}

export function absoluteUrl(pathname = "/"): string {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteUrl()}${p}`;
}

type PageMetaInput = {
  title: string;
  description?: string;
  path: string;
  keywords?: string[];
};

/** Builds metadata for an individual page using shared SEO defaults. */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
}: PageMetaInput): Metadata {
  const desc = description ?? DEFAULT_DESCRIPTION;
  const url = absoluteUrl(path);
  return {
    title,
    description: desc,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: absoluteUrl("/og.png"),
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [absoluteUrl("/og.png")],
    },
  };
}

export const DEFAULT_KEYWORDS = [
  "GTA 6 map",
  "GTA 6 interactive map",
  "GTA 6 collectibles",
  "GTA 6 locations",
  "GTA 6 stunt jumps",
  "GTA 6 easter eggs",
  "GTA VI map",
  "Vice City map",
  "GTA 6 checklist",
  "GTA 6 100% guide",
];

export function jsonLdWebsite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "GTA 6 Interactive Map",
    url: siteUrl(),
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl()}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function jsonLdWebApplication() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    applicationCategory: "GameApplication",
    operatingSystem: "Web Browser",
    url: siteUrl(),
    description: DEFAULT_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl(),
    },
  };
}
