
exports.getDate = function () {
    
    const today = new Date();
    //var currentDay = today.getDay();
    
    //const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    
    const options = {
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric'
                };
    
    return today.toLocaleDateString("en-US",options);
    
    

}

