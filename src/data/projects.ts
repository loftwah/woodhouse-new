export const reviewDate = "2026-09-28";
export const reviewDateLabel = "28 September 2026";
export const snapshotSource = "The shareable factory SITREP supplied for the Woodhouse launch.";

export type Project = {
  slug: string;
  name: string;
  index: string;
  discipline: string;
  state: string;
  stateTone: "green" | "amber" | "red" | "quiet";
  title: string;
  summary: string;
  why: string;
  current: string;
  teaches: string;
  remaining: string;
  proofBoundary: string;
};

export const projects: Project[] = [
  {
    slug: "bubbles",
    name: "Bubbles",
    index: "01",
    discipline: "Game systems · deterministic play",
    state: "Final convergence",
    stateTone: "amber",
    title: "A game can work and still be waiting to feel finished.",
    summary: "Bubbles is a polished arcade game with a serious deterministic core. Its remaining work is concentrated in the connected product experience, broad browser qualification and owner acceptance.",
    why: "The interesting question has changed. Bubbles no longer needs to prove that a game exists; it needs to prove that the whole product holds together across screens, states and actual play.",
    current: "Mechanically and functionally very mature. The current convergence order places Bubbles closest to its stated finish line.",
    teaches: "Closing an issue is a record of work. It is not proof that the product has finished the job.",
    remaining: "Finish connected-product polish, complete a clean browser qualification and secure owner acceptance.",
    proofBoundary: "This is a reviewed portfolio snapshot. It does not claim that the latest browser matrix is green or that every remaining acceptance gate has passed."
  },
  {
    slug: "fighter",
    name: "Fighter",
    index: "02",
    discipline: "Game systems · authored journeys",
    state: "A+ convergence",
    stateTone: "amber",
    title: "The game is real. The quality bar is deliberately unreasonable.",
    summary: "Fighter has grown into a deep game with Story, Tournament, Battle, Arcade, Survival, Daily Challenges and progression. The work now is to make the complete experience earn an A+.",
    why: "A large feature set can hide weak moments. Fighter is a proving ground for the difference between a technically complete game and one that feels authored from first run through the result.",
    current: "Functional maturity is very high. The reported remaining work is whole-game quality convergence, not a greenfield prototype.",
    teaches: "Passing geometry checks does not settle visual hierarchy, role, motion or whether a screen feels right in context.",
    remaining: "Keep reconciling the complete product against the A+ bar and qualify the exact current release state.",
    proofBoundary: "The snapshot describes broad functional maturity. It does not assert that the latest source has passed every whole-game or production gate."
  },
  {
    slug: "shoalshot",
    name: "SHOALSHOT",
    index: "03",
    discipline: "Game systems · mobile-first presentation",
    state: "Release convergence",
    stateTone: "amber",
    title: "Good software evidence still has to reach the water.",
    summary: "SHOALSHOT is a richly developed fishing game whose recent work spans presentation, performance, responsive play and qualification.",
    why: "Its hard problem is not whether the systems exist. It is whether the experience stays convincing across the full journey, on real devices, and at the exact version claimed to be live.",
    current: "Functionally mature and increasingly polished. The supplied report calls for another clean production qualification and promotion pass.",
    teaches: "A release claim belongs to an exact build and a fresh observation. Old green evidence cannot qualify a newer head.",
    remaining: "Obtain a valid qualification window, qualify the exact candidate, then verify the same state in production.",
    proofBoundary: "The supplied report does not claim that the current head is production verified."
  },
  {
    slug: "protocol-11",
    name: "Protocol 11",
    index: "04",
    discipline: "Game systems · responsive table play",
    state: "Qualification and tracker reconciliation",
    stateTone: "amber",
    title: "A mature game can still have an immature record of what is done.",
    summary: "Protocol 11 has mature game systems and a substantially recovered frontend, including better mobile, table and tablet composition.",
    why: "A tracker is part of the product's evidence chain. If a closed item still contradicts its own definition of done, the system must reconcile the record before treating it as progress.",
    current: "The supplied report points to qualification and tracker reconciliation as the main unresolved work.",
    teaches: "State needs a trustworthy source. A green label is not more authoritative than the evidence beneath it.",
    remaining: "Resolve the tracker contradictions, refresh the project record and qualify the actual current build.",
    proofBoundary: "No statement here treats issue closure as proof of completion."
  },
  {
    slug: "max",
    name: "MAX",
    index: "05",
    discipline: "Assistive technology · software and hardware",
    state: "Physical proof required",
    stateTone: "red",
    title: "The software cannot prove that a person can find the real walker.",
    summary: "MAX is an assistive-technology project with a substantial software platform: PWA, pairing, gateway, offline behaviour, remote FIND and STOP, privacy and device control.",
    why: "The product crosses a physical boundary. Simulation and a green software suite cannot prove that a real walker, microphone, speaker and lights work for a person in their environment.",
    current: "Software capability is advancing. The actual Pi, walker and real-world FIND experience remain the defining reality check.",
    teaches: "Software proof and physical proof are different kinds of evidence.",
    remaining: "Build and qualify the real Pi and walker path with the actual microphone, speaker, lights and human use.",
    proofBoundary: "The supplied report explicitly leaves the physical product unproven."
  },
  {
    slug: "pirates",
    name: "Pirates",
    index: "06",
    discipline: "Game reconstruction · source archaeology",
    state: "Gate B locked",
    stateTone: "red",
    title: "Reconstruct the original game before asking the agents to invent another one.",
    summary: "Pirates is rebuilding Master of the Secret Sea from original source evidence. The work is deliberately parity-first.",
    why: "Generative systems are good at filling gaps. In a reconstruction, that instinct can quietly turn an unknown into a confident invention. The project has to know what the source proves and what it does not.",
    current: "Deep in archaeology and parity work. The original game must pass its gate before procedural or endless expansion begins.",
    teaches: "Sometimes the most intelligent agent action is to stop at the edge of the evidence.",
    remaining: "Complete the missing archaeology families and integrated parity before opening the expansion path.",
    proofBoundary: "Gate B remains locked in the supplied snapshot. No procedural fork is represented as approved."
  },
  {
    slug: "loftwahfm",
    name: "LoftwahFM",
    index: "07",
    discipline: "Music platform · listener and venue product",
    state: "Parked against the larger roadmap",
    stateTone: "quiet",
    title: "A mature listener product and an unfinished venue business can both be true.",
    summary: "LoftwahFM is already a substantial working music product. The larger business-music roadmap adds a second, broader product with venue reliability, control and operations still to build.",
    why: "One percentage would hide the distinction between the listener experience that exists and the more ambitious venue product that remains.",
    current: "The supplied report describes the expanded business-music roadmap as parked, with little recent application movement.",
    teaches: "A project can be useful today and still have a much larger unfinished ambition.",
    remaining: "Make an explicit decision to resume a bounded roadmap slice or keep the broader venue programme parked.",
    proofBoundary: "This snapshot separates the existing music product from the paused business-music roadmap."
  },
  {
    slug: "social-club",
    name: "Social Club",
    index: "08",
    discipline: "Hospitality · membership experience",
    state: "Parked",
    stateTone: "quiet",
    title: "The product works. The intended atmosphere has not arrived yet.",
    summary: "Social Club has a functional foundation for a private-club and hospitality experience.",
    why: "A working feature set cannot make up for an identity that has not yet been designed. The next meaningful move is a coherent premium visual direction.",
    current: "The larger visual redesign is parked in the supplied report.",
    teaches: "Product quality includes the feeling a coherent interface creates, not just the work its controls perform.",
    remaining: "Resume the premium private-club, hospitality and editorial design pass when the project is active again.",
    proofBoundary: "The current visual direction is not represented as the intended finished experience."
  }
];

export const bySlug = Object.fromEntries(projects.map((project) => [project.slug, project])) as Record<string, Project>;
