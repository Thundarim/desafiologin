const express = require("express");
const router = express.Router();
const ProductManager = require("../dao/db/productManager.js");
const productManager = new ProductManager("./src/models/products.json");

function isLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

router.get("/", isLoggedIn, async (req, res) => {
    try {
        res.render("index");
    } catch (error) {
        console.error('Error al cargar la ruta raiz:', error);
        res.status(500).send('Error interno del servidor');
    }
});
router.get("/home", isLoggedIn, async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render("realtimeproducts", { products });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
router.get("/realtimeproducts", isLoggedIn, async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render("realtimeproducts", { products });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
router.delete("/products/:pid", isLoggedIn, async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const deletedProduct = await productManager.deleteProduct(productId);
        if (deletedProduct) {
            io.emit('realtimeProductRemoval', productId);
            res.json({ message: "Producto eliminado correctamente" });
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar producto por ID:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.get("/cart", isLoggedIn, (req, res) => {
    res.render("cart");
});
router.get("/products", isLoggedIn, (req, res) => {
    res.render("products", { user: req.session.user })   ;
});
router.get('/carts/:cid', isLoggedIn, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const selectedCart = await cartManager.getCartById(cartId);

        if (!selectedCart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const productsInCart = selectedCart.products.map(item => ({
            product: item.product.toObject(),
            quantity: item.quantity
        }));

        res.render('cartid', { products: productsInCart });
    } catch (error) {
        console.error("Error al obtener productos en el carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


router.get('/register', (req, res) => {
    res.render('register');
});
router.get('/login', (req, res) => {
    res.render('login');
});
router.get("/profile", (req, res) => {
    if (!req.session.login) {
        return res.redirect("/login");
    }

    res.render("profile", { user: req.session.user });
});


module.exports = router;
