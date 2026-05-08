<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding no-scroll" style="--background: #01579B;">
      <!-- Decorative Blobs -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      
      <div class="login-container">
        <!-- Logo Section -->
        <div class="logo-section">
          <div class="logo-circle">
            <img :src="settings.app_logo" alt="Logo" @error="onLogoError">
          </div>
          <h1 class="app-title">SUCCESS MANDIRI</h1>
          <p class="app-subtitle">Aplikasi Transaksi Sawit</p>
        </div>

        <!-- Form Card -->
        <div class="login-card">
          <div class="card-header">
            <h2>Selamat Datang Kembali!</h2>
            <p>Silakan masuk ke akun Anda</p>
          </div>

          <div class="form-body">
            <!-- Email Input -->
            <div class="custom-input-group">
              <label>Email</label>
              <div class="input-wrapper">
                <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
                <input 
                  v-model="email" 
                  type="email" 
                  placeholder="superadmin@gmail.com"
                >
              </div>
            </div>

            <!-- Password Input -->
            <div class="custom-input-group">
              <label>Password</label>
              <div class="input-wrapper">
                <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                <input 
                  v-model="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="••••••••"
                >
                <ion-icon 
                  :icon="showPassword ? eyeOffOutline : eyeOutline" 
                  class="suffix-icon clickable"
                  @click="showPassword = !showPassword"
                ></ion-icon>
              </div>
            </div>

            <!-- Options -->
            <div class="options-row">
              <ion-item lines="none" class="remember-me">
                <ion-checkbox v-model="rememberMe" slot="start" mode="md"></ion-checkbox>
                <ion-label>Ingat Saya</ion-label>
              </ion-item>
              <a href="#" class="forgot-link">Lupa Password?</a>
            </div>

            <!-- Login Button -->
            <button class="login-button" @click="handleLogin" :disabled="loading">
              <span v-if="loading">MEMPROSES...</span>
              <span v-else>MASUK SEKARANG</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <p class="version">Versi {{ settings.app_version }}</p>
          <p class="creator">DIKEMBANGKAN OLEH {{ settings.app_creator }}</p>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { 
  IonPage, IonContent, IonCheckbox, IonLabel, IonItem, IonIcon 
} from '@ionic/vue';
import { 
  mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, chevronDownCircleOutline 
} from 'ionicons/icons';

const email = ref('superadmin@gmail.com');
const password = ref('password');
const rememberMe = ref(true);
const loading = ref(false);
const showPassword = ref(false);

const settings = reactive({
  app_name: 'SUCCESS MANDIRI',
  app_version: '1.0.0',
  app_creator: 'SUCCESS MANDIRI',
  app_logo: 'https://ui-avatars.com/api/?name=SM&background=fff&color=01579B'
});

const emit = defineEmits(['login-success']);

const handleLogin = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    emit('login-success');
  }, 1000);
};

const onLogoError = (e) => {
  e.target.src = 'https://ui-avatars.com/api/?name=SM&background=fff&color=01579B';
}

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:8000/api/settings');
    const data = await res.json();
    Object.assign(settings, data);
  } catch (e) {
    console.warn("Offline settings mode");
  }
});
</script>

<style scoped>
.no-scroll {
  --overflow: hidden;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding-bottom: 20px;
  position: relative;
  z-index: 10;
}

/* Blob Styles */
.blob {
  position: absolute;
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
  border-radius: 50%;
  filter: blur(40px);
  z-index: 1;
  animation: float 20s infinite alternate ease-in-out;
}

.blob-1 {
  top: -50px;
  left: -50px;
  background: radial-gradient(circle, rgba(2, 136, 209, 0.4) 0%, transparent 70%);
}

.blob-2 {
  bottom: 100px;
  right: -50px;
  background: radial-gradient(circle, rgba(129, 212, 250, 0.3) 0%, transparent 70%);
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg) scale(1); }
  33% { transform: translate(30px, 50px) rotate(10deg) scale(1.1); }
  66% { transform: translate(-20px, 20px) rotate(-10deg) scale(0.9); }
  100% { transform: translate(0, 0) rotate(0deg) scale(1); }
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.logo-circle {
  width: 110px;
  height: 110px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  padding: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: all 0.5s ease;
}

.logo-circle:hover {
  transform: scale(1.05) rotate(5deg);
}

.logo-circle img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.app-title {
  color: white;
  font-size: 28px;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.5px;
}

.app-subtitle {
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  margin: 5px 0 0;
  font-weight: 500;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 40px;
  padding: 35px 25px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.25);
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header h2 {
  font-size: 22px;
  font-weight: 800;
  color: #263238;
  margin: 0;
}

.card-header p {
  font-size: 13px;
  color: #78909c;
  margin: 5px 0 0;
  font-weight: 500;
}

.form-body {
  margin-top: 35px;
}

.custom-input-group {
  position: relative;
  margin-bottom: 25px;
}

.custom-input-group label {
  position: absolute;
  top: -12px;
  left: 12px;
  background: transparent;
  padding: 0 4px;
  font-size: 12px;
  font-weight: 800;
  color: #546e7a;
  z-index: 10;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1.5px solid #eceff1;
  border-radius: 18px;
  padding: 0 15px;
  height: 58px;
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  border-color: #01579B;
}

.input-icon {
  font-size: 22px;
  color: #01579B;
  margin-right: 12px;
}

.suffix-icon {
  font-size: 20px;
  color: #b0bec5;
  margin-left: 10px;
}

.clickable {
  cursor: pointer;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #37474f;
  font-weight: 600;
  background: transparent;
}

.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
}

.remember-me {
  --padding-start: 0;
  --background: transparent;
  min-height: auto;
}

.remember-me ion-checkbox {
  --size: 20px;
  --border-radius: 4px;
  --border-color: #cfd8dc;
  --checkbox-background-checked: #01579B;
  margin-right: 10px;
}

.remember-me ion-label {
  font-size: 12px;
  font-weight: 700;
  color: #546e7a;
}

.forgot-link {
  font-size: 12px;
  font-weight: 800;
  color: #0288d1;
  text-decoration: none;
}

.login-button {
  width: 100%;
  height: 58px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #01579B 0%, #0288D1 100%);
  color: white;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 1.5px;
  box-shadow: 0 10px 20px rgba(1, 87, 155, 0.3);
  transition: all 0.2s;
}

.login-button:active {
  transform: scale(0.97);
  box-shadow: 0 5px 10px rgba(1, 87, 155, 0.2);
}

.login-footer {
  margin-top: 30px;
  text-align: center;
}

.version {
  color: white;
  font-size: 12px;
  font-weight: 700;
  margin: 0;
}

.creator {
  color: rgba(255,255,255,0.5);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  margin: 5px 0 0;
  text-transform: uppercase;
}
</style>
