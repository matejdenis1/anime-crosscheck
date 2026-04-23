import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {createContext, useState} from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import usePost from "../hooks/usePost";
import API_URL from "../../config/api";
const AuthContext = createContext();

//Tato komponenta spravuje uživatelské stavy v celé aplikaci a poskytuje metody pro přihlašování, odhlašování, registraci a mazání profilu.
//
const AuthProvider = ({children}) => {
    const queryClient = useQueryClient();
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const navigate = useNavigate()

    //Když uživatel poprvé přijde na web - do localStorage se nastaví prázdné pole anime, pokud tam již neexistuje
    //Aby si mohl přidávat anime do oblíbených a podle nich filtrovat na adrese /layout
    if(localStorage.getItem('animes') === null || localStorage.getItem('animes') === ''){
      localStorage.setItem('animes', JSON.stringify([]))
    }

    //Požadavek serveru pro získání informací o uživateli
    const {data: user, isPending} = useQuery({
      queryKey: ['user'],
      queryFn: async () => {
        const response = await fetch(`${API_URL}/api/protected`, {credentials: 'include'} )
        if(!response.ok){
          const error = await response.json();
          throw new Error(error.message || 'Something went wrong while fetching user!')
        }
        const resolve = await response.json();
        setIsAuthenticated(resolve.auth)
        return resolve.user;
      },
      staleTime: 5*60*1000,
      gcTime: 5*60*1000,
      retry: false
    })

    
    
    const handleDeleteUser = () => {
      deleteProfile.mutate();
    }

    const deleteProfile = useMutation({
      mutationFn: async () => {
        const response = await fetch(`${API_URL}/api/user`, {
          method: 'DELETE',
          credentials: 'include'
        })
        return await response.json();
      },
      onSuccess: () => {
        navigate('/')
        queryClient.removeQueries({queryKey: ['user']})
        //Smazaný uživatel se může vyskytovat v ostatních cache (followers/follows, komentáře, recent ratings) - zajistí refetch.
        queryClient.invalidateQueries()
        setIsAuthenticated(false)
      }
    })

    const handleRegister = async (formData) => {
      try{
        const response = await register.mutateAsync(formData);
        return response
      } catch(err){
        if(typeof err === 'object' && err !== null){
          return err
        }
      }
    }
    //Metoda využívá asynchroní variaci mutace pro zobrazení registračního toastu
    const register = useMutation({
      mutationFn: async (formData) => {
        const response = await fetch(`${API_URL}/api/users/register`, {
          method: "POST",
          credentials: 'include',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({...formData})
        });
        if(!response.ok){
          const error = await response.json();
          throw error
        }
        return await response.json();
      },
      onSuccess: () => {
        toast.success('Registered successfully!')
        queryClient.invalidateQueries({queryKey: ['user']});
      }
    })

    
    const handleLogin = async (formData) => {
      try{
        const response = await login.mutateAsync(formData)
        return response.auth
      } catch(err){
        return false
      }
    }
    const login = useMutation({
      mutationFn: async (formData) => {
        const response = await fetch(`${API_URL}/api/users/login`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'include',
          body: JSON.stringify({...formData})
        })
        if(!response.ok){
          const error = await response.json();
          throw new Error(error.message || 'Error occurred while logging!')
        }
        return await response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ['user']});
        localStorage.setItem('animes', '[]')
      }
    })
    
    const handleLogout = () => {
      logout.mutate({});
      localStorage.setItem('animes', '[]')
    }
    //Zde se provádí odhlášení uživatele a odstranění jeho dat z cache
    const {handlePost: logout} = usePost(`${API_URL}/api/users/logout`, 
      () => {
        setIsAuthenticated(false);
        navigate("/"); 
        //Mažou se data z cache pro odhlášeného uživatele
        queryClient.removeQueries({queryKey: ['user']});  
    }, [])
    return(
        <AuthContext.Provider value={{user, isAuthenticated, login: handleLogin, logout: handleLogout , register: handleRegister , userLoading: isPending, deleteUser: handleDeleteUser}}>
            {children}
        </AuthContext.Provider>
    )
}
export {AuthProvider,AuthContext}