import 'dotenv/config';

import { Validator } from './utils/Validator.js';

const getEnv = (key: string, defaultValue?: string): string => {
    return Validator.string(process.env[key] || defaultValue, key);
};

const [mUser, mPass, mHost, mPort, mDb] = [
    getEnv('MONGO_ROOT_USER'), getEnv('MONGO_ROOT_PASS'),
    getEnv('MONGO_HOST', 'localhost'), getEnv('MONGO_PORT', '27017'), getEnv('MONGO_DB_NAME', 'brc_logs')
];

const [rUser, rPass, rHost, rPort] = [
    getEnv('RABBIT_USER'), getEnv('RABBIT_PASS'),
    getEnv('RABBIT_HOST', 'localhost'), getEnv('RABBIT_PORT', '5672')
];

export const config = {
    port: Number(process.env.PORT) || 4010,
    nodeEnv: process.env.NODE_ENV || 'development',
    isProd: process.env.NODE_ENV === 'production',

    mongo: {
        uri: `mongodb://${mUser}:${mPass}@${mHost}:${mPort}/${mDb}?authSource=admin`,
        dbName: mDb
    },

    rabbit: {
        uri: `amqp://${rUser}:${rPass}@${rHost}:${rPort}`,
        user: rUser
    }
};