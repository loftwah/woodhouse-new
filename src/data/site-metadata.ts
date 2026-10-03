import type { WoodhouseProject } from "../content/repository";

export type SiteMetadata = {
  title: string;
  description: string;
  image: string;
  icon: string | null;
};

export function getSiteMetadata(project: WoodhouseProject): SiteMetadata {
  return {
    title: project.siteOgTitle ?? project.name,
    description: project.siteOgDescription ?? project.summary,
    image: project.previewImage ?? `/og/projects/${project.slug}.svg`,
    icon: project.siteFavicon ?? null
  };
}
