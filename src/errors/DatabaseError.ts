import { BaseError } from './BaseError.js';

export class DatabaseError extends BaseError {
    constructor(message: string, public readonly originalError: unknown) {
        super(message);
    }
}
