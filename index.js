// Se instala 'nodemon' para estar eschando cambios en el archivo seleccionado y no estar teniendo que cancelar y correr nuevamente el servidor
// const express = require ('express'); // Lo que hace esta variable es ir a express en el node_modules y asignarlo a la variable (pertenece a commonJS)
import express from "express"; // Pertenece a ESM y requiere pasar el tipo de archivo a 'module' (se hace desde el package.json y se coloca una propiedad de '"type": "module"')
import dotenv from "dotenv";
import cors from "cors";
import { conectarDB } from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";
// import proyectoRoutes from "./routes/proyectoRoutes.js";
// Los archivos que importes y hayas creado tú, tienes que ponerle la extensión al final del path, ejemplo 'import prueba from "prueba.js"'

const app = express();
app.use(express.json()); // Para leer la información en json hay que usar este método que ya viene incluido con express

// express requiere de un env aparte por lo que se descarga una dependencia aparte llamada 'dotenv'
dotenv.config();

conectarDB();

// Configuración CORS

const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin)) {
      // Puede consultar API
      callback(null, true); // no va a tirar error, por eso se pone null, pero si permitimos que consulte la API por lo que se coloca true
    } else {
      // No puede consultar API
      callback(new Error("Error de CORS"));
    }
  },
};

app.use(cors(corsOptions));

// Routing
// el 'use' soporta todos los verbos (get, post, delete, put, etc...)
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000;

// Se crea el server como variable para tener su referencia
const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Socket.io

import { Server } from "socket.io";

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    // De donde vienen las peticiones, es decir del frontend
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("Conectado a Socket.io");

  // Definir los eventos de Socket.io
  socket.on("abrir proyecto", (proyecto) => {
    socket.join(proyecto); // el método join solo existe en el serverside
  });

  socket.on("nueva tarea", (tarea) => {
    const proyecto = tarea.proyecto; // No se puede aplicar destructuring porque da errores
    socket.to(proyecto).emit("tarea agregada", tarea);
  });

  socket.on("eliminar tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea eliminada", tarea);
  });

  socket.on("actualizar tarea", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("tarea actualizada", tarea);
  });

  socket.on("cambiar estado", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("nuevo estado", tarea);
  });
});
