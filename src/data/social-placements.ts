export const socialPlacements = [
  {
    id: "x",
    platform: "X / Twitter",
    placement: "Profile header",
    format: "X header",
    example: "direct-social-x",
    source:
      "https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo",
    note: "X says some views may trim 60 pixels from the top and bottom. Turn on Crop guide to see those edges.",
    guide: "Crop guide"
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    placement: "Single-image post",
    format: "Portrait feed",
    example: "direct-social-linkedin",
    source: "https://www.linkedin.com/help/linkedin/answer/a527229",
    note: "This is a 4:5 photo for a single-image post. LinkedIn lays out multi-image posts differently."
  },
  {
    id: "tiktok",
    platform: "TikTok",
    placement: "Photo post",
    format: "Story still",
    example: "direct-social-tiktok",
    source: "https://support.tiktok.com/en/using-tiktok/creating-videos/making-a-post",
    note: "This is a 9:16 still for Photo mode. The guide approximates space for captions and controls. Check the preview in the app before posting.",
    guide: "Overlay guide"
  },
  {
    id: "facebook",
    platform: "Facebook",
    placement: "Feed photo",
    format: "Square feed",
    example: "direct-social-facebook",
    note: "A square export for a single photo in the feed. Use the image upload for this artwork."
  },
  {
    id: "instagram",
    platform: "Instagram",
    placement: "Portrait feed photo",
    format: "Portrait feed",
    example: "direct-social-instagram",
    source: "https://help.instagram.com/1631821640426723",
    note: "This export uses a 4:5 feed frame. Check the profile grid crop separately in Instagram."
  },
  {
    id: "discord",
    platform: "Discord",
    placement: "Server banner",
    format: "Discord banner",
    example: "direct-social-discord",
    source: "https://support.discord.com/hc/en-us/articles/360028716472-Server-Banners",
    note: "This 16:9 banner leaves a quiet band at the top for the server name.",
    guide: "Server name guide"
  },
  {
    id: "youtube",
    platform: "YouTube",
    placement: "Video thumbnail",
    format: "Landscape",
    example: "direct-social-youtube",
    source: "https://support.google.com/youtube/answer/72431",
    note: "A 16:9 still for a regular video thumbnail. Use Small preview to check whether the artwork reads at a glance."
  }
] as const;
