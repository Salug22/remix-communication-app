import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
    return [
        { title: "Push Test App" },
        { name: "description", content: "A simple push notification test app." },
    ];
};

export default function Index() {
    const sendPush = async () => {
        if (!("serviceWorker" in navigator)) {
            alert("Service Worker not supported in this browser.");
            return;
        }

        const registration = await navigator.serviceWorker.ready;

        // Testdaten für die Benachrichtigung
        const payload = JSON.stringify({
            title: "Hello from the App!",
            body: "This is your push notification.",
            icon: "/192x192.png",
        });

        // Service Worker simuliert ein Push-Event
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
                    <Button onClick={sendPush}>Send Push</Button>
                </div>
            </div>
    );
}
