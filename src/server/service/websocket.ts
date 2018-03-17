import { Server } from "http";
import { server as WebSocketServer, connection } from "websocket";
import { DownloadLinksWSMessage } from "../..";

export class WebSocketManager {
    clientConnections: connection[] = [];
    messageQueue: DownloadLinksWSMessage[] = [];

    constructor(server: Server) {
        const wsServer = new WebSocketServer({
            httpServer: server,
            autoAcceptConnections: true
        });
        wsServer.on('connect', this.onConnect.bind(this));
        wsServer.on('close', this.onClose.bind(this));
    }

    onConnect(clientConnection: connection) {
        this.clientConnections.push(clientConnection);
        while (this.messageQueue.length > 0) {
            clientConnection.sendUTF(JSON.stringify(this.messageQueue.pop()));
        }
    }

    onClose(clientConnection: connection, reasonCode: number, description: string) {
        const iToRemove = this.clientConnections.indexOf(clientConnection);
        if (iToRemove < 0) {
            console.warn("Unable to clean web socket client connection: not found");
        } else {
            this.clientConnections.splice(iToRemove, 1);
        }
    }

    sendMessage(message: DownloadLinksWSMessage) {
        if (this.clientConnections.length === 0) {
            if (this.messageQueue.length === 0) {
                console.warn("No web socket clients connected, messages will be queued");
            }
            this.messageQueue.push(message);
            return;
        }
        this.clientConnections.forEach(c => c.sendUTF(JSON.stringify(message)));
    }
}
