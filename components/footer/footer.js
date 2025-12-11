class Footer extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <footer>
        <div class="container">
          <a class="impressum" href="impressum.html">Impressum</a>
        </div>
      </footer>

      <style>
        footer {
          width: 100%;
          background-color: var(--primary);
          padding: 20px;
          box-sizing: border-box;
          font-family: sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .container {
          width: 100%;
          max-width: 100px;
          display: flex;
          justify-content: center;     
          align-items: center;
        }

        .impressum {
          font-size: 1.3rem;           
          font-weight: 600;
          color: var(--secondary);
          text-decoration: none;
          padding: 10px 16px;
          border-radius: 8px;
          transition: 0.2s ease;
        }

        .impressum:hover {
          background: var(--primary-dark);
        }
      </style>
    `;
  }
}

customElements.define('my-footer', Footer);
