/**
 * CI/CD Pipeline Visualizer — Interactive 3D Experience
 * Zero-dependency Node.js HTTP server for AWS CI/CD Lab.
 * Uses strictly native Node.js modules (http, os) — zero npm dependencies.
 */

const http = require('http');
const os = require('os');

// Configuration & Environment Variables
const PORT = process.env.PORT || 80;
const COMMIT_SHA = process.env.COMMIT_SHA || 'unknown';

/**
 * Generates random star elements for the parallax starfield background.
 * Stars are generated server-side so each page load gets a unique sky.
 */
function generateStars(count, sizeMin, sizeMax, opacityMin, opacityMax) {
  let html = '';
  for (let i = 0; i < count; i++) {
    const x = (Math.random() * 100).toFixed(2);
    const y = (Math.random() * 100).toFixed(2);
    const size = (Math.random() * (sizeMax - sizeMin) + sizeMin).toFixed(1);
    const opacity = (Math.random() * (opacityMax - opacityMin) + opacityMin).toFixed(2);
    const delay = (Math.random() * 5).toFixed(1);
    html += '<div class="star" style="left:' + x + '%;top:' + y + '%;width:' + size + 'px;height:' + size + 'px;opacity:' + opacity + ';animation-delay:' + delay + 's"></div>';
  }
  return html;
}

/**
 * Generates diagonal shooting star streaks.
 */
function generateShootingStars(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    const top = (Math.random() * 50).toFixed(0);
    const left = (Math.random() * 60 + 10).toFixed(0);
    const delay = (Math.random() * 12 + i * 4).toFixed(1);
    const duration = (Math.random() * 1.2 + 0.8).toFixed(1);
    html += '<div class="shooting-star" style="top:' + top + '%;left:' + left + '%;animation-delay:' + delay + 's;animation-duration:' + duration + 's"></div>';
  }
  return html;
}

/**
 * Generates the self-contained HTML landing page with dynamic runtime deployment info.
 */
function renderLandingPage() {
  const hostname = os.hostname();
  const serverTime = new Date().toUTCString();
  const displaySha = COMMIT_SHA !== 'unknown' ? COMMIT_SHA : 'unknown';

  const stars1 = generateStars(100, 0.5, 1.5, 0.3, 0.7);
  const stars2 = generateStars(50, 1.5, 2.5, 0.5, 0.9);
  const stars3 = generateStars(15, 2.5, 3.5, 0.7, 1.0);
  const shootingStars = generateShootingStars(5);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CI/CD Pipeline Visualizer | AWS</title>
  <meta name="description" content="Interactive 3D CI/CD pipeline visualization — watch your code journey from source to production.">
  <noscript><style>.countdown-overlay{display:none!important}.main-content{opacity:1!important}</style></noscript>
  <style>
    /* ═══════════════════════════════════════════════
       1. RESET & CUSTOM PROPERTIES
       ═══════════════════════════════════════════════ */
    :root {
      --bg: #030712;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --glass: rgba(15, 23, 42, 0.65);
      --glass-border: rgba(255, 255, 255, 0.07);
      --cyan: #00f0ff;
      --purple: #a855f7;
      --amber: #f59e0b;
      --green: #22c55e;
      --pink: #f472b6;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* ═══════════════════════════════════════════════
       2. STARFIELD BACKGROUND
       ═══════════════════════════════════════════════ */
    .starfield {
      position: fixed;
      inset: 0;
      z-index: 0;
      overflow: hidden;
    }

    .star {
      position: absolute;
      border-radius: 50%;
      background: #fff;
      animation: twinkle 3s ease-in-out infinite alternate;
    }

    @keyframes twinkle {
      0% { opacity: var(--tw-from, 0.3); transform: scale(1); }
      100% { opacity: var(--tw-to, 1); transform: scale(1.3); }
    }

    .shooting-star {
      position: absolute;
      width: 80px;
      height: 1.5px;
      background: linear-gradient(90deg, rgba(255,255,255,0.9), transparent);
      border-radius: 2px;
      transform: rotate(-35deg);
      opacity: 0;
      animation: shoot 1.5s ease-out infinite;
    }

    @keyframes shoot {
      0% { transform: translateX(0) translateY(0) rotate(-35deg); opacity: 0; }
      5% { opacity: 1; }
      30% { opacity: 0.6; }
      100% { transform: translateX(600px) translateY(400px) rotate(-35deg); opacity: 0; }
    }

    /* Nebula layers */
    .starfield::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 15% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 85% 20%, rgba(0, 240, 255, 0.06) 0%, transparent 40%),
        radial-gradient(ellipse at 50% 90%, rgba(244, 114, 182, 0.05) 0%, transparent 40%);
      pointer-events: none;
    }

    /* ═══════════════════════════════════════════════
       3. COUNTDOWN OVERLAY
       ═══════════════════════════════════════════════ */
    .countdown-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(3, 7, 18, 0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 0.8s ease;
    }

    .countdown-label {
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--cyan);
      margin-bottom: 2rem;
      opacity: 0;
      animation: fadeInUp 0.6s 0.2s ease forwards;
    }

    .countdown-number {
      font-size: 8rem;
      font-weight: 900;
      line-height: 1;
      color: transparent;
      text-align: center;
      min-height: 10rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .countdown-number.pop {
      animation: countPop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      background: linear-gradient(135deg, var(--cyan), var(--purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .countdown-number.deployed {
      font-size: 3.5rem;
      letter-spacing: 0.15em;
      animation: deployFlash 1s ease forwards;
      background: linear-gradient(90deg, var(--cyan), var(--green));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .countdown-sub {
      font-size: 0.85rem;
      color: var(--text-muted);
      letter-spacing: 0.1em;
      margin-top: 1.5rem;
      opacity: 0;
      animation: fadeInUp 0.6s 0.4s ease forwards;
    }

    .explode-particle {
      position: absolute;
      top: 50%;
      left: 50%;
      border-radius: 50%;
      pointer-events: none;
      animation: explode 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }

    @keyframes countPop {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.1); opacity: 1; }
      70% { transform: scale(0.95); }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes deployFlash {
      0% { transform: scale(0.5); opacity: 0; }
      40% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes explode {
      0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 1; }
      100% { transform: translate(-50%, -50%) translate(var(--ex), var(--ey)) scale(0); opacity: 0; }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ═══════════════════════════════════════════════
       4. MAIN CONTENT
       ═══════════════════════════════════════════════ */
    .main-content {
      position: relative;
      z-index: 1;
      opacity: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1.5rem 2rem;
      gap: 3rem;
    }

    .main-content.visible {
      opacity: 1;
      transition: opacity 1s ease;
    }

    /* ═══════════════════════════════════════════════
       5. HEADER
       ═══════════════════════════════════════════════ */
    .header {
      text-align: center;
      max-width: 700px;
      animation: fadeInUp 0.8s 0.2s ease both;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      background: rgba(0, 240, 255, 0.08);
      border: 1px solid rgba(0, 240, 255, 0.25);
      border-radius: 9999px;
      color: var(--cyan);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: var(--green);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--green);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
    }

    .header h1 {
      font-size: 3rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 1rem;
      background: linear-gradient(90deg, #fff 0%, var(--cyan) 30%, var(--purple) 55%, var(--amber) 80%, var(--green) 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: holographic 6s linear infinite;
    }

    @keyframes holographic {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }

    .header .subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
      line-height: 1.6;
      max-width: 520px;
      margin: 0 auto;
    }

    /* ═══════════════════════════════════════════════
       6. PIPELINE SECTION
       ═══════════════════════════════════════════════ */
    .pipeline-section {
      position: relative;
      width: 100%;
      max-width: 960px;
      overflow: hidden;
      padding: 1rem 0;
      animation: fadeInUp 0.8s 0.4s ease both;
    }

    .pipeline {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      padding: 1rem 0;
    }

    /* ═══════════════════════════════════════════════
       7. 3D FLIP CARDS
       ═══════════════════════════════════════════════ */
    .flip-card {
      width: 150px;
      height: 190px;
      perspective: 1000px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .flip-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .flip-card:hover .flip-inner {
      transform: rotateY(180deg);
    }

    .flip-front, .flip-back {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
      border: 1px solid var(--glass-border);
      overflow: hidden;
    }

    .flip-front {
      background: var(--glass);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .flip-front::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 1px;
      background: linear-gradient(135deg, var(--stage-color, #fff) 0%, transparent 50%);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0.5;
      pointer-events: none;
    }

    .flip-front:hover::before {
      opacity: 1;
    }

    .flip-back {
      transform: rotateY(180deg);
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      align-items: flex-start;
      justify-content: flex-start;
      gap: 0.3rem;
      padding: 1.5rem 1.25rem;
      border-color: var(--stage-color, var(--glass-border));
    }

    /* Stage colors */
    .source { --stage-color: var(--cyan); }
    .build  { --stage-color: var(--purple); }
    .deploy { --stage-color: var(--amber); }
    .live   { --stage-color: var(--green); }

    .stage-icon {
      font-size: 2rem;
      margin-bottom: 0.75rem;
      color: var(--stage-color);
      text-shadow: 0 0 20px var(--stage-color);
      filter: drop-shadow(0 0 8px var(--stage-color));
    }

    .stage-icon.code-icon {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-weight: 700;
    }

    .live-icon {
      animation: pulse 2s infinite;
    }

    .stage-name {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: 0.02em;
    }

    .stage-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 0.25rem;
    }

    .detail-label {
      font-size: 0.6rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--stage-color);
      margin-top: 0.5rem;
    }

    .detail-label:first-child {
      margin-top: 0;
    }

    .detail-value {
      font-size: 0.8rem;
      color: var(--text);
      font-weight: 500;
    }

    .detail-value.mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.75rem;
      color: var(--cyan);
      background: rgba(0, 240, 255, 0.06);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      border: 1px solid rgba(0, 240, 255, 0.12);
      word-break: break-all;
    }

    .detail-value.status-ok {
      color: var(--green);
      text-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
    }

    /* ═══════════════════════════════════════════════
       8. CONNECTORS & PARTICLES
       ═══════════════════════════════════════════════ */
    .connector {
      position: relative;
      width: 70px;
      height: 3px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .connector-line {
      position: absolute;
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, var(--c-from), var(--c-to));
      opacity: 0.25;
    }

    .connector-particle {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--p-color);
      box-shadow: 0 0 8px var(--p-color), 0 0 16px var(--p-color);
      animation: particleFlow 2.2s linear infinite;
    }

    @keyframes particleFlow {
      0% { left: -6px; opacity: 0; transform: scale(0.4); }
      15% { opacity: 1; transform: scale(1); }
      85% { opacity: 1; transform: scale(1); }
      100% { left: calc(100% + 6px); opacity: 0; transform: scale(0.4); }
    }

    /* Scan line sweeping across pipeline */
    .scan-line {
      position: absolute;
      top: 0;
      left: -4px;
      width: 3px;
      height: 100%;
      background: linear-gradient(to bottom, transparent 10%, rgba(0, 240, 255, 0.4) 40%, rgba(0, 240, 255, 0.9) 50%, rgba(0, 240, 255, 0.4) 60%, transparent 90%);
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.5), 0 0 30px rgba(0, 240, 255, 0.2);
      animation: scanMove 5s linear infinite;
      pointer-events: none;
    }

    @keyframes scanMove {
      0% { left: -4px; opacity: 0; }
      3% { opacity: 1; }
      97% { opacity: 1; }
      100% { left: 100%; opacity: 0; }
    }

    /* ═══════════════════════════════════════════════
       9. 3D ORBITING DOCKER CUBES
       ═══════════════════════════════════════════════ */
    .orbit-section {
      width: 100%;
      max-width: 700px;
      text-align: center;
      animation: fadeInUp 0.8s 0.6s ease both;
    }

    .orbit-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .orbit-scene {
      position: relative;
      width: 100%;
      height: 220px;
      perspective: 800px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .orbit-ring {
      position: absolute;
      width: 0;
      height: 0;
      transform-style: preserve-3d;
    }

    .orbit-ring-1 { animation: orbitSpin 14s linear infinite; }
    .orbit-ring-2 { animation: orbitSpin 20s linear infinite reverse; }
    .orbit-ring-3 { animation: orbitSpin 10s linear infinite; }

    @keyframes orbitSpin {
      from { transform: rotateX(70deg) rotateZ(0deg); }
      to   { transform: rotateX(70deg) rotateZ(360deg); }
    }

    /* Ellipse path indicator */
    .orbit-path {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.04);
      transform: rotateX(70deg);
      pointer-events: none;
    }

    .orbit-path-1 { width: 260px; height: 260px; top: calc(50% - 130px); left: calc(50% - 130px); }
    .orbit-path-2 { width: 360px; height: 360px; top: calc(50% - 180px); left: calc(50% - 180px); }

    .cube-pos {
      position: absolute;
      transform-style: preserve-3d;
    }

    .cube {
      transform-style: preserve-3d;
      animation: cubeSpin 5s linear infinite;
    }

    .cube-1 .cube { animation-duration: 6s; }
    .cube-2 .cube { animation-duration: 4.5s; animation-direction: reverse; }
    .cube-3 .cube { animation-duration: 7s; }
    .cube-4 .cube { animation-duration: 5.5s; animation-direction: reverse; }

    @keyframes cubeSpin {
      from { transform: rotateX(0deg) rotateY(0deg); }
      to   { transform: rotateX(360deg) rotateY(360deg); }
    }

    .face {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    /* Small cubes: 36px */
    .cube-sm .face { width: 36px; height: 36px; }
    .cube-sm .front  { transform: rotateY(0deg)   translateZ(18px); }
    .cube-sm .back   { transform: rotateY(180deg) translateZ(18px); }
    .cube-sm .right  { transform: rotateY(90deg)  translateZ(18px); }
    .cube-sm .left   { transform: rotateY(-90deg) translateZ(18px); }
    .cube-sm .top    { transform: rotateX(90deg)  translateZ(18px); }
    .cube-sm .bottom { transform: rotateX(-90deg) translateZ(18px); }

    /* Large cubes: 48px */
    .cube-lg .face { width: 48px; height: 48px; }
    .cube-lg .front  { transform: rotateY(0deg)   translateZ(24px); }
    .cube-lg .back   { transform: rotateY(180deg) translateZ(24px); }
    .cube-lg .right  { transform: rotateY(90deg)  translateZ(24px); }
    .cube-lg .left   { transform: rotateY(-90deg) translateZ(24px); }
    .cube-lg .top    { transform: rotateX(90deg)  translateZ(24px); }
    .cube-lg .bottom { transform: rotateX(-90deg) translateZ(24px); }

    .face-cyan {
      background: rgba(0, 240, 255, 0.06);
      border: 1px solid rgba(0, 240, 255, 0.3);
      box-shadow: inset 0 0 12px rgba(0, 240, 255, 0.08);
      color: var(--cyan);
    }

    .face-purple {
      background: rgba(168, 85, 247, 0.06);
      border: 1px solid rgba(168, 85, 247, 0.3);
      box-shadow: inset 0 0 12px rgba(168, 85, 247, 0.08);
      color: var(--purple);
    }

    .face-amber {
      background: rgba(245, 158, 11, 0.06);
      border: 1px solid rgba(245, 158, 11, 0.3);
      box-shadow: inset 0 0 12px rgba(245, 158, 11, 0.08);
      color: var(--amber);
    }

    .face-green {
      background: rgba(34, 197, 94, 0.06);
      border: 1px solid rgba(34, 197, 94, 0.3);
      box-shadow: inset 0 0 12px rgba(34, 197, 94, 0.08);
      color: var(--green);
    }

    /* ═══════════════════════════════════════════════
       10. TELEMETRY PANEL
       ═══════════════════════════════════════════════ */
    .telemetry {
      width: 100%;
      max-width: 750px;
      background: var(--glass);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: fadeInUp 0.8s 0.8s ease both;
    }

    .telemetry-header {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text);
      padding-bottom: 1.25rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .telemetry-header::before {
      content: '';
      width: 8px;
      height: 8px;
      background: var(--cyan);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--cyan);
      animation: pulse 2s infinite;
    }

    .telemetry-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .t-card {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.25rem;
      transition: transform 0.25s ease, border-color 0.25s ease;
    }

    .t-card:hover {
      transform: translateY(-3px);
      border-color: rgba(0, 240, 255, 0.2);
    }

    .t-card.full-span {
      grid-column: 1 / -1;
    }

    .t-label {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .t-value {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text);
      word-break: break-all;
    }

    .t-value.mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.85rem;
      color: var(--cyan);
      background: rgba(0, 240, 255, 0.06);
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(0, 240, 255, 0.12);
      display: block;
    }

    /* ═══════════════════════════════════════════════
       11. FOOTER
       ═══════════════════════════════════════════════ */
    .footer {
      text-align: center;
      color: #475569;
      font-size: 0.75rem;
      letter-spacing: 0.03em;
      animation: fadeInUp 0.8s 1s ease both;
    }

    /* ═══════════════════════════════════════════════
       12. RESPONSIVE
       ═══════════════════════════════════════════════ */
    @media (max-width: 800px) {
      .header h1 { font-size: 2.2rem; }

      .pipeline {
        flex-direction: column;
        gap: 0;
      }

      .connector {
        width: 3px;
        height: 50px;
        flex-direction: column;
      }

      .connector-line {
        width: 1px;
        height: 100%;
        background: linear-gradient(180deg, var(--c-from), var(--c-to));
      }

      .connector-particle {
        animation-name: particleFlowV;
      }

      @keyframes particleFlowV {
        0% { top: -6px; left: -1.5px; opacity: 0; transform: scale(0.4); }
        15% { opacity: 1; transform: scale(1); }
        85% { opacity: 1; transform: scale(1); }
        100% { top: calc(100% + 6px); left: -1.5px; opacity: 0; transform: scale(0.4); }
      }

      .orbit-path { display: none; }
      .orbit-scene { height: 180px; }

      .telemetry { padding: 1.25rem; }
      .telemetry-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 480px) {
      .header h1 { font-size: 1.75rem; }
      .flip-card { width: 130px; height: 170px; }
      .countdown-number { font-size: 5rem; }
      .countdown-number.deployed { font-size: 2.5rem; }
    }
  </style>
</head>
<body>
  <!-- ═══ Starfield Background ═══ -->
  <div class="starfield" id="starfield">
    ${stars1}
    ${stars2}
    ${stars3}
    ${shootingStars}
  </div>

  <!-- ═══ Deploy Countdown Overlay ═══ -->
  <div class="countdown-overlay" id="countdown">
    <div class="countdown-label">Initializing Deployment</div>
    <div class="countdown-number" id="countdown-num"></div>
    <div class="countdown-sub" id="countdown-sub">Systems check in progress&hellip;</div>
  </div>

  <!-- ═══ Main Content ═══ -->
  <div class="main-content" id="main">

    <header class="header">
      <div class="badge">
        <span class="pulse-dot"></span>
        Deployed via AWS CodePipeline
      </div>
      <h1>CI/CD Pipeline Visualizer</h1>
      <p class="subtitle">Watch your code journey from source to production &mdash; hover each stage to reveal deployment details.</p>
    </header>

    <!-- ═══ Pipeline Stages ═══ -->
    <section class="pipeline-section">
      <div class="pipeline">

        <!-- SOURCE -->
        <div class="flip-card" id="stage-source">
          <div class="flip-inner">
            <div class="flip-front source">
              <div class="stage-icon code-icon">&lt;/&gt;</div>
              <div class="stage-name">Source</div>
              <div class="stage-sub">GitHub Push</div>
            </div>
            <div class="flip-back source">
              <div class="detail-label">Repository</div>
              <div class="detail-value">CI-CD-lab</div>
              <div class="detail-label">Branch</div>
              <div class="detail-value">main</div>
              <div class="detail-label">Commit SHA</div>
              <div class="detail-value mono">${displaySha}</div>
            </div>
          </div>
        </div>

        <!-- CONNECTOR 1 -->
        <div class="connector">
          <div class="connector-line" style="--c-from: var(--cyan); --c-to: var(--purple);"></div>
          <div class="connector-particle" style="--p-color: #00f0ff; animation-delay: 0s;"></div>
          <div class="connector-particle" style="--p-color: #7c3aed; animation-delay: 0.7s;"></div>
          <div class="connector-particle" style="--p-color: #a855f7; animation-delay: 1.4s;"></div>
        </div>

        <!-- BUILD -->
        <div class="flip-card" id="stage-build">
          <div class="flip-inner">
            <div class="flip-front build">
              <div class="stage-icon">&#9881;</div>
              <div class="stage-name">Build</div>
              <div class="stage-sub">Docker Image</div>
            </div>
            <div class="flip-back build">
              <div class="detail-label">Engine</div>
              <div class="detail-value">AWS CodeBuild</div>
              <div class="detail-label">Base Image</div>
              <div class="detail-value">node:20-alpine</div>
              <div class="detail-label">Status</div>
              <div class="detail-value status-ok">&#10003; Success</div>
            </div>
          </div>
        </div>

        <!-- CONNECTOR 2 -->
        <div class="connector">
          <div class="connector-line" style="--c-from: var(--purple); --c-to: var(--amber);"></div>
          <div class="connector-particle" style="--p-color: #a855f7; animation-delay: 0.2s;"></div>
          <div class="connector-particle" style="--p-color: #c084fc; animation-delay: 0.9s;"></div>
          <div class="connector-particle" style="--p-color: #f59e0b; animation-delay: 1.6s;"></div>
        </div>

        <!-- DEPLOY -->
        <div class="flip-card" id="stage-deploy">
          <div class="flip-inner">
            <div class="flip-front deploy">
              <div class="stage-icon">&#9650;</div>
              <div class="stage-name">Deploy</div>
              <div class="stage-sub">Blue / Green</div>
            </div>
            <div class="flip-back deploy">
              <div class="detail-label">Strategy</div>
              <div class="detail-value">Blue/Green</div>
              <div class="detail-label">Platform</div>
              <div class="detail-value">AWS CodeDeploy</div>
              <div class="detail-label">Container</div>
              <div class="detail-value mono">${hostname}</div>
            </div>
          </div>
        </div>

        <!-- CONNECTOR 3 -->
        <div class="connector">
          <div class="connector-line" style="--c-from: var(--amber); --c-to: var(--green);"></div>
          <div class="connector-particle" style="--p-color: #f59e0b; animation-delay: 0.3s;"></div>
          <div class="connector-particle" style="--p-color: #84cc16; animation-delay: 1.0s;"></div>
          <div class="connector-particle" style="--p-color: #22c55e; animation-delay: 1.7s;"></div>
        </div>

        <!-- LIVE -->
        <div class="flip-card" id="stage-live">
          <div class="flip-inner">
            <div class="flip-front live">
              <div class="stage-icon live-icon">&#9679;</div>
              <div class="stage-name">Live</div>
              <div class="stage-sub">Production</div>
            </div>
            <div class="flip-back live">
              <div class="detail-label">Port</div>
              <div class="detail-value">${PORT}</div>
              <div class="detail-label">Server Time</div>
              <div class="detail-value">${serverTime}</div>
              <div class="detail-label">Status</div>
              <div class="detail-value status-ok">&#9679; Running</div>
            </div>
          </div>
        </div>

      </div>
      <div class="scan-line"></div>
    </section>

    <!-- ═══ Orbiting 3D Docker Cubes ═══ -->
    <section class="orbit-section">
      <div class="orbit-label">Docker Containers in Orbit</div>
      <div class="orbit-scene">
        <!-- Orbit path ellipses (decorative) -->
        <div class="orbit-path orbit-path-1"></div>
        <div class="orbit-path orbit-path-2"></div>

        <!-- Inner orbit — 2 small cubes, opposite sides -->
        <div class="orbit-ring orbit-ring-1">
          <div class="cube-pos cube-1" style="transform: translateX(130px);">
            <div class="cube cube-sm">
              <div class="face front face-cyan">&#x2B21;</div>
              <div class="face back face-cyan"></div>
              <div class="face right face-cyan"></div>
              <div class="face left face-cyan"></div>
              <div class="face top face-cyan"></div>
              <div class="face bottom face-cyan"></div>
            </div>
          </div>
        </div>
        <div class="orbit-ring orbit-ring-1" style="animation-delay: -7s;">
          <div class="cube-pos cube-3" style="transform: translateX(130px);">
            <div class="cube cube-sm">
              <div class="face front face-green"></div>
              <div class="face back face-green"></div>
              <div class="face right face-green">&#x2B21;</div>
              <div class="face left face-green"></div>
              <div class="face top face-green"></div>
              <div class="face bottom face-green"></div>
            </div>
          </div>
        </div>

        <!-- Outer orbit — 2 large cubes, opposite sides -->
        <div class="orbit-ring orbit-ring-2">
          <div class="cube-pos cube-2" style="transform: translateX(180px);">
            <div class="cube cube-lg">
              <div class="face front face-purple">&#x1F433;</div>
              <div class="face back face-purple"></div>
              <div class="face right face-purple"></div>
              <div class="face left face-purple"></div>
              <div class="face top face-purple"></div>
              <div class="face bottom face-purple"></div>
            </div>
          </div>
        </div>
        <div class="orbit-ring orbit-ring-2" style="animation-delay: -10s;">
          <div class="cube-pos cube-4" style="transform: translateX(180px);">
            <div class="cube cube-lg">
              <div class="face front face-amber"></div>
              <div class="face back face-amber">&#x1F433;</div>
              <div class="face right face-amber"></div>
              <div class="face left face-amber"></div>
              <div class="face top face-amber"></div>
              <div class="face bottom face-amber"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Deployment Telemetry ═══ -->
    <section class="telemetry">
      <div class="telemetry-header">
        Deployment Traceability &amp; Telemetry
      </div>
      <div class="telemetry-grid">
        <div class="t-card full-span">
          <div class="t-label">Commit SHA</div>
          <div class="t-value mono">${displaySha}</div>
        </div>
        <div class="t-card">
          <div class="t-label">Served By (Container ID)</div>
          <div class="t-value mono">${hostname}</div>
        </div>
        <div class="t-card">
          <div class="t-label">Server Time</div>
          <div class="t-value">${serverTime}</div>
        </div>
      </div>
    </section>

    <footer class="footer">
      Node.js v20 (Alpine) &bull; AWS EC2 &amp; CodeDeploy
    </footer>

  </div>

  <!-- ═══ Client-side Script ═══ -->
  <script>
    (function() {
      var overlay = document.getElementById('countdown');
      var numEl   = document.getElementById('countdown-num');
      var subEl   = document.getElementById('countdown-sub');
      var mainEl  = document.getElementById('main');
      var steps   = [3, 2, 1];
      var idx     = 0;

      var subtexts = [
        'Pulling source from repository...',
        'Building Docker image...',
        'Deploying to production...'
      ];

      function showNext() {
        if (idx < steps.length) {
          numEl.textContent = steps[idx];
          numEl.className = 'countdown-number';
          // Force reflow to restart animation
          void numEl.offsetWidth;
          numEl.className = 'countdown-number pop';
          subEl.textContent = subtexts[idx];
          idx++;
          setTimeout(showNext, 950);
        } else {
          // Show DEPLOYED
          numEl.textContent = 'DEPLOYED';
          numEl.className = 'countdown-number deployed';
          subEl.textContent = 'All systems go.';
          launchExplosion();
          setTimeout(function() {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            mainEl.classList.add('visible');
          }, 1400);
          setTimeout(function() {
            overlay.style.display = 'none';
          }, 2400);
        }
      }

      function launchExplosion() {
        var colors = ['#00f0ff', '#a855f7', '#f59e0b', '#22c55e', '#f472b6', '#ffffff'];
        for (var i = 0; i < 60; i++) {
          var p = document.createElement('div');
          p.className = 'explode-particle';
          var angle = (Math.PI * 2 / 60) * i + (Math.random() - 0.5) * 0.4;
          var dist  = 80 + Math.random() * 280;
          var x = Math.cos(angle) * dist;
          var y = Math.sin(angle) * dist;
          var size = 3 + Math.random() * 5;
          var color = colors[Math.floor(Math.random() * colors.length)];
          var delay = (Math.random() * 0.25).toFixed(2);
          p.style.cssText = 'width:' + size + 'px;height:' + size + 'px;'
            + '--ex:' + x.toFixed(0) + 'px;--ey:' + y.toFixed(0) + 'px;'
            + 'background:' + color + ';'
            + 'box-shadow:0 0 6px ' + color + ';'
            + 'animation-delay:' + delay + 's;';
          overlay.appendChild(p);
        }
      }

      // Start countdown after brief pause
      setTimeout(showNext, 600);
    })();
  </script>
</body>
</html>`;
}

// Request Router & HTTP Server Setup
const server = http.createServer((req, res) => {
  // Lightweight healthcheck endpoint for ALB & deploy scripts
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('OK');
  }

  // Primary HTML landing page
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderLandingPage());
});

// Start listening on configured port
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Commit SHA: ${COMMIT_SHA}`);
  console.log(`Hostname: ${os.hostname()}`);
});
