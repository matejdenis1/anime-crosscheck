//Funkce pro převod data do čitelného časového formátu
export const convertTimeToAgo = (time) => {
    let string = '';
    const timeAgo = Math.round((new Date() - new Date(time)) / (1000*60));
    if (timeAgo >= 1440){
        string = (`${Math.round(timeAgo/60/24)} days ago`)
    }
    else if(timeAgo >= 60){
        string = (`${Math.round(timeAgo/60)} hours ago`)
    }
    else{
        string = (`${Math.round(timeAgo)} minutes ago`)
    }
    return string;
}