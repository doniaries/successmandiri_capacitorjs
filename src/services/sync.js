import { reactive } from 'vue';
import { Network } from '@capacitor/network';
import { DatabaseService } from './database';

const API_BASE_URL = 'http://192.168.1.10:8000/api'; // Menggunakan IP komputer agar bisa diakses HP fisik

export const SyncService = reactive({
    isOnline: true,
    unsyncedCount: 0,
    isSyncing: false,

    async init() {
        // Update initial status
        const status = await Network.getStatus();
        this.isOnline = status.connected;
        await this.updateUnsyncedCount();

        // Sync users if online
        if (this.isOnline) {
            this.syncUsers();
        }

        // Listen for network status changes
        Network.addListener('networkStatusChange', status => {
            this.isOnline = status.connected;
            if (status.connected) {
                console.log('Online! Memulai sinkronisasi...');
                this.syncNow();
                this.syncUsers();
            }
        });

        // Periodically check for unsynced data
        setInterval(() => this.updateUnsyncedCount(), 5000);
    },

    async updateUnsyncedCount() {
        const data = await DatabaseService.getUnsyncedData();
        this.unsyncedCount = data.length;
    },

    async syncNow() {
        if (this.isSyncing) return;
        
        const unsyncedData = await DatabaseService.getUnsyncedData();
        
        if (unsyncedData.length === 0) {
            this.unsyncedCount = 0;
            return;
        }

        this.isSyncing = true;
        console.log(`Mengirim ${unsyncedData.length} data ke server...`);

        try {
            for (const item of unsyncedData) {
                const response = await fetch(`${API_BASE_URL}/sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        id: item.id,
                        type: item.type,
                        data: JSON.parse(item.content),
                        updated_at: item.updated_at
                    })
                });

                if (response.ok) {
                    await DatabaseService.markAsSynced(item.id);
                    console.log(`Data ${item.id} berhasil tersinkronisasi.`);
                }
            }
        } catch (error) {
            console.error(`Gagal sinkronisasi:`, error);
        } finally {
            this.isSyncing = false;
            await this.updateUnsyncedCount();
        }
    },

    // Fungsi untuk menyinkronkan daftar pengguna dari Laravel (untuk login offline)
    async syncUsers() {
        if (!this.isOnline) return;

        try {
            console.log('Menyinkronkan data pengguna untuk mode offline...');
            const response = await fetch(`${API_BASE_URL}/users/sync`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const users = await response.json();
                await DatabaseService.saveUsers(users);
                console.log(`${users.length} pengguna berhasil diimpor untuk mode offline.`);
            }
        } catch (error) {
            console.error('Gagal sinkronisasi pengguna:', error);
        }
    },

    // Fungsi untuk menyinkronkan daftar penjual
    async syncSellers() {
        if (!this.isOnline) return;

        try {
            console.log('Menyinkronkan data penjual untuk mode offline...');
            const response = await fetch(`${API_BASE_URL}/sellers/sync`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const sellers = await response.json();
                await DatabaseService.saveSellers(sellers);
                console.log(`${sellers.length} penjual berhasil diimpor untuk mode offline.`);
            }
        } catch (error) {
            console.error('Gagal sinkronisasi penjual:', error);
        }
    },

    // Metode untuk mengambil data terbaru dari server
    async pullUpdates() {
        const status = await Network.getStatus();
        if (!status.connected) return;

        try {
            const lastSync = localStorage.getItem('last_sync_timestamp') || '2000-01-01 00:00:00';
            const response = await fetch(`${API_BASE_URL}/pull?since=${lastSync}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const updates = await response.json();
                for (const update of updates) {
                    await DatabaseService.saveOffline(update.type, update.id, update.data);
                    // Mark as synced immediately since it's from server
                    await DatabaseService.markAsSynced(update.id);
                }
                localStorage.setItem('last_sync_timestamp', new Date().toISOString());
            }
        } catch (error) {
            console.error('Gagal mengambil pembaruan dari server:', error);
        }
    },

    // Metode utama untuk menjalankan semua proses sinkronisasi
    async syncAll() {
        if (!this.isOnline) return;
        
        console.log('Memulai sinkronisasi global...');
        await this.syncNow();   // Kirim data lokal ke server
        await this.syncUsers(); // Ambil data user terbaru untuk offline
        await this.pullUpdates(); // Ambil data transaksi terbaru dari server
        console.log('Sinkronisasi selesai.');
    }
});
