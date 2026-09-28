# Design system

## Direction

Woodhouse is an evidence-led public journal for a small software factory. The visual language is a bright engineering annual printed in a short run: real product artwork beside clear copy, diagrams that explain an actual system, and a visible record of what was reviewed.

The previous Steward's Office direction is retired. Do not bring back the staged steward image, dark-club palette, theme switch, faux archival material or office metaphors.

## Colour and material

- Warm paper `#FAF4E6` is the page ground; near-black `#171812` carries body text and the navigation.
- Acid yellow `#E6F451` signals Woodhouse and marks a live focus or featured region.
- Signal orange `#F2744A` highlights a decision, handoff or warning.
- Electric blue `#4665E8` is used for a related path or diagram layer.
- State colours remain labelled and readable without colour: qualified green, held amber and unresolved red.
- Use flat ink and paper, crisp rules and occasional offset shadows on a featured artifact. No gradients, glass, soft dashboard tiles or nested cards.
- The site is a single stable light canvas. Do not read or write a theme preference or change the palette after first paint. The dark navigation is part of the same composition, not an alternate theme.

## Typography

- Display titles use a heavy system grotesk with tight tracking and useful line breaks.
- Body copy uses the platform sans-serif at a readable measure of roughly 65–75 characters.
- Monospace is limited to identifiers, source labels and compact technical detail.
- Sentence case carries prose. Uppercase labels are small and short.

## Composition

- The homepage opens on the real Open Graph artwork from product sites. The images remain at their source URL and keep their original crop and aspect ratio.
- Project records pair the upstream image, favicon, title and description with the dated Woodhouse summary. Art is labelled as promotional; it is not release evidence.
- If there is no public source image, a project-specific Woodhouse SVG fills the frame and names why. If an upstream image fails in the browser, replace it with that same local fallback and update the caption. On social previews, list a local fallback OG image after the source image.
- Pages use large type, asymmetrical columns, image-led sections and decisive horizontal rules. Do not solve every section with a new box.
- A diagram earns its area by explaining a real system or control. Keep its editable `.d2` source beside the checked-in SVG; ship a phone composition as well as the wider version. Provide an image description and a readable text transcript.

## Interaction and states

- Keep the header and page colours fixed from first paint. There is no theme toggle.
- Source images link to their project site. If one fails, the browser swaps to the local project SVG once and changes the source caption to explain the failure.
- A missing public site uses the local SVG from the outset. Never imitate missing product artwork as if it came from that project.
- Favicons are pulled from their source site and hidden if they fail.
- Controls have visible focus, working keyboard and touch behavior, and clear labels. Hover adds detail but is never required.
- The Woodhouse index is searchable from the keyboard with `⌘K` or `Ctrl+K`, and from the phone's House Index.
- Motion is small and purposeful. Respect `prefers-reduced-motion` and do not animate every section into view.

## Responsive and accessibility rules

- Design the narrow reading order deliberately. Keep source images at their original aspect ratio and show the phone-specific D2 SVG at phone widths.
- Nothing depends on hover. Do not hide diagrams on phones; include a text transcript for detail and screen readers.
- Preserve readable contrast, visible focus, useful image text and link purpose. Keep the page free of horizontal overflow.

## Review

1. Can a new visitor tell what the factory does in one viewport?
2. Are the visible project images actually served by the project sites?
3. Does every absent or failed image explain its fallback?
4. Does each diagram explain a real boundary, process or decision?
5. Does every claim stay inside the evidence and its review date?
