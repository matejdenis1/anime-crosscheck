import { useState } from "react";
import Fuse from 'fuse.js';

/**
 * useFilterSearch hook parametry:
 * @param {Array} from - Pole objektů, které chceme filtrovat a prohledávat.
 * @param {Array} keyArray - Pole klíčů (řetězců), podle kterých chceme hledat v rámci jednotlivých položek v poli 'from'.
 */

const useFilterSearch = (from, keyArray) => {
    const [filter, setFilter] = useState([]);
    const [search, setSearch] = useState("");
    const fuse = new Fuse(from, {
            keys: keyArray,
            threshold: 0.2,
            includeScore: true,
            minMatchCharLength: 1,
            ignoreLocation: true,
    });
    const handleSearchChange = (e) => {
        const input = e.target.value
        if(input === ''){
            ;
            setSearch(input)
            setFilter([])
            return;
        }
        setSearch(input)
        const results = fuse.search(input);
        if (results.length > 0) {
            const filtered = results.filter(result => result.score < 0.2); 
            setFilter(filtered.map(result => result.item))
        }
        else{
            return setFilter([]);
        } 
    }
  return {filter, search, handleSearchChange}
}

export default useFilterSearch