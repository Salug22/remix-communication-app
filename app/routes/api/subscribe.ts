import { json } from '@remix-run/node';
import { createSubscriptionHandler } from '@remix-pwa/push';

export const action = createSubscriptionHandler({
    async onNewSubscription(subscription) {
        // Speichere das Abonnement, z. B. in einer Datenbank
        console.log('Neues Abonnement:', subscription);
    },
});

export const loader = async () => json({ success: true });
