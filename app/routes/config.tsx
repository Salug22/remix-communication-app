import React, { useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "~/firebase.config"; // Deine Firebase-Konfiguration
import { Button } from "~/components/ui/button";

const FCMTokenGenerator: React.FC = () => {
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateToken = async () => {
        try {
            // VAPID-Key aus deinen Firebase Cloud Messaging-Einstellungen
            const vapidKey = "DEIN_VAPID_PUBLIC_KEY";

            const fcmToken = await getToken(messaging, { vapidKey });
            if (fcmToken) {
                console.log("FCM Token:", fcmToken);
                setToken(fcmToken);
                setError(null);
            } else {
                console.warn("Token konnte nicht generiert werden.");
                setError("Bitte erlaube Benachrichtigungen in deinem Browser.");
            }
        } catch (err) {
            console.error("Fehler beim Generieren des Tokens:", err);
            setError("Ein Fehler ist beim Generieren des Tokens aufgetreten.");
        }
    };

    return (
            <div className="container m-auto text-center mt-8">
                <h1 className="text-2xl font-bold mb-4">FCM Token Generator</h1>
                <Button onClick={generateToken} variant="primary" className="mb-4">
                    Token generieren
                </Button>

                {token && (
                        <div className="mt-4 p-4 bg-gray-100 rounded">
                            <h2 className="text-lg font-semibold">Dein FCM Token:</h2>
                            <p className="text-sm break-words">{token}</p>
                        </div>
                )}

                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
    );
};

export default FCMTokenGenerator;
