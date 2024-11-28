import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { useState } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Push Test App" },
        { name: "description", content: "A simple push notification test app." },
    ];
};

export default function Push() {
    const [isSubscribed, setIsSubscribed] = useState(false);

    const subscribeToPush = async () => {
        if (!("serviceWorker" in navigator)) {
            alert("Service Worker is not supported in this browser.");
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: "BKVadYCRn2IiAyFMEO2VPRl0Yajc5u3_4SeY2vOZr82qWCuaJASAqk1ZTWJq-QmoHk-Ocd7dOBM2y7ZLtvt38G0", // Ersetze mit deinem VAPID-Schlüssel
            });

            console.log("Push Subscription:", JSON.stringify(subscription));
            alert("Push subscription created successfully!");
            setIsSubscribed(true);
        } catch (error) {
            console.error("Subscription failed:", error);
            alert("Failed to create push subscription.");
        }
    };

    const sendPushNotification = async () => {
        if (!("serviceWorker" in navigator)) {
            alert("Service Worker is not supported in this browser.");
            return;
        }

        const registration = await navigator.serviceWorker.ready;

        // Testdaten für die Benachrichtigung
        const payload = JSON.stringify({
            title: "Test Push Notification",
            body: "This is a test notification sent via the Button.",
            icon: "/192x192.png",
        });

        // Simuliere eine Push-Nachricht an den Service Worker
        registration.active?.postMessage({
            type: "PUSH_TEST",
            payload,
        });
    };

    return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-16">
                    <header>
                        <h1 className="text-2xl font-bold">Push Test App</h1>
                    </header>
                    <Button onClick={subscribeToPush} disabled={isSubscribed}>
                        {isSubscribed ? "Subscribed" : "Subscribe to Push"}
                    </Button>
                    <Button onClick={sendPushNotification} disabled={!isSubscribed}>
                        Send Push Notification
                    </Button>
                </div>
            </div>
    );
}
