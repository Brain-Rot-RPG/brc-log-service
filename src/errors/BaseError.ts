export abstract class BaseError extends Error {
    constructor(public readonly message: string, public readonly statusCode: number = 500) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}