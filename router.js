class PageRouter {
  constructor(routerConfig, rootId = 'root', defaultRoute = 'home') {
    this.router = routerConfig;
    this.root = document.getElementById(rootId);
    this.loadedCss = [];
    this.loadedJs = [];

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
      navigate(this.defaultRoute);
      return;
    }

    const { templateHTML, templateJS, templateStyle } = this.router[pageName];

    try {
      // HTML laden
      if (typeof templateHTML === 'string' && templateHTML.endsWith('.html')) {
        const html = await (await fetch(templateHTML)).text();

        // Nur inneres HTML laden da wir css und javascript schon anderes mitladen
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        this.root.innerHTML = doc.body.innerHTML;

        // CSS laden
        this.loadCss(templateStyle);

        // JS laden
        this.loadJs(templateJS);
      } else {
        console.error(
          'The templateHTML you set is not a filepath nor html file'
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  navigate(route) {
    this.params.set('page', route);

    // Lade die Standard-Seite
    this.loadPageContent(route);
  }

  loadCss(files) {
    // Alte CSS entfernen
    this.loadedCss.forEach((css) => css.remove());
    this.loadedCss = [];

    if (!files || !Array.isArray(files) || files.length === 0) {
      console.warn('No CSS files provided to load.');
      return;
    }

    files.forEach((file) => {
      if (typeof file !== 'string') {
        console.warn(`Skipped loading CSS because it is not a string:`, file);
        return;
      }

      if (!file.endsWith('.css')) {
        console.warn(
          `Skipped loading file because it does not end with ".css": ${file}`
        );
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = file;
      document.head.appendChild(link);
      this.loadedCss.push(link);
    });
  }

  loadJs(files) {
    // Alte JS entfernen
    this.loadedJs.forEach((script) => script.remove());
    this.loadedJs = [];

    if (!files || !Array.isArray(files) || files.length === 0) {
      console.warn('No JS files provided to load.');
      return;
    }

    files.forEach((file) => {
      if (typeof file !== 'string') {
        console.warn(`Skipped loading JS because it is not a string:`, file);
        return;
      }

      if (!file.endsWith('.js')) {
        console.warn(
          `Skipped loading file because it does not end with ".js": ${file}`
        );
        return;
      }

      const script = document.createElement('script');
      script.src = file;
      // jenachdem könnte es zu fehler kommen wegen wenn variablen global deklariert
      // weil die variablen dann schon vom browser gespeichert wurden und nicht nochmal deklariert
      // deshalb benutzen wir iife um das zu verhindern
      // TODO: ABER WIR BRAUCHEN NOCH EINE BESSERE LÖSUNG DAFÜR!!!!
      document.body.appendChild(script);

      this.loadedJs.push(script);
    });
  }
}

// game1 ist die für die route ?page=game1 und
const routerConfig = {
  game2: {
    templateHTML: 'pages/game2/game2.html',
    templateJS: ['pages/game2/scripts/game2.js'],
    templateStyle: ['pages/game2/styles/game2.css'],
  },
  game1: {
    templateHTML: 'pages/game1/game1.html',
    templateJS: ['pages/game1/logic/main.js'],
    templateStyle: ['pages/game1/game1.css'],
  },
  home: {
    templateHTML: 'pages/home/home.html',
    templateStyle: ['pages/home/home.css'],
  },
};

const appRouter = new PageRouter(routerConfig);
