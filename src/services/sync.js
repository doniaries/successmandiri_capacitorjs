import { Network } from '@capacitor/network';
import { DatabaseService } from './database';

const API_BASE_URL = 'https://api.successmandiri.com/api/v1'; // Sesuaikan dengan URL Laravel

export const SyncService = {
    async init() {
        // Listen for network status changes
        Network.addListener('networkStatusChange', status => {
            if (status.connected) {
                console.log('Online! Memulai sinkronisasi...');
                this.syncNow();
            } else {
                console.log('Offline. Mode penyimpanan lokal aktif.');
            }
        });

        // Initial sync check
        const status = await Network.getStatus();
        if (status.connected) {
            this.syncNow();
        }
    },

    async syncNow() {
        const unsyncedData = await DatabaseService.getUnsyncedData();
        
        if (unsyncedData.length === 0) {
            console.log('Semua data sudah tersinkronisasi.');
            return;
        }

        console.log(`Mengirim ${unsyncedData.length} data ke server...`);

        for (const item of unsyncedData) {
            try {
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
            } catch (error) {
                console.error(`Gagal sinkronisasi data ${item.id}:`, error);
            }
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
};
