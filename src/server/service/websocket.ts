import { Server } from "http";
import { server as WebSocketServer, connection } from "websocket";
import { DownloadLinksWSMessage } from "../..";

export class WebSocketManager {
    clientConnections: connection[] = [];
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
            console.warn("No web socket clients connected, message not sent");
            return;
        }
        this.clientConnections.forEach(c => c.sendUTF(JSON.stringify(message)));
    }
}
