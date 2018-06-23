import { Server } from "http";
import { connection, IMessage, server as WebSocketServer } from "websocket";
import { DownloadActionWSMessage, DownloadLinksWSMessage } from "../..";

export class DownloadLinksWebSocketManager {
    clientConnections: connection[] = [];
    messageById: { [id: number]: DownloadLinksWSMessage } = {};
    downloadActionListener: DownloadActionListener;

    constructor(server: Server) {
        const wsServer = new WebSocketServer({
            httpServer: server,
            autoAcceptConnections: true
        });
        wsServer.on('connect', this.onConnect.bind(this));
        wsServer.on('close', this.onClose.bind(this));
    }

    private onConnect(clientConnection: connection) {
        this.clientConnections.push(clientConnection);
        clientConnection.on("message", data => this.onMessage(data));
        Object.values(this.messageById).forEach((m: DownloadLinksWSMessage) => this.send(clientConnection, m));
    }

    private onClose(clientConnection: connection, reasonCode: number, description: string) {
        const iToRemove = this.clientConnections.indexOf(clientConnection);
        if (iToRemove < 0) {
            console.warn("Unable to clean web socket client connection: not found");
        } else {
            this.clientConnections.splice(iToRemove, 1);
        }
    }

    onMessage(data: IMessage) {
        const message: DownloadActionWSMessage = JSON.parse(data.utf8Data);
        const id = message.id;
        switch (message.action) {
            case "cancel":
                this.downloadActionListener.cancel(id);
                break;
            case "pause":
                this.downloadActionListener.pause(id);
                break;
            case "resume":
                this.downloadActionListener.resume(id);
                break;
        }
    }

    sendMessage(message: DownloadLinksWSMessage) {
        if (message.channel !== "new") {
            this.messageById[message.id] = message;
        }
        this.sendAll(message);
    }

    clean(id: number) {
        delete this.messageById[id];
    }

    registerDownloadActionListener(listener: DownloadActionListener) {
        this.downloadActionListener = listener;
    }

    private sendAll(message: DownloadLinksWSMessage) {
        this.clientConnections.forEach(c => this.send(c, message));
    }

    private send(conn: connection, message: DownloadLinksWSMessage) {
        conn.sendUTF(JSON.stringify(message));
    }
}

export interface DownloadActionListener {
    cancel(id: number);
    pause(id: number);
    resume(id: number);
}
