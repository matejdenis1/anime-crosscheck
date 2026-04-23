import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast";


/**
 * @param {string} url
 * URL endpointu
 * @param {Function} onSuccessFunction
 * Funkce, která se spustí po úspěšné mutaci
 * @param {Array} queryKeys
 * Klíče dotazů, které se mají invalidovat
 * @returns
 * useMutation funkce
 */

const usePost = (url, onSuccessFunction, queryKeys) => {
    const queryClient = useQueryClient();
    const handlePost = useMutation({
        mutationFn: async ({params = '', body = []}) => {
            const response = await fetch(url+params, {
                method: 'POST',
                credentials: 'include',
                headers: typeof body === 'string' ? {'Content-Type': 'application/json'} : {},
                body: body
            })
            if(!response.ok){
                const error = await response.json();
                throw new Error(error.message || 'Something went wrong while sending data!')
            }
            return await response.json();
        },
        onSuccess: (data, variables) => {
            if(data.message) toast.success(data.message)
            if(queryKeys.length !== 0) queryClient.invalidateQueries({queryKey: queryKeys})
            if(onSuccessFunction) onSuccessFunction(data, variables);
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
  return (
    {handlePost}
  )
}

export default usePost