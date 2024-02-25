const passport = require("passport");
const local = require("passport-local");
const UserModel = require("../dao/models/users.model.js");
const { createHash, isValidPassword } = require("../utils/hashBcrypt.js");
const LocalStrategy = local.Strategy;
const initializePassport = () => {

    passport.use("register", new LocalStrategy({
        passReqToCallback: true, 
        usernameField: "email"
    }, async (req, email, password, done) => {
        const { first_name, last_name, age } = req.body; 
        try {
            //Verificamos si ya existe un registro
            let user = await UserModel.findOne({ email });
            if (user) return done(null, false);
            //Si no existe, crear un usuario nuevo
            let newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                role: "usuario"
            }
    
            let result = await UserModel.create(newUser);
            return done(null, result);        
        } catch (error) {
            return done(error);
        }
    }));

    passport.use("login", new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email, password, done) => {
        try {
            if (email === "adminCoder@coder.com" && password === "adminCod3r123") {

                const adminUser = {
                    first_name: "Admin",
                    last_name: "User",
                    email: email,
                    role: "admin"
                };
                return done(null, adminUser);
            }
            const user = await UserModel.findOne({ email });
            if (!user) {
                console.log("Este usuario no existe");
                return done(null, false);
            }
            if (!isValidPassword(password, user)) {
                console.log("Contraseña incorrecta");
                return done(null, false);
            }
            user.role = "usuario";
            return done(null, user);
    
        } catch (error) {
            console.error("Error de autenticación:", error);
            return done(error);
        }
    }));
    
    
    
    
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser( async (id, done) => {
        let user = await UserModel.findById({_id: id});
        done(null, user);
    })
}


module.exports = initializePassport;