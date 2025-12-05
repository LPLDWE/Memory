export class MemoryNav extends HTMLElement {
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
      <li><a href="../../game2/game2.html">Quiz Champion</a></li>
      <li><a href="../../game1/game1.html">Treasure Hunt</a></li>
      </div>
    </ul>
  </nav>

  <style>
    .menu {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: var(--primary);
      padding: 20px 28px;        
      box-sizing: border-box;
      z-index: 1000;
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
      gap: 28px;                 
    }

    .memory-item {
      margin-right: auto;
    }

    .menu a {
      text-decoration: none;
      font-family: sans-serif;
      color: var(--bg);
      padding: 10px 14px;        
      font-size: 1.1rem;         
      border-radius: 8px;
      transition: 0.2s ease-in-out;
    }

    .menu a:hover {
      background: var(--primary-dark);
    }

    .menu .memory {
      font-family: 'Poppins', sans-serif;
      font-size: 1.6rem;         
      font-weight: 600;
      letter-spacing: 0.5px;
      color: var(--secondary);
    }
  </style>
`;
  }
}

customElements.define('navigation-bar', MemoryNav);
