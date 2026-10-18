# Woodhouse illustrated technical plates

Reviewed 18 October 2026. MP rejected the published D2 treatment. These are replacement candidates, not a record of MP taste acceptance.

The eleven landscape masters are actual built-in OpenAI imagegen outputs. Each adjacent prompt records the exact selected generation/edit instruction; direct edit references and prompt history are retained in `generation-history/`. The producer candidates and rejected outputs are additionally retained in this task's ignored output/candidate folders. Generated typography, invented hardware and misleading paths were rejected during criticism; generation alone is not approval.

The publication has three explicit source layers:

- `diagrams/*.d2` are the editable system models: the real labels, relationships, stops and limits. They are public downloads, honestly labelled **system model (D2)**. They are not bitmap-editing files.
- Landscape artwork uses the selected PNG master. Its self-contained published SVG carries a WebP derivative plus a meaningful title/description.
- Phone artwork is composed in `scripts/phone-technical-plates.mjs`: exact native SVG type and paths with non-destructively clipped details from the same generated landscape illustration. Principal labels are 24 source pixels and explanation text 20 on a 360-wide canvas, retaining about 19/16px at a 280px display width. Generated bitmap phone lettering and connectors failed actual phone checks and are retained as studies, not published as the phone edition.

Each per-plate JSON binds its model and actual illustration master by SHA-256. A changed model or master refuses rendering until the pair is reviewed again. This prevents a source edit from silently publishing a picture of the former system; it never grants agent or MP approval. Release evidence remains bound to the exact source digest and Worker through the existing publication gate.

Run `pnpm diagrams` to validate/render the D2 models privately under ignored `output/diagram-models/`, reproduce the published illustration derivatives/native phone compositions, copy the public D2 models and refresh intrinsic sizes. It uses the existing D2 CLI, ImageMagick and checked-in Bricolage fonts. No new runtime framework, service, registry or resource is involved.

The pictures are method illustrations. They do not establish an individual project's results, actual workforce count, adoption, payment integration or physical-device proof. The commercial plate remains explicitly proposed, and the Pirates example retains its locked/conditional boundary. Native page descriptions and complete transcripts remain available.
