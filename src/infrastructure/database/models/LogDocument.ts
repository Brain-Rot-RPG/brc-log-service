import type { Document } from 'mongoose';

export interface LogDocument extends Document {
    service: string;
    level: string;
    message: string;
    timestamp: Date;
    payload: Record<string, unknown>;
    traceId: string;
}
