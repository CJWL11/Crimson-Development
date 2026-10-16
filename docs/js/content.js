/*
  CRIMSON DEVELOPMENT — SITE CONTENT
  ---------------------------------
  This is the only file you need to edit to add blog posts, projects and
  progress updates. Every page (home, blog, projects, project pages) reads
  from here.

  Images: put the files in docs/images/ (e.g. docs/images/projects/skarvik/)
  and reference them relative to the docs folder, e.g.
    "images/projects/skarvik/cover.jpg"
  Leave an image field out (or empty) and a placeholder is shown instead.

  Text: separate paragraphs with a blank line ("\n\n").

  Order: put the NEWEST post / update FIRST in each list.
*/

window.CRIMSON = {
  posts: [
    {
      id: "website-development-begins", // used in links: blog.html#website-development-begins
      title: "Website development begins",
      date: "14 Oct 2026",
      summary: "The Crimson Development website is now in development, with the homepage, team section and project hub being built first.",
      body: "The Crimson Development website is now in development, with the homepage, team section and project hub being built first.\n\nNext up are the full dev blog, project pages with progress updates, and the Trading Hub.",
      images: [
        // { src: "images/blog/website-homepage.jpg", caption: "First look at the homepage" }
      ]
    },
    {
      id: "trading-hub-planning",
      title: "Trading Hub planning",
      date: "Coming soon",
      summary: "We are planning the user-to-user trading system and the tools that will support it.",
      body: "We are planning the user-to-user trading system and the tools that will support it.",
      images: []
    },
    {
      id: "brm5-rge-map-progress",
      title: "BRM5 RGE map progress",
      date: "Coming soon",
      summary: "Map design, layout testing and environment development are underway.",
      body: "Map design, layout testing and environment development are underway.",
      images: []
    }
  ],

  projects: [
    {
      id: "skarvik", // used in links: project.html?id=skarvik
      name: "Skarvik",
      status: "In development",
      cover: "", // e.g. "images/projects/skarvik/cover.jpg"
      summary: "A map based in a fictional, disputed area between Finland and Russia.",
      description: "Skarvik is a BRM5 RGE map set in a fictional, disputed area between Finland and Russia.",
      lore: "Add the story and background of Skarvik here.",
      images: [
        // { src: "images/projects/skarvik/screenshot-1.jpg", caption: "Northern ridge" }
      ],
      updates: [
        {
          title: "Project started",
          date: "14 Oct 2026",
          body: "Skarvik is now in development. Map layout and terrain work have begun.",
          images: []
        }
      ]
    }
  ]
};
