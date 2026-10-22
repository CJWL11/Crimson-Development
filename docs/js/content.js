/*
  CRIMSON DEVELOPMENT — SITE CONTENT
  ---------------------------------
  This is the only file you need to edit to change the team, blog posts,
  projects and progress updates. Every page reads from here.

  Images: put the files in docs/images/ (e.g. docs/images/projects/skarvik/)
  and reference them relative to the docs folder, e.g.
    "images/projects/skarvik/cover.jpg"
  Leave an image field out (or empty) and a placeholder is shown instead.

  Text: separate paragraphs with a blank line ("\n\n").

  Order: put the NEWEST post / update FIRST in each list.
*/

window.CRIMSON = {
  team: [
    {
      name: "CJ",
      role: "Founder / Lead Developer",
      photo: "images/team/cj.png",
      summary: "Hi, my name is CJ. I am an avgeek and started CRIMSONDEV off our first project, Skarvik.", // shown on the home page
      bio: "Hi, my name is CJ. I am an avgeek and started CRIMSONDEV off our first project, Skarvik." // shown on the Team page
    },
    {
      name: "Aves",
      role: "Developer / Community Manager",
      photo: "images/team/aves.jpg",
      summary: "Playing BRM5 since around 2022. Likes RGE and makes props every once in a while.",
      bio: "I'm Aves. I've been playing BRM5 since around 2022, but really started LARPing hard around January 2026.\n\nI like RGE and also make props every once in a while. I met CJ in a faction, and that's where I've spent most of my time in RGE."
    },
    {
      name: "acrxvrxxx",
      role: "Developer",
      photo: "images/team/acrxvrxxx.jpg"
      // no bio yet: add summary + bio here when ready
    },
    {
      name: "Kartime",
      role: "Developer",
      photo: "images/team/kartime.jpg"
      // no bio yet: add summary + bio here when ready
    }
  ],

  posts: [
    {
      id: "website-development-begins", // used in links: blog.html#post-website-development-begins
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
      cover: "images/projects/skarvik/cover.jpg",
      summary: "A map based in a fictional, disputed area between Finland and Russia.",
      description: "Skarvik is a BRM5 RGE map set in a fictional, disputed area between Finland and Russia.",
      lore: "A fictional area of northern Finland, and a geopolitical nightmare. The Skarvik valley lies in territory disputed between the Russian Federation and Finland. Previously of little interest to either party, the citizens of Skarvik lived in relative peace, governed mostly by Finnish rules and regulations.\n\nFollowing an increase in tension in Eastern Europe, the Russian Federation laid claim to the area and dispatched a hired force known as the PoD, infamous for their work in Ronograd. Finland appealed to the UN, but the UN feigned ignorance, and so NATO authorised the deployment of a specialised task force: Task Force Adak. Their previous experience against the PoD and in winter combat made them the natural choice.\n\nAnd so the quiet battle for Skarvik began.",
      images: [
        { src: "images/projects/skarvik/cover.jpg", caption: "View across the Skarvik valley" },
        { src: "images/projects/skarvik/fob-overhead.jpg", caption: "The FOB from above" },
        { src: "images/projects/skarvik/fob-building.jpg", caption: "One of the FOB buildings" },
        { src: "images/projects/skarvik/forest-road.jpg", caption: "Forest road leading out from the checkpoint" },
        { src: "images/projects/skarvik/terrain-blockout.jpg", caption: "Terrain blockout (work in progress)" },
        { src: "images/projects/skarvik/high-ground.jpg", caption: "High ground rising above the forest" },
        { src: "images/projects/skarvik/treeline.jpg", caption: "Along the treeline" }
      ],
      updates: [
        {
          title: "FOB complete",
          date: "16 Oct 2026",
          body: "The Forward Operating Base is finished. Work now moves on to the basin directly below the FOB.",
          images: []
        },
        {
          title: "Project started",
          date: "14 Oct 2026",
          body: "Skarvik is now in development. Map layout and terrain work have begun.",
          images: []
        }
      ]
    },
    {
      id: "isola-veyra", // used in links: project.html?id=isola-veyra
      name: "Isola Veyra",
      status: "In development",
      cover: "images/projects/isola-veyra/cover.jpg",
      summary: "A tropical island in the Canary Islands area, home to a rich and corrupt CEO.",
      description: "Isola Veyra is a BRM5 RGE map set on a tropical island in the Canary Islands area.",
      lore: "Isola Veyra is home to a rich and corrupt CEO.",
      images: [
        { src: "images/projects/isola-veyra/cover.jpg", caption: "Blockout: the island and helipad" },
        { src: "images/projects/isola-veyra/from-above.jpg", caption: "Blockout: the island from above" },
        { src: "images/projects/isola-veyra/beach-cliffs.jpg", caption: "Blockout: beach and cliffs" },
        { src: "images/projects/isola-veyra/hills.jpg", caption: "Blockout: hills above the beach" },
        { src: "images/projects/isola-veyra/outline.jpg", caption: "First outline of the island" }
      ],
      updates: [
        {
          title: "Blockout under way",
          date: "22 Oct 2026",
          body: "Isola Veyra is now in development. The island's outline, beach, cliffs and helipad have been blocked out.",
          images: []
        }
      ]
    }
  ]
};
