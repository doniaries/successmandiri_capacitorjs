<template>
  <div class="form-container">
    
    <div class="form-card">
      <div class="card-header">
        <h2>Detail Transaksi</h2>
        <p>Lengkapi informasi DO di bawah ini</p>
      </div>

      <div class="form-fields">
        <!-- Nama Pelanggan -->
        <div class="ion-input-group">
          <ion-item lines="none" class="custom-item">
            <ion-label position="stacked">Nama Pelanggan</ion-label>
            <ion-input 
              v-model="form.name" 
              placeholder="Contoh: Toko Jaya Mandiri"
              mode="md"
            ></ion-input>
          </ion-item>
        </div>

        <!-- Nama Barang -->
        <div class="ion-input-group">
          <ion-item lines="none" class="custom-item">
            <ion-label position="stacked">Nama Barang</ion-label>
            <ion-input 
              v-model="form.item" 
              placeholder="Contoh: Kelapa Sawit (TBS)"
              mode="md"
            ></ion-input>
          </ion-item>
        </div>

        <!-- Jumlah (Qty) -->
        <div class="ion-input-group">
          <ion-item lines="none" class="custom-item">
            <ion-label position="stacked">Jumlah (Kg)</ion-label>
            <ion-input 
              v-model="form.qty" 
              type="number"
              placeholder="0"
              mode="md"
            ></ion-input>
          </ion-item>
        </div>

        <!-- Catatan Tambahan -->
        <div class="ion-input-group">
          <ion-item lines="none" class="custom-item">
            <ion-label position="stacked">Catatan Tambahan</ion-label>
            <ion-textarea 
              v-model="form.note" 
              placeholder="Tulis keterangan jika ada..."
              :rows="3"
              mode="md"
            ></ion-textarea>
          </ion-item>
        </div>

        <!-- Submit Button -->
        <div class="button-section">
          <ion-button 
            expand="block" 
            shape="round" 
            color="primary" 
            class="submit-btn"
            @click="handleSubmit"
            :disabled="loading"
          >
            <ion-icon slot="start" :icon="saveOutline"></ion-icon>
            {{ loading ? 'MENYIMPAN...' : 'SIMPAN TRANSAKSI' }}
          </ion-button>
          
          <ion-button 
            expand="block" 
            fill="clear" 
            color="medium" 
            @click="$emit('submitted')"
          >
            Batal
          </ion-button>
        </div>
      </div>
    </div>

    <!-- Sync Info -->
    <div class="sync-info">
      <ion-icon :icon="cloudDoneOutline"></ion-icon>
      <span>Data akan disinkronkan otomatis saat online</span>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { 
  IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonIcon,
  toastController
} from '@ionic/vue';
import { saveOutline, cloudDoneOutline } from 'ionicons/icons';
import { DatabaseService } from '../services/database';

const loading = ref(false);
const emit = defineEmits(['submitted']);

const form = reactive({
  name: '',
  item: '',
  qty: '',
  note: ''
});

const showToast = async (message, color = 'success') => {
  const toast = await toastController.create({
    message: message,
    duration: 2000,
    color: color,
    position: 'top',
    mode: 'ios',
    cssClass: 'custom-toast'
  });
  await toast.present();
};

const handleSubmit = async () => {
  if (!form.name || !form.qty) {
    await showToast('Mohon isi nama dan jumlah!', 'warning');
    return;
  }
  
  loading.value = true;
  try {
    await DatabaseService.saveTransaction({
      customer_name: form.name,
      item_name: form.item,
      qty: parseFloat(form.qty),
      note: form.note,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    
    await showToast('Data disimpan secara lokal!');

    // Reset form
    form.name = '';
    form.item = '';
    form.qty = '';
    form.note = '';
    
    setTimeout(() => {
      emit('submitted');
    }, 500);
  } catch (error) {
    console.error('Gagal menyimpan:', error);
    await showToast('Gagal menyimpan data!', 'danger');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.form-container {
  padding-bottom: 40px;
}

.form-card {
  background: white;
  border-radius: 32px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.card-header {
  margin-bottom: 30px;
}

.card-header h2 {
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
}

.card-header p {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  margin: 5px 0 0;
}

.custom-item {
  --background: #f8fafc;
  --border-radius: 16px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  margin-bottom: 15px;
  border: 1px solid #f1f5f9;
}

.custom-item ion-label {
  font-size: 10px !important;
  font-weight: 800 !important;
  color: #64748b !important;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px !important;
}

.custom-item ion-input, 
.custom-item ion-textarea {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  --placeholder-color: #cbd5e1;
}

.button-section {
  margin-top: 30px;
}

.submit-btn {
  height: 56px;
  --box-shadow: 0 10px 20px rgba(1, 87, 155, 0.2);
  font-weight: 900;
  letter-spacing: 1px;
}

.sync-info {
  margin-top: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
}

.sync-info ion-icon {
  font-size: 18px;
}

.sync-info span {
  font-size: 11px;
  font-weight: 700;
}
</style>
