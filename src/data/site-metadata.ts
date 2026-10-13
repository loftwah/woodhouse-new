import type { WoodhouseProject } from "../content/repository";

export type SiteMetadata = {
  title: string;
  description: string;
  image: string;
  icon: string | null;
};

export function getArtworkFallback(project: WoodhouseProject) {
  return project.slug === "app-composer"
    ? {
        image: "/og/projects/app-composer.jpg",
        alt: "Original generated App Composer artwork, preserved locally.",
        credit: "ORIGINAL APP COMPOSER ARTWORK"
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
