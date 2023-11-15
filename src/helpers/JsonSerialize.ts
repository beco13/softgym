import { Binary, ObjectId } from "mongodb";

export class JsonSerialize {

    /**
     * Permite verificar si el valor dado es de los valores que se deben serializar
     * @param value
     * @returns
     */
    public static isTarget(value: any): boolean {

        // varificamos si es identificador de mongodb
        if (value instanceof ObjectId) {
            return true;
        }

        // verificamos si es binary
        if (value instanceof Binary) {
            return true;
        }

        // verificamos si es fecha
        if (value instanceof Date) {
            return true;
        }

        return false;
    }

    /**
     * permite serializar como se necesitan los valores de acuerdo a su tipo
     * @param value
     * @returns
     */
    public static serializeTarget(value: any) {

        // varificamos si es identificador de mongodb
        if (value instanceof ObjectId) {
            return value.toString();
        }

        // verificamos si es fecha
        if (value instanceof Date) {
            return value.getTime();
        }

        // verificamos si es binary
        if (value instanceof Binary) {
            return value.value();
        }

        return value;
    }

    /**
     * Verifica si el valor dado es escalar (null, string, boolean y number)
     *
     * @param value
     * @returns
     */
    public static isScalar(value: any) {

        if (typeof value === null) {
            return true;
        }

        if (typeof value === 'string' || value instanceof String) {
            return true;
        }

        if (typeof value === 'boolean') {
            return true;
        }

        if (typeof value === 'number') {
            return true;
        }

        return false;
    }

    /**
     * permite iterar los elementos de un array para iterarlos y aplicar la serializacion
     * @param value Array
     * @returns
     */
    public static serializeArray(value: Array<any>): Array<any> {

        // iteramos el arrelgo
        for (let index = 0; index < value.length; index++) {

            // aplicamos serializacion por cada elmeento del arreglo
            value[index] = JsonSerialize.toSerialize(value[index]);
        }

        // devolvemos el resultado
        return value;
    }

    /**
     * permite iterar los campos de un object para aplicar la serializacion
     * @param value
     * @returns
     */
    public static serializeObject(value) {

        // obtenemos las llaves para saber exactamente cuales campos procesar
        let keys = Object.keys(value);

        // iteramos los campos
        for (const index of keys) {

            // procesamos los campso
            value[index] = JsonSerialize.toSerialize(value[index]);
        }

        // devolvemos el resultado
        return value;
    }


    /**
     * Permite verificar el tipo del objeto para aplicar la serializacion segun sea el caso
     * @param value
     * @returns
     */
    public static toSerialize(value: any): any {

        // varificamos si la variable contiene valor diferente de objeto o de array
        if (JsonSerialize.isScalar(value)) {
            return value;
        }

        // varificamos si la variable es un array
        if (Array.isArray(value)) {
            // aplicamos serializacion
            return JsonSerialize.serializeArray(value);
        }

        // verificamos si el dato es de los tipos de datos objetivos a serializar
        if (JsonSerialize.isTarget(value)) {
            return JsonSerialize.serializeTarget(value);
        }

        // aplicamos serializacion al objeto
        return JsonSerialize.serializeObject(value);
    }


}