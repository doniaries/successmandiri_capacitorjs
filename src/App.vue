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
              <ion-buttons slot="end">
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
                <p>Senin, 08 Mei 2024</p>
              </div>

              <!-- Balance Card -->
              <div class="premium-balance-card">
                <div class="card-bg-decoration"></div>
                <div class="card-content">
                  <div class="label">
                    <ion-icon :icon="walletOutline"></ion-icon>
                    <span>Saldo Kas Utama</span>
                  </div>
                  <h1 class="balance-amount">Rp 125.450.000</h1>
                  <div class="stats-row">
                    <div class="stat-badge income">
                      <ion-icon :icon="trendingUpOutline"></ion-icon>
                      <span>Rp 12.5M</span>
                    </div>
                    <div class="stat-badge expense">
                      <ion-icon :icon="trendingDownOutline"></ion-icon>
                      <span>Rp 4.2M</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Services Grid -->
              <div class="section-header">
                <h3>Layanan Utama</h3>
              </div>
              <div class="services-grid">
                <div class="service-item" @click="currentTab = 'add'">
                  <div class="icon-box blue">
                    <ion-icon :icon="busOutline"></ion-icon>
                  </div>
                  <div class="text">
                    <strong>Input DO</strong>
                    <span>Pengiriman Sawit</span>
                  </div>
                </div>
                <div class="service-item">
                  <div class="icon-box emerald">
                    <ion-icon :icon="cashOutline"></ion-icon>
                  </div>
                  <div class="text">
                    <strong>Kas Harian</strong>
                    <span>Laporan Keuangan</span>
                  </div>
                </div>
              </div>

              <!-- Recent Transactions -->
              <div class="section-header flex-row">
                <h3>Transaksi Terakhir</h3>
                <button class="view-all">Semua</button>
              </div>
              <div class="transaction-list">
                <div v-for="i in 3" :key="i" class="transaction-item">
                  <div class="icon-circle">
                    <ion-icon :icon="busOutline"></ion-icon>
                  </div>
                  <div class="info">
                    <strong>#SM-2024050{{ i }}</strong>
                    <span>TOKO BERKAH JAYA • 14:20</span>
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
import { ref } from 'vue';
import { 
  IonApp, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel, 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonFab, IonFabButton
} from '@ionic/vue';
import { 
  gridOutline, timeOutline, personOutline, logOutOutline, walletOutline,
  trendingUpOutline, trendingDownOutline, busOutline, cashOutline,
  chevronForwardOutline, addOutline, arrowBackOutline
} from 'ionicons/icons';
import LoginView from './components/LoginView.vue';
import OfflineForm from './components/OfflineForm.vue';

const isLoggedIn = ref(true);
const currentTab = ref('home');

const handleLogout = () => {
  isLoggedIn.value = false;
};
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

.chevron {
  margin-left: auto;
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

.custom-fab {
  margin-bottom: 90px;
  margin-right: 10px;
}

.custom-fab ion-fab-button {
  --box-shadow: 0 10px 25px rgba(1, 87, 155, 0.4);
}
</style>
