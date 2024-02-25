const mongoose = require("mongoose")


mongoose.connect ('mongodb+srv://lauti:GP8Wl8XoRjI6BwTD@ecommerce.3uuqahh.mongodb.net/Comercio')
    .then(() => console.log('Conectado a la base de datos') )
    .catch((error)=>console.log(error));
    