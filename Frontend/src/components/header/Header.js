import { useWindowWidth } from "../hooks/useWindowWidth";
import { useScrollY } from "../hooks/useScrollY";
import ScrollToTopButton from "../misc/ScrollToTopButton";
import DesktopHeader from "../desktop-components/DesktopHeader";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MobileHeader from "../mobile-components/MobileHeader";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import API_URL from "../../config/api";



//Tato komponenta pouze rozhoduje o zobrazení mobilní nebo desktopové hlavičky a předává jim potřebné props
//Jelikož jednotlivé child komponenty jsou poměrně rozsáhlé a aplikují trošku jinou logiku vykreslování
const Header = () => {
    //Zde se posílá user input na backend pro vyhledávání uživatelů s funkcí debounceru
    const getUsersForSearch = useDebouncedCallback(async (search) => {
        const response = await fetch(`${API_URL}/api/users/search`, {
            method: 'POST',
            body: JSON.stringify({filter: search}),
            headers: {'Content-Type': 'application/json'}
        });
        const users = await response.json();
        setFilter(users);
    }, {wait: 300});

    const handleSearchChange = async (e) => {
        const search = e.target.value;
        setSearch(search);
        if(search === "" || search.length < 3){
            setFilter([])
            return;
        }
        await getUsersForSearch(search);
    }

    const [filter, setFilter] = useState([]);
    const [search, setSearch] = useState("");

    //Zde se čistí search input vyhledávání, když se prochází mezi stránkami
    const location = useLocation();
    useEffect(() => {
        setSearch("");
        setFilter([]);
    }, [location.pathname]);

    const windowWidth = useWindowWidth();
    const { scrollY, sentinelRef } = useScrollY();

    const [show, setShow] = useState(false);
    return(
        <>
            <div ref={sentinelRef} style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', pointerEvents: 'none', opacity: 0 }} aria-hidden="true" />
            {scrollY > 0 && <ScrollToTopButton />}
            {
                windowWidth > 800 ? <DesktopHeader show={show} setShow={setShow} search={search} filter={filter} handleSearchChange={handleSearchChange}/>
                 : <MobileHeader show={show} setShow={setShow} search={search}  filter={filter} handleSearchChange={handleSearchChange}/>
            }  
        </>
    );
}
export default Header;