const server = require('./index');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

describe('Server Tests', () => {

    it('should send request', async () => {
        const response = await requestWithSupertest.get('');
        expect(response.status).toEqual(200);
    });

    it('should receive response-text "hello world"', async () => {
        const response = await requestWithSupertest.get('');
        expect(response.status).toEqual(200);
        expect(response.text).toEqual('<h1>Hello world</h1>');
    });

    server.stopServer();
});