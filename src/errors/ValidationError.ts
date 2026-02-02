import {BaseError} from './BaseError.js';

export class ValidationError extends BaseError {
    constructor(message: string) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}