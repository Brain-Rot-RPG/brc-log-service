import { describe, expect, it } from '@jest/globals';

describe('Initial Smoke Test', () => {
    it('should confirm that the test environment is correctly configured', () => {
        const sigmaStatus = true;
        expect(sigmaStatus).toBe(true);
    });

    it('should have NODE_ENV set to test', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });
});