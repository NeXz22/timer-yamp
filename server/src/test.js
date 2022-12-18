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

    it('should find rooms to leave', async () => {
        const rooms = new Set(['socketId', 'sessionToLeave1', 'sessionToLeave2']);
        const socketMock = {id: 'socketId', get rooms() {return rooms}};

        const sessionToLeave = server.findSessionsToLeave(socketMock);

        expect(sessionToLeave).toEqual(['sessionToLeave1', 'sessionToLeave2']);
    });

    it('should return empty array if no rooms to leave exists', async () => {
        const rooms = new Set(['socketId']);
        const socketMock = {id: 'socketId', get rooms() {return rooms}};

        const sessionToLeave = server.findSessionsToLeave(socketMock);

        expect(sessionToLeave).toEqual([]);
    });

    it('should return empty array if no rooms exist', async () => {
        const rooms = new Set([]);
        const socketMock = {id: 'socketId', get rooms() {return rooms}};

        const sessionToLeave = server.findSessionsToLeave(socketMock);

        expect(sessionToLeave).toEqual([]);
    });

    server.stopServer();
});