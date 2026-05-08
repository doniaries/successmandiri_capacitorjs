import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { initialUsers } from './seed';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db = null;

export const DatabaseService = {
    async init() {
        if (db) return db;

        try {
            const platform = Capacitor.getPlatform();
            
            // Create the connection
            db = await sqlite.createConnection('success_mandiri_db', false, 'no-encryption', 1, false);
            
            // Open the database
            await db.open();

            // Create tables
            await this.createTables();

            // Seed initial data if empty
            await this.seedData();
            
            console.log('Database Local Initialized & Seeded');
            return db;
        } catch (error) {
            console.error('Database Initialization Error:', error);
            throw error;
        }
    },

    async createTables() {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT,
                avatar TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name TEXT NOT NULL,
                record_id TEXT NOT NULL,
                action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
                payload TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS offline_data (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL, -- 'customer', 'transaction', etc
                content TEXT NOT NULL,
                is_synced INTEGER DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.execute(query);
    },

    async seedData() {
        const checkQuery = `SELECT COUNT(*) as count FROM users`;
        const result = await db.query(checkQuery);
        if (result.values[0].count === 0) {
            console.log('Seeding initial users...');
            await this.saveUsers(initialUsers);
        }
    },

    async saveUsers(users) {
        if (!users || !users.length) return;
        
        for (const user of users) {
            const query = `
                INSERT OR REPLACE INTO users (id, name, email, password, role, avatar, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;
            await db.run(query, [
                user.id, 
                user.name, 
                user.email, 
                user.password, // Synced hashed password
                user.role || 'user', 
                user.avatar || null
            ]);
        }
    },

    async findUserByEmail(email) {
        await this.init();
        try {
            const query = `SELECT * FROM users WHERE email = ? LIMIT 1`;
            const result = await db.query(query, [email.trim().toLowerCase()]);
            const user = result.values && result.values.length > 0 ? result.values[0] : null;
            console.log(`Pencarian user: ${email} -> ${user ? 'Ditemukan' : 'Tidak ditemukan'}`);
            return user;
        } catch (err) {
            console.error('Error finding user:', err);
            return null;
        }
    },

    async saveOffline(type, id, content) {
        const query = `
            INSERT OR REPLACE INTO offline_data (id, type, content, is_synced, updated_at)
            VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)
        `;
        await db.run(query, [id, type, JSON.stringify(content)]);
    },

    async saveTransaction(data) {
        const id = `TX-${Date.now()}`;
        await this.saveOffline('transaction', id, data);
    },

    async getUnsyncedData() {
        const query = `SELECT * FROM offline_data WHERE is_synced = 0`;
        const result = await db.query(query);
        return result.values || [];
    },

    async markAsSynced(id) {
        const query = `UPDATE offline_data SET is_synced = 1 WHERE id = ?`;
        await db.run(query, [id]);
    },

    async getRecentTransactions(limit = 10) {
        const query = `
            SELECT * FROM offline_data 
            WHERE type = 'transaction' 
            ORDER BY updated_at DESC 
            LIMIT ?
        `;
        const result = await db.query(query, [limit]);
        return (result.values || []).map(item => ({
            id: item.id,
            ...JSON.parse(item.content),
            is_synced: item.is_synced === 1,
            updated_at: item.updated_at
        }));
    }
};
