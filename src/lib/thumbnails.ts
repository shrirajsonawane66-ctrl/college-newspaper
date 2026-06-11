export function getArticleThumbnail(articleId: string): string {
  const thumbnails: Record<string, string> = {
    "1": autonomousSvg,
    "2": dataScienceSvg,
    "3": topRankSvg,
    "4": culturalFestSvg,
    "5": hackathonSvg,
  };
  return thumbnails[articleId] || genericSvg;
}

const toDataUri = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

const autonomousSvg = toDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#f2ede4"/>
    <rect x="180" y="70" width="440" height="310" rx="8" fill="none" stroke="#8b6f4e" stroke-width="2"/>
    <rect x="200" y="90" width="400" height="270" rx="4" fill="none" stroke="#d4c9b8" stroke-width="1"/>
    <path d="M320 60 L400 40 L480 60" fill="none" stroke="#a67c3e" stroke-width="2.5"/>
    <rect x="340" y="55" width="120" height="30" rx="15" fill="#a67c3e"/>
    <text x="400" y="75" font-family="Georgia, serif" font-size="11" fill="#f2ede4" text-anchor="middle" font-weight="bold">AUTONOMOUS</text>
    <text x="400" y="175" font-family="Georgia, serif" font-size="22" fill="#1c1512" text-anchor="middle" font-weight="bold">Campus</text>
    <text x="400" y="205" font-family="Georgia, serif" font-size="14" fill="#3a3028" text-anchor="middle">A New Era of</text>
    <text x="400" y="225" font-family="Georgia, serif" font-size="14" fill="#3a3028" text-anchor="middle">Academic Excellence</text>
    <line x1="300" y1="250" x2="500" y2="250" stroke="#d4c9b8" stroke-width="1"/>
    <circle cx="400" cy="300" r="25" fill="none" stroke="#a67c3e" stroke-width="1.5"/>
    <text x="400" y="305" font-family="Georgia, serif" font-size="10" fill="#8b6f4e" text-anchor="middle">SEAL</text>
    <rect x="160" y="65" width="480" height="320" rx="8" fill="none" stroke="#1c1512" stroke-width="1.5" opacity="0.3"/>
  </svg>`
);

const dataScienceSvg = toDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#f2ede4"/>
    <rect x="200" y="80" width="400" height="260" rx="6" fill="none" stroke="#1c1512" stroke-width="2"/>
    <rect x="220" y="100" width="360" height="200" rx="2" fill="#f7f3ec" stroke="#d4c9b8" stroke-width="1"/>
    <rect x="235" y="120" width="60" height="40" fill="#d4c9b8"/>
    <rect x="235" y="170" width="80" height="30" fill="#c4a77d" opacity="0.6"/>
    <rect x="325" y="140" width="40" height="60" fill="#8b6f4e" opacity="0.4"/>
    <rect x="375" y="120" width="50" height="80" fill="#a67c3e" opacity="0.5"/>
    <rect x="435" y="160" width="35" height="40" fill="#d4c9b8"/>
    <rect x="480" y="130" width="45" height="70" fill="#c4a77d" opacity="0.6"/>
    <rect x="535" y="150" width="30" height="50" fill="#8b6f4e" opacity="0.3"/>
    <polyline points="235,280 280,230 320,260 370,200 420,240 460,180 510,220 560,190"
      fill="none" stroke="#1c1512" stroke-width="1.5" opacity="0.5"/>
    <polyline points="235,290 300,250 350,270 400,210 460,250 510,200 560,230"
      fill="none" stroke="#8b6f4e" stroke-width="1" opacity="0.4"/>
    <rect x="350" y="320" width="100" height="30" rx="3" fill="#1c1512"/>
    <text x="400" y="339" font-family="Georgia, serif" font-size="11" fill="#f2ede4" text-anchor="middle">DATA SCIENCE</text>
    <circle cx="600" cy="105" r="8" fill="#8b6f4e" opacity="0.3"/>
    <circle cx="620" cy="120" r="5" fill="#8b6f4e" opacity="0.2"/>
    <circle cx="590" cy="130" r="6" fill="#8b6f4e" opacity="0.2"/>
  </svg>`
);

const topRankSvg = toDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#f2ede4"/>
    <path d="M400 60 L430 140 L510 150 L450 210 L470 290 L400 250 L330 290 L350 210 L290 150 L370 140 Z"
      fill="none" stroke="#a67c3e" stroke-width="2.5"/>
    <path d="M400 75 L422 138 L488 145 L440 198 L455 268 L400 235 L345 268 L360 198 L312 145 L378 138 Z"
      fill="none" stroke="#c4a77d" stroke-width="1" opacity="0.5"/>
    <text x="400" y="165" font-family="Georgia, serif" font-size="32" fill="#a67c3e" text-anchor="middle" font-weight="bold">#1</text>
    <line x1="260" y1="300" x2="540" y2="300" stroke="#d4c9b8" stroke-width="1"/>
    <text x="400" y="325" font-family="Georgia, serif" font-size="14" fill="#1c1512" text-anchor="middle">University Rank</text>
    <text x="400" y="345" font-family="Georgia, serif" font-size="11" fill="#3a3028" text-anchor="middle">Semester Examination</text>
    <line x1="280" y1="370" x2="520" y2="370" stroke="#1c1512" stroke-width="1.5" opacity="0.2"/>
    <path d="M350 385 L400 365 L450 385" fill="none" stroke="#8b6f4e" stroke-width="1" opacity="0.4"/>
    <circle cx="150" cy="100" r="20" fill="none" stroke="#d4c9b8" stroke-width="1"/>
    <circle cx="650" cy="100" r="20" fill="none" stroke="#d4c9b8" stroke-width="1"/>
    <circle cx="150" cy="360" r="12" fill="none" stroke="#d4c9b8" stroke-width="1"/>
    <circle cx="650" cy="360" r="12" fill="none" stroke="#d4c9b8" stroke-width="1"/>
  </svg>`
);

const culturalFestSvg = toDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#f2ede4"/>
    <path d="M100 50 Q200 120 400 150 Q600 120 700 50 L700 400 L100 400 Z" fill="#1c1512" opacity="0.85"/>
    <path d="M100 50 Q200 130 400 160 Q600 130 700 50" fill="none" stroke="#a67c3e" stroke-width="2"/>
    <path d="M150 70 Q250 140 400 165 Q550 140 650 70" fill="none" stroke="#c4a77d" stroke-width="1" opacity="0.5"/>
    <text x="400" y="140" font-family="Georgia, serif" font-size="24" fill="#f2ede4" text-anchor="middle" font-weight="bold">UTSAV</text>
    <text x="400" y="165" font-family="Georgia, serif" font-size="13" fill="#c4a77d" text-anchor="middle">2026</text>
    <circle cx="200" cy="230" r="4" fill="#c4a77d" opacity="0.6"/>
    <circle cx="600" cy="230" r="4" fill="#c4a77d" opacity="0.6"/>
    <circle cx="250" cy="260" r="3" fill="#c4a77d" opacity="0.4"/>
    <circle cx="550" cy="260" r="3" fill="#c4a77d" opacity="0.4"/>
    <circle cx="300" cy="245" r="2" fill="#c4a77d" opacity="0.5"/>
    <circle cx="500" cy="245" r="2" fill="#c4a77d" opacity="0.5"/>
    <rect x="330" y="270" width="140" height="40" rx="3" fill="none" stroke="#c4a77d" stroke-width="1.5"/>
    <text x="400" y="295" font-family="Georgia, serif" font-size="12" fill="#c4a77d" text-anchor="middle">ANNUAL CULTURAL FEST</text>
    <text x="400" y="360" font-family="Georgia, serif" font-size="10" fill="#3a3028" text-anchor="middle">Music &middot; Dance &middot; Drama &middot; Fine Arts</text>
    <line x1="250" y1="380" x2="550" y2="380" stroke="#d4c9b8" stroke-width="1"/>
  </svg>`
);

const hackathonSvg = toDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#f2ede4"/>
    <rect x="220" y="80" width="260" height="180" rx="6" fill="#f7f3ec" stroke="#1c1512" stroke-width="2"/>
    <rect x="235" y="95" width="230" height="130" rx="2" fill="#f2ede4" stroke="#d4c9b8" stroke-width="1"/>
    <rect x="240" y="245" width="220" height="12" rx="2" fill="#d4c9b8"/>
    <text x="350" y="135" font-family="monospace" font-size="10" fill="#1c1512">
      <tspan x="245" dy="0">function hack() {</tspan>
      <tspan x="255" dy="16">  const idea = "solve";</tspan>
      <tspan x="255" dy="16">  const code = ["JS", "Py"];</tspan>
      <tspan x="255" dy="16">  while (!done) {</tspan>
      <tspan x="265" dy="14">    build(solution);</tspan>
      <tspan x="255" dy="14">  }</tspan>
      <tspan x="245" dy="16">  return win();</tspan>
      <tspan x="245" dy="16">}</tspan>
    </text>
    <path d="M540 100 L580 120 L540 140" fill="none" stroke="#1c1512" stroke-width="2"/>
    <path d="M620 100 L580 120 L620 140" fill="none" stroke="#1c1512" stroke-width="2"/>
    <rect x="530" y="150" width="100" height="60" rx="4" fill="none" stroke="#d4c9b8" stroke-width="1.5"/>
    <text x="580" y="183" font-family="Georgia, serif" font-size="11" fill="#8b6f4e" text-anchor="middle">INNOVATE</text>
    <path d="M560 240 L580 220 L600 240" fill="none" stroke="#a67c3e" stroke-width="2"/>
    <text x="580" y="260" font-family="Georgia, serif" font-size="10" fill="#a67c3e" text-anchor="middle">REGIONAL FINALS</text>
    <line x1="200" y1="320" x2="600" y2="320" stroke="#d4c9b8" stroke-width="1"/>
    <text x="400" y="355" font-family="Georgia, serif" font-size="13" fill="#1c1512" text-anchor="middle">Smart India Hackathon</text>
    <text x="400" y="375" font-family="Georgia, serif" font-size="11" fill="#3a3028" text-anchor="middle">Building solutions that matter</text>
  </svg>`
);

const genericSvg = toDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#f2ede4"/>
    <rect x="200" y="100" width="400" height="250" rx="4" fill="none" stroke="#d4c9b8" stroke-width="1"/>
    <rect x="220" y="120" width="360" height="210" fill="#f7f3ec"/>
    <text x="400" y="210" font-family="Georgia, serif" font-size="16" fill="#8b6f4e" text-anchor="middle">Campus TIMELINE</text>
    <text x="400" y="240" font-family="Georgia, serif" font-size="11" fill="#3a3028" text-anchor="middle">College Newspaper</text>
    <line x1="300" y1="260" x2="500" y2="260" stroke="#d4c9b8" stroke-width="1"/>
    <rect x="140" y="80" width="520" height="290" rx="4" fill="none" stroke="#d4c9b8" stroke-width="1" stroke-dasharray="4,4"/>
  </svg>`
);
