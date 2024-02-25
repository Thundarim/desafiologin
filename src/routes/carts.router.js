const express = require('express');
const CartManager = require('../dao/db/cartManager.js');
const Product = require('../dao/models/products.model.js');
const router = express.Router();

const cartManager = new CartManager();

router.post("/carts", async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        console.error("Error al crear un nuevo carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Obtener todos los carritos
router.get("/carts", async (req, res) => {
    try {
        const carts = await cartManager.getCarts();
        res.json(carts);
    } catch (error) {
        console.error("Error al obtener carritos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// Obtener los carritos por id
router.get("/carts/:cid", async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);
        const products = await cartManager.getProductsInCart(cartId);
        res.render("cartid", { cart: cart.toObject(), products: products });
    } catch (error) {
        console.error("Error al obtener carrito por ID:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});



// Añadir producto al carrito
router.post("/carts/:cid/product/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;
  
    try {
        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error al agregar producto al carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Eliminar producto del carrito
router.delete("/carts/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
  
    try {
        const updatedCart = await cartManager.removeProductFromCart(cartId, productId);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error al eliminar producto del carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Actualizar carrito con arreglo de productos
router.put("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;
    const products = req.body.products;
  
    try {
        const updatedCart = await cartManager.updateCartProducts(cartId, products);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error al actualizar productos del carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Actualizar cantidad de ejemplares del producto en el carrito
router.put("/carts/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity;
  
    try {
        const updatedCart = await cartManager.updateProductQuantity(cartId, productId, quantity);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error al actualizar cantidad del producto en el carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Eliminar todos los productos del carrito
router.delete("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;
  
    try {
        const updatedCart = await cartManager.removeAllProductsFromCart(cartId);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error al eliminar todos los productos del carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;
