import { useState } from "react";
/**
 * @param {Object} params - Objekt obsahující pole chyb.
 * Každý klíč v objektu představuje název pole a hodnota je chybová zpráva pro dané pole.
 */

const useFormValidation = (initialValue) => {
    const [values, setValues] = useState(initialValue);
    const [errors, setErrors] = useState({});

    const setValue = (field, value) => {
        setValues(prev => ({...prev, [field]: value}))
        setErrors(prev => ({...prev, [field]: undefined}));
    }
    return {values, errors, setValue, setErrors}
}
export default useFormValidation;