import * as express from 'express';
import {Server, createServer} from 'http';
import SocketIoServer from './socket-io-server';


const app = express();
let httpServer: Server;


(async () => {
    await startServer(4444);
    SocketIoServer.getInstance(httpServer);
})();

app.get('/', (_req, res) => {
    res.send('<h1>Hello world</h1>');
});


async function startServer(port: number) {
    httpServer = createServer(app);
    await httpServer.listen(4444);
    logMultiple(['Server started', `Listening on *:${port}`]);
}

function stopServer() {
    httpServer.unref();
}

function logMultiple(messages) {
    for (const message of messages) {
        console.log(`${new Date().toISOString()}: ${message}.`);
    }
}


module.exports = httpServer
module.exports.stopServer = stopServer;
