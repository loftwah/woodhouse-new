type FieldNote = {
  slug: string;
  kind: string;
  title: string;
  deck: string;
  date: string;
  dateISO: string;
  readingTime: string;
  lead: string;
  lesson: string;
};

export const fieldNotes: FieldNote[] = [
  {
    slug: "eight-finish-lines",
    kind: "Portfolio report",
    title: "Eight projects. Eight different finish lines.",
    deck: "A fresh review of the factory's eight projects separates what each can do from the evidence and decisions still needed.",
    date: "1 October 2026",
    dateISO: "2026-10-01",
    readingTime: "5 minute read",
    lead: "The most useful result was not a ranking. It was a clear boundary between what each project can do and what still needs proof.",
    lesson: "A portfolio has no single finish line. Each project's state belongs to its own evidence and review date."
  },
  {
    slug: "i-didnt-mean-to-build-a-software-factory",
    kind: "Founding essay",
    title: "I Didn't Mean to Build a Software Factory",
    deck: "A practical habit of composing tools grew into a system for directing software agents, checking their work and seeing what survived in the real world.",
    date: "28 September 2026",
    dateISO: "2026-09-28",
    readingTime: "6 minute read",
    lead: "The work began with making software. It grew into a system for deciding what the software had actually proved.",
    lesson: "The factory exists to make intent, work and evidence legible across products."
  },
  {
    slug: "the-tests-passed",
    kind: "Factory incident",
    title: "The tests passed. The game still looked wrong.",
    deck: "Fighter passed its geometry checks and still fell short of the product bar. The factory had measured whether the interface fitted. It had not measured whether the interface worked as a composition.",
    date: "28 September 2026",
    dateISO: "2026-09-28",
    readingTime: "6 minute read",
    lead: "The interface did what the tests could see. The tests could not see what the player felt.",
    lesson: "Geometry is evidence about geometry. Product judgement needs its own review."
  },
  {
    slug: "a-gate-for-what-the-source-proves",
    kind: "Field note",
    title: "Pirates is learning when not to invent.",
    deck: "The source reconstruction stays behind a parity gate until the original game is accounted for. Expansion waits for evidence.",
    date: "28 September 2026",
    dateISO: "2026-09-28",
    readingTime: "4 minute read",
    lead: "A generative system can produce a plausible answer to an unknown. Plausibility is not a recovered rule.",
    lesson: "An explicit locked gate makes uncertainty visible and keeps creativity out of the wrong phase."
  },
  {
    slug: "software-is-not-the-walker",
    kind: "Field note",
    title: "A green build cannot find the real walker.",
    deck: "MAX is a reminder that software qualification ends where physical use begins. The Pi, walker and person using FIND still have to meet in the real world.",
    date: "28 September 2026",
    dateISO: "2026-09-28",
    readingTime: "4 minute read",
    lead: "A complete simulation is still a simulation.",
    lesson: "Name the physical observation that remains. Do not borrow confidence from software tests."
  }
];

export const originStory = {
  title: "I didn't mean to build a software factory.",
  introduction: "I started by gluing websites together with plugins. The useful skill was knowing what did each job well and not rebuilding capability that already existed.",
  body: [
    "The tools changed. Plugins became APIs, cloud services, infrastructure, models, skills and agents. Platform engineering became a way to compose work. One coding agent became several.",
    "Then the agents worked across more than one product at a time. I needed a system to understand what had changed, what had survived review and what the software had actually proved.",
    "Woodhouse is that public record. The projects are real. The claims stay smaller than the evidence. The failures explain which factory controls came next."
  ],
  close: "I build systems that turn intent into shipped software, then build controls around whatever reality proves was wrong."
};
