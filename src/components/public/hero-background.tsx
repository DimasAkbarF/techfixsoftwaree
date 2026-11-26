export function HeroBackground() {
  return (
    <div aria-hidden="true" className="hero-bg">
      <div className="hero-bg__gradient" />
      <svg
        className="hero-bg__waves"
        viewBox="0 0 1456 819"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.06" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d="M0 332C50 270 100 232 170 218C240 205 280 185 315 140C350 95 395 40 445 0L0 0Z"
          fill="rgba(6,52,46,.34)"
          stroke="rgba(255,255,255,.07)"
        />
        <path d="M0 160L78 72" stroke="rgba(255,255,255,.05)" fill="none" />
        <path
          d="M1456 440C1400 505 1340 560 1250 590C1170 620 1100 660 1040 725C1000 770 965 800 940 819L1456 819Z"
          fill="url(#wl)"
          stroke="rgba(255,255,255,.3)"
          strokeWidth="1.2"
        />
        <path
          d="M1456 590C1410 640 1360 680 1300 695C1240 710 1200 740 1175 780C1165 795 1158 808 1150 819L1456 819Z"
          fill="url(#wl)"
          stroke="rgba(255,255,255,.35)"
          strokeWidth="1.2"
        />
      </svg>
      <div className="hero-bg__grid-light" />
      <div className="hero-bg__grid-dark" />
    </div>
  );
}
