class PageRouter {
  constructor(routerConfig, rootId = 'root', defaultRoute = 'home') {
    this.router = routerConfig;
    this.root = document.getElementById(rootId);
    this.loadedCss = [];
    this.loadedJs = [];

    // Standard-Route speichern
    this.defaultRoute = defaultRoute;

    this.params = new URLSearchParams(window.location.search);
    this.page = this.params.get('page');
    if (this.page === null) {
      this.params.append('page', defaultRoute);
      this.page = defaultRoute;
    }

    this.loadPageContent(this.page);
  }

  async loadPageContent(pageName) {
    if (!this.router[pageName]) {
      this.params.delete('page');
      this.params.append('page', this.defaultRoute);
      this.loadPageContent(this.defaultRoute);
      return;
    }

    const { templateHTML, templateJS, templateStyle } = this.router[pageName];

    try {
      // HTML laden
      const html = await (await fetch(templateHTML)).text();
      this.root.innerHTML = html;

      // CSS laden
      this.loadCss(templateStyle);

      // JS laden
      this.loadJs(templateJS);
    } catch (e) {
      console.error(e);
    }
  }

  loadCss(files) {
    // Entferne alte CSS
    this.loadedCss.forEach((css) => css.remove());
    this.loadedCss = [];

    if (files) {
      // Füge neue CSS hinzu
      files.forEach((file) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = file;
        document.head.appendChild(link);
        this.loadedCss.push(link);
      });
    } else {
      console.error('No css files could be loaded');
    }
  }

  loadJs(files) {
    // Entferne alte JS
    this.loadedJs.forEach((script) => script.remove());
    this.loadedJs = [];
    if (files) {
      // Füge neue JS hinzu
      files.forEach((file) => {
        const script = document.createElement('script');
        script.src = file;
        document.body.appendChild(script);
        this.loadedJs.push(script);
      });
    }
  }
}

// game1 ist die für die route ?page=game1 und
const routerConfig = {
  game1: {
    templateHTML: 'game1/game1.html',
    templateJS: ['game1/logic/main.js'],
    templateStyle: ['game1/game1.css'],
  },
  home: {
    templateHTML: 'pages/home/home.html',
    templateStyle: ['pages/home/home.css'],
  },
  // weitere Seiten...
};

const appRouter = new PageRouter(routerConfig);
