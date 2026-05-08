<template>
  <div class="form-container">
    <div class="form-wrapper">
      <ion-list lines="none" class="premium-list">
        <!-- Section: Identitas DO -->
        <div class="section-container">
          <div class="input-card">
            <ion-item class="premium-item readonly-item">
              <ion-input
                label="NOMOR TRANSAKSI"
                label-placement="stacked"
                :value="form.nomor"
                readonly
              ></ion-input>
            </ion-item>

            <ion-item class="premium-item" :class="{'item-error': errors.tanggal}">
              <ion-input
                label="TANGGAL TRANSAKSI *"
                label-placement="stacked"
                type="date"
                v-model="form.tanggal"
              ></ion-input>
            </ion-item>

            <!-- Nama Penjual with Search & Add -->
            <ion-item class="premium-item" :class="{'item-error': errors.penjual_id}">
              <ion-input
                label="NAMA PENJUAL *"
                label-placement="stacked"
                v-model="searchTerms.seller"
                placeholder="Cari atau pilih penjual..."
                @ionFocus="handleSearch('seller')"
                @ionInput="handleSearch('seller')"
              >
                <ion-button slot="end" fill="clear" class="input-action-btn" @click="handleSearch('seller')">
                  <ion-icon slot="icon-only" :icon="searchOutline"></ion-icon>
                </ion-button>
                <ion-button slot="end" fill="clear" class="input-action-btn add-btn" @click="addNew('seller')">
                  <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
                </ion-button>
              </ion-input>
              
              <!-- Suggestions Popover -->
              <div v-if="suggestions.showSeller" class="suggestion-box">
                <div v-for="s in filteredData.sellers" :key="s.id" class="sug-item" @click="selectItem('seller', s)">
                  <div class="sug-main">
                    <span class="sug-name">{{ s.nama }}</span>
                    <span class="sug-sub">Hutang: {{ formatCurrency(s.hutang || 0) }}</span>
                  </div>
                </div>
                <div v-if="filteredData.sellers.length === 0" class="sug-empty" @click="addNew('seller')">
                  <ion-icon :icon="addOutline"></ion-icon>
                  Tambah "{{ searchTerms.seller }}" sebagai penjual baru
                </div>
              </div>
            </ion-item>

            <!-- Nama Supir with Search & Add -->
            <ion-item class="premium-item" :class="{'item-error': errors.supir_id}">
              <ion-input
                label="NAMA SUPIR *"
                label-placement="stacked"
                v-model="searchTerms.driver"
                placeholder="Cari atau pilih supir..."
                @ionFocus="handleSearch('driver')"
                @ionInput="handleSearch('driver')"
              >
                <ion-button slot="end" fill="clear" class="input-action-btn" @click="handleSearch('driver')">
                  <ion-icon slot="icon-only" :icon="searchOutline"></ion-icon>
                </ion-button>
                <ion-button slot="end" fill="clear" class="input-action-btn add-btn" @click="addNew('driver')">
                  <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
                </ion-button>
              </ion-input>

              <!-- Suggestions Popover -->
              <div v-if="suggestions.showDriver" class="suggestion-box">
                <div v-for="d in filteredData.drivers" :key="d.id" class="sug-item" @click="selectItem('driver', d)">
                  <span class="sug-name">{{ d.nama }}</span>
                </div>
                <div v-if="filteredData.drivers.length === 0" class="sug-empty" @click="addNew('driver')">
                  <ion-icon :icon="addOutline"></ion-icon>
                  Tambah "{{ searchTerms.driver }}" sebagai supir baru
                </div>
              </div>
            </ion-item>

            <ion-item class="premium-item" :class="{'item-error': errors.no_polisi}">
              <ion-input
                label="NOMOR POLISI *"
                label-placement="stacked"
                v-model="form.no_polisi"
                placeholder="Contoh: B 1234 ABC"
                class="uppercase-text"
              ></ion-input>
            </ion-item>
          </div>
        </div>

        <!-- Section: Detail Tonase & Harga -->
        <div class="section-container mt-4">
          <div class="input-card">
            <div class="grid-2">
              <ion-item class="premium-item" :class="{'item-error': errors.tonase}">
                <ion-input
                  label="TONASE (KG) *"
                  label-placement="stacked"
                  inputmode="numeric"
                  placeholder="0"
                  :value="displayValues.tonase"
                  @ionInput="handleNumericInput($event, 'tonase')"
                ></ion-input>
              </ion-item>
              <ion-item class="premium-item" :class="{'item-error': errors.harga_satuan}">
                <ion-input
                  label="HARGA SATUAN *"
                  label-placement="stacked"
                  inputmode="numeric"
                  placeholder="0"
                  :value="displayValues.harga_satuan"
                  @ionInput="handleNumericInput($event, 'harga_satuan')"
                ></ion-input>
              </ion-item>
            </div>

            <div class="result-box subtotal-accent">
              <div class="res-label">SUB TOTAL (KOTOR)</div>
              <div class="res-value">{{ formatCurrency(form.sub_total) }}</div>
            </div>

            <div class="grid-2 mt-4">
              <ion-item class="premium-item">
                <ion-input
                  label="BONGKAR (RP)"
                  label-placement="stacked"
                  inputmode="numeric"
                  placeholder="0"
                  :value="displayValues.upah_bongkar"
                  @ionInput="handleNumericInput($event, 'upah_bongkar')"
                ></ion-input>
              </ion-item>
              <ion-item class="premium-item">
                <ion-input
                  label="BIAYA LAIN (RP)"
                  label-placement="stacked"
                  inputmode="numeric"
                  placeholder="0"
                  :value="displayValues.biaya_lain"
                  @ionInput="handleNumericInput($event, 'biaya_lain')"
                ></ion-input>
              </ion-item>
            </div>

            <ion-item class="premium-item potong-hutang-item mt-4">
              <ion-input
                label="POTONG HUTANG (RP)"
                label-placement="stacked"
                inputmode="numeric"
                placeholder="0"
                :value="displayValues.pembayaran_hutang"
                @ionInput="handleNumericInput($event, 'pembayaran_hutang')"
              >
                <div slot="helper" v-if="form.penjual_id" class="helper-info">
                  <ion-icon :icon="cardOutline"></ion-icon>
                  Hutang Terdaftar: {{ formatCurrency(form.hutang_awal) }}
                </div>
              </ion-input>
            </ion-item>

            <div class="result-box final-accent mt-6">
              <div class="res-label">TOTAL BAYAR KE PENJUAL</div>
              <div class="res-value big">{{ formatCurrency(form.sisa_bayar) }}</div>
              <div class="res-sub">Hutang Tersisa: {{ formatCurrency(form.sisa_hutang_penjual) }}</div>
            </div>
          </div>
        </div>

        <!-- Section: Pembayaran & Keterangan -->
        <div class="section-container mt-4">
          <div class="input-card">
            <ion-item class="premium-item">
              <ion-select
                label="CARA PEMBAYARAN"
                label-placement="stacked"
                v-model="form.cara_bayar"
                interface="action-sheet"
                class="custom-select"
              >
                <ion-select-option value="tunai">Kas / Tunai</ion-select-option>
                <ion-select-option value="transfer">Bank Transfer</ion-select-option>
                <ion-select-option value="tunai & transfer">Tunai & Transfer</ion-select-option>
                <ion-select-option value="belum dibayar">Hutang (Belum Dibayar)</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item v-if="form.cara_bayar === 'tunai & transfer'" class="premium-item info-item mt-4 animate-fade">
              <ion-input
                label="NOMINAL TUNAI (SISANYA TRANSFER)"
                label-placement="stacked"
                inputmode="numeric"
                placeholder="0"
                :value="displayValues.nominal_tunai"
                @ionInput="handleNumericInput($event, 'nominal_tunai')"
              ></ion-input>
            </ion-item>

            <ion-item class="premium-item mt-4">
              <ion-textarea
                label="CATATAN / KETERANGAN"
                label-placement="stacked"
                v-model="form.keterangan_pembayaran"
                placeholder="Tambahkan catatan jika diperlukan..."
                :auto-grow="true"
                rows="2"
              ></ion-textarea>
            </ion-item>
          </div>
        </div>

        <!-- Bottom Action Buttons -->
        <div class="bottom-actions">
          <ion-button
            expand="block"
            class="submit-btn"
            @click="handleSubmit"
            :disabled="loading"
          >
            <ion-icon slot="start" :icon="saveOutline" v-if="!loading"></ion-icon>
            {{ loading ? "SEDANG MENYIMPAN..." : "SIMPAN TRANSAKSI SEKARANG" }}
          </ion-button>

          <ion-button
            expand="block"
            fill="clear"
            color="danger"
            class="cancel-btn"
            @click="$emit('submitted')"
          >
            Batalkan & Kembali
          </ion-button>
        </div>
      </ion-list>

      <div class="offline-notice">
        <ion-icon :icon="cloudDoneOutline"></ion-icon>
        Data tersimpan secara lokal dan akan sinkron saat online.
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from "vue";
import {
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  toastController,
} from "@ionic/vue";
import {
  saveOutline,
  cloudDoneOutline,
  documentTextOutline,
  scaleOutline,
  cardOutline,
  chevronDownOutline,
  searchOutline,
  addOutline,
} from "ionicons/icons";
import { DatabaseService } from "../services/database";
import { SyncService } from "../services/sync";

const props = defineProps({
  type: {
    type: String,
    default: "DO",
  },
});

const loading = ref(false);
const emit = defineEmits(["submitted"]);

const form = reactive({
  nomor:
    (props.type || "DO") +
    "-" +
    new Date().toISOString().slice(0, 10).replace(/-/g, "") +
    "-" +
    Math.floor(Math.random() * 1000)
      .toString()
      .padStart(4, "0"),
  tanggal: new Date().toISOString().slice(0, 10),
  penjual_id: null,
  supir_id: null,
  no_polisi: "",
  tonase: 0,
  harga_satuan: 0,
  sub_total: 0,
  upah_bongkar: 0,
  biaya_lain: 0,
  pembayaran_hutang: 0,
  hutang_awal: 0,
  sisa_hutang_penjual: 0,
  cara_bayar: "tunai",
  nominal_tunai: 0,
  sisa_bayar: 0,
  keterangan_pembayaran: "",
});

const errors = reactive({
  tanggal: false,
  penjual_id: false,
  supir_id: false,
  no_polisi: false,
  tonase: false,
  harga_satuan: false,
});

const displayValues = reactive({
  tonase: "",
  harga_satuan: "",
  upah_bongkar: "",
  biaya_lain: "",
  pembayaran_hutang: "",
  nominal_tunai: "",
});

const searchTerms = reactive({
  seller: "",
  driver: "",
});

const masterData = reactive({
  sellers: [],
  drivers: [],
});

const suggestions = reactive({
  showSeller: false,
  showDriver: false,
});

const filteredData = computed(() => {
  const s = searchTerms.seller.toLowerCase();
  const d = searchTerms.driver.toLowerCase();

  return {
    sellers: masterData.sellers
      .filter((item) => item.nama.toLowerCase().includes(s))
      .slice(0, 5),
    drivers: masterData.drivers
      .filter((item) => item.nama.toLowerCase().includes(d))
      .slice(0, 5),
  };
});

onMounted(async () => {
  await loadMasterData();
});

const loadMasterData = async () => {
  masterData.sellers = await DatabaseService.getSellers();
  masterData.drivers = await DatabaseService.getDrivers();
};

const formatNumberWithDots = (val) => {
  if (!val && val !== 0) return "";
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const handleNumericInput = (event, field) => {
  const rawValue = event.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
  const numericValue = parseInt(rawValue, 10) || 0;

  form[field] = numericValue;
  displayValues[field] = formatNumberWithDots(numericValue);

  calculateAll();
};

const handleSearch = (type) => {
  if (type === "seller") {
    suggestions.showSeller = true;
    suggestions.showDriver = false;
  } else {
    suggestions.showDriver = true;
    suggestions.showSeller = false;
  }
};

const selectItem = (type, item) => {
  if (type === "seller") {
    form.penjual_id = item.id;
    form.hutang_awal = item.hutang || 0;
    searchTerms.seller = item.nama;
    suggestions.showSeller = false;
  } else {
    form.supir_id = item.id;
    searchTerms.driver = item.nama;
    suggestions.showDriver = false;
  }
  calculateAll();
};

const addNew = (type) => {
  if (type === "seller") {
    form.penjual_id = "NEW_" + Date.now();
    form.hutang_awal = 0;
    suggestions.showSeller = false;
  } else {
    form.supir_id = "NEW_" + Date.now();
    suggestions.showDriver = false;
  }
};

const calculateAll = () => {
  form.sub_total = Math.round(form.tonase * form.harga_satuan);
  form.sisa_bayar =
    form.sub_total -
    (form.upah_bongkar + form.biaya_lain + form.pembayaran_hutang);
  form.sisa_hutang_penjual = Math.max(
    0,
    form.hutang_awal - form.pembayaran_hutang,
  );

  if (form.cara_bayar !== "tunai & transfer") {
    form.nominal_tunai = 0;
    displayValues.nominal_tunai = "";
  }
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const showToast = async (message, color = "success") => {
  const toast = await toastController.create({
    message: message,
    duration: 2500,
    color: color,
    position: "top",
    mode: "ios",
  });
  await toast.present();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach(key => errors[key] = false);
  let hasError = false;
  if (!form.tanggal) { errors.tanggal = true; hasError = true; }
  if (!form.penjual_id) { errors.penjual_id = true; hasError = true; }
  if (!form.supir_id) { errors.supir_id = true; hasError = true; }
  if (!form.no_polisi) { errors.no_polisi = true; hasError = true; }
  if (form.tonase <= 0) { errors.tonase = true; hasError = true; }
  if (form.harga_satuan <= 0) { errors.harga_satuan = true; hasError = true; }

  if (hasError) {
    await showToast("Mohon lengkapi data yang ditandai (*)!", "warning");
    return;
  }

  loading.value = true;
  try {
    const dataToSave = { 
      ...form, 
      type: props.type, 
      name: searchTerms.seller, 
      qty: form.tonase, 
      status: "pending", 
      created_at: new Date().toISOString() 
    };
    await DatabaseService.saveTransaction(dataToSave);
    await showToast("Transaksi " + props.type + " berhasil disimpan!");
    if (SyncService.isOnline) SyncService.syncNow();
    setTimeout(() => emit("submitted"), 600);
  } catch (error) {
    await showToast("Gagal menyimpan!", "danger");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.form-container {
  background: #f8fafc;
  min-height: 100vh;
  padding: 0 0 40px 0;
}

.dark-mode .form-container {
  background: #000000;
}

/* Header Styling */
.header-section {
  padding: 30px 20px;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .header-section {
  background: #000000;
  border-color: #1e293b;
}

.page-title {
  font-size: 24px;
  font-weight: 900;
  margin: 0;
  color: #0f172a;
}

.dark-mode .page-title {
  color: #ffffff;
}

.page-subtitle {
  font-size: 12px;
  font-weight: 700;
  color: #3b82f6;
  margin: 4px 0 0 0;
  letter-spacing: 1px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  background: #f1f5f9;
  color: #64748b;
}

.dark-mode .status-badge {
  background: #1e293b;
  color: #94a3b8;
}

.status-badge.online {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.online .dot {
  background: #22c55e;
}

.status-badge .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}

/* Form Layout */
.form-wrapper {
  padding: 8px;
}

.premium-list {
  background: transparent;
  padding: 0;
}

.section-container {
  margin-bottom: 12px;
}

.input-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.dark-mode .input-card {
  background: #111827;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Premium Items */
.premium-item {
  --background: #f8fafc;
  --border-radius: 16px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  --highlight-height: 0;
  margin-bottom: 12px;
  border: 1.5px solid #e2e8f0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode .premium-item {
  --background: #1f2937;
  border-color: #374151;
}

.premium-item.item-has-focus {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(59, 130, 246, 0.1);
}

.dark-mode .premium-item.item-has-focus {
  border-color: #fbbf24;
}

.readonly-item {
  opacity: 0.7;
  --background: #f1f5f9;
}

.dark-mode .readonly-item {
  --background: #111827;
}

.item-error {
  border-color: #ef4444 !important;
}

/* Input Typography */
ion-input, ion-textarea, ion-select {
  --color: #0f172a;
  --placeholder-color: #94a3b8;
  font-weight: 700;
  font-size: 16px;
}

.dark-mode ion-input, 
.dark-mode ion-textarea, 
.dark-mode ion-select {
  --color: #f8fafc;
}

.uppercase-text {
  text-transform: uppercase;
}

/* Buttons in Input */
.input-action-btn {
  --padding-start: 10px;
  --padding-end: 10px;
  height: 40px;
  color: #3b82f6;
  margin: 0;
}

.add-btn {
  color: #10b981;
}

/* Suggestion UI */
.suggestion-box {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  z-index: 2000;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  margin-top: 8px;
  max-height: 250px;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.dark-mode .suggestion-box {
  background: #1f2937;
  border-color: #374151;
}

.sug-item {
  padding: 15px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.dark-mode .sug-item {
  border-color: #374151;
}

.sug-item:active {
  background: #f8fafc;
}

.sug-name {
  display: block;
  font-weight: 800;
  color: #0f172a;
  font-size: 15px;
}

.dark-mode .sug-name {
  color: #ffffff;
}

.sug-sub {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  margin-top: 2px;
}

.sug-empty {
  padding: 20px;
  text-align: center;
  color: #3b82f6;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* Results Display */
.result-box {
  padding: 20px;
  border-radius: 20px;
  text-align: center;
}

.subtotal-accent {
  background: #eff6ff;
  border: 1px dashed #3b82f6;
}

.dark-mode .subtotal-accent {
  background: #1e293b;
}

.final-accent {
  background: #ecfdf5;
  border: 1px solid #10b981;
}

.dark-mode .final-accent {
  background: #064e3b;
}

.res-label {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
}

.res-value {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  margin-top: 5px;
}

.dark-mode .res-value {
  color: #ffffff;
}

.res-value.big {
  font-size: 32px;
  color: #10b981;
}

.res-sub {
  font-size: 12px;
  font-weight: 700;
  color: #10b981;
  margin-top: 8px;
}

/* Utils */
.grid-2 {
  display: flex;
  gap: 12px;
}

.grid-2 > * {
  flex: 1;
}

.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }

.potong-hutang-item {
  border-color: #fbbf24;
}

.helper-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #fbbf24;
  margin-top: 5px;
}

/* Bottom Actions */
.bottom-actions {
  margin-top: 40px;
}

.submit-btn {
  --background: #3b82f6;
  --background-activated: #2563eb;
  --border-radius: 20px;
  height: 64px;
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 0.5px;
  margin-bottom: 15px;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.cancel-btn {
  font-weight: 800;
  --color: #ef4444;
}

.offline-notice {
  margin-top: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
