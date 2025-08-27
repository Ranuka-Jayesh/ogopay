<!-- =========================
      OgoPay – README (HTML)
     ========================= -->

<!-- Header -->
<div align="center">
  <h1>OgoPay 💸</h1>
  <p><em>Modern Digital Ledger for Personal Loans & Debts</em></p>

  <!-- Badges -->
  <p>
    <a href="LICENSE">
      <img alt="License" src="https://img.shields.io/badge/License-MIT-2ea44f.svg">
    </a>
    <a href="https://react.dev/" target="_blank">
      <img alt="React 18" src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=white">
    </a>
    <a href="https://supabase.com/" target="_blank">
      <img alt="Supabase" src="https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase&logoColor=white">
    </a>
    <a href="https://www.postgresql.org/" target="_blank">
      <img alt="PostgreSQL" src="https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white">
    </a>
  </p>

  <!-- Optional Banner -->
  <p>
    <img src="public/Neutral Beige Screen Creator Facebook Cover.png" alt="OgoPay Banner" width="940">
  </p>

  <!-- Quick Nav -->
  <p>
    <a href="#overview"><b>🚀 Overview</b></a> •
    <a href="#features"><b>✨ Features</b></a> •
    <a href="#tech"><b>🏗️ Tech</b></a> •
    <a href="#install"><b>⚙️ Install</b></a> •
    <a href="#env"><b>🔐 Env</b></a> •
    <a href="#screens"><b>📸 Screens</b></a> •
    <a href="#faq"><b>❓ FAQ</b></a> •
    <a href="#contrib"><b>🤝 Contribute</b></a>
  </p>
</div>

<hr>
<!-- Optional: Inline MP4 (GitHub supports) -->
<details>
  <summary><b>▶️ Play Inline (MP4)</b> — fallback/alternative</summary>
  <p>
    <video controls width="940">
      <source src="assets/ogopay-demo.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>
  </p>
</details>

<hr>

<!-- Overview -->
<h2 id="overview">🚀 Overview</h2>
<p>
  <b>OgoPay</b> is a full-stack web app that digitizes the classic <b>IOU</b> into a secure, transparent ledger for 
  <b>loans</b> and <b>repayments</b> among friends and family. It includes an Admin Dashboard for managing friends & transactions,
  and a Friend Dashboard with a unique tracking link + <kbd>4-digit PIN</kbd>.
</p>

<!-- Highlight Cards (table-based for GitHub) -->
<table>
  <tr>
    <td>
      <h3>👥 Friend Management</h3>
      Add, edit, archive, and message friends (WhatsApp stored).
    </td>
    <td>
      <h3>💳 Transactions</h3>
      Record loans/repayments with notes; export PDF slips.
    </td>
    <td>
      <h3>📊 Analytics</h3>
      Charts, totals, and outstanding balances in real time.
    </td>
  </tr>
  <tr>
    <td>
      <h3>🔐 Secure Access</h3>
      Supabase Auth, role-based access, 4-digit friend PIN.
    </td>
    <td>
      <h3>🌗 Theming</h3>
      Dark/Light mode + responsive design.
    </td>
    <td>
      <h3>💱 Multi-Currency</h3>
      Defaults to <b>LKR</b>, configurable per friend.
    </td>
  </tr>
</table>

<hr>

<!-- Features (collapsible deep-dive) -->
<h2 id="features">✨ Features</h2>

<ul>
  <li><b>Admin Dashboard:</b> friends, transactions, analytics, profile, exports</li>
  <li><b>Friend Dashboard:</b> personal overview, history, status indicators</li>
  <li><b>Unique Tracking:</b> per-friend URL + <kbd>PIN</kbd> for safe access</li>
  <li><b>PDF Exports:</b> transaction slips for records/sharing</li>
  <li><b>Responsive UI:</b> desktop/tablet/mobile</li>
</ul>

<details>
  <summary><b>🛡️ Security & Privacy</b></summary>
  <ul>
    <li>Supabase Auth (JWT), role-based access</li>
    <li>4-digit PIN protection for friend dashboards</li>
    <li>Row-level data isolation per admin</li>
    <li>HTTPS in production</li>
  </ul>
</details>

<details>
  <summary><b>🗄️ Database Schema</b></summary>
  <ul>
    <li><b>Users</b> — admin profiles & preferences</li>
    <li><b>Friends</b> — friend records, tracking URL, PIN, currency</li>
    <li><b>Transactions</b> — loan/repayment, amount, note, timestamps</li>
  </ul>
  <p><img src="YOUR_SCHEMA_IMAGE" alt="Database Schema" width="940"></p>
</details>

<hr>

<!-- Tech Stack -->
<h2 id="tech">🏗️ Tech Stack</h2>
<ul>
  <li><b>Frontend:</b> React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, Lucide</li>
  <li><b>Backend:</b> Supabase (Auth, Storage), PostgreSQL</li>
</ul>

<details>
  <summary><b>🧩 Architecture Diagram</b> (optional)</summary>
  <p><img src="YOUR_ARCHITECTURE_IMAGE" alt="System Architecture" width="940"></p>
</details>

<hr>

<!-- Install -->
<h2 id="install">⚙️ Installation</h2>

<p><b>Clone & Run</b></p>
<pre><code>git clone https://github.com/YOUR_USERNAME/OgoPay.git
cd OgoPay
npm install
npm run dev
</code></pre>

<details>
  <summary><b>🧰 Requirements</b></summary>
  <ul>
    <li>Node.js 18+</li>
    <li>npm or pnpm</li>
    <li>Supabase project (URL + anon/public key)</li>
  </ul>
</details>

<h3 id="env">🔐 Environment</h3>
<p>Create a <code>.env</code> (or <code>.env.local</code>) in the project root:</p>
<pre><code>VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
</code></pre>

<details>
  <summary><b>📦 Production Build</b></summary>
  <pre><code>npm run build
npm run preview</code></pre>
  <p>SPA routing supported (Netlify/Vercel). Include <code>_redirects</code> for Netlify if needed.</p>
</details>

<hr>

<!-- Usage -->
<h2 id="usage">🧭 Usage</h2>
<ol>
  <li>Sign up / Log in (Admin)</li>
  <li>Add friends (name, WhatsApp, currency)</li>
  <li>Share friend’s unique tracking URL + <kbd>4-digit PIN</kbd></li>
  <li>Record loans/repayments — watch live balance & analytics</li>
  <li>Export PDFs when needed</li>
</ol>

<details>
  <summary><b>💡 Tips</b></summary>
  <ul>
    <li>Use consistent currency per friend for clearer reporting.</li>
    <li>Keep notes on transactions to simplify audits later.</li>
    <li>Encourage friends to check their dashboard to avoid mismatches.</li>
  </ul>
</details>

<hr>

<!-- Roadmap (interactive checkboxes) -->
<h2 id="roadmap">🗺️ Roadmap</h2>
<ul>
  <li><input type="checkbox" disabled> Multi-language support</li>
  <li><input type="checkbox" disabled> Email reminders for due repayments</li>
  <li><input type="checkbox" disabled> Mobile app (React Native)</li>
  <li><input type="checkbox" disabled> Category tagging & filters</li>
  <li><input type="checkbox" disabled> CSV import/export</li>
</ul>

<hr>

<!-- FAQ (collapsible) -->
<h2 id="faq">❓ FAQ</h2>

<details>
  <summary><b>How do friends access their dashboard?</b></summary>
  <p>Each friend has a unique tracking URL + 4-digit PIN. Share both securely; they can view balances and history without full admin access.</p>
</details>

<details>
  <summary><b>Is my data isolated from other admins?</b></summary>
  <p>Yes. Row-level policies ensure admins can only see their own friends and transactions.</p>
</details>

<details>
  <summary><b>Which currencies are supported?</b></summary>
  <p>Multi-currency is supported. The default is <b>LKR</b> (Sri Lankan Rupees) but you can set others per friend.</p>
</details>

<hr>

<!-- Contributing -->
<h2 id="contrib">🤝 Contributing</h2>
<p>Contributions are welcome. Please open an issue to discuss significant changes and follow a standard PR workflow.</p>

<hr>

<!-- License -->
<h2 id="license">📜 License</h2>
<p>Released under the <a href="LICENSE">MIT License</a>.</p>

<hr>

<!-- Author -->
<h2 id="author">👨‍💻 Author</h2>
<p>
  Built with ❤️ by <a href="https://ogotechnology.net" target="_blank">Ogo Technology</a> • Sri Lanka 🇱🇰
</p>
