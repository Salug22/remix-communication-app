import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import webpush from 'web-push';

const VAPID_PUBLIC_KEY = 'Dein Public Key hier';
const VAPID_PRIVATE_KEY = 'Dein Private Key hier';

webpush.setVapidDetails(
        'mailto:youremail@example.com',
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
);

export const action: ActionFunction = async () => {
    const payload = JSON.stringify({
        title: 'Hallo!',
        body: 'Dies ist eine Push-Benachrichtigung.',
    });

    // Alle Abonnements durchgehen und Benachrichtigung senden
    for (const sub of subscriptions) {
        await webpush.sendNotification(sub, payload).catch((err) => console.error(err));
    }

    return json({ success: true });
};
