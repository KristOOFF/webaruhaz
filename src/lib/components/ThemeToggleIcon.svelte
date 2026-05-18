<!--
  @component ThemeToggleIcon

  Téma váltó ikon, amely Sun ↔ Moon között crossfade-el az `isDarkMode`
  store értéke alapján.

  Miért külön komponens?
  - A korábbi `{#if $isDarkMode}` ↔ `{:else}` váltás un-mount/re-mount-tal
    instant ikoncserét csinált, ami a 700ms-os háttér-tranzícióval együtt
    "villogást" okozott.
  - Itt mindkét ikont egyszerre rendereljük abszolút pozícióban, és csak
    az opacity-t animáljuk ugyanazzal a 700ms-os duration-nel, mint amit
    a többi téma-tranzíció használ.
-->
<script lang="ts">
  import { isDarkMode } from '$lib/theme';
  import Sun from '@lucide/svelte/icons/sun';
  import Moon from '@lucide/svelte/icons/moon';

  let { size = 20 }: { size?: number } = $props();
</script>

<span class="relative inline-flex items-center justify-center" style="width: {size}px; height: {size}px;">
  <Sun
    {size}
    class="absolute inset-0 m-auto text-yellow-400 transition-opacity duration-300
           {$isDarkMode ? 'opacity-100' : 'opacity-0'}"
  />
  <Moon
    {size}
    class="absolute inset-0 m-auto transition-opacity duration-300
           {$isDarkMode ? 'opacity-0' : 'opacity-100'}"
  />
</span>
