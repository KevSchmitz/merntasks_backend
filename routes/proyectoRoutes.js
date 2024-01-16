import express from "express";
import {
  agregarColaborador,
  buscarColaborador,
  editarProyecto,
  eliminarColaborador,
  eliminarProyecto,
  nuevoProyecto,
  obtenerProyecto,
  obtenerProyectos,
  // obtenerTareas,
} from "../controllers/proyectoController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

// router.get("/", checkAuth, obtenerProyectos);
// router.post("/", checkAuth, nuevoProyecto);
router
  .route("/")
  .get(checkAuth, obtenerProyectos)
  .post(checkAuth, nuevoProyecto);

router
  .route("/:id")
  .get(checkAuth, obtenerProyecto)
  .put(checkAuth, editarProyecto)
  .delete(checkAuth, eliminarProyecto);

router
  .post("/colaboradores", checkAuth, buscarColaborador)
  // .get("/tareas/:id", checkAuth, obtenerTareas)
  .post("/colaboradores/:id", checkAuth, agregarColaborador)
  // Aunque sea una acción de eliminar se usa el post ya que vas a eliminar una parte de un conjunto y no el conjunto completo
  // El método .delete no te permite pasar valores, por lo que vuelve a ser un post y cambiamos la ruta
  .post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador);

export default router;
