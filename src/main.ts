const ACCESS_CODE: string = "crimsondev"; // Change this

interface BlogPost {
  title: string;
  date: string;
  body: string;
}

const manageButton = document.getElementById("manageButton") as HTMLButtonElement;
const manageSection = document.getElementById("manage") as HTMLElement;
const loginBox = document.getElementById("loginBox") as HTMLElement;
const editorBox = document.getElementById("editorBox") as HTMLElement;
const loginButton = document.getElementById("loginButton") as HTMLButtonElement;
const logoutButton = document.getElementById("logoutButton") as HTMLButtonElement;
const loginError = document.getElementById("loginError") as HTMLElement;
const accessCodeInput = document.getElementById("accessCode") as HTMLInputElement;

const createPostButton = document.getElementById("createPost") as HTMLButtonElement;
const postTitle = document.getElementById("postTitle") as HTMLInputElement;
const postDate = document.getElementById("postDate") as HTMLInputElement;
const postBody = document.getElementById("postBody") as HTMLTextAreaElement;

const latestPosts = document.getElementById("latestPosts") as HTMLElement;
const allPosts = document.getElementById("allPosts") as HTMLElement;
const allPostsList = document.getElementById("allPostsList") as HTMLElement;
const toggleBlogButton = document.getElementById("toggleBlog") as HTMLButtonElement;

const allProjects = document.getElementById("allProjects") as HTMLElement;
const toggleProjectsButton = document.getElementById("toggleProjects") as HTMLButtonElement;

function getSavedPosts(): BlogPost[] {
  const stored = localStorage.getItem("crimsonPosts");
  return stored ? (JSON.parse(stored) as BlogPost[]) : [];
}

function savePosts(posts: BlogPost[]): void {
  localStorage.setItem("crimsonPosts", JSON.stringify(posts));
}

function renderPosts(): void {
  const posts = getSavedPosts();
  allPostsList.innerHTML = "";

  for (const post of posts) {
    const article = document.createElement("article");
    article.className = "post";

    const date = document.createElement("p");
    date.className = "date";
    date.textContent = post.date;

    const title = document.createElement("h3");
    title.textContent = post.title;

    const body = document.createElement("p");
    body.textContent = post.body;

    article.append(date, title, body);
    allPostsList.appendChild(article);
  }
}

manageButton.addEventListener("click", () => {
  manageSection.classList.toggle("hidden");
});

loginButton.addEventListener("click", () => {
  if (accessCodeInput.value === ACCESS_CODE) {
    loginBox.classList.add("hidden");
    editorBox.classList.remove("hidden");
    loginError.classList.add("hidden");
  } else {
    loginError.classList.remove("hidden");
  }
});

logoutButton.addEventListener("click", () => {
  editorBox.classList.add("hidden");
  loginBox.classList.remove("hidden");
  accessCodeInput.value = "";
});

createPostButton.addEventListener("click", () => {
  if (!postTitle.value || !postBody.value) return;

  const posts = getSavedPosts();
  posts.unshift({
    title: postTitle.value,
    date: postDate.value || "No date",
    body: postBody.value
  });

  savePosts(posts);
  renderPosts();

  postTitle.value = "";
  postDate.value = "";
  postBody.value = "";
});

toggleBlogButton.addEventListener("click", () => {
  allPosts.classList.toggle("hidden");
  toggleBlogButton.textContent = allPosts.classList.contains("hidden")
    ? "View all posts"
    : "Hide all posts";
});

toggleProjectsButton.addEventListener("click", () => {
  allProjects.classList.toggle("hidden");
  toggleProjectsButton.textContent = allProjects.classList.contains("hidden")
    ? "View all projects"
    : "Hide all projects";
});

renderPosts();