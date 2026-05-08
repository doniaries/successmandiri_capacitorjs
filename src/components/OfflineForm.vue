<template>
  <div class="form-container">
    
    <div class="form-card">
      <div class="card-header">
        <h2>Detail Transaksi</h2>
        <p>Lengkapi informasi {{ props.type === 'DO' ? 'DO' : 'Operasional' }} di bawah ini</p>
      </div>

      <div class="form-fields">
        <!-- Field Dinamis sesuai Filament -->
        <template v-if="props.type === 'DO'">
          <!-- Pencarian Penjual -->
          <div class="ion-input-group">
            <ion-item lines="none" class="custom-item">
              <ion-label position="stacked">Nama Penjual (Filament)</ion-label>
              <div class="searchable-container">
                <ion-input 
                  v-model="form.name" 
                  placeholder="Cari atau tambah penjual..."
                  mode="md"
                  @ionInput="handleSearch"
                ></ion-input>
                
                <!-- Suggestion List -->
                <div v-if="showSuggestions && filteredSellers.length > 0" class="suggestion-list">
                  <div 
                    v-for="s in filteredSellers" 
                    :key="s.id" 
                    class="suggestion-item"
                    @click="selectSeller(s)"
                  >
                    <ion-icon :icon="personOutline"></ion-icon>
                    <span>{{ s.nama }}</span>
                  </div>
                </div>
                
                <div v-if="showSuggestions && form.name && filteredSellers.length === 0" class="no-match" @click="addNewSeller">
                  <ion-icon :icon="addCircleOutline"></ion-icon>
                  <span>Tambah "{{ form.name }}" sebagai penjual baru</span>
                </div>
              </div>
            </ion-item>
          </div>

          <!-- Tonase -->
          <div class="ion-input-group">
            <ion-item lines="none" class="custom-item">
              <ion-label position="stacked">Tonase (Kg)</ion-label>
              <ion-input v-model="form.qty" type="number" placeholder="0" mode="md"></ion-input>
            </ion-item>
          </div>

          <!-- Harga Satuan -->
          <div class="ion-input-group">
            <ion-item lines="none" class="custom-item">
              <ion-label position="stacked">Harga Satuan (Rp)</ion-label>
              <ion-input v-model="form.price" type="number" placeholder="0" mode="md"></ion-input>
            </ion-item>
          </div>

          <!-- Cara Bayar -->
          <div class="ion-input-group">
            <ion-item lines="none" class="custom-item">
              <ion-label position="stacked">Cara Bayar</ion-label>
              <ion-select v-model="form.payment_method" interface="action-sheet" placeholder="Pilih Metode">
                <ion-select-option value="tunai">Tunai</ion-select-option>
                <ion-select-option value="transfer">Transfer</ion-select-option>
                <ion-select-option value="belum_dibayar">Belum Dibayar</ion-select-option>
              </ion-select>
            </ion-item>
          </div>
        </template>

        <template v-else>
          <!-- Operasional -->
          <div class="ion-input-group">
            <ion-item lines="none" class="custom-item">
              <ion-label position="stacked">Kategori Biaya</ion-label>
              <ion-select v-model="form.item" interface="action-sheet" placeholder="Pilih Kategori">
                <ion-select-option value="Solar / BBM">Solar / BBM</ion-select-option>
                <ion-select-option value="Makan / Konsumsi">Makan / Konsumsi</ion-select-option>
                <ion-select-option value="Perbaikan / Sparepart">Perbaikan / Sparepart</ion-select-option>
                <ion-select-option value="Gaji / Upah">Gaji / Upah</ion-select-option>
                <ion-select-option value="Lain-lain">Lain-lain</ion-select-option>
              </ion-select>
            </ion-item>
          </div>

          <div class="ion-input-group">
            <ion-item lines="none" class="custom-item">
              <ion-label position="stacked">Nominal (Rp)</ion-label>
              <ion-input v-model="form.qty" type="number" placeholder="0" mode="md"></ion-input>
            </ion-item>
          </div>

          <div class="ion-input-group">
            <ion-item lines="none" class="custom-item">
              <ion-label position="stacked">Keterangan</ion-label>
              <ion-textarea v-model="form.note" placeholder="Tulis catatan di sini..." mode="md"></ion-textarea>
            </ion-item>
          </div>
        </template>

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
import { reactive, ref, onMounted } from 'vue';
import { 
  IonItem, IonLabel, IonInput, IonTextarea, IonButton, 
  IonIcon, IonSelect, IonSelectOption, toastController
} from '@ionic/vue';
import { 
  saveOutline, cloudDoneOutline, personOutline, addCircleOutline 
} from 'ionicons/icons';
import { DatabaseService } from '../services/database';
import { SyncService } from '../services/sync';

const props = defineProps({
  type: {
    type: String,
    default: 'DO'
  }
});

const loading = ref(false);
const emit = defineEmits(['submitted']);

const form = reactive({
  name: '',
  seller_id: null,
  item: '',
  qty: '',
  price: '',
  payment_method: 'tunai',
  note: ''
});

const sellers = ref([]);
const filteredSellers = ref([]);
const showSuggestions = ref(false);

onMounted(async () => {
  sellers.value = await DatabaseService.getSellers();
});

const handleSearch = () => {
  if (!form.name) {
    filteredSellers.value = [];
    showSuggestions.value = false;
    return;
  }
  
  filteredSellers.value = sellers.value.filter(s => 
    s.nama.toLowerCase().includes(form.name.toLowerCase())
  );
  showSuggestions.value = true;
};

const selectSeller = (s) => {
  form.name = s.nama;
  form.seller_id = s.id;
  showSuggestions.value = false;
};

const addNewSeller = () => {
  form.seller_id = 'NEW_' + Date.now();
  showSuggestions.value = false;
};

const showToast = async (message, color = 'success') => {
  const toast = await toastController.create({
    message: message,
    duration: 2000,
    color: color,
    position: 'top',
    mode: 'ios'
  });
  await toast.present();
};

const handleSubmit = async () => {
  if (!form.name || !form.qty) {
    await showToast('Mohon isi field yang diperlukan!', 'warning');
    return;
  }
  
  loading.value = true;
  try {
    await DatabaseService.saveTransaction({
      ...form,
      type: props.type,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    
    await showToast('Data disimpan secara lokal!');
    if (SyncService.isOnline) SyncService.syncNow();

    form.name = '';
    form.item = '';
    form.qty = '';
    form.price = '';
    form.note = '';
    
    setTimeout(() => emit('submitted'), 500);
  } catch (error) {
    console.error(error);
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
.custom-item ion-textarea,
.custom-item ion-select {
  font-size: 18px;
  font-weight: 800;
  color: #01579B;
  --placeholder-color: #cbd5e1;
}

.searchable-container {
  position: relative;
  width: 100%;
}

.suggestion-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  z-index: 1000;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  max-height: 200px;
  overflow-y: auto;
  margin-top: 5px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.suggestion-item ion-icon {
  color: #64748b;
  font-size: 18px;
}

.suggestion-item span {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.no-match {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-top: 8px;
  cursor: pointer;
  border: 1px dashed #cbd5e1;
}

.no-match span {
  font-size: 13px;
  font-weight: 700;
  color: #3b82f6;
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
