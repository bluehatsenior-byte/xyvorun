import AirdropClaim from "@/components/AirdropClaim";
import XYVMissions from "@/components/XYVMissions";
import TokenDashboard from "@/components/TokenDashboard";
import WalletButton from "@/components/WalletButton";

const stats = [
  ["1B", "MAX SUPPLY"],
  ["50M", "AIRDROP ALLOCATION"],
  ["5%", "AIRDROP SHARE"],
  ["0%", "TRANSFER TAX"],
];

const tokenomics = [
  ["Ecosystem & Rewards", "25%", "250M XYV"],
  ["Treasury", "15%", "150M XYV"],
  ["Liquidity Reserve", "15%", "150M XYV"],
  ["Founders", "12%", "120M XYV"],
  ["Adgenius AI Ecosystem", "10%", "100M XYV"],
  ["Community & Marketing", "8%", "80M XYV"],
  ["Strategic Partners", "5%", "50M XYV"],
  ["Public / Community Launch", "5%", "50M XYV"],
  ["Airdrop", "5%", "50M XYV"],
];

const roadmap = [
  {
    phase: "PHASE 01",
    title: "FOUNDATION",
    items: [
      "Xyvorun brand launch",
      "XYV token architecture",
      "Community formation",
      "Adgenius AI integration",
    ],
  },
  {
    phase: "PHASE 02",
    title: "BUILD",
    items: [
      "BSC testnet deployment",
      "Smart contract testing",
      "Airdrop infrastructure",
      "Community campaigns",
    ],
  },
  {
    phase: "PHASE 03",
    title: "LAUNCH",
    items: [
      "Security review",
      "Mainnet deployment",
      "PancakeSwap liquidity",
      "Genesis airdrop",
    ],
  },
  {
    phase: "PHASE 04",
    title: "EXPAND",
    items: [
      "XYV rewards ecosystem",
      "Adgenius AI growth",
      "Strategic partnerships",
      "Global community expansion",
    ],
  },
];

export default function Home() {
  return (
    <main>
      {/* NAVIGATION */}
      <nav className="nav">
        <a href="#" className="brand">
          <img
            src="/brand/xyv-logo.svg"
            alt="Xyvorun"
            className="brand-logo"
          />
          <span>XYVORUN</span>
        </a>

        <div className="nav-links">
          <a href="#ecosystem">Ecosystem</a>
          <a href="#tokenomics">Tokenomics</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#airdrop">Airdrop</a>
        </div>

        <WalletButton />
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow glow-one" />
        <div className="hero-glow glow-two" />

        <div className="hero-content">
          <div className="eyebrow">
            <span className="status-dot" />
            BNB SMART CHAIN • XYV
          </div>

          <h1>
            THE NEXT
            <br />
            <span>DIGITAL</span>
            <br />
            ECONOMY.
          </h1>

          <p className="hero-text">
            Xyvorun is building a utility-focused digital ecosystem connecting
            AI, Web3 and community-powered growth through XYV.
          </p>

          <div className="hero-actions">
            <a href="#airdrop" className="primary-button">
              CHECK AIRDROP <span>→</span>
            </a>

            <a href="#tokenomics" className="secondary-button">
              EXPLORE XYV
            </a>
          </div>

          <div className="hero-note">
            <span>✦</span>
            Built for the next generation of Web3 users
          </div>
        </div>

        <div className="coin-orbit">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />

          <div className="token-coin">
            <div className="coin-inner">
              <div className="coin-symbol">X</div>
              <div className="coin-name">XYV</div>
            </div>
          </div>

          <div className="floating-card card-top">
            <small>MAX SUPPLY</small>
            <strong>1,000,000,000</strong>
          </div>

          <div className="floating-card card-bottom">
            <small>NETWORK</small>
            <strong>BNB CHAIN</strong>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map(([value, label]) => (
            <div className="stat-card" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AIRDROP */}
      <section className="airdrop-section" id="airdrop">
        <div className="section-label">01 / COMMUNITY</div>

        <div className="airdrop-grid">
          <div>
            <p className="mini-title">THE XYV COMMUNITY AIRDROP</p>

            <h2>
              EARN XYV BY
              <br />
              BEING PART
              <br />
              OF <span>XYVORUN.</span>
            </h2>
          </div>

          <div className="airdrop-copy">
            <p>
              A dedicated allocation of XYV is reserved for community growth,
              early participation, ecosystem activity and future campaigns.
            </p>

            <div className="airdrop-number">
              <strong>50,000,000</strong>
              <span>XYV COMMUNITY ALLOCATION</span>
            </div>

            <AirdropClaim />
      <XYVMissions />
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="ecosystem-section" id="ecosystem">
        <div className="section-label">02 / ECOSYSTEM</div>

        <div className="section-heading">
          <div>
            <p className="mini-title">ONE ECOSYSTEM</p>

            <h2>
              BUILT TO
              <br />
              <span>EVOLVE.</span>
            </h2>
          </div>

          <p>
            Xyvorun brings together AI-powered products, Web3 infrastructure
            and community participation into a single expanding ecosystem.
          </p>
        </div>

        <div className="ecosystem-grid">
          <div className="eco-card eco-large">
            <div className="eco-icon">AI</div>
            <span>01</span>
            <h3>ADGENIUS AI</h3>
            <p>
              AI-powered advertising technology designed to help businesses
              create, optimize and scale digital campaigns.
            </p>
            <div className="card-arrow">→</div>
          </div>

          <div className="eco-card">
            <div className="eco-icon">XY</div>
            <span>02</span>
            <h3>XYV REWARDS</h3>
            <p>
              Community participation and ecosystem activities can be connected
              to predefined XYV reward programs.
            </p>
            <div className="card-arrow">→</div>
          </div>

          <div className="eco-card">
            <div className="eco-icon">✦</div>
            <span>03</span>
            <h3>WEB3 INFRASTRUCTURE</h3>
            <p>
              Built around BNB Smart Chain with transparent token mechanics and
              community-oriented distribution.
            </p>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </section>

      {/* TOKENOMICS */}
      <section className="tokenomics-section" id="tokenomics">
        <div className="section-label">03 / TOKENOMICS</div>

        <div className="section-heading">
          <div>
            <p className="mini-title">XYV TOKEN</p>

            <h2>
              SIMPLE.
              <br />
              <span>TRANSPARENT.</span>
            </h2>
          </div>

          <p>
            XYV is designed with a fixed maximum supply and no post-deployment
            minting. The core token has 0% transfer tax.
          </p>
        </div>

        <div className="tokenomics-layout">
          <div className="supply-card">
            <div className="supply-ring">
              <div>
                <strong>1B</strong>
                <span>XYV</span>
              </div>
            </div>

            <p>MAXIMUM SUPPLY</p>

            <div className="supply-details">
              <div>
                <span>Decimals</span>
                <strong>18</strong>
              </div>

              <div>
                <span>Tax</span>
                <strong>0%</strong>
              </div>

              <div>
                <span>Chain</span>
                <strong>BSC</strong>
              </div>
            </div>
          </div>

          <div className="allocation-list">
            {tokenomics.map(([name, percent, amount]) => (
              <div className="allocation-row" key={name}>
                <div>
                  <span>{name}</span>
                  <small>{amount}</small>
                </div>

                <strong>{percent}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="roadmap-section" id="roadmap">
        <div className="section-label">04 / ROADMAP</div>

        <div className="section-heading">
          <div>
            <p className="mini-title">THE JOURNEY</p>

            <h2>
              FROM
              <br />
              <span>VISION</span> TO
              <br />
              ECOSYSTEM.
            </h2>
          </div>

          <p>
            Xyvorun&apos;s development is structured around progressive
            technology, community and ecosystem milestones.
          </p>
        </div>

        <div className="roadmap-grid">
          {roadmap.map((item) => (
            <div className="roadmap-card" key={item.phase}>
              <div className="phase">{item.phase}</div>

              <h3>{item.title}</h3>

              <ul>
                {item.items.map((entry) => (
                  <li key={entry}>
                    <span>✦</span>
                    {entry}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-section">
        <div className="final-glow" />

        <p className="mini-title">WELCOME TO XYVORUN</p>

        <h2>
          THE FUTURE
          <br />
          IS <span>BUILT.</span>
        </h2>

        <p>
          Follow the ecosystem as Xyvorun moves from foundation to a growing AI
          and Web3 economy.
        </p>

        <div className="hero-actions">
          <a href="#airdrop" className="primary-button">
            JOIN THE COMMUNITY <span>→</span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-disclaimer">
          XYV is a utility token within the Xyvorun ecosystem. The information
          on this website is for informational purposes only and does not
          constitute financial, investment, legal or tax advice. Token
          availability, functionality and ecosystem features may change as
          development progresses.
        </div>

        <div className="footer-brand">
          <img
            src="/brand/xyv-logo.svg"
            alt="Xyvorun"
            className="brand-logo"
          />

          <div>
            <strong>XYVORUN</strong>
            <small>THE DIGITAL ECONOMY</small>
          </div>
        </div>

        <div className="footer-links">
          <a href="#ecosystem">Ecosystem</a>
          <a href="#tokenomics">Tokenomics</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#airdrop">Airdrop</a>
        </div>

        <p>© 2026 Xyvorun Tech. All rights reserved.</p>
      </footer></main>
  );
}





<XYVMissions />

