import { Response } from 'express';
import * as notifier from 'node-notifier';

export function notify(title: string, message: any, callback?: notifier.NotificationCallback) {
    notifier.notify({
        title: title,
        message: JSON.stringify(message),
        sound: false,
        wait: true
    }, callback);
}

export function handleError(err: Error | string, res?: Response) {
    let msg;
    if (err instanceof Error) {
        msg = err.message;
    } else {
        msg = err;
    }
    console.error(err);
    notify('Error', msg);
    if (res) {
        res.sendStatus(400);
    }
}
