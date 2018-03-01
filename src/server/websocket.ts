import { Server } from "http";
import { server as WebSocketServer, connection } from "websocket";

export class WebSocketManager {
    clientConnection: connection;
    constructor(server: Server) {
        const wsServer = new WebSocketServer({
            httpServer: server,
            autoAcceptConnections: true
        });
        wsServer.on('connect', this.onConnect.bind(this));
        wsServer.on('close', this.onClose.bind(this));
    }

    onConnect(clientConnection: connection) {
        this.clientConnection = clientConnection;
    }

    onClose(clientConnection: connection, reasonCode: number, description: string) {
        this.clientConnection = null;
    }

    sendMessage(message: string) {
        if (!this.clientConnection) {
            console.warn("No client receiver for web socket message");
            return;
        }
        this.clientConnection.sendUTF(message);
    }
}
