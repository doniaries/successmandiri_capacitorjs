<template>
  <ion-app>
    <!-- Login View Condition -->
    <LoginView v-if="!isLoggedIn" @login-success="handleLoginSuccess" />

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
                <!-- Sync Status Icon -->
                <div class="sync-status-header">
                  <ion-icon 
                    :icon="SyncService.isOnline ? cloudDoneOutline : cloudOfflineOutline" 
                    :color="SyncService.isOnline ? 'success' : 'danger'"
                    class="sync-icon-large"
                  ></ion-icon>
                  <div class="sync-badge" v-if="SyncService.unsyncedCount > 0">{{ SyncService.unsyncedCount }}</div>
                </div>

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
            <!-- Pull to Refresh -->
            <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
              <ion-refresher-content></ion-refresher-content>
            </ion-refresher>

            <div class="dashboard-wrapper">
              
              <!-- Premium Profile Card -->
              <div class="profile-card-container" @click="currentTab = 'profile'">
                <div class="profile-card clickable">
                  <div class="profile-main">
                    <div class="avatar-wrapper">
                      <img src="https://ui-avatars.com/api/?name=Super+Admin&background=01579B&color=fff" alt="User">
                      <div class="online-indicator"></div>
                    </div>
                    <div class="profile-info">
                      <h2>Halo, Super Admin</h2>
                      <p>{{ currentDate }}</p>
                    </div>
                  </div>
                  <div class="profile-time">
                    <ion-icon :icon="timeOutline"></ion-icon>
                    <span>{{ currentTime }}</span>
                  </div>
                </div>
              </div>

              <div class="nested-content">
                <!-- Tabs Statistik -->
                <div class="stats-tabs-container">
                  <ion-segment v-model="statTab" mode="ios" class="custom-segment">
                    <ion-segment-button value="keuangan">
                      <ion-label>Keuangan</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="operasional">
                      <ion-label>Operasional</ion-label>
                    </ion-segment-button>
                  </ion-segment>
                </div>

                <!-- Widgets Keuangan -->
                <div v-if="statTab === 'keuangan'" class="stats-grid-compact horizontal-scroll">
                  <!-- Saldo Kas -->
                  <div class="stat-card-mini emerald">
                    <div class="mini-header">
                      <span>Saldo Kas Perusahaan</span>
                    </div>
                    <h3 class="mini-value">{{ formatCurrency(stats.saldo_kas) }}</h3>
                    <div class="mini-footer">
                      <span class="footer-label">Total saldo tersedia</span>
                      <ion-icon :icon="walletOutline"></ion-icon>
                    </div>
                  </div>

                  <!-- Uang Masuk -->
                  <div class="stat-card-mini blue">
                    <div class="mini-header">
                      <span>Uang Masuk (Hari Ini)</span>
                    </div>
                    <h3 class="mini-value">{{ formatCurrency(stats.uang_masuk) }}</h3>
                    <div class="mini-footer">
                      <span class="footer-label">Total topup hari ini</span>
                      <ion-icon :icon="trendingUpOutline"></ion-icon>
                    </div>
                  </div>

                  <!-- Pengeluaran -->
                  <div class="stat-card-mini rose">
                    <div class="mini-header">
                      <span>Pengeluaran (Hari Ini)</span>
                    </div>
                    <h3 class="mini-value">{{ formatCurrency(stats.uang_keluar) }}</h3>
                    <div class="mini-footer">
                      <span class="footer-label">Total biaya operasional</span>
                      <ion-icon :icon="trendingDownOutline"></ion-icon>
                    </div>
                  </div>
                </div>

                <!-- Widgets Operasional -->
                <div v-if="statTab === 'operasional'" class="stats-grid-compact horizontal-scroll">
                  <!-- DO Hari Ini -->
                  <div class="stat-card-mini blue">
                    <div class="mini-header">
                      <span>DO Hari Ini</span>
                    </div>
                    <h3 class="mini-value">{{ stats.do_hari_ini }} DO</h3>
                    <div class="mini-footer">
                      <span class="footer-label">Total Bruto: {{ formatCurrency(stats.total_bruto) }}</span>
                      <ion-icon :icon="documentTextOutline"></ion-icon>
                    </div>
                  </div>

                  <!-- Total Tonase -->
                  <div class="stat-card-mini amber">
                    <div class="mini-header">
                      <span>Total Tonase</span>
                    </div>
                    <h3 class="mini-value">{{ stats.total_tonase }} Kg</h3>
                    <div class="mini-footer">
                      <span class="footer-label">Volume buah hari ini</span>
                      <ion-icon :icon="scaleOutline"></ion-icon>
                    </div>
                  </div>

                  <!-- Rekap Cara Bayar -->
                  <div class="stat-card-mini emerald">
                    <div class="mini-header">
                      <span>Rekap Cara Bayar</span>
                    </div>
                    <h3 class="mini-value">{{ stats.tunai }} T | {{ stats.transfer }} Tr</h3>
                    <div class="mini-footer">
                      <span class="footer-label">T: Tunai, Tr: Transfer</span>
                      <ion-icon :icon="cardOutline"></ion-icon>
                    </div>
                  </div>
                </div>

                <!-- Quick Action Cards (Moved Below) -->
                <div class="quick-actions-grid" style="margin-top: 10px;">
                  <div class="action-card primary" @click="currentTab = 'add'; currentFormType = 'DO'">
                    <div class="action-icon">
                      <ion-icon :icon="addOutline"></ion-icon>
                    </div>
                    <div class="action-text">
                      <h4>Transaksi DO</h4>
                      <p>Input pengiriman</p>
                    </div>
                  </div>
                  <div class="action-card secondary" @click="currentTab = 'add'; currentFormType = 'OPS'">
                    <div class="action-icon">
                      <ion-icon :icon="cashOutline"></ion-icon>
                    </div>
                    <div class="action-text">
                      <h4>Operasional</h4>
                      <p>Biaya & pengeluaran</p>
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
                    <div class="tx-icon" :class="tx.type === 'OPS' ? 'rose' : 'blue'">
                      <ion-icon :icon="tx.type === 'OPS' ? cashOutline : busOutline"></ion-icon>
                    </div>
                    <div class="tx-info">
                      <p class="tx-title">{{ tx.customer_name || 'Tanpa Nama' }}</p>
                      <p class="tx-date">{{ tx.item_name }} • {{ formatTime(tx.created_at) }}</p>
                    </div>
                    <div class="tx-amount" :class="tx.type === 'OPS' ? 'rose-text' : 'blue-text'">
                      {{ tx.type === 'OPS' ? 'Rp ' + formatCurrency(tx.qty) : tx.qty + ' Kg' }}
                    </div>
                  </div>
                </div>
              </div> <!-- End nested-content -->
            </div> <!-- End dashboard-wrapper -->

          </ion-content>
        </ion-page>

        <!-- History Page Content -->
        <ion-page v-if="currentTab === 'history'">
          <ion-header class="ion-no-border">
            <ion-toolbar class="ion-padding-horizontal">
              <ion-title>Riwayat Transaksi</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="nested-content">
              <h3>Daftar Riwayat</h3>
              <p>Halaman Riwayat Transaksi Sedang Dikembangkan...</p>
            </div>
          </ion-content>
        </ion-page>

        <!-- Profile Page Content -->
        <ion-page v-if="currentTab === 'profile'">
          <ion-header class="ion-no-border">
            <ion-toolbar class="ion-padding-horizontal">
              <ion-title>Profil Pengguna</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="nested-content">
              <div class="profile-card-container">
                <div class="profile-card">
                   <div class="profile-main">
                      <div class="avatar-wrapper">
                        <img src="https://ui-avatars.com/api/?name=Super+Admin&background=01579B&color=fff" alt="User">
                      </div>
                      <div class="profile-info">
                        <h2>Super Admin</h2>
                        <p>superadmin@gmail.com</p>
                      </div>
                   </div>
                </div>
              </div>
              <ion-button expand="block" color="danger" @click="handleLogout" style="margin-top: 20px;">
                LOGOUT
              </ion-button>
            </div>
          </ion-content>
        </ion-page>

        <!-- Add Transaction Page -->
        <ion-page v-if="currentTab === 'add'">
          <ion-header class="ion-no-border">
            <ion-toolbar class="ion-padding-horizontal">
              <ion-buttons slot="start">
                <ion-button @click="currentTab = 'home'">
                  <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
              <ion-title>{{ currentFormType === 'DO' ? 'Tambah DO' : 'Tambah Operasional' }}</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="nested-content">
              <OfflineForm 
                :type="currentFormType"
                @submitted="currentTab = 'home'; loadDashboardData()" 
              />
            </div>
          </ion-content>
        </ion-page>

        <!-- Tab Bar -->
        <ion-tab-bar slot="bottom" class="custom-tab-bar" v-if="currentTab !== 'add'">
          <ion-tab-button tab="home" @click="currentTab = 'home'" :selected="currentTab === 'home'">
            <ion-icon :icon="gridOutline"></ion-icon>
            <ion-label>Beranda</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="history" @click="currentTab = 'history'" :selected="currentTab === 'history'">
            <ion-icon :icon="timeOutline"></ion-icon>
            <ion-label>Riwayat</ion-label>
          </ion-tab-button>
          
          <!-- Central Add Button -->
          <ion-tab-button tab="add" @click="currentTab = 'add'" class="center-add-tab">
            <ion-icon :icon="addCircleOutline" class="add-icon-main"></ion-icon>
            <ion-label>Tambah</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="profile" @click="currentTab = 'profile'" :selected="currentTab === 'profile'">
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
  IonFab, IonFabButton, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton
} from '@ionic/vue';
import { 
  gridOutline, timeOutline, personOutline, logOutOutline, walletOutline,
  trendingUpOutline, trendingDownOutline, busOutline, cashOutline,
  chevronForwardOutline, addOutline, arrowBackOutline, scaleOutline,
  arrowDownCircleOutline, arrowUpCircleOutline, documentTextOutline,
  cardOutline, moonOutline, sunnyOutline, cloudDoneOutline, cloudOfflineOutline,
  addCircleOutline
} from 'ionicons/icons';
import LoginView from './components/LoginView.vue';
import OfflineForm from './components/OfflineForm.vue';
import { SyncService } from './services/sync';
import { DatabaseService } from './services/database';

const isLoggedIn = ref(false);
const currentTab = ref('home');
const statTab = ref('keuangan');
const currentFormType = ref('DO'); // 'DO' atau 'OPS'
const recentTransactions = ref([]);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark'); // Default putih (false)

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
  return `Rp ${val}`;
};

const doRefresh = async (event) => {
  console.log('Refreshing data...');
  if (SyncService.isOnline) {
    await SyncService.syncAll();
  }
  await loadDashboardData();
  event.target.complete();
};

const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString('id-ID', { 
    hour: '2-digit', minute: '2-digit' 
  });
};

const loadDashboardData = async () => {
  try {
    recentTransactions.value = await DatabaseService.getRecentTransactions(5);
    
    // Update stats dari local database
    const localStats = await DatabaseService.getDashboardStats();
    Object.assign(stats, localStats);
    
    console.log("Dashboard data updated from local DB");
  } catch (e) {
    console.error("Gagal memuat data dashboard:", e);
  }
};

const handleLogout = () => {
  isLoggedIn.value = false;
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  console.log("Logged out, session cleared.");
};

const handleLoginSuccess = (authData) => {
  const { token, remember } = authData;
  isLoggedIn.value = true;
  
  if (remember) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
  
  loadDashboardData();
  SyncService.syncAll();
};

const currentTime = ref(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

onMounted(async () => {
  // Check if session exists in either storage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    isLoggedIn.value = true;
    console.log("Session restored");
  }

  updateTheme();
  await DatabaseService.init();
  await SyncService.init();
  
  // Triger sync awal saat refresh
  if (isLoggedIn.value && SyncService.isOnline) {
    console.log("Triggering auto-sync on refresh...");
    SyncService.syncAll(); 
  }

  loadDashboardData();
  
  setInterval(updateTime, 1000);
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

.custom-item ion-input, 
.custom-item ion-textarea {
  font-size: 20px;
  font-weight: 800;
  color: #01579B;
  --placeholder-color: #cbd5e1;
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

/* Quick Actions Grid */
.quick-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.action-card:active {
  transform: scale(0.96);
  background: #f8fafc;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.primary .action-icon {
  background: #eff6ff;
  color: #3b82f6;
}

.secondary .action-icon {
  background: #fdf2f8;
  color: #db2777;
}

.action-text h4 {
  font-size: 13px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
}

.action-text p {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  margin: 2px 0 0;
}

/* Transaction List Icons & Colors */
.tx-icon.rose { background: #fff1f2; color: #f43f5e; border-radius: 12px; }
.tx-icon.blue { background: #eff6ff; color: #3b82f6; border-radius: 12px; }
.rose-text { color: #f43f5e; font-weight: 800; }
.blue-text { color: #3b82f6; font-weight: 800; }

/* Tab Bar Adjustments */
.add-icon-main {
  font-size: 32px !important;
  color: #01579B;
  margin-bottom: 2px;
}

.center-add-tab {
  --color-selected: #01579B;
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
  width: 100%;
  margin: 0;
  border-radius: 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  position: relative;
  backdrop-filter: blur(10px);
  background: rgba(var(--tab-bg-rgb), 0.9) !important;
  border-top: 1px solid var(--card-border);
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

/* Profile Card Styling */
.profile-card-container {
  padding: 60px 20px 30px;
  background: var(--bg-color);
}

.profile-card {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--card-border);
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar-wrapper {
  position: relative;
  width: 54px;
  height: 54px;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  object-fit: cover;
  border: 2px solid var(--card-border);
}

.online-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  background: #10b981;
  border: 3px solid var(--card-bg);
  border-radius: 50%;
}

.profile-info h2 {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-color);
  margin: 0;
  letter-spacing: -0.5px;
}

.profile-info p {
  font-size: 10px;
  font-weight: 700;
  color: var(--muted-text);
  text-transform: uppercase;
  margin: 4px 0 0;
  letter-spacing: 0.5px;
}

.profile-time {
  background: rgba(1, 87, 155, 0.08);
  padding: 8px 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #01579B;
}

.profile-time span {
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.profile-time ion-icon {
  font-size: 16px;
}

/* Header Sync Indicator */
.sync-status-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.sync-icon-large {
  font-size: 24px;
}

.sync-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f43f5e;
  color: white;
  font-size: 9px;
  font-weight: 800;
  min-width: 14px;
  height: 14px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--bg-color);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
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

.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--muted-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 21px;
  font-weight: 900;
  color: var(--text-color);
  margin: 4px 0;
  letter-spacing: -0.5px;
}

.stat-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.footer-text {
  font-size: 10px;
  font-weight: 600;
  color: var(--muted-text);
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
/* Stats Tabs & Mini Cards Redesign */
.stats-tabs-container {
  margin-bottom: 15px;
  padding: 0 5px;
}

.custom-segment {
  --background: #f1f5f9;
  border-radius: 16px;
  padding: 6px;
}

.stats-grid-compact {
  display: flex;
  gap: 16px;
  padding: 5px 5px 25px 5px;
  margin-bottom: 5px;
}

.horizontal-scroll {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.horizontal-scroll::-webkit-scrollbar {
  display: none;
}

.stat-card-mini {
  flex: 0 0 240px; /* Lebar lebih besar agar mirip gambar */
  padding: 24px;
  border-radius: 28px;
  background: white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  scroll-snap-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.02);
}

.dark-mode .stat-card-mini {
  background: #1e1e1e;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.05);
}

.mini-header {
  margin-bottom: 12px;
}

.mini-header span {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0.2px;
}

.dark-mode .mini-header span {
  color: #94a3b8;
}

.mini-value {
  font-size: 24px;
  font-weight: 800;
  color: #000000;
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
}

.dark-mode .mini-value {
  color: #ffffff;
}

.mini-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.footer-label {
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
}

.mini-footer ion-icon {
  font-size: 18px;
  color: #10b981;
}

/* Color Overrides for specific cards */
.stat-card-mini.rose .footer-label, 
.stat-card-mini.rose .mini-footer ion-icon { color: #f43f5e; }

.stat-card-mini.blue .footer-label, 
.stat-card-mini.blue .mini-footer ion-icon { color: #3b82f6; }

.stat-card-mini.amber .footer-label, 
.stat-card-mini.amber .mini-footer ion-icon { color: #f59e0b; }
/* Global Dark Mode Support */
.dark-mode {
  --ion-background-color: #121212;
  --ion-text-color: #ffffff;
  background: #121212;
  color: #ffffff;
}

.dark-mode ion-content, 
.dark-mode ion-page,
.dark-mode .nested-content {
  --background: #121212;
  background: #121212;
}

.dark-mode .section-header h3,
.dark-mode .action-text h4,
.dark-mode .tx-title,
.dark-mode .tx-amount:not(.rose-text):not(.blue-text) {
  color: #ffffff;
}

.dark-mode .transaction-item {
  background: #1e1e1e;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.dark-mode .action-card {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.05);
}

.dark-mode .custom-segment {
  --background: #1e1e1e;
}

.dark-mode ion-toolbar {
  --background: #121212;
  --color: #ffffff;
}

.dark-mode .custom-tab-bar {
  --background: #1e1e1e;
  border-top: 1px solid rgba(255,255,255,0.05);
}
</style>
