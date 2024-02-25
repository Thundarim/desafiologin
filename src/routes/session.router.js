const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/logout", (req, res) => {
    if (req.session.login) {
        req.session.destroy();
    }
    res.redirect("/login");
})

router.post("/login", (req, res, next) => {
    passport.authenticate("login", {failureRedirect: "/api/sessions/faillogin"}, (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: "error", message: "Error de autenticación" });
        }
        if (!user) {
            return res.status(400).json({ status: "error", message: "Credenciales inválidas" });
        }

        req.session.user = {
            first_name: user.first_name,
            last_name: user.last_name,
            age: user.age,
            email: user.email,
            role: user.role
        };

        req.session.login = true;

        res.redirect("/profile");
    })(req, res, next);
});



router.get("/faillogin", async (req, res ) => {
    console.log("Fallo la estrategia")
    res.send({error: "fallo nose porque, vos sabes?"});
})


module.exports = router;