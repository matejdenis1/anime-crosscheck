import { useContext} from 'react'
import { AuthContext } from '../providers/AuthProvider';
import usePost from './usePost';
import { useDebouncedCallback } from '@tanstack/react-pacer';
import { useQueryClient } from '@tanstack/react-query';
import API_URL from "../../config/api";
export const useFavoriteAnime = () => {
  const {user} = useContext(AuthContext)
  const queryClient = useQueryClient();
  // Funkce pro optimistické aktualizování cache po úspěšném přidání nebo odebrání anime z oblíbených v případě přihlášeného uživatele.
  const successMethod = (data, variables) => {
    const animeId = variables?.params ?? variables;
    queryClient.setQueryData(['user'], (oldUser) => {
      if (!oldUser) return oldUser;
      const updatedAnimes = oldUser.animes.includes(animeId)
        ? oldUser.animes.filter(anime => anime !== animeId)
        : [...oldUser.animes, animeId];
      return { ...oldUser, animes: updatedAnimes };
    });
    if(user?.profileId){
      queryClient.invalidateQueries({queryKey: ['userProfile', user.profileId]});
    }
  }
  const {handlePost: addToFavorite} = usePost(`${API_URL}/api/users/anime/`, successMethod , ['recommended'])
  // Jestli je uživatel přihlášený přidej anime do databáze, jinak do localStorage
  const addAnime = (id) => {
    if(!user){
      let newAnimes;
      const animes = JSON.parse(localStorage.getItem('animes'))
      if(animes.includes(id)){
        newAnimes = animes.filter(animeId => animeId !== id)
      } else{
        newAnimes = [...animes, id]
      }
      localStorage.setItem('animes', JSON.stringify(newAnimes))
      return;
    }
    debounceRequest(id);
  }
  //Použití debounce pro optimalizaci požadavků na server, aby se zabránilo příliš častým aktualizacím při rychlém klikání
  const debounceRequest = useDebouncedCallback((id) => {
    addToFavorite.mutate({params: id})}, {wait: 500}
  )
  return {...addToFavorite, addAnime}
}
