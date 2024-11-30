export const generateSystemMessage = (
        type: "word" | "custom_word" | "check" | "synonym" = "word",
        content: string | null,
): string => {
    if (type === "synonym") {
        return `Du bist ein Sprachassistent. Bitte finde 3 bis 5 Synonym für folgendes Wort: "${content}".
    Antworte im JSON-Format:
    {
        "synonym": "Kommaseparierte Begriffe"
    }`;
    }

    if (type === "check") {
        return `Du bist ein Korrektor für deutsche Texte. Bitte korrigiere den folgenden Text und beschreibe alle Fehler. 
        Dazu gehören Satzzeichen, Kommasetzung, Rechtsschreibfehler usw. Dabei soll der Stil beibehalten werden. 
        Eine zweite Antwort soll in "styled" zurück gegeben werden. Dies beinhaltet den gegeben Satz mit einem besseren Stil. 
        Bedeutet es soll ohne Umgangssprache korrigiert sein.
        Wenn der Stil gut ist, lasse bitte "stylised" leer:
    "${content}".
    Antworte im JSON-Format:
    {
        "correctedText": "Der korrigierte Text",
        "stylised": "Der Text mit einem besseren Stil (wenn möglich)",
        "corrections": [
            {
                "error": "Beschreibung des Fehlers",
                "suggestion": "Vorschlag zur Verbesserung"
            }
        ]
    }`;
    }

    if (type === "custom_word") {
        return `Du bist ein Sprachassistent, der detaillierte Informationen zu einem Begriff liefert.
    Bitte gebe mir eine Erklärung für folgenden Begriff: ${content}.
    Antworte im JSON-Format:
    {
        "word": "Wort",
        "definition": "Kurze, präzise Erklärung des Begriffs.",
        "example": "Ein Satz, der zeigt, wie der Begriff verwendet werden kann."
    }`;
    }

    if (type === "word") {
        return `Du bist ein Sprachassistent, der detaillierte Informationen zu einem Begriff liefert.
  Begriffe sollten anspruchsvoll, aber nicht zu akademisch sein. Die folgenden Begriffe wurden bereits verwendet: ${content}.
  Antworte im JSON-Format:
  {
      "word": "Wort",
      "definition": "Kurze, präzise Erklärung des Begriffs.",
      "example": "Ein Satz, der zeigt, wie der Begriff verwendet werden kann."
  }`;
    }
    return '';
};
