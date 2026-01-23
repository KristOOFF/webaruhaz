<!--
  @component AdminPage

  Admin felület - rendelések kezelése API-val

  Ez az oldal az admin felület, ahol a rendelések megtekinthetők és kezelhetők.
  Bejelentkezés szükséges a használatához.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { isDarkMode } from '$lib/theme';
  import { Sun, Moon, ArrowLeft, Package, Trash2, Eye, LogIn, LogOut } from '@lucide/svelte';
  import ThemeDecorations from '$lib/components/ThemeDecorations.svelte';
  import * as api from '$lib/api';
  import type { ApiOrder } from '$lib/api';

  // UI Components
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Table from '$lib/components/ui/table';
  import * as Select from '$lib/components/ui/select';

  // ============================================================================
  // ÁLLAPOTOK
  // ============================================================================

  let isLoggedIn = $state(false);
  let isLoading = $state(true);
  let orders = $state<ApiOrder[]>([]);
  let error = $state<string | null>(null);
  let selectedOrder = $state<ApiOrder | null>(null);
  let selectedOrderNumber = $state<number>(0);

  // Login form
  let username = $state('');
  let password = $state('');
  let loginError = $state<string | null>(null);
  let loginLoading = $state(false);

  // Szűrő
  let statusFilter = $state<string>('all');

  // Szűrt rendelések
  let filteredOrders = $derived(
    statusFilter === 'all'
      ? orders
      : statusFilter === 'pending'
        ? orders.filter(o => o.postazva === 0)
        : orders.filter(o => o.postazva === 1)
  );

  // ============================================================================
  // INICIALIZÁCIÓ
  // ============================================================================

  onMount(async () => {
    if (api.isLoggedIn()) {
      try {
        await api.verifyToken();
        isLoggedIn = true;
        await loadOrders();
      } catch {
        api.clearToken();
      }
    }
    isLoading = false;
  });

  // ============================================================================
  // API MŰVELETEK
  // ============================================================================

  async function loadOrders() {
    try {
      error = null;
      orders = await api.getOrders();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Hiba a rendelések betöltésekor';
    }
  }

  async function handleLogin() {
    loginError = null;
    loginLoading = true;

    try {
      await api.login(username, password);
      isLoggedIn = true;
      username = '';
      password = '';
      await loadOrders();
    } catch (err) {
      loginError = err instanceof Error ? err.message : 'Bejelentkezési hiba';
    } finally {
      loginLoading = false;
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }
    isLoggedIn = false;
    orders = [];
  }

  async function deleteOrder(orderId: string) {
    try {
      await api.deleteOrder(orderId);
      orders = orders.filter(o => o.id !== orderId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Hiba a törléskor';
    }
  }

  async function toggleShipped(orderId: string, currentStatus: number) {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const result = await api.shipOrder(orderId, newStatus as 0 | 1);
      orders = orders.map(o => {
        if (o.id === orderId) {
          return { ...o, postazva: result.postazva, postazva_datum: result.postazva_datum };
        }
        return o;
      });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Hiba a státusz módosításakor';
    }
  }

  // ============================================================================
  // UI SEGÉDFÜGGVÉNYEK
  // ============================================================================

  function toggleTheme() {
    isDarkMode.update(v => !v);
  }

  function openOrderDetails(order: ApiOrder, displayNumber: number) {
    selectedOrder = order;
    selectedOrderNumber = displayNumber;
  }

  function closeOrderDetails() {
    selectedOrder = null;
  }

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

  function calculateOrderTotal(order: ApiOrder): number {
    return order.items.reduce((sum, item) => sum + item.termek_ar * item.mennyiseg, 0);
  }

</script>

<!-- Main Container -->
<div class="min-h-screen relative overflow-hidden font-sans transition-colors duration-700
  bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500
  dark:bg-gradient-to-br dark:from-[#0d0e1a] dark:via-[#0d0e1a] dark:to-[#0d0e1a]">

  <!-- DECORATIONS -->
  <ThemeDecorations />

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

    <!-- Right Buttons -->
    <div class="absolute right-4 top-8 flex gap-2">
      {#if isLoggedIn}
        <Button variant="destructive" size="icon" onclick={handleLogout}>
          {#snippet children()}
            <LogOut size={20} />
          {/snippet}
        </Button>
      {/if}
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

    {#if isLoading}
      <!-- Loading -->
      <div class="backdrop-blur-xl border rounded-2xl p-12 text-center transition-all duration-300
        bg-white/20 border-white/40 shadow-lg
        dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        <div class="text-gray-700 dark:text-white text-lg">Betöltés...</div>
      </div>

    {:else if !isLoggedIn}
      <!-- Login Form -->
      <div class="max-w-md mx-auto backdrop-blur-xl border rounded-2xl p-8 transition-all duration-300
        bg-white/20 border-white/40 shadow-lg
        dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">

        <div class="flex items-center justify-center gap-3 mb-6">
          <LogIn class="text-gray-800 dark:text-white" size={28} />
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">Bejelentkezés</h2>
        </div>

        <form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="space-y-4">
          <div class="space-y-2">
            <Label for="username" class="text-gray-800 dark:text-white">Felhasználónév</Label>
            <Input
              id="username"
              type="text"
              bind:value={username}
              placeholder="Felhasználónév"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="password" class="text-gray-800 dark:text-white">Jelszó</Label>
            <Input
              id="password"
              type="password"
              bind:value={password}
              placeholder="Jelszó"
              required
            />
          </div>

          {#if loginError}
            <div class="text-red-500 dark:text-red-400 text-sm text-center">{loginError}</div>
          {/if}

          <Button type="submit" variant="default" class="w-full" disabled={loginLoading}>
            {#snippet children()}
              {loginLoading ? 'Bejelentkezés...' : 'Bejelentkezés'}
            {/snippet}
          </Button>
        </form>
      </div>

    {:else}
      <!-- Orders Table -->
      <div class="backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300
        bg-white/20 border-white/40 shadow-lg
        dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">

        {#if error}
          <div class="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-700 dark:text-red-300">
            {error}
          </div>
        {/if}

        <Table.Root>
          <Table.Header>
            <Table.Row class="border-b border-gray-800/20 dark:border-white/10">
              <Table.Head>ID</Table.Head>
              <Table.Head>Vevő neve</Table.Head>
              <Table.Head>Email</Table.Head>
              <Table.Head>Telefon</Table.Head>
              <Table.Head>Cím</Table.Head>
              <Table.Head>Dátum</Table.Head>
              <Table.Head>
                <div class="flex items-center gap-2">
                  <span>Státusz</span>
                  <Select.Root type="single" bind:value={statusFilter}>
                    <Select.Trigger size="sm" class="h-5 px-1.5 text-[10px] w-auto min-w-0">
                      {#snippet children()}
                        <Select.Value placeholder="Mind" />
                      {/snippet}
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="all">Mind</Select.Item>
                      <Select.Item value="pending">Folyamatban</Select.Item>
                      <Select.Item value="shipped">Kiszállítva</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>
              </Table.Head>
              <Table.Head>Tételek</Table.Head>
              <Table.Head>Műveletek</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each filteredOrders as order, index (order.id)}
              <Table.Row>
                <Table.Cell>#{index + 1}</Table.Cell>
                <Table.Cell>{order.vevo_nev}</Table.Cell>
                <Table.Cell>{order.email}</Table.Cell>
                <Table.Cell>{order.telefon}</Table.Cell>
                <Table.Cell>
                  {order.iranyitoszam} {order.telepules}<br/>
                  {order.utca_hazszam}
                </Table.Cell>
                <Table.Cell>{formatDate(order.megrendelve)}</Table.Cell>
                <Table.Cell>
                  {#if order.postazva === 1}
                    <div class="flex flex-col gap-1">
                      <Badge variant="success">Kiszállítva</Badge>
                      <span class="text-xs text-gray-700 dark:text-white">
                        {order.postazva_datum ? formatDate(order.postazva_datum) : ''}
                      </span>
                    </div>
                  {:else}
                    <Badge variant="warning">Feldolgozás alatt</Badge>
                  {/if}
                </Table.Cell>
                <Table.Cell>
                  <Button variant="default" size="sm" onclick={() => openOrderDetails(order, index + 1)}>
                    {#snippet children()}
                      <Eye size={16} />
                      Megjelenítés
                    {/snippet}
                  </Button>
                </Table.Cell>
                <Table.Cell>
                  <div class="flex gap-2">
                    <Button
                      variant={order.postazva === 1 ? 'warning' : 'success'}
                      size="sm"
                      onclick={() => toggleShipped(order.id, order.postazva)}
                    >
                      {#snippet children()}
                        {order.postazva === 1 ? 'Visszavonás' : 'Kiszállítás'}
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

        {#if filteredOrders.length === 0}
          <div class="text-center py-8 text-gray-700 dark:text-white/60">
            {statusFilter === 'all' ? 'Nincs megjeleníthető rendelés.' : 'Nincs a szűrőnek megfelelő rendelés.'}
          </div>
        {/if}
      </div>
    {/if}
  </main>

  <!-- Order Details Dialog -->
  <Dialog.Root open={selectedOrder !== null} onOpenChange={(open) => { if (!open) closeOrderDetails(); }}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title class="text-2xl">{selectedOrder ? `Rendelés #${selectedOrderNumber} tételei` : ''}</Dialog.Title>
        {#if selectedOrder}
          <div>
            <span class="text-sm font-bold text-gray-800 dark:text-white">Rendelés ID:</span>
            <span class="ml-2 font-mono text-sm font-bold text-gray-800 dark:text-white select-all">{selectedOrder.id}</span>
          </div>
        {/if}
      </Dialog.Header>

      {#if selectedOrder}
        <div class="space-y-3 max-h-96 overflow-y-auto">
          {#each selectedOrder.items as item}
            <div class="flex justify-between items-start p-4 rounded-xl backdrop-blur-xl border
              bg-white/40 border-white/50
              dark:bg-white/[0.05] dark:border-white/[0.1]">
              <div class="flex-1">
                <div class="font-semibold text-gray-800 dark:text-white text-lg">
                  {item.termek_nev} <span class="text-gray-600 dark:text-white/80">x{item.mennyiseg}</span>
                </div>
                <div class="text-sm text-gray-700 dark:text-white mt-2">
                  <div>Tej: <span class="font-medium">{item.tej}</span></div>
                  <div>Cukor: <span class="font-medium">{item.cukor}</span></div>
                </div>
              </div>
              <div class="font-bold text-gray-800 dark:text-white text-lg">
                {item.termek_ar * item.mennyiseg} Ft
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-4 pt-4 border-t border-gray-800/20 dark:border-white/20 flex justify-between items-center">
          <span class="text-lg font-bold text-gray-800 dark:text-white">Összesen:</span>
          <span class="text-xl font-bold text-gray-800 dark:text-white">
            {calculateOrderTotal(selectedOrder)} Ft
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

