(() => {
  const content = window.PROFILE_CONTENT;

  if (!content) {
    return;
  }

  const setTextContent = () => {
    document.querySelectorAll("[data-content]").forEach((element) => {
      const key = element.dataset.content;
      if (content[key]) {
        element.textContent = content[key];
      }
    });
  };

  const makeLink = ({ label, href }, className = "") => {
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.textContent = label;
    anchor.className = className;

    if (href.startsWith("http")) {
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.setAttribute("aria-label", `${label} (opens in a new tab)`);
    }

    return anchor;
  };

  const renderFacts = () => {
    const container = document.querySelector("#profile-facts");
    content.facts.forEach(({ label, value }) => {
      const group = document.createElement("div");
      const term = document.createElement("dt");
      const definition = document.createElement("dd");
      term.textContent = label;
      definition.textContent = value;
      group.append(term, definition);
      container.append(group);
    });
  };

  const renderLinks = (selector, links, className) => {
    const container = document.querySelector(selector);
    links.forEach((link) => container.append(makeLink(link, className)));
  };

  const renderThemes = () => {
    const container = document.querySelector("#research-themes");
    content.researchThemes.forEach(({ number, title, description }) => {
      const article = document.createElement("article");
      const index = document.createElement("p");
      const heading = document.createElement("h3");
      const body = document.createElement("p");
      article.className = "theme";
      index.className = "theme-number";
      index.textContent = number;
      heading.textContent = title;
      body.textContent = description;
      article.append(index, heading, body);
      container.append(article);
    });
  };

  const renderProjects = () => {
    const container = document.querySelector("#projects");
    content.projects.forEach(({ type, year, title, description, methods, href }) => {
      const article = document.createElement("article");
      const meta = document.createElement("div");
      const typeLabel = document.createElement("p");
      const yearLabel = document.createElement("p");
      const body = document.createElement("div");
      const heading = document.createElement("h3");
      const descriptionNode = document.createElement("p");
      const tags = document.createElement("ul");
      const link = href
        ? makeLink({ label: "View project", href }, "project-link")
        : null;

      article.className = "project";
      meta.className = "project-meta";
      typeLabel.textContent = type;
      yearLabel.textContent = year;
      body.className = "project-body";
      heading.textContent = title;
      descriptionNode.textContent = description;
      tags.className = "method-tags";
      tags.setAttribute("aria-label", `${title} methods`);

      methods.forEach((method) => {
        const item = document.createElement("li");
        item.textContent = method;
        tags.append(item);
      });

      meta.append(typeLabel, yearLabel);
      body.append(heading, descriptionNode, tags);
      article.append(meta, body);
      if (link) {
        article.append(link);
      }
      container.append(article);
    });
  };

  const renderPublications = () => {
    const container = document.querySelector("#publications-list");
    content.publications.forEach(({ status, title, authors, venue, href }) => {
      const article = document.createElement("article");
      const statusNode = document.createElement("p");
      const body = document.createElement("div");
      const heading = document.createElement("h3");
      const citation = document.createElement("p");

      article.className = "publication";
      statusNode.className = "publication-status";
      statusNode.textContent = status;
      body.className = "publication-body";
      heading.textContent = title;
      citation.textContent = `${authors} ${venue}`;
      body.append(heading, citation);
      article.append(statusNode, body);

      if (href) {
        article.append(makeLink({ label: "Source", href }, "project-link"));
      }

      container.append(article);
    });
  };

  const renderMethods = () => {
    const container = document.querySelector("#methods");
    content.methods.forEach(({ title, text }) => {
      const article = document.createElement("article");
      const heading = document.createElement("h3");
      const body = document.createElement("p");
      heading.textContent = title;
      body.textContent = text;
      article.append(heading, body);
      container.append(article);
    });
  };

  const renderQuestions = () => {
    const container = document.querySelector("#questions");
    content.questions.forEach((question) => {
      const item = document.createElement("li");
      item.textContent = question;
      container.append(item);
    });
  };

  const renderPresentations = () => {
    const container = document.querySelector("#presentations-list");
    content.presentations.forEach(({ year, type, title }) => {
      const article = document.createElement("article");
      const yearNode = document.createElement("p");
      const body = document.createElement("div");
      const typeNode = document.createElement("p");
      const heading = document.createElement("h3");

      article.className = "presentation";
      yearNode.className = "presentation-year";
      yearNode.textContent = year;
      typeNode.className = "presentation-type";
      typeNode.textContent = type;
      heading.textContent = title;
      body.append(typeNode, heading);
      article.append(yearNode, body);
      container.append(article);
    });
  };

  setTextContent();
  renderFacts();
  renderLinks("#hero-links", content.links, "text-link");
  renderThemes();
  renderPublications();
  renderProjects();
  renderMethods();
  renderPresentations();
  renderQuestions();
  renderLinks("#contact-links", content.contactLinks, "contact-link");
  document.querySelector("#current-year").textContent = new Date().getFullYear();
})();
