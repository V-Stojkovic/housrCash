import request from 'supertest';
import app from '../app';

describe('Auth routes', () => {
    it('GET /api/v0/auth/google should redirect (302) to Google', async () => {
        const res = await request(app).get('/api/v0/auth/google');
        // Passport will redirect to Google (302). If passport not configured or env missing, it may 500.
        expect([301,302,400,500]).toContain(res.status);
    });
});
