<!--
  @component AdminPage

  Admin felület - rendelések kezelése UI komponensekkel

  Ez az oldal az admin felület, ahol a rendelések megtekinthetők és kezelhetők.
  Újrafelhasználható UI komponenseket használ a glassmorphism stílussal.
-->
<script lang="ts">
  import { orders } from '$lib/orders';
  import { isDarkMode } from '$lib/theme';
  import { Sun, Moon, ArrowLeft, Package, Trash2, Eye } from '@lucide/svelte';
  import type { Order } from '$lib/types';

  // UI Components
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Table from '$lib/components/ui/table';

  /**
   * Témaváltó függvény
   */
  function toggleTheme() {
    isDarkMode.update(v => !v);
  }

  /**
   * Rendelés törlése
   */
  function deleteOrder(orderId: number) {
    orders.update(currentOrders => currentOrders.filter(order => order.id !== orderId));
  }

  /**
   * Postázási státusz váltása
   */
  function toggleShipped(orderId: number) {
    orders.update(currentOrders => currentOrders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          shipped: !order.shipped,
          shippedDate: !order.shipped ? new Date().toISOString() : null
        };
      }
      return order;
    }));
  }

  /**
   * Popup modal state
   */
  let selectedOrder: Order | null = $state(null);

  /**
   * Rendelés részletek megjelenítése popup-ban
   */
  function openOrderDetails(order: Order) {
    selectedOrder = order;
  }

  /**
   * Popup bezárása
   */
  function closeOrderDetails() {
    selectedOrder = null;
  }

  /**
   * Dátum formázása
   */
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Csillag interfész
   */
  interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    delay: number;
  }

  /**
   * Csillagok generálása
   */
  const stars: Star[] = [];
  const starCount = 100;

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 4
    });
  }

  /**
   * Felhő interfész
   */
  interface Cloud {
    x: number;
    y: number;
    size: number;
    opacity: number;
    delay: number;
  }

  /**
   * Felhők generálása
   */
  const clouds: Cloud[] = [];
  const cloudCount = 5;

  for (let i = 0; i < cloudCount; i++) {
    clouds.push({
      x: Math.random() * 100,
      y: Math.random() * 60,
      size: Math.random() * 60 + 40,
      opacity: Math.random() * 0.3 + 0.3,
      delay: Math.random() * 20
    });
  }
</script>

<!-- Main Container -->
<div class="min-h-screen relative overflow-hidden font-sans transition-colors duration-700
  bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500
  dark:bg-gradient-to-br dark:from-[#0d0e1a] dark:via-[#0d0e1a] dark:to-[#0d0e1a] selection:bg-pink-400">

  <!-- DECORATIONS -->

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
        <div class="cloud-part" style="width: {cloud.size}px; height: {cloud.size * 0.6}px; left: 0;"></div>
        <div class="cloud-part" style="width: {cloud.size * 0.8}px; height: {cloud.size * 0.7}px; left: {cloud.size * 0.3}px; top: {cloud.size * 0.1}px;"></div>
        <div class="cloud-part" style="width: {cloud.size * 0.9}px; height: {cloud.size * 0.65}px; left: {cloud.size * 0.5}px; top: -{cloud.size * 0.05}px;"></div>
        <div class="cloud-part" style="width: {cloud.size * 0.7}px; height: {cloud.size * 0.6}px; left: {cloud.size * 0.8}px; top: {cloud.size * 0.08}px;"></div>
      </div>
    {/each}
  </div>

  <!-- Celestial Body -->
  <div class="absolute top-20 right-[-50px] rounded-full blur-[2px] transition-all duration-1000
    w-32 h-32 bg-yellow-300 opacity-90 shadow-[0_0_50px_rgba(253,224,71,0.5)]
    dark:bg-yellow-100 dark:opacity-80 dark:shadow-[0_0_50px_rgba(255,255,255,0.2)]">
  </div>

  <!-- HEADER -->
  <header class="flex justify-center items-center py-8 relative px-4 z-20 max-w-7xl mx-auto">
    <!-- Back Button -->
    <div class="absolute left-4 top-8">
      <a href="/">
        <Button variant="default" size="icon">
          {#snippet children()}
            <ArrowLeft size={20} />
          {/snippet}
        </Button>
      </a>
    </div>

    <!-- Title Box -->
    <div class="backdrop-blur-xl border px-8 py-3 rounded-2xl flex items-center space-x-3 transition-all duration-300
      bg-white/20 border-white/30 shadow-lg
      dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
      <Package class="text-gray-800 dark:text-white transition-colors duration-300" />
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white tracking-wide drop-shadow-md transition-colors duration-300">Admin Felület</h1>
    </div>

    <!-- Theme Toggle Button -->
    <div class="absolute right-4 top-8">
      <Button variant="default" size="icon" onclick={toggleTheme}>
        {#snippet children()}
          {#if $isDarkMode}
            <Sun size={20} class="text-yellow-400" />
          {:else}
            <Moon size={20} />
          {/if}
        {/snippet}
      </Button>
    </div>
  </header>

  <!-- MAIN CONTENT -->
  <main class="max-w-7xl mx-auto px-4 z-10 relative pb-8">
    <div class="backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300
      bg-white/20 border-white/40 shadow-lg
      dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">

      <Table.Root>
        <Table.Header>
          <Table.Row class="border-b border-gray-800/20 dark:border-white/10">
            <Table.Head>ID</Table.Head>
            <Table.Head>Vevő neve</Table.Head>
            <Table.Head>Email</Table.Head>
            <Table.Head>Telefon</Table.Head>
            <Table.Head>Cím</Table.Head>
            <Table.Head>Dátum</Table.Head>
            <Table.Head>Státusz</Table.Head>
            <Table.Head>Tételek</Table.Head>
            <Table.Head>Műveletek</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each $orders as order (order.id)}
            <Table.Row>
              <Table.Cell>#{order.id}</Table.Cell>
              <Table.Cell>{order.customerName}</Table.Cell>
              <Table.Cell>{order.email}</Table.Cell>
              <Table.Cell>{order.phone}</Table.Cell>
              <Table.Cell>
                {order.address.zip} {order.address.city}<br/>
                {order.address.street} {order.address.house}
              </Table.Cell>
              <Table.Cell>{formatDate(order.orderDate)}</Table.Cell>
              <Table.Cell>
                {#if order.shipped}
                  <div class="flex flex-col gap-1">
                    <Badge variant="success">Postázva</Badge>
                    <span class="text-xs text-gray-700 dark:text-white">
                      {formatDate(order.shippedDate || '')}
                    </span>
                  </div>
                {:else}
                  <Badge variant="warning">Feldolgozás alatt</Badge>
                {/if}
              </Table.Cell>
              <Table.Cell>
                <Button variant="default" size="sm" onclick={() => openOrderDetails(order)}>
                  {#snippet children()}
                    <Eye size={16} />
                    Megjelenítés
                  {/snippet}
                </Button>
              </Table.Cell>
              <Table.Cell>
                <div class="flex gap-2">
                  <Button
                    variant={order.shipped ? 'warning' : 'success'}
                    size="sm"
                    onclick={() => toggleShipped(order.id)}
                  >
                    {#snippet children()}
                      {order.shipped ? 'Visszavonás' : 'Postázás'}
                    {/snippet}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    class="!p-1.5 !w-auto !h-auto"
                    onclick={() => deleteOrder(order.id)}
                  >
                    {#snippet children()}
                      <Trash2 size={16} />
                    {/snippet}
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>

      {#if $orders.length === 0}
        <div class="text-center py-8 text-gray-700 dark:text-white/60">
          Nincs megjeleníthető rendelés.
        </div>
      {/if}
    </div>
  </main>

  <!-- Order Details Dialog -->
  <Dialog.Root open={selectedOrder !== null} onOpenChange={(open) => { if (!open) closeOrderDetails(); }}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>{selectedOrder ? `Rendelés #${selectedOrder.id} tételei` : ''}</Dialog.Title>
      </Dialog.Header>

      {#if selectedOrder}
        <div class="space-y-3 max-h-96 overflow-y-auto">
          {#each selectedOrder.items as item}
            <div class="flex justify-between items-start p-4 rounded-xl backdrop-blur-xl border
              bg-white/40 border-white/50
              dark:bg-white/[0.05] dark:border-white/[0.1]">
              <div class="flex-1">
                <div class="font-semibold text-gray-800 dark:text-white text-lg">
                  {item.name} <span class="text-gray-600 dark:text-white/80">x{item.quantity}</span>
                </div>
                <div class="text-sm text-gray-700 dark:text-white mt-2">
                  <div>Tej: <span class="font-medium">{item.modifiers.milk}</span></div>
                  <div>Cukor: <span class="font-medium">{item.modifiers.sugar}</span></div>
                </div>
              </div>
              <div class="font-bold text-gray-800 dark:text-white text-lg">
                {item.price * item.quantity} Ft
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-4 pt-4 border-t border-gray-800/20 dark:border-white/20 flex justify-between items-center">
          <span class="text-lg font-bold text-gray-800 dark:text-white">Összesen:</span>
          <span class="text-xl font-bold text-gray-800 dark:text-white">
            {selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} Ft
          </span>
        </div>

        <Button variant="default" class="w-full mt-4" onclick={closeOrderDetails}>
          {#snippet children()}
            Bezárás
          {/snippet}
        </Button>
      {/if}
    </Dialog.Content>
  </Dialog.Root>

  <footer class="text-center text-white/60 text-xs py-4 relative w-full z-10">
    © 2025 NeoCoffee Kft. - Minden jog fenntartva.
  </footer>
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
