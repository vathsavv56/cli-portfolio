export type SectionId = "home" | "projects" | "writing" | "contact";

export interface Section {
  id: SectionId;
  label: string;
  shortLabel: string;
  key: string;
  description: string;
}

export const SECTIONS: Section[] = [
  {
    id: "home",
    label: "home",
    shortLabel: "home",
    key: "1",
    description: "About, featured work, and what I'm doing now",
  },
  {
    id: "projects",
    label: "projects",
    shortLabel: "work",
    key: "2",
    description: "Things I've built, the stack, and live links",
  },
  {
    id: "writing",
    label: "writing",
    shortLabel: "writing",
    key: "3",
    description: "Blog posts and essays on software, ideas, and living",
  },
  {
    id: "contact",
    label: "contact",
    shortLabel: "contact",
    key: "4",
    description: "Email, GitHub, X, LinkedIn, and the rest",
  },
];

export const PROFILE = {
  name: "Vathsav Inavolu",
  goesBy: "Vathsav",
  location: "Guntur, India",
  traits: ["Curious", "Relentless", "Driven"],
  email: "inavoluvathsav@gmail.com",
  availability: "Open to software engineering internships",
  education: "B.Tech Computer Science · Vignan University (2023–2027)",
  focus:
    "Frontend engineering, UI component systems, developer tools, and understanding how things work under the hood.",
  links: {
    portfolio: "https://vathsavv56.vercel.app/",
    github: "https://github.com/vathsavv56",
    x: "https://x.com/vathsavv56",
    linkedin: "https://www.linkedin.com/in/vathsavv56/",
    resumePdf:
      "https://raw.githubusercontent.com/vathsavv56/images-repo/main/resumeX.pdf",
    blog: "https://vathsavv56.vercel.app/blogs",
    blogMarkdownBase:
      "https://raw.githubusercontent.com/vathsavv56/images-repo/main",
    philosophy: "https://vathsavv56.vercel.app/philosophy",
    contextFile: "https://vathsavv56.vercel.app/vathsavv56.md",
    gmailCompose:
      "https://mail.google.com/mail/?view=cm&fs=1&to=inavoluvathsav%40gmail.com&su=Hello%20Vathsav",
  },
} as const;

export const ABOUT = {
  lead: "Hi, I'm Vathsav. I love building and learning new things, and I'm deeply curious about computers and how things work under the hood.",
  values:
    "I've been inspired by people who live with intention, and that shapes my own outlook on life: nothing is permanent, and every moment counts.",
  close:
    "So instead of coasting through life like an NPC, I choose to play it like the main character.",
  highlight: "nothing is permanent, and every moment counts",
};

export interface Project {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  highlights: string[];
  tags: string[];
  demo?: string;
  github?: string;
  year: string;
  featured: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: "kernui-v2",
    name: "kernUI-v2",
    subtitle: "UI component library",
    description:
      "A refined UI component library built with React, TypeScript and Tailwind CSS, with light and dark mode support throughout.",
    highlights: [
      "A lightweight React component library in TypeScript, styled with Tailwind CSS",
      "File explorer, button, footer, and an inspired-by section, ready to drop into a project",
      "Strict typing and a modular, composable architecture",
      "Deployed on Vercel with a live demo",
    ],
    tags: ["React", "TypeScript", "Tailwind CSS", "Vite", "Motion"],
    demo: "https://kern-v2-alpha.vercel.app/",
    year: "2026",
    featured: true,
  },
  {
    id: "api-client",
    name: "API Client",
    subtitle: "PIA · Postman-like API client",
    description:
      "A Postman-like API client for testing REST APIs with request history, collections, and response inspection. It runs entirely in the browser, with no backend or account.",
    highlights: [
      "A Postman-inspired HTTP client that runs entirely in the browser",
      "A reverse proxy bypasses CORS so requests can reach any API",
      "Zustand for state and Zod for validation",
      "Collections and requests persist on the local file system",
    ],
    tags: [
      "Bun",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "React Router",
      "Zustand",
      "Zod",
    ],
    demo: "https://pia-beta.vercel.app/",
    github: "https://github.com/vathsavv56/pia",
    year: "2026",
    featured: true,
  },
  {
    id: "react-loaders",
    name: "React-loaders",
    subtitle: "Loader collection",
    description:
      "A collection of clean, Apple-inspired loaders built with plain Tailwind CSS, using no extra dependencies.",
    highlights: [
      "Clean, Apple-inspired loaders",
      "Plain Tailwind CSS with zero extra dependencies",
      "Built with React and TypeScript",
    ],
    tags: ["React", "TypeScript", "Node.js", "Tailwind CSS"],
    demo: "https://react-hello-loaders.vercel.app/",
    github: "https://github.com/vathsavv56/React-HelloLoaders",
    year: "2026",
    featured: true,
  },
];

export interface Post {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  url: string;
  readingTime: string;
}

export const POSTS: Post[] = [
  {
    slug: "local-first-software",
    title: "Local First Software",
    summary:
      "Own your data: what local-first software is and how sync really works.",
    date: "Oct 06, 2026",
    tags: ["Local-First", "Distributed Systems", "Web"],
    url: "https://vathsavv56.vercel.app/blogs/local-first-software",
    readingTime: "6 min read",
  },
];

export interface Inspiration {
  name: string;
  source: string;
}

export const INSPIRATIONS: Inspiration[] = [
  { name: "Gapryong Kim", source: "Lookism" },
  { name: "Eren Yeager", source: "Attack on Titan" },
  { name: "Monkey D. Luffy", source: "One Piece" },
];

export const PHILOSOPHY = {
  title: "On Living Fully",
  intro:
    "A few honest thoughts on the things that changed how I see life. I hope some of it resonates with you too.",
  paragraphs: [
    "These three characters — and many more who were never real — shaped me more than I expected. I watch a lot of anime, and I keep gravitating toward people who simply refuse to give up. For a long time, I admired that trait without actually living it.",
    "A friend once insisted I watch One Piece. I put it off for months before finally giving in, and that's when I found Luffy — reckless, far from the sharpest person in the room, but endlessly ambitious and fiercely loyal. Watching him fight for the people he loves, again and again, without ever backing down, moved me in a way I didn't expect. It made me ask what it would mean to live even a fraction like that.",
    "Then there's Gapryong Kim from Lookism — someone with an almost romantic relationship with his own life, living it entirely on his own terms. It's easy to assume we're already doing the same. But are we, really? Are the things you're studying your choice? Are your daily decisions actually yours, or shaped by who's watching? I'm still working through this myself — I don't think I'm fully there yet, but I'm trying to live more honestly and openly every day.",
    "At some point, it hit me: if I died today, would I be happy with how I lived? This version of me — this body, this mind, this exact combination of experiences — will never exist again. Even if something similar is recreated, it won't be original. That thought unsettled me, because I already understood how rare it is to exist as a human at all. The Vedas describe roughly 8.4 million species — birds, animals, bacteria, and more we haven't even named. Against that scale, being born human is an extraordinary coincidence.",
    "The same day you call boring might be a miracle to someone else. Forget what others think of you, and forget it if they leave — nothing is permanent, as Sri Krishna said. The day you truly understand the value of your life — and start doing the work to make it good, the day you start loving what you do — is the day everything shifts. Life is short, but it feels long enough once you find that feeling.",
    "The epics — the Ramayana, the Mahabharata, and others — changed me too. Stories like Lord Rama's, the ideal of the perfect human, reshape how you see your own life once you really sit with them.",
    "Even after all of this, I'm still a work in progress. I want to live fully, take risks, and eventually die peacefully with no regrets. Holding on to that feeling — that sense of urgency and gratitude — is what I think will carry me through. There are still habits I want to break, and plenty I still want to build.",
  ],
  stats: [
    { value: "174,000", label: "people did not wake up today" },
    { value: "~50M", label: "people are fighting cancer" },
    { value: "300M", label: "cannot see color" },
    { value: "430M", label: "cannot hear" },
    { value: "2.6B", label: "have never used the internet" },
  ],
  closing:
    "If you made it this far, I'd love to hear your story too — what changed you?",
} as const;

export interface WritingEntry {
  id: string;
  kind: "post" | "essay";
  title: string;
  summary: string;
  meta: string;
  tags: string[];
  url: string;
  slug?: string;
}

export const WRITING_ENTRIES: WritingEntry[] = [
  ...POSTS.map(
    (post): WritingEntry => ({
      id: post.slug,
      kind: "post",
      title: post.title,
      summary: post.summary,
      meta: `${post.date}  ·  ${post.readingTime}`,
      tags: post.tags,
      url: post.url,
      slug: post.slug,
    }),
  ),
  {
    id: "on-living-fully",
    kind: "essay",
    title: PHILOSOPHY.title,
    summary: PHILOSOPHY.intro,
    meta: "philosophy, purpose, and living on your own terms",
    tags: ["Life", "Philosophy", "Intentional Living"],
    url: PROFILE.links.philosophy,
  },
];

export interface ContactLink {
  id: string;
  label: string;
  value: string;
  url: string;
  description: string;
}

export const CONTACT_LINKS: ContactLink[] = [
  {
    id: "email",
    label: "Email",
    value: PROFILE.email,
    url: PROFILE.links.gmailCompose,
    description: "Opens a pre-filled Gmail compose window",
  },
  {
    id: "github",
    label: "GitHub",
    value: "github.com/vathsavv56",
    url: PROFILE.links.github,
    description: "Code, experiments, and open source",
  },
  {
    id: "x",
    label: "X",
    value: "x.com/vathsavv56",
    url: PROFILE.links.x,
    description: "Short thoughts and things I'm learning",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/vathsavv56",
    url: PROFILE.links.linkedin,
    description: "The professional version of the story",
  },
  {
    id: "resume",
    label: "Resume",
    value: "resumeX.pdf",
    url: PROFILE.links.resumePdf,
    description: "The one-page PDF",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    value: "vathsavv56.vercel.app",
    url: PROFILE.links.portfolio,
    description: "The site this terminal is based on",
  },
  {
    id: "context",
    label: "Context",
    value: "vathsavv56.md",
    url: PROFILE.links.contextFile,
    description: "The public source of truth about me",
  },
];

export const INTERESTS = [
  "Building polished interfaces and reusable UI components",
  "Developer experience and developer tools",
  "How computers work under the hood",
  "First-principles thinking and data structures & algorithms",
  "Anime and stories about people who refuse to give up",
  "Philosophy, intentional living, and Indian epics",
];
