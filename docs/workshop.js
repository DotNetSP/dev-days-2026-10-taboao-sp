const lessons = [...document.querySelectorAll(".lesson")];
const status = document.getElementById("interaction-status");
const navigation = [...document.querySelectorAll("[data-lesson-link]")];
const theme = document.getElementById("theme");
const search = document.getElementById("search");
const searchResults = document.getElementById("search-results");
let activeLesson;

function showLesson(focus = false) {
  let target;
  try {
    target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  } catch (error) {
    if (!(error instanceof URIError)) throw error;
    status.textContent = "Endereço de etapa inválido. Exibindo a visão geral.";
  }
  const lesson = target?.closest(".lesson")
    || (target?.id === "conteudo" ? activeLesson : null)
    || lessons[0];
  lessons.forEach((item) => { item.hidden = item !== lesson; });
  navigation.forEach((link) => {
    if (link.hash === `#${lesson.id}`) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const index = lessons.indexOf(lesson);
  const heading = lesson.querySelector("h1");
  document.title = `${heading.textContent} | Dev Days Workshops`;
  document.getElementById("breadcrumb-track").textContent = lesson.dataset.track || "Primeiros passos";
  document.getElementById("breadcrumb-lesson").textContent = lesson.dataset.title;
  const toc = document.getElementById("page-toc");
  toc.replaceChildren();
  lesson.querySelectorAll("h2[id]").forEach((item) => {
    const link = document.createElement("a");
    link.href = `#${item.id}`;
    link.textContent = item.textContent;
    toc.append(link);
  });
  const previous = document.getElementById("previous");
  const next = document.getElementById("next");
  previous.hidden = index === 0;
  next.hidden = index === lessons.length - 1;
  for (const [link, offset, label] of [[previous, -1, "Anterior"], [next, 1, "Próxima"]]) {
    const adjacent = lessons[index + offset];
    if (!adjacent) continue;
    link.href = `#${adjacent.id}`;
    link.replaceChildren();
    const small = document.createElement("small");
    small.textContent = label;
    link.append(small, document.createTextNode(adjacent.dataset.title));
  }
  if (activeLesson !== lesson) {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (focus) heading.focus({ preventScroll: true });
  }
  if (target && target !== lesson) target.scrollIntoView({ block: "start" });
  activeLesson = lesson;
  document.getElementById("mobile-menu").open = false;
}
window.addEventListener("hashchange", () => showLesson(true));
showLesson();

document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.closest(".prompt").querySelector("code");
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(code.textContent.trim());
      button.textContent = "Copiado!";
      status.textContent = "Texto copiado para a área de transferência.";
      setTimeout(() => { button.textContent = "Copiar"; }, 2000);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = "Use Ctrl/⌘+C";
      status.textContent = "Não foi possível copiar automaticamente. Texto selecionado: use Ctrl+C ou Command+C para copiar.";
    }
  });
});

theme.addEventListener("change", () => {
  if (theme.value === "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme.value;
});
function updateProgress() {
  for (const track of ["app", "cli"]) {
    const completed = document.querySelectorAll(`[data-checkpoint="${track}"]:checked`).length;
    document.getElementById(`${track}-progress`).textContent = `${completed}/5 concluídas`;
  }
}
document.querySelectorAll(".checkpoint input").forEach((input) => {
  input.addEventListener("change", updateProgress);
});
updateProgress();

search.addEventListener("input", () => {
  searchResults.replaceChildren();
  const query = search.value.trim().toLocaleLowerCase("pt-BR");
  searchResults.hidden = !query;
  if (!query) return;
  const matches = lessons.filter((lesson) => lesson.textContent.toLocaleLowerCase("pt-BR").includes(query));
  for (const lesson of matches) {
    const link = document.createElement("a");
    link.href = `#${lesson.id}`;
    link.textContent = `${lesson.dataset.track || "Workshop"} · ${lesson.dataset.title}`;
    link.addEventListener("click", () => {
      searchResults.hidden = true;
      search.value = "";
    });
    searchResults.append(link);
  }
  if (!matches.length) {
    const message = document.createElement("p");
    message.textContent = "Nenhuma lição encontrada.";
    searchResults.append(message);
  }
  status.textContent = `${matches.length} lições encontradas.`;
});
search.addEventListener("keydown", (event) => {
  if (event.key === "Escape") searchResults.hidden = true;
  if (event.key === "ArrowDown") {
    const first = searchResults.querySelector("a");
    if (first && !searchResults.hidden) { event.preventDefault(); first.focus(); }
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".search")) searchResults.hidden = true;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !searchResults.hidden) {
    searchResults.hidden = true;
    search.focus();
  }
});
