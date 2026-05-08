<template>
  <ion-app>
    <!-- Login View Condition -->
    <LoginView v-if="!isLoggedIn" @login-success="isLoggedIn = true" />

    <template v-else>
      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>
        
        <!-- Dashboard Home Content -->
        <ion-page v-if="currentTab === 'home'" id="main-content">
          <ion-header class="ion-no-border">
            <ion-toolbar class="ion-padding-horizontal">
              <ion-buttons slot="start">
                <div class="logo-mini">SM</div>
              </ion-buttons>
              <ion-title class="ion-text-uppercase font-black">Success Mandiri</ion-title>
              
              <ion-buttons slot="end">
                <ion-button @click="toggleDarkMode">
                  <ion-icon slot="icon-only" :icon="isDarkMode ? sunnyOutline : moonOutline" color="primary"></ion-icon>
                </ion-button>
                <ion-button @click="handleLogout" color="medium">
                  <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content :fullscreen="true">
            <div class="dashboard-wrapper">
              <div class="greeting-section">
                <p>{{ currentDate }}</p>
                <h2>Halo, Super Admin</h2>
              </div>

              <div class="nested-content">
                <!-- Status Sinkronisasi -->
                <div class="sync-status-bar">
                  <div class="sync-dot" :class="{ 'synced': SyncService.isOnline }"></div>
                  <span>{{ SyncService.isOnline ? 'Terhubung ke Laravel' : 'Mode Offline' }}</span>
                </div>

                <div class="stats-grid-6">
                  <!-- Saldo Kas -->
                  <div class="stat-card-6 emerald">
                    <span class="stat-label">Saldo Kas Perusahaan</span>
                    <h3 class="stat-value">{{ formatCurrency(stats.saldo_kas) }}</h3>
                    <div class="stat-footer">
                      <span class="footer-text">Total saldo tersedia</span>
                      <ion-icon :icon="walletOutline" class="footer-icon"></ion-icon>
                    </div>
                  </div>

                  <!-- DO Hari Ini -->
                  <div class="stat-card-6 blue">
                    <span class="stat-label">DO Hari Ini</span>
                    <h3 class="stat-value">{{ stats.do_hari_ini }}</h3>
                    <div class="stat-footer">
                      <span class="footer-text">Total Bruto: {{ formatCurrency(stats.total_bruto) }}</span>
                      <ion-icon :icon="documentTextOutline" class="footer-icon"></ion-icon>
                    </div>
                  </div>

                  <!-- Total Tonase -->
                  <div class="stat-card-6 amber">
                    <span class="stat-label">Total Tonase</span>
                    <h3 class="stat-value">{{ stats.total_tonase }} Kg</h3>
                    <div class="stat-footer">
                      <span class="footer-text">Volume buah hari ini</span>
                      <ion-icon :icon="scaleOutline" class="footer-icon"></ion-icon>
                    </div>
                  </div>

                  <!-- Uang Masuk -->
                  <div class="stat-card-6 emerald">
                    <span class="stat-label">Uang Masuk (Hari Ini)</span>
                    <h3 class="stat-value">{{ formatCurrency(stats.uang_masuk) }}</h3>
                    <div class="stat-footer">
                      <span class="footer-text">Topup: {{ formatCurrency(stats.topup) }}</span>
                      <ion-icon :icon="trendingUpOutline" class="footer-icon"></ion-icon>
                    </div>
                  </div>

                  <!-- Pengeluaran -->
                  <div class="stat-card-6 rose">
                    <span class="stat-label">Pengeluaran (Hari Ini)</span>
                    <h3 class="stat-value">{{ formatCurrency(stats.uang_keluar) }}</h3>
                    <div class="stat-footer">
                      <span class="footer-text">Ops/Biaya: {{ formatCurrency(stats.ops_biaya) }}</span>
                      <ion-icon :icon="trendingDownOutline" class="footer-icon"></ion-icon>
                    </div>
                  </div>

                  <!-- Rekap Cara Bayar -->
                  <div class="stat-card-6 amber">
                    <span class="stat-label">Rekap Cara Bayar</span>
                    <h3 class="stat-value">{{ stats.rekap_cara_bayar }} DO</h3>
                    <div class="stat-footer">
                      <span class="footer-text">T: {{ stats.tunai }} | Tr: {{ stats.transfer }}</span>
                      <ion-icon :icon="cardOutline" class="footer-icon"></ion-icon>
                    </div>
                  </div>
                </div>

                <!-- Recent Transactions Section inside Nested -->
                <div class="section-header flex-row">
                  <h3>TRANSAKSI TERAKHIR</h3>
                  <button class="view-all">SEMUA</button>
                </div>
                <div class="transaction-list">
                  <div v-if="recentTransactions.length === 0" class="empty-state">
                    <p>Belum ada transaksi</p>
                  </div>
                  <div v-for="tx in recentTransactions" :key="tx.id" class="transaction-item">
                    <div class="tx-icon" :class="tx.type === 'income' ? 'income' : 'expense'">
                      <ion-icon :icon="tx.type === 'income' ? arrowUpCircleOutline : arrowDownCircleOutline"></ion-icon>
                    </div>
                    <div class="tx-info">
                      <p class="tx-title">{{ tx.title }}</p>
                      <p class="tx-date">{{ tx.date }}</p>
                    </div>
                    <div class="tx-amount" :class="tx.type">
                      {{ tx.type === 'income' ? '+' : '-' }} Rp {{ formatCurrency(tx.amount) }}
                    </div>
                  </div>
                </div>
              </div> <!-- End nested-content -->
            </div> <!-- End dashboard-wrapper -->

            <!-- FAB -->
            <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="custom-fab">
              <ion-fab-button @click="currentTab = 'add'" color="primary">
                <ion-icon :icon="addOutline"></ion-icon>
              </ion-fab-button>
            </ion-fab>
          </ion-content>
        </ion-page>

        <!-- Form Page Content -->
        <ion-page v-if="currentTab === 'add'">
          <ion-header>
            <ion-toolbar color="primary">
              <ion-buttons slot="start">
                <ion-button @click="currentTab = 'home'">
                  <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
              <ion-buttons slot="end">
                <ion-button @click="toggleDarkMode">
                  <ion-icon :icon="isDarkMode ? sunnyOutline : moonOutline" color="primary"></ion-icon>
                </ion-button>
                <ion-button @click="handleLogout">
                  <ion-icon :icon="logOutOutline" color="danger"></ion-icon>
                </ion-button>
              </ion-buttons>
              <ion-title>Tambah Transaksi</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding" color="light">
            <OfflineForm @submitted="currentTab = 'home'" />
          </ion-content>
        </ion-page>

        <!-- Tab Bar -->
        <ion-tab-bar slot="bottom" class="custom-tab-bar" v-if="currentTab !== 'add'">
          <ion-tab-button tab="home" @click="currentTab = 'home'" :selected="currentTab === 'home'">
            <ion-icon :icon="gridOutline"></ion-icon>
            <ion-label>Beranda</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="history">
            <ion-icon :icon="timeOutline"></ion-icon>
            <ion-label>Riwayat</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="profile">
            <ion-icon :icon="personOutline"></ion-icon>
            <ion-label>Profil</ion-label>
          </ion-tab-button>
        </ion-tab-bar>

      </ion-tabs>
    </template>
  </ion-app>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { 
  IonApp, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel, 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonFab, IonFabButton
} from '@ionic/vue';
import { 
  gridOutline, timeOutline, personOutline, logOutOutline, walletOutline,
  trendingUpOutline, trendingDownOutline, busOutline, cashOutline,
  chevronForwardOutline, addOutline, arrowBackOutline, scaleOutline,
  arrowDownCircleOutline, arrowUpCircleOutline, documentTextOutline,
  cardOutline, moonOutline, sunnyOutline
} from 'ionicons/icons';
import LoginView from './components/LoginView.vue';
import OfflineForm from './components/OfflineForm.vue';
import { SyncService } from './services/sync';
import { DatabaseService } from './services/database';

const isLoggedIn = ref(true);
const currentTab = ref('home');
const recentTransactions = ref([]);
const isDarkMode = ref(localStorage.getItem('theme') !== 'light'); // Default dark

const stats = reactive({
  saldo_kas: 46500000,
  do_hari_ini: 0,
  total_bruto: 0,
  total_tonase: 0,
  uang_masuk: 0,
  topup: 0,
  uang_keluar: 0,
  bayar_tunai: 0,
  ops_biaya: 0,
  rekap_cara_bayar: 0,
  tunai: 0,
  transfer: 0,
  cair: 0,
  belum: 0
});

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  updateTheme();
};

const updateTheme = () => {
  const theme = isDarkMode.value ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
};

const currentDate = new Intl.DateTimeFormat('id-ID', { 
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
}).format(new Date());

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0 
  }).format(val);
};

const formatCurrencyShort = (val) => {
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}K`;
  return formatCurrency(val);
};

const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString('id-ID', { 
    hour: '2-digit', minute: '2-digit' 
  });
};

const loadDashboardData = async () => {
  try {
    recentTransactions.value = await DatabaseService.getRecentTransactions(5);
    // Di sini bisa ditambahkan logic untuk hitung stats dari local data jika perlu
  } catch (e) {
    console.error("Gagal memuat data dashboard:", e);
  }
};

const handleLogout = () => {
  isLoggedIn.value = false;
};

onMounted(() => {
  updateTheme();
  loadDashboardData();
  // Refresh data setiap kali kembali ke tab home
  setInterval(loadDashboardData, 10000);
});
</script>

<style scoped>
.font-black { font-weight: 900; }

.logo-mini {
  width: 36px;
  height: 36px;
  background: #01579B;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-style: italic;
  font-size: 14px;
}

.main-dashboard {
  padding-bottom: 80px;
}

.greeting-section {
  margin-bottom: 25px;
}

.greeting-section h2 {
  font-size: 24px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
}

.greeting-section p {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 5px;
}

.premium-balance-card {
  background: #01579B;
  border-radius: 32px;
  padding: 25px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(1, 87, 155, 0.3);
  margin-bottom: 30px;
}

.card-bg-decoration {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 140px;
  height: 140px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
}

.card-content {
  position: relative;
  z-index: 2;
}

.card-content .label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.7);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.balance-amount {
  color: white;
  font-size: 30px;
  font-weight: 900;
  margin: 15px 0;
  letter-spacing: -1px;
}

.stats-row {
  display: flex;
  gap: 12px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255,255,255,0.15);
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
}

.stat-badge.income span { color: #4ade80; }
.stat-badge.expense span { color: #f87171; }

.section-header {
  margin-bottom: 15px;
}

.section-header.flex-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0;
}

.services-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
}

.service-item {
  background: white;
  padding: 20px;
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.icon-box.blue { background: #eff6ff; color: #01579B; }
.icon-box.emerald { background: #ecfdf5; color: #059669; }

.service-item .text strong {
  display: block;
  font-size: 14px;
  font-weight: 900;
  color: #1e293b;
  text-transform: uppercase;
}

.service-item .text span {
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.view-all {
  background: transparent;
  color: #01579B;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  border: none;
}

.transaction-list {
  background: white;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px 20px;
  border-bottom: 1px solid #f8fafc;
}

.transaction-item:last-child { border-bottom: none; }

.icon-circle {
  width: 44px;
  height: 44px;
  background: #f1f5f9;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 20px;
}

.transaction-item .info strong {
  display: block;
  font-size: 13px;
  font-weight: 900;
  color: #1e293b;
}

.transaction-item .info span {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
}

.tx-amount {
  margin-left: auto;
  text-align: right;
  margin-right: 10px;
}

.tx-amount span {
  font-size: 9px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.synced {
  background: #f0fdf4;
  color: #16a34a;
}

.pending {
  background: #fffbeb;
  color: #d97706;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  font-weight: 600;
  font-size: 13px;
}

.chevron {
  color: #cbd5e1;
  font-size: 18px;
}

/* Tab Bar Styling (Floating) */
ion-tab-bar {
  --background: var(--card-bg);
  --border: none;
  height: 65px;
  width: calc(100% - 40px);
  margin: 0 20px 20px 20px;
  border-radius: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  position: absolute;
  bottom: 0;
  backdrop-filter: blur(10px);
  background: rgba(var(--tab-bg-rgb), 0.8) !important;
  border: 1px solid var(--card-border);
}

body:not(.dark-mode) ion-tab-bar { --tab-bg-rgb: 255, 255, 255; }
body.dark-mode ion-tab-bar { --tab-bg-rgb: 24, 24, 27; }

ion-tab-button {
  --color: #94a3b8;
  --color-selected: #3b82f6;
  transition: all 0.3s ease;
}

ion-tab-button ion-icon {
  font-size: 24px;
}

ion-tab-button.tab-selected ion-icon {
  transform: translateY(-2px);
}

ion-tab-button ion-label {
  font-size: 10px;
  font-weight: 800;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Global Content Reset */
ion-content {
  --background: var(--bg-color);
  --padding-top: 0;
  --padding-bottom: 90px;
}

/* Dashboard Layout (Nested Approach) */
.dashboard-wrapper {
  background: var(--bg-color);
  min-height: 100vh;
  position: relative;
}

.nested-content {
  background: var(--card-bg);
  border-radius: 32px 32px 0 0;
  min-height: calc(100vh - 120px);
  padding: 24px 20px;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.05);
  margin-top: -20px;
  position: relative;
  z-index: 10;
}

/* Header & Toolbar */
ion-toolbar {
  --background: var(--bg-color);
  --color: var(--text-color);
  --border-style: none;
  --padding-top: calc(var(--safe-area-inset-top) + 15px);
  --padding-bottom: 15px;
  --padding-start: 16px;
  --padding-end: 16px;
}

ion-title {
  font-weight: 900;
  letter-spacing: -0.5px;
  font-size: 19px;
  text-align: left;
}

/* Greeting Section */
.greeting-section {
  padding: 45px 20px 40px;
  background: var(--bg-color);
  position: relative;
  z-index: 5;
}

.greeting-section h2 {
  font-size: 26px;
  font-weight: 900;
  color: var(--text-color);
  margin: 0;
  letter-spacing: -0.8px;
  line-height: 1.2;
}

.greeting-section p {
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 8px;
}

/* Sync Status Bar */
.sync-status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  background: var(--bg-color);
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-color);
  border: 1px solid var(--card-border);
}

.sync-dot {
  width: 8px;
  height: 8px;
  background: #f43f5e;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.5);
}

.sync-dot.synced {
  background: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

/* Transaction List */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0 20px;
}

.section-header h3 {
  font-size: 13px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.view-all {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 14px 0;
  border-bottom: 1px solid var(--card-border);
}

.transaction-item:last-child {
  border-bottom: none;
}

.tx-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.tx-icon.income { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.tx-icon.expense { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }

.tx-info { flex: 1; }
.tx-title { font-weight: 800; font-size: 15px; color: var(--text-color); margin: 0; }
.tx-date { font-size: 12px; color: #94a3b8; margin: 4px 0 0; font-weight: 600; }

.tx-amount { font-weight: 900; font-size: 15px; }
.tx-amount.income { color: #10b981; }
.tx-amount.expense { color: #f43f5e; }

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
  font-weight: 600;
}

.custom-fab {
  margin-bottom: 90px;
  margin-right: 10px;
}

.custom-fab ion-fab-button {
  --box-shadow: 0 10px 25px rgba(1, 87, 155, 0.4);
}

/* Stats Grid 6 */
.stats-grid-6 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 25px;
}

@media (min-width: 350px) {
  .stats-grid-6 {
    grid-template-columns: 1fr 1fr;
  }
}

.stat-card-6 {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--card-border);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card-6.emerald { border-left: 3px solid #10b981; }
.stat-card-6.blue { border-left: 3px solid #3b82f6; }
.stat-card-6.amber { border-left: 3px solid #f59e0b; }
.stat-card-6.rose { border-left: 3px solid #f43f5e; }

.stat-header span {
  font-size: 11px;
  font-weight: 600;
  color: #a1a1aa;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: white;
  margin: 4px 0;
}

.stat-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.stat-footer span {
  font-size: 10px;
  font-weight: 500;
  color: #71717a;
}

.footer-icon {
  font-size: 14px;
  opacity: 0.8;
}

.emerald .footer-icon { color: #10b981; }
.blue .footer-icon { color: #3b82f6; }
.amber .footer-icon { color: #f59e0b; }
.rose .footer-icon { color: #f43f5e; }

.emerald .stat-footer span { color: #10b981; opacity: 0.9; }
.blue .stat-footer span { color: #3b82f6; opacity: 0.9; }
.amber .stat-footer span { color: #f59e0b; opacity: 0.9; }
.rose .stat-footer span { color: #f43f5e; opacity: 0.9; }

/* Sync Status Indicator Styles */
.sync-status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 6px 12px;
  border-radius: 100px;
  margin-right: 10px;
  transition: all 0.3s ease;
}

.sync-status-indicator.offline {
  background: #fef2f2;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.offline .status-dot {
  background: #ef4444;
}

.status-text {
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.syncing {
  animation: blink 1s infinite;
}

@keyframes blink {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
