import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
/**
 * 
 * @param {string} url
 * URL endpointu
 * @param {Array} queryKeys
 * Klíče dotazů pro cachování
 * @param {boolean} enabled
 * podmíněné fetchování
 * @returns
 * data a stav načítání
 */
const useFetch = (url, queryKeys, enabled) => {
    const {data, isLoading, isError, error} = useQuery({
        enabled: enabled,
        queryKey: queryKeys,
        queryFn: async () => {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            })
            if(!response.ok){
                const error = await response.json();
                throw new Error(error.message)
            }
            return await response.json();
        },
        staleTime: 5*60*1000,
        gcTime: 5*60*1000
    })
    useEffect(() => {
        if(error){
            toast.error(error.message)
        }
    }, [error])
  return (
    {data, isLoading, isError}
  )
}

export default useFetch