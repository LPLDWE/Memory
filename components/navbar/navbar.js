class MemoryNav extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
        <nav class="menu">
          <ul>
            <li class="memory-item">
              <a class="memory" href="../../index.html">Memory</a>
            </li>

            <div class="left-links">
              <li><a href="../../game1/game1.html">Spiel 1</a></li>
              <li><a href="../../game2/game2.html">Spiel 2</a></li>
            </div>
          </ul>
        </nav>

        <style>
          .menu {
            width: 100%;
            background: #444bbd;
            padding: 12px 20px;
            box-sizing: border-box;
          }

          .menu ul {
            list-style: none;
            display: flex;
            align-items: center;
            margin: 0;
            padding: 0;
            width: 100%;
          }

          .left-links {
            display: flex;
            gap: 20px;
          }

          .memory-item {
            margin-right: auto;
          }

          .menu a {
            text-decoration: none;
            font-family: sans-serif;
            color: #fff;
            padding: 6px 10px;
            border-radius: 6px;
            transition: 0.2s ease-in-out;
          }

          .menu a:hover {
            text-decoration: underline;
          }

          .menu .memory {
            font-family: 'Poppins', sans-serif;
            font-size: 1.2rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            color: #68aff5;
          }
        </style>
      `;
  }
}

customElements.define('memory-nav', MemoryNav);
