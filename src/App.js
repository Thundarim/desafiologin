// constantes
const express = require("express");
const multer = require("multer");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const FileStore = require("session-file-store");
const socket = require("socket.io");
const ProductManager = require("./dao/db/productManager.js");
const initializePassport = require("./config/passport.config.js");
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const userRouter = require("./routes/user.router.js");
const sessionRouter = require("./routes/session.router.js");



require("./database.js");

const app = express();
const PUERTO = 8080;

// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./src/public/img");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// Express
app.use('/api/carts', express.static('./src/public'));
app.use(express.static("./src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: "secretoCoderhouse",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://lauti:GP8Wl8XoRjI6BwTD@ecommerce.3uuqahh.mongodb.net/Comercio",
        ttl: 1600
    })
}));


// handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// rutas
app.use("/", viewsRouter);
app.use("/api/users", userRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api", productsRouter);
app.use("/api", cartsRouter);

// config de passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// middleware de error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal!');
});

// inicializacion de server
const httpServer = app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto: ${PUERTO}`);
});

// inicializacion de socket.io
const io = socket(httpServer);
const productManager = new ProductManager("./src/models/products.json", io);

// rutas de productos
app.post("/api/products", async (req, res) => {
    try {
        const newProduct = req.body;
        const addedProduct = await productManager.addProduct(newProduct);
        console.log(`Usuario ${socket.id} ha agregado un nuevo producto:`, newProduct);
        io.emit('realtimeProductUpdate', addedProduct);
        res.json(addedProduct);
    } catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

app.post("/api/products/delete/:pid", async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const deletedProduct = await productManager.deleteProduct(productId);
        console.log(`Usuario ${socket.id} ha eliminado un producto con ID: ${productId}`);
        io.emit('realtimeProductRemoval', productId);
        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar producto por ID:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
