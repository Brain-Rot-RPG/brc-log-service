import mongoose, { Schema } from 'mongoose';

import type { LogDocument } from './LogDocument.js';

const LogSchema = new Schema<LogDocument>({
    service: { type: String, required: true },
    level: { type: String, required: true, index: true },
    message: { type: String, required: true },
    timestamp: { type: Date, required: true, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    traceId: { type: String, required: true, index: true }
}, {
    timestamps: true,
    versionKey: false
});

export const MongooseLogModel = mongoose.model<LogDocument>('Log', LogSchema);
