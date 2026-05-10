import dotenv from 'dotenv';

dotenv.config();

export const initializeDatabase = async () => {
};

export const databaseConfig = {
    get config() {
        return {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
                ? parseInt(process.env.DB_PORT, 10)
                : 3306,
            reconnect: {
                max: 10,
                delay: 1000,
            },
        };
    }
};
