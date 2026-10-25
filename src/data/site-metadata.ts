import type { WoodhouseProject } from "../content/repository";

export type SiteMetadata = {
  title: string;
  description: string;
  image: string;
  icon: string | null;
};

/**
 * The card Woodhouse draws for itself when a project publishes no artwork of
 * its own. It is a capture of the homepage signature, not an illustration of a
 * product, and the provenance beside it says so.
 */
export const WOODHOUSE_SOCIAL_CARD = "/og/project-dossier-20261025.jpg";
export const WOODHOUSE_SOCIAL_CARD_ALT =
  "Woodhouse project dossier card: a lit lens of pale blue, cyan and lime fibres gathered to a point at each end, under the words “A project, in context.”";

/**
 * Only raster images unfurl. X, Facebook, LinkedIn, Slack and iMessage ignore an
 * SVG `og:image`, so a project pointing at one shares with no picture at all.
 * The share gallery still shows the original SVG in a browser; this guard is
 * for social metadata only.
 */
export function isRasterImage(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const { pathname } = new URL(url, "https://woodhouse.loftwah.com");
    return /\.(png|jpe?g|webp|avif)$/i.test(pathname);
  } catch {
    return false;
  }
}

/**
 * The single social image a page should advertise, with alt text that describes
 * whichever image was actually chosen. A page must not carry two `og:image`
 * tags: consumers disagree about which one wins, and the loser is invisible.
 */
export function socialCardFor(project: WoodhouseProject): {
  image: string;
  alt: string;
  fromProduct: boolean;
  width: number;
  height: number;
} {
  const candidate = project.previewImage;
  if (project.siteUrl && isRasterImage(candidate)) {
    return {
      image: candidate!,
      alt: project.previewAlt ?? `Artwork from the ${project.name} site.`,
      fromProduct: true,
      width: project.previewWidth ?? 1200,
      height: project.previewHeight ?? 630
    };
  }
  return {
    image: WOODHOUSE_SOCIAL_CARD,
    alt: WOODHOUSE_SOCIAL_CARD_ALT,
    fromProduct: false,
    width: 1200,
    height: 630
  };
}

export function getArtworkFallback(project: WoodhouseProject) {
  if (project.slug === "fighter") {
    return {
      image: "/og/projects/fighter-duo-20261023.png",
      alt: "Illustrated LOFTWAH FIGHTER poster: Dean/Loftwah reaches into a charged arena while Pippa, a stocky black bulldog, braces in front of him, under bold LOFTWAH FIGHTER lettering.",
      credit: "FIGHTER PROMOTIONAL ARTWORK"
    };
  }
  return project.slug === "app-composer"
    ? {
        image: "/og/projects/app-composer.jpg",
        alt: "App Composer's orange merging-block mark and the line “Make software. Keep it yours.” on a flat orange field.",
        credit: "APPROVED APP COMPOSER ARTWORK"
      }
    : {
        image: `/og/projects/${project.slug}.svg`,
        alt: `Woodhouse illustration for ${project.name}.`,
        credit: "ILLUSTRATION BY WOODHOUSE"
      };
}

export function getSiteMetadata(project: WoodhouseProject): SiteMetadata {
  return {
    title: project.siteOgTitle ?? project.name,
    description: project.siteOgDescription ?? project.summary,
    image: project.previewImage ?? getArtworkFallback(project).image,
    icon: project.siteFavicon ?? null
  };
}
