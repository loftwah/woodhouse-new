// Generated lettering and connectors failed at actual phone size. Keep the
// generated illustration fragments; author the reading type and system geometry
// as native SVG. D2 retains the paired, editable system model; the publication
// composition is authored here and reviewed with that model.
const ink = "#080D19",
  white = "#EAF0FA",
  cyan = "#79D8FF",
  lime = "#E9FF49",
  coral = "#FF746A",
  muted = "#A6B4CB";
const xml = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const wrap = (s, limit = 30) =>
  String(s)
    .split("\n")
    .flatMap((paragraph) => {
      const lines = [];
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        if (line && `${line} ${word}`.length > limit) {
          lines.push(line);
          line = word;
        } else line += (line ? " " : "") + word;
      }
      if (line) lines.push(line);
      return lines;
    });

export function renderPhonePlate({ name, labels, image, artWidth, artHeight, regular, bold }) {
  const subject = name.replace(/-mobile$/, "");
  const out = [];
  const t = (x, y, text, size = 20, color = white, weight = 400) =>
    out.push(
      `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}">${xml(text)}</text>`
    );
  const lines = (x, y, text, { size = 20, color = white, limit = 30, weight = 400 } = {}) => {
    const values = wrap(text, limit);
    values.forEach((s, i) => t(x, y + i * (size + 7), s, size, color, weight));
    return y + values.length * (size + 7);
  };
  const rule = (y, color = cyan) =>
    out.push(`<path d="M16 ${y}H344" stroke="${color}" stroke-width="1"/>`);
  const path = (d, color = cyan, arrow = true, dashed = false) =>
    out.push(
      `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5"${dashed ? ' stroke-dasharray="5 5"' : ""}${arrow ? ` marker-end="url(#${color === lime ? "lime" : color === coral ? "coral" : "cyan"})"` : ""}/>`
    );
  const mark = (x, y, color = cyan) =>
    out.push(
      `<circle cx="${x}" cy="${y}" r="3" fill="${ink}" stroke="${color}" stroke-width="1.5"/>`
    );
  const art = (x, y, width, height, crop) => {
    if (crop)
      out.push(
        `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${crop.join(" ")}" preserveAspectRatio="xMidYMid meet"><use href="#art"/></svg>`
      );
  };
  const tail = (id) => (labels[id] ?? "").split("\n").slice(1).join(". ");
  const header = (title, note) => {
    let y = lines(16, 38, title, { size: 30, limit: 21, weight: 700 });
    if (note) y = lines(16, y + 5, note, { size: 20, color: muted });
    rule(y + 12);
    return y + 52;
  };
  const row = (y, title, detail, { crop, color = white, seam = true } = {}) => {
    const titleLines = wrap(title, crop ? 22 : 25);
    titleLines.forEach((s, i) => t(16, y + i * 29, s, 24, color, 700));
    if (crop) art(278, y - 24, 64, 58, crop);
    const detailOffset = Math.max(titleLines.length * 29 + 7, crop ? 60 : 0);
    const end = lines(16, y + detailOffset, detail);
    if (seam) rule(end + 10, "#29405A");
    return end + 56;
  };
  let y;
  switch (subject) {
    case "evidence-ladder": {
      y = header("The evidence ladder", "One candidate revision.");
      const fields = [
        ["Observed", "Source examined", [60, 300, 250, 240]],
        ["Implemented", "Change exists", [375, 300, 250, 240]],
        ["Merged", "Revision integrated", [650, 300, 250, 240]],
        ["Qualified", "Named checks passed", [940, 300, 250, 240]],
        ["Production verified", "Live revision observed", [1240, 300, 250, 240]]
      ];
      fields.forEach(([title, detail, crop], i) => {
        t(16, y - 27, `0${i + 1}`, 14, cyan);
        y = row(y, title, detail, { crop });
      });
      y = lines(16, y + 6, "Independent observations", { size: 22, weight: 700 }) + 24;
      y = row(y, "Human acceptance", "Does it meet the brief?", {
        crop: [490, 700, 180, 195],
        color: lime
      });
      y = row(y, "Physical proof", "Does it work on the real device?", {
        crop: [880, 700, 180, 195],
        color: coral
      });
      y = lines(16, y, "Each claim needs its own observation.") + 20;
      break;
    }
    case "risk-controls": {
      y = header("Controls follow consequences");
      const entries = [
        ["Throwaway", "Discard cheaply. Keep it reversible."],
        ["Experiment", "Retain useful observations."],
        ["Project", "Protect source and history."],
        ["Product", "Observe real use."],
        ["Commercial", "Protect money and commitments.\nBound authority and fulfilment."],
        ["Treasured", "Restrict access to what must stay private."]
      ];
      entries.forEach(([title, detail], i) => {
        y = row(y, title, detail, { crop: [45, 170 + i * 121, 320, 108] });
      });
      y = lines(16, y, "Classes, not stages.", { size: 24, weight: 700 }) + 4;
      y = lines(16, y, "Choose controls for the actual consequence.") + 20;
      break;
    }
    case "factory-flow": {
      y = header("From intent to evidence", "One exact candidate.");
      const positions = [];
      const fields = [
        ["Human intent", "Goal, limits and owner.", [145, 170, 225, 290]],
        ["Coding agents", "Bounded tasks. Reviewable changes.", [520, 180, 440, 260]],
        ["Independent review", "Check the held revision.", [1080, 170, 365, 250]],
        ["Qualification", "Exact candidate. Record what passed.", [1135, 715, 270, 210]],
        ["Production", "Observe the named live version.", [635, 695, 345, 225]],
        ["Real use", "People, devices and environments.", [100, 690, 400, 230]]
      ];
      fields.forEach(([title, detail, crop], i) => {
        positions.push(y - 10);
        y = row(y, title, detail, { crop, color: i === 0 ? lime : white });
      });
      for (let i = 0; i < positions.length - 1; i++)
        path(`M350 ${positions[i] + 28}V${positions[i + 1] - 18}`);
      path(`M12 ${positions.at(-1)}H5V${positions[0]}H12`, lime);
      y = lines(16, y, "Evidence returns to the human.", { color: lime, weight: 700 }) + 8;
      y =
        lines(16, y, "Owning review and release gates apply. Deployment alone is not real use.") +
        20;
      break;
    }
    case "failure-loop": {
      y = header("The failure loop");
      const positions = [];
      const fields = [
        ["Expectation", "State what should happen."],
        ["Attempt", "Make a reviewable change."],
        ["Reality", "Inspect the actual result."],
        ["Incident", "Name what escaped the checks."],
        ["Control", "Prevent the same failure class."],
        ["Recheck", "Repeat it. Record the evidence."]
      ];
      fields.forEach(([title, detail], i) => {
        positions.push(y - 10);
        y = row(y, title, detail, { color: i === 0 ? lime : i === 2 || i === 3 ? coral : white });
      });
      for (let i = 0; i < positions.length - 1; i++)
        path(`M350 ${positions[i] + 25}V${positions[i + 1] - 18}`);
      path(`M12 ${positions.at(-1)}H5V${positions[0]}H12`, lime);
      y = lines(16, y, "Return evidence to the expectation.", { color: lime }) + 16;
      art(16, y, 328, 172, [535, 285, 460, 325]);
      y += 200;
      t(16, y, "Illustrative diagnostic", 16, muted);
      y += 36;
      y = row(
        y,
        "FT / Fighter",
        "Geometry passed. Design missed. Independent visual criticism became a separate check.",
        { color: lime }
      );
      break;
    }
    case "lineage": {
      y = header("How the work changed", "Working habits, not dated steps.");
      const fields = [
        ["Compose tools", "Plugins, APIs and services."],
        ["Work in a pair", "One human, one agent."],
        ["Delegate work", "Bounded tasks. Explicit owners."],
        ["Work in parallel", "Competing changes. Independent review."],
        ["Qualify the result", "Exact revision. Named release gates."],
        ["Operate a factory", "Tie intent and work to release evidence."]
      ];
      fields.forEach(([title, detail], i) => {
        const col = i % 3;
        const r = Math.floor(i / 3);
        y = row(y, title, detail, { crop: [40 + col * 505, 225 + r * 365, 440, 265] });
      });
      break;
    }
    case "project-network": {
      y = header("One operator. Distinct projects.");
      y = row(y, "Human direction", "Scope and authority.", { color: lime });
      y = row(y, "Coding agents", "Bounded tasks. Named owners.");
      y = lines(16, y, "Independent project ownership", { size: 22, weight: 700 }) + 24;
      const projects = [
        ["BB", "Bubbles", "Game systems."],
        ["FT", "Fighter", "Authored play."],
        ["SS", "SHOALSHOT", "Fishing arcade play."],
        ["P11", "Protocol 11", "A changing card table."],
        ["MX", "MAX", "Assistive technology."],
        ["PR", "Pirates", "Source-backed reconstruction."],
        ["FM", "LoftwahFM", "Music."],
        ["SC", "Social Club", "Hospitality."],
        ["AC", "App Composer", "Environment preparation and independent app composition."],
        ["AH", "Asset Hunter", "Public capability catalogue. Rights per example."]
      ];
      projects.forEach(([id, title, detail]) => {
        t(16, y, id, 16, cyan, 700);
        t(64, y, title, 24, white, 700);
        y = lines(64, y + 31, detail, { limit: 24 }) + 12;
        rule(y, "#29405A");
        y += 40;
      });
      y =
        lines(16, y, "Each project owns its identity, source, data and release gates.", {
          weight: 700
        }) + 8;
      y = lines(16, y, "Markers do not imply activity, health or adoption.") + 20;
      break;
    }
    case "release-path": {
      y = header("Qualify what you ship.");
      y = row(y, "Exact candidate", tail("candidate"), {
        crop: [70, 220, 285, 345]
      });
      path(`M180 ${y - 44}V${y - 28}`);
      y = row(y, "Review and checks", "Observe this revision. Owning release gates still apply.");
      y = row(
        y,
        "Candidate changed?",
        "Stop. Earlier checks no longer qualify the changed state.",
        { color: coral }
      );
      y =
        lines(16, y, "Revise and repeat the affected checks before continuing.", { color: coral }) +
        24;
      rule(y);
      y += 44;
      y = row(y, "Production", "Deploy and inspect the named live revision.");
      y = row(y, "Real use", "People and devices need a separate observation.");
      y = lines(16, y, "Checks, production and real use are separate claims.") + 20;
      break;
    }
    case "publication-path": {
      y = header("A public window. A private workshop.");
      y = row(y, "Project site metadata", "Title, summary and source artwork URL.", {
        crop: [390, 190, 175, 185]
      });
      const feedA = y - 58;
      y = row(y, "Reviewed public record", "Public-safe claims and review date.");
      const feedB = y - 58;
      const join = y + 4;
      path(`M350 ${feedA}V${join}H180`);
      path(`M340 ${feedB}V${join}H180`);
      mark(180, join);
      y = row(join + 44, "Woodhouse page", "Human and agent views share the reviewed record.");
      path(`M180 ${y - 44}V${y - 28}`);
      y = row(y, "Reader's browser", "Loads original artwork directly from its project.");
      y = row(
        y,
        "If source artwork fails",
        "Identify the Woodhouse fallback. Change its text and credit."
      );
      y += 12;
      rule(y, coral);
      y += 42;
      y = row(
        y,
        "Private / blocked",
        "Repository bodies, credentials and conversations have no publication path.",
        { color: coral }
      );
      break;
    }
    case "agent-policy": {
      y = header("Act within your authority.");
      const proposal = y - 10;
      y = row(y, "Observe and propose", "Safe reads, drafts, issues and bounded changes.", {
        crop: [380, 210, 180, 155]
      });
      y = row(y, "Check authority", "Is this ordinary authorised work, or a reserved decision?");
      const decision = y - 40;
      rule(y + 2);
      y += 44;
      const execute = y - 8;
      y = row(y, "Ordinary authorised work", "Execute and qualify the bounded result.", {
        color: cyan
      });
      const reserved = y - 8;
      y = row(
        y,
        "Reserved human decision",
        "Accounts, money, rights, irreversible actions and explicit gates.",
        { color: lime }
      );
      mark(180, decision);
      path(`M180 ${decision}H350V${execute}H340`);
      path(`M180 ${decision}H5V${reserved}H12`, lime, true, true);
      mark(340, execute);
      mark(12, reserved, lime);
      y = lines(16, y, "Reserved decision outcomes", { size: 22, weight: 700 }) + 20;
      const approval = y - 10;
      y = row(y, "Approve", "Return to execution and qualification within scope.", { color: lime });
      path(`M340 ${approval}H356V${execute}H340`, lime);
      const returned = y - 10;
      y = row(y, "Return", "Revise the proposal. Requalify the result.");
      path(`M12 ${returned}H1V${proposal}H12`, cyan, true, true);
      y = row(y, "Reject", "Record the decision and stop.", { color: coral });
      break;
    }
    case "pirates-parity": {
      y = header("Parity before expansion", "PR / Pirates");
      const original = y - 10;
      y = row(y, "Original evidence", "Recover rules and provenance.", {
        crop: [60, 340, 300, 330]
      });
      const reconstruction = y - 10;
      y = row(y, "Reconstruction", "Implement evidenced rules only.");
      const gap = y - 10;
      y = row(
        y,
        "Source gap / STOP",
        "An unknown stays unknown. Plausibility is not source evidence.",
        { color: coral }
      );
      path(`M350 ${original}V${gap}H340`, coral, true, true);
      const parity = y - 10;
      y = row(y, "Integrated parity", "Compare the whole game.");
      const locked = y - 10;
      y = row(y, "Gate B / locked", "Expansion waits.", { color: coral });
      path(`M12 ${original}H5V${reconstruction}H12`);
      path(`M12 ${reconstruction}H5V${parity}H12`);
      path(`M12 ${parity}H5V${locked}H12`);
      rule(y, coral);
      y += 44;
      y = lines(16, y, "Future expansion condition", { size: 22, weight: 700 }) + 8;
      y = lines(16, y, "Only after integrated parity and the owning gate's acceptance.") + 20;
      break;
    }
    case "payment-fulfilment": {
      y = header("Payment before fulfilment", "Proposed model. Not a live shop.");
      y = row(y, "Payment provider", "Signed payment event.");
      path(`M180 ${y - 44}V${y - 28}`);
      y = row(y, "Verify + deduplicate", "Check the signature and event identity.");
      path(`M180 ${y - 44}V${y - 28}`);
      const ledger = y;
      y = row(y, "Order ledger", "Verified events only.");
      y += 12;
      const policy = y;
      y = row(y, "Approved policy", "Artwork, rights and price. Spend and fulfilment limits.", {
        color: lime
      });
      const joint = y + 8;
      path(`M350 ${ledger}V${joint}H180`);
      path(`M5 ${policy}V${joint}H180`, lime);
      mark(180, joint, lime);
      path(`M180 ${joint}V${joint + 28}`, lime);
      y = row(joint + 58, "Printful order", "Only within the approved limits.");
      path(`M180 ${y - 44}V${y - 28}`);
      const shipment = y;
      y = row(y, "Shipment event", "Update the same order ledger.");
      path(`M344 ${shipment}H356V${ledger + 8}H340`);
      path(`M180 ${y - 44}V${y - 28}`);
      y = row(y, "Notify the customer", "Use the shipment evidence.");
      y += 12;
      rule(y, coral);
      y += 44;
      y = row(
        y,
        "Browser redirect / STOP",
        "A browser redirect is not payment proof. It has no route to the ledger.",
        { color: coral }
      );
      art(267, ledger - 20, 70, 96, [650, 175, 390, 545]);
      break;
    }
    default:
      throw new Error(`No authored phone composition for ${subject}`);
  }
  rule(y + 4);
  t(16, y + 34, "WOODHOUSE / METHOD", 14, muted);
  t(16, y + 55, "Reviewed 18 October 2026", 14, muted);
  const height = Math.ceil(y + 78);
  const markers = ["cyan", "lime", "coral"]
    .map(
      (id) =>
        `<marker id="${id}" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L6 3L0 6" fill="${id === "cyan" ? cyan : id === "lime" ? lime : coral}"/></marker>`
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="${height}" viewBox="0 0 360 ${height}" role="img" aria-labelledby="title description"><title id="title">${xml(labels.title || subject)}</title><desc id="description">Authored phone plate. Native reading type and exact paths accompany generated software illustrations. ${xml(labels.note || "")}</desc><style>@font-face{font-family:Woodhouse;src:url(data:font/ttf;base64,${regular}) format('truetype');font-weight:400}@font-face{font-family:Woodhouse;src:url(data:font/ttf;base64,${bold}) format('truetype');font-weight:700}text{font-family:Woodhouse,sans-serif}svg{overflow:hidden}</style><defs><image id="art" width="${artWidth}" height="${artHeight}" href="data:image/webp;base64,${image}"/>${markers}</defs><rect width="360" height="${height}" fill="${ink}"/>${out.join("")}</svg>\n`;
}
