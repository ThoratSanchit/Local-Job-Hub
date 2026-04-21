import dotenv from 'dotenv';

dotenv.config();

export const initializeDatabase = async () => {
    // You could plug secret managers here
};

export const databaseConfig = {
    get config() {
        return {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'local_job_hub_db',
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
            reconnect: {
                max: 10,
                delay: 1000,
            },
        };
    }
};
