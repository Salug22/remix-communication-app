export const fetchChatGPT = async (api, systemMessage, role) => {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${api}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: role, content: systemMessage }, // Benutzerdefinierte Nachricht
                ],
            }),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error("Error details:", errorDetails);
            throw new Error(`Error: ${response.status} - ${errorDetails.error.message}`);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error fetching word:", err.message);
        throw err; // Fehler weiterwerfen, falls notwendig
    }
};
