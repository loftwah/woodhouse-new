# Design system

## Direction

Woodhouse is an evidence-led public journal for a small software factory. Its world is a dark technical canvas with vivid, authored diagrams and the artwork each product publishes about itself. The result should feel like a confident engineering publication, not a dashboard or a generated portfolio template.

The site is dark by design on every device. Do not follow the operating-system appearance, read or write a theme preference, offer a theme switch, or show a light surface between navigations.

## Colour and material

- Ink `#080D19` is the page ground. Raised surfaces stay within the same dark family: `#0F182A`, `#111A2C`, and `#17233A`.
- Acid lime `#E9FF49` marks human direction and the Woodhouse identity.
- Cyan `#79D8FF`, cobalt `#647DFF`, and coral `#FF746A` distinguish real system paths and evidence boundaries. A colour must never carry a state without a text label.
- Use crisp edges, strong contrast and restrained light. No paper backgrounds, gradients for decoration, glass, soft dashboard tiles, or nests of boxes.

## Typography

- Display titles use locally hosted Bricolage Grotesque with deliberate line breaks and tight tracking.
- Body copy uses the platform sans-serif at a readable measure of roughly 65–75 characters.
- Monospace is reserved for identifiers, source labels and compact technical detail.
- Sentence case carries prose. Uppercase is for short diagram labels, never whole paragraphs.

## Composition

- The homepage identifies the human operator and coding agents, then places the eight-project D2 network in the first view. The work map and the release/evidence flow are distinct diagrams because they explain different things.
- Project artwork is fetched from each project's own published page metadata and shown from the source image URL at its original 1200×630 aspect ratio. Titles, descriptions, favicons and links identify the source. Do not copy or recreate source-site OG artwork as Woodhouse art.
- Source-page metadata is read during the Woodhouse build; the image itself stays at the source URL. A source-site update appears on the next Woodhouse build (and an image-file update at a stable source URL is served directly).
- Credit product artwork to its project and Woodhouse-made illustrations to Woodhouse. Never present a Woodhouse illustration as product artwork.
- A diagram earns its area by explaining a real system, boundary or decision. Keep its editable `.d2` source beside the checked-in SVG, ship a phone composition as well as the wider version, and provide a meaningful image description and readable text transcript.
- Pages use large type, asymmetrical composition and decisive horizontal rules. Do not solve every section with another box.

## Interaction and states

- Keep page colours fixed from first paint. Dark mode has no transition and no toggle.
- Source artwork links to its project site. Credit Woodhouse-made illustrations as Woodhouse artwork. Remove failed source icons cleanly.
- Diagram transcripts use native `<details>` and `<summary>`; do not render the control when there is no transcript.
- The Woodhouse index is searchable from the keyboard with `⌘K` or `Ctrl+K`, and from the phone's House Index.
- Motion is small and purposeful. Respect `prefers-reduced-motion`; do not animate every section into view.

## Responsive and accessibility rules

- Design the narrow reading order deliberately. Keep source artwork at its original aspect ratio and show the phone-specific D2 SVG at phone widths.
- Nothing depends on hover. Do not hide diagrams on phones; include a text transcript for detail and assistive technology.
- Preserve readable contrast, visible focus, useful image text and clear link purpose. Keep the page free of horizontal overflow.

## Review

1. Can a new visitor tell who runs the factory, what agents do and how many products it spans?
2. Are project cards displaying the artwork and metadata their own sites publish?
3. Does every image name its source or creator accurately?
4. Does each diagram explain a real boundary, process or decision and work on a phone?
5. Does every project claim stay inside its source and review date?
