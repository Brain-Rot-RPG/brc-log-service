import {ValidationError} from '../../errors/ValidationError.js';

export class Validator {
    /**
     * Valide qu'une valeur est une chaîne de caractères et qu'elle n'est pas vide ou composée uniquement d'espaces.
     * @param value - La valeur à tester (provenant généralement d'une source inconnue).
     * @param fieldName - Le nom du champ pour personnaliser le message d'erreur.
     * @returns La chaîne de caractères validée.
     * @throws {Error} Si la valeur n'est pas une string ou est vide.
     */
    static string(value: unknown, fieldName: string): string {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new ValidationError(`Le champ '${fieldName}' doit être une chaîne de caractères non vide.`);
        }
        return value;
    }

    /**
     * Valide et convertit une valeur en instance de Date.
     * Accepte les objets Date ou les chaînes de caractères convertibles (ISO strings, etc.).
     * @param value - La valeur à valider ou à transformer.
     * @param fieldName - Le nom du champ pour le message d'erreur.
     * @returns Une instance de Date valide.
     * @throws {Error} Si la valeur est manquante (null/undefined).
     * @throws {TypeError} Si la date est invalide (ex: 'date' inexistante).
     */
    static date(value: unknown, fieldName: string): Date {
        if (value === undefined || value === null) {
            throw new ValidationError(`Le champ '${fieldName}' est requis.`);
        }

        const parsedDate = typeof value === 'string' ? new Date(value) : value;

        if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
            throw new ValidationError(`Le champ '${fieldName}' doit être une date valide.`);
        }
        return parsedDate;
    }

    /**
     * Valide qu'une valeur fait partie des valeurs autorisées d'un objet (Enum ou Const).
     * Utilise les génériques pour garantir le retour du type correct.
     * @param value - La valeur dont on veut vérifier l'appartenance à l'enum.
     * @param enumObj - L'objet de référence (ex: LogLevel).
     * @param fieldName - Le nom du champ pour le message d'erreur.
     * @returns La valeur validée avec son type spécifique au sein de l'enum.
     * @throws {Error} Si la valeur n'est pas présente dans l'objet de référence.
     */
    static enumValue<T extends Record<string, unknown>>(
        value: unknown,
        enumObj: T,
        fieldName: string
    ): T[keyof T] {
        const values = Object.values(enumObj);
        if (!values.includes(value as T[keyof T])) {
            throw new ValidationError(`La valeur '${value}' est invalide pour le champ '${fieldName}'.`);
        }
        return value as T[keyof T];
    }

    /**
     * Valide que la valeur est un objet dictionnaire (Record).
     * Exclut explicitement 'null' et les 'Array' pour éviter les pièges classiques du `typeof` en JavaScript.
     * @param value - La donnée à vérifier.
     * @param fieldName - Le nom du champ pour le message d'erreur.
     * @returns La valeur castée en Record<string, unknown>.
     * @throws {TypeError} Si la valeur n'est pas un objet, est null ou est un tableau.
     */
    static object(value: unknown, fieldName: string): Record<string, unknown> {
        if (
            typeof value !== 'object' ||
            value === null ||
            Array.isArray(value)
        ) {
            throw new ValidationError(`Le champ '${fieldName}' doit être un objet valide (dictionnaire).`);
        }
        return value as Record<string, unknown>;
    }
}