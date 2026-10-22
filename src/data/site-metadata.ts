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
