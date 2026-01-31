import 'dotenv/config';

export const config = {
    port: Number(process.env.PORT) || 4010,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/brc_logs'
    },
    isProd: process.env.NODE_ENV === 'production'
};