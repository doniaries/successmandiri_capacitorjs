import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router';
import { DatabaseService } from './services/database'
import { SyncService } from './services/sync'
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { Capacitor } from '@capacitor/core';

jeepSqlite(window);

/* Ionic Core CSS */
import { IonicVue } from '@ionic/vue';
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

const init = async () => {
    try {
        await DatabaseService.init();
        await SyncService.init();
    } catch (e) {
        console.error('Failed to init app services:', e);
    }
    
    const app = createApp(App)
        .use(IonicVue)
        .use(router);
        
    router.isReady().then(() => {
        app.mount('#app');
    });
}

init();
