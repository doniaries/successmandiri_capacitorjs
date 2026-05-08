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
            <ion-toolbar color="white" class="ion-padding-horizontal">
              <ion-buttons slot="start">
                <div class="logo-mini">SM</div>
              </ion-buttons>
              <ion-title class="ion-text-uppercase font-black">Success Mandiri</ion-title>
              
              <!-- Sync Status Indicator -->
              <ion-buttons slot="end">
                <div class="sync-status-indicator" :class="{ 'offline': !SyncService.isOnline }">
                  <div class="status-dot" :class="{ 'syncing': SyncService.isSyncing }"></div>
                  <span class="status-text" v-if="SyncService.unsyncedCount > 0">
                    {{ SyncService.unsyncedCount }} Pending
                  </span>
                </div>
                <ion-button @click="handleLogout" color="medium">
                  <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content :fullscreen="true" color="light">
            <div class="ion-padding main-dashboard">
              
              <!-- Greeting -->
              <div class="greeting-section">
                <h2>Halo, Super Admin</h2>
                <p>{{ currentDate }}</p>
              </div>

              <!-- Premium 6-Widget Grid (Matching New Laravel Dashboard) -->
              <div class="stats-grid-6">
                <!-- Saldo Kas Perusahaan -->
                <div class="stat-card-6 emerald">
                  <div class="stat-header">
                    <span>Saldo Kas Perusahaan</span>
                  </div>
                  <div class="stat-value">{{ formatCurrency(stats.saldo_kas) }}</div>
                  <div class="stat-footer">
                    <span>Total saldo tersedia saat ini</span>
                    <ion-icon :icon="walletOutline" class="footer-icon"></ion-icon>
                  </div>
                </div>

                <!-- DO Hari Ini -->
                <div class="stat-card-6 blue">
                  <div class="stat-header">
                    <span>DO Hari Ini</span>
                  </div>
                  <div class="stat-value">{{ stats.do_hari_ini }}</div>
                  <div class="stat-footer">
                    <span>Total Bruto: {{ formatCurrency(stats.total_bruto) }}</span>
                    <ion-icon :icon="documentTextOutline" class="footer-icon"></ion-icon>
                  </div>
                </div>

                <!-- Total Tonase -->
                <div class="stat-card-6 amber">
                  <div class="stat-header">
                    <span>Total Tonase</span>
                  </div>
                  <div class="stat-value">{{ stats.total_tonase }} Kg</div>
                  <div class="stat-footer">
                    <span>Volume buah masuk hari ini</span>
                    <ion-icon :icon="scaleOutline" class="footer-icon"></ion-icon>
                  </div>
                </div>

                <!-- Uang Masuk (Hari Ini) -->
                <div class="stat-card-6 emerald">
                  <div class="stat-header">
                    <span>Uang Masuk (Hari Ini)</span>
                  </div>
                  <div class="stat-value">{{ formatCurrency(stats.uang_masuk) }}</div>
                  <div class="stat-footer">
                    <span>Topup: {{ formatCurrency(stats.topup) }} | Ops: {{ formatCurrency(stats.ops_biaya) }}</span>
                    <ion-icon :icon="trendingUpOutline" class="footer-icon"></ion-icon>
                  </div>
                </div>

                <!-- Pengeluaran (Hari Ini) -->
                <div class="stat-card-6 rose">
                  <div class="stat-header">
                    <span>Pengeluaran (Hari Ini)</span>
                  </div>
                  <div class="stat-value">{{ formatCurrency(stats.uang_keluar) }}</div>
                  <div class="stat-footer">
                    <span>Bayar Tunai: {{ formatCurrency(stats.bayar_tunai) }} | Ops/Biaya: {{ formatCurrency(stats.ops_biaya) }}</span>
                    <ion-icon :icon="trendingDownOutline" class="footer-icon"></ion-icon>
                  </div>
                </div>

                <!-- Rekap Cara Bayar -->
                <div class="stat-card-6 amber">
                  <div class="stat-header">
                    <span>Rekap Cara Bayar</span>
                  </div>
                  <div class="stat-value">{{ stats.rekap_cara_bayar }} DO</div>
                  <div class="stat-footer">
                    <span>T: {{ stats.tunai }} | Tr: {{ stats.transfer }} | C: {{ stats.cair }} | B: {{ stats.belum }}</span>
                    <ion-icon :icon="cardOutline" class="footer-icon"></ion-icon>
                  </div>
                </div>
              </div>

              <!-- Services Grid -->
              <div class="section-header">
                <h3>LAYANAN UTAMA</h3>
              </div>
              <div class="services-grid">
                <div class="service-item" @click="currentTab = 'add'">
                  <div class="icon-box blue">
                    <ion-icon :icon="busOutline"></ion-icon>
                  </div>
                  <div class="text">
                    <strong>TRANSAKSI DO</strong>
                    <span>INPUT PENGIRIMAN</span>
                  </div>
                </div>
                <div class="service-item">
                  <div class="icon-box emerald">
                    <ion-icon :icon="cashOutline"></ion-icon>
                  </div>
                  <div class="text">
                    <strong>KAS HARIAN</strong>
                    <span>LAPORAN KEUANGAN</span>
                  </div>
                </div>
              </div>

              <!-- Recent Transactions -->
              <div class="section-header flex-row">
                <h3>TRANSAKSI TERAKHIR</h3>
                <button class="view-all">SEMUA</button>
              </div>
              <div class="transaction-list">
                <div v-if="recentTransactions.length === 0" class="empty-state">
                  <p>Belum ada transaksi</p>
                </div>
                <div v-for="tx in recentTransactions" :key="tx.id" class="transaction-item">
                  <div class="icon-circle">
                    <ion-icon :icon="busOutline"></ion-icon>
                  </div>
                  <div class="info">
                    <strong>{{ tx.nomor || '#DRAFT-' + tx.id }}</strong>
                    <span>{{ tx.customer_name }} • {{ formatTime(tx.created_at) }}</span>
                  </div>
                  <div class="tx-amount">
                    <span :class="tx.is_synced ? 'synced' : 'pending'">
                      {{ tx.is_synced ? 'Synced' : 'Pending' }}
                    </span>
                  </div>
                  <ion-icon :icon="chevronForwardOutline" class="chevron"></ion-icon>
                </div>
              </div>

            </div>

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

.custom-tab-bar {
  --background: white;
  --border-color: #f1f5f9;
  height: 85px;
  border-radius: 25px 25px 0 0;
  box-shadow: 0 -5px 20px rgba(0,0,0,0.03);
}

.custom-tab-bar ion-tab-button {
  --color-selected: #01579B;
  --color: #94a3b8;
}

.custom-tab-bar ion-label {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

/* Header & Toolbar */
ion-toolbar {
  --background: var(--header-bg);
  --color: var(--text-color);
  --border-style: none;
}

/* Page Setup */
ion-content {
  --background: var(--bg-color);
}

.dashboard-container {
  padding: 20px;
}

/* Greeting */
.greeting-section {
  margin-top: 10px;
  margin-bottom: 25px;
}

.greeting-section h2 {
  font-size: 24px;
  font-weight: 900;
  color: var(--text-color);
  margin: 0;
  letter-spacing: -0.5px;
}

.greeting-section p {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 5px 0 0;
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
