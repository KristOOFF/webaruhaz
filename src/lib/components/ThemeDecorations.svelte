<!--
  @component ThemeDecorations

  Dekorációs elemek a témához - csillagok (dark mode) és felhők (light mode)

  Ez a komponens tartalmazza az összes háttér dekorációt:
  - 100 villogó csillag sötét módban
  - 5 lebegő felhő világos módban
  - Égi test (nap/hold) mindkét témában
-->
<script lang="ts">
  /**
   * Csillag interfész
   * Definiálja egy egyedi csillag tulajdonságait a dark mode animációhoz
   */
  interface Star {
    x: number;      // Vízszintes pozíció (0-100%)
    y: number;      // Függőleges pozíció (0-100%)
    size: number;   // Csillag mérete pixelben
    opacity: number; // Alapértelmezett átlátszóság
    delay: number;  // Animáció késleltetés másodpercben
  }

  /**
   * Felhő interfész
   * Definiálja egy egyedi felhő tulajdonságait a light mode animációhoz
   */
  interface Cloud {
    x: number;      // Vízszintes pozíció (0-100%)
    y: number;      // Függőleges pozíció (0-60%)
    size: number;   // Felhő mérete pixelben
    opacity: number; // Átlátszóság (0.3-0.6)
    delay: number;  // Animáció késleltetés másodpercben
  }

  /**
   * Csillagok generálása
   * 100 véletlenszerű pozíciójú, méretű és villogási mintájú csillag
   */
  const stars: Star[] = [];
  const starCount = 100;

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,         // 1-3px méret
      opacity: Math.random() * 0.5 + 0.5,  // 0.5-1.0 átlátszóság
      delay: Math.random() * 4              // 0-4s késleltetés
    });
  }

  /**
   * Felhők generálása
   * 5 véletlenszerű pozíciójú, méretű és lebegési mintájú felhő
   */
  const clouds: Cloud[] = [];
  const cloudCount = 5;

  for (let i = 0; i < cloudCount; i++) {
    clouds.push({
      x: Math.random() * 100,
      y: Math.random() * 60,               // Felső/középső rész (0-60%)
      size: Math.random() * 60 + 40,       // 40-100px méret
      opacity: Math.random() * 0.3 + 0.3,  // 0.3-0.6 átlátszóság
      delay: Math.random() * 20             // 0-20s késleltetés
    });
  }
</script>

<!-- Stars (Dark mode only) -->
<div class="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-700">
  {#each stars as star}
    <div
      class="star absolute rounded-full bg-white"
      style="left: {star.x}%; top: {star.y}%; width: {star.size}px; height: {star.size}px; --base-opacity: {star.opacity}; --delay: {star.delay};"
    ></div>
  {/each}
</div>

<!-- Clouds (Light mode only) -->
<div class="absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-100 dark:opacity-0">
  {#each clouds as cloud}
    <div class="cloud-container absolute" style="left: {cloud.x}%; top: {cloud.y}%; --delay: {cloud.delay}s; --opacity: {cloud.opacity};">
      <!-- Main cloud body made of overlapping circles -->
      <div class="cloud-part" style="width: {cloud.size}px; height: {cloud.size * 0.6}px; left: 0;"></div>
      <div class="cloud-part" style="width: {cloud.size * 0.8}px; height: {cloud.size * 0.7}px; left: {cloud.size * 0.3}px; top: {cloud.size * 0.1}px;"></div>
      <div class="cloud-part" style="width: {cloud.size * 0.9}px; height: {cloud.size * 0.65}px; left: {cloud.size * 0.5}px; top: -{cloud.size * 0.05}px;"></div>
      <div class="cloud-part" style="width: {cloud.size * 0.7}px; height: {cloud.size * 0.6}px; left: {cloud.size * 0.8}px; top: {cloud.size * 0.08}px;"></div>
    </div>
  {/each}
</div>

<!-- Celestial Body (Sun in Light / Moon in Dark) -->
<div class="absolute top-20 right-[-50px] rounded-full blur-[2px] transition-all duration-1000
  w-32 h-32 bg-yellow-300 opacity-90 shadow-[0_0_50px_rgba(253,224,71,0.5)]
  dark:bg-yellow-100 dark:opacity-80 dark:shadow-[0_0_50px_rgba(255,255,255,0.2)]">
</div>

<style>
  /* Stars - Twinkling animation (dark mode only) */
  .star {
    animation: twinkle 4s ease-in-out infinite;
    animation-delay: calc(var(--delay, 0) * 1s);
  }

  @keyframes twinkle {
    0%, 100% { opacity: var(--base-opacity, 1); }
    50% { opacity: calc(var(--base-opacity, 1) * 0.3); }
  }

  /* Light Mode Clouds */
  .cloud-container {
    position: relative;
    animation: float 20s infinite ease-in-out;
    animation-delay: var(--delay, 0s);
  }

  .cloud-part {
    position: absolute;
    background: rgba(255, 255, 255, var(--opacity, 0.4));
    filter: blur(40px);
    border-radius: 50%;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
    25% { transform: translateY(-15px) translateX(10px) scale(1.05); }
    50% { transform: translateY(-25px) translateX(5px) scale(1.1); }
    75% { transform: translateY(-15px) translateX(-5px) scale(1.05); }
  }
</style>
