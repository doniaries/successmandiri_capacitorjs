import { reactive } from 'vue';
import { Network } from '@capacitor/network';
import { DatabaseService } from './database';

const API_BASE_URL = 'http://localhost/api/v1'; // Fallback ke localhost untuk dev

export const SyncService = reactive({
    isOnline: true,
    unsyncedCount: 0,
    isSyncing: false,

    async init() {
        // Update initial status
        const status = await Network.getStatus();
        this.isOnline = status.connected;
        await this.updateUnsyncedCount();

        // Listen for network status changes
        Network.addListener('networkStatusChange', status => {
            this.isOnline = status.connected;
            if (status.connected) {
                console.log('Online! Memulai sinkronisasi...');
                this.syncNow();
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
    }
});
