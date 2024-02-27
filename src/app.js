import express from "express";
import cors from "cors";
import productRoutes from "./routes/products.routes";
import usersRoutes from "./routes/users.routes";
import emailRoutes from "./routes/email.routes";
import morgan from "morgan";

import config from "./config";

const app = express();

// settings
app.set("port", config.port);

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Manejo de la ruta raíz
app.get("/", (req, res) => {
    res.send("¡Hola, este es mi servidor API!");
  });
  
  app.get("/api", (req, res) => {
    res.send("¡APIw!");
  });
  
  app.get("/users", (req, res) => {
    res.send("Obteniendo información del usuario!");
  });
// Routes
app.use("/api", productRoutes);
app.use("/api", usersRoutes);
app.use("/api", emailRoutes);

export default app;
