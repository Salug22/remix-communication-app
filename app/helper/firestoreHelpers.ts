import { doc, setDoc, deleteDoc } from "firebase/firestore";
import db from "../firebase.config";

/**
 * Löscht ein Dokument aus Firestore.
 * @param collectionName - Name der Sammlung
 * @param id - ID des zu löschenden Dokuments
 * @returns Promise<void>
 */
export const deleteFirestoreDocument = async (
        collectionName: string,
        id: string
): Promise<void> => {
    try {
        await deleteDoc(doc(db, collectionName, id));
        console.log(`Dokument mit ID ${id} aus der Sammlung ${collectionName} wurde gelöscht.`);
    } catch (error) {
        console.error("Fehler beim Löschen des Dokuments:", error);
        throw new Error("Fehler beim Löschen des Dokuments");
    }
};

/**
 * Speichert ein Dokument in Firestore.
 * @param collectionName - Name der Firestore-Sammlung
 * @param id - Dokument-ID (z. B. generiert mit `Date.now()` oder `uuid`)
 * @param data - Daten, die gespeichert werden sollen
 * @returns Promise<void>
 */
export const saveToFirestore = async (
        collectionName: string,
        id: string,
        data: Record<string, unknown>
): Promise<void> => {
    try {
        await setDoc(doc(db, collectionName, id), {
            ...data,
            createdAt: new Date().toISOString(), // Automatisch das Erstellungsdatum hinzufügen
        });
        console.log(`Dokument in Sammlung "${collectionName}" gespeichert:`, data);
    } catch (err) {
        console.error("Fehler beim Speichern des Dokuments:", err);
        throw new Error("Fehler beim Speichern des Dokuments");
    }
};
