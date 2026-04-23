import { useContext, useMemo} from 'react'
import { AuthContext } from '../providers/AuthProvider'

//Nastavení hooku pro získávání anime z kontextu nebo localStorage, pokud uživatel je nebo není přihlášen
const useAnimes = () => {
    const {user} = useContext(AuthContext);
    const animes = useMemo(() => {
        if(user) return user.animes;
        return JSON.parse(localStorage.getItem('animes')) ?? [];
    }, [user])
  return {animes}
}

export default useAnimes