import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import mongoose from "mongoose";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;

  if (!mongoose.Types.ObjectId.isValid(proyecto)) {
    // El ID de mongoose tiene que ser hexadecimal de 24 carácteres, lo que si tiene mas o menos de ese número, crashea la APP, este es un método para verifciar si es un ID válido.
    const error = new Error("El ID no es válido");
    return res.status(404).json({ msg: error.message });
  }

  const existeProyecto = await Proyecto.findById(proyecto);

  if (!existeProyecto) {
    const error = new Error("El proyecto no existe");
    return res.status(404).json({ msg: error.message });
  }

  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes los permisos para añadir tareas");
    return res.status(403).json({ msg: error.message }); //401 requiere estar autenticado .
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);
    // Almacenar el ID en el Proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id); // Al ser NODE no importa usar el push
    await existeProyecto.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    // El ID de mongoose tiene que ser hexadecimal de 24 carácteres, lo que si tiene mas o menos de ese número, crashea la APP, este es un método para verifciar si es un ID válido.
    const error = new Error("El ID de la tarea no es válido");
    return res.status(404).json({ msg: error.message });
  }

  /*
  SE PUEDE HACER DE ESTA MANERA PERO ESTARIAS CONSULTANDO 2 VECES AL SERVIDOR LO QUE BAJA EL RENDIMIENTO DE LA APP
  const tarea = await Tarea.findById(id);

  const proyecto = await Proyecto.findById(tarea.proyecto);
  console.log(proyecto);
  */
  const tarea = await Tarea.findById(id).populate("proyecto"); // populate permite traer los datos de la referencia a la que se hizo.

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message }); // Cuando no existe es error 404.
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no permitida");
    return res.status(403).json({ msg: error.message }); // 403 No tienes los permisos adecuados.
  }
  res.json(tarea);
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      "No tienes permisos para poder realizar esta accion"
    );
    return res.status(403).json({ msg: error.message });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

  try {
    const tareaAlmacenada = await tarea.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      "No tienes permisos para poder realizar esta accion"
    );
    return res.status(403).json({ msg: error.message });
  }

  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);

    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);

    res.json({ msg: "La tarea ha sido eliminada" });
  } catch (error) {
    console.log(error);
  }
};

const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea No Encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error(
      "No tienes permisos para poder realizar esta accion"
    );
    return res.status(403).json({ msg: error.message });
  }

  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario.id;
  await tarea.save();

  // Se llama a la tarea actualizada y se da respuesta de la misma para que traiga el nombre de la persona al se completada la tarea
  const tareaAlmacenada = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado");

  res.json(tareaAlmacenada);
};

export {
  actualizarTarea,
  agregarTarea,
  cambiarEstado,
  eliminarTarea,
  obtenerTarea,
};
