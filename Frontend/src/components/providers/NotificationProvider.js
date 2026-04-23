import { createContext, useState, useEffect, useContext} from 'react';
import { AuthContext } from './AuthProvider';
import API_URL from "../../config/api";

const NotificationContext = createContext(null); 

const NotificationProvider = ({ children }) => {
    const {user, userLoading} = useContext(AuthContext)
    const [notifications, setNotifications] = useState([]);

    //Získání notifikací z databáze při načtení komponenty, pokud je uživatel přihlášen
    const fetchNotifications = async () => {
        const response = await fetch(`${API_URL}/api/user/notifications`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        })
        const resolve = await response.json();
        setNotifications(resolve.notifications)
    }
    useEffect(() => {
        if(user && user.type === 'user' && !userLoading){
            fetchNotifications();
        }
    }, [user, userLoading])

    //Požadavek serveru pro připojení k SSE, pokud je uživatel přihlášen
    useEffect(() => {
        let eventSource = null;
        if(userLoading || (user?.type !== 'user' && user?.type !== 'moderator')) return;
        try{
            eventSource = new EventSource(`${API_URL}/api/notification/stream`, {
            withCredentials: true
        });
        eventSource.onmessage = (event) => {
                const eventData = JSON.parse(event.data);
                setNotifications(prev => [eventData, ...prev]); 
        };
            } catch (error) {
            console.error("Error connecting to SSE:", error);
        }
        return () => {
            if(eventSource){
                eventSource.close();
            }
        }
    }, [userLoading, user]);


    return (
        <NotificationContext.Provider value={{notifications, setNotifications}}>
            {children}
        </NotificationContext.Provider>
    );
};

export { NotificationProvider, NotificationContext };