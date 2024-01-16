import moongose from "mongoose";

const proyectosSchema = moongose.Schema(
  {
    nombre: {
      type: String,
      trim: true,
      required: true,
    },
    descripcion: {
      type: String,
      trim: true,
      required: true,
    },
    fechaEntrega: {
      type: Date,
      default: Date.now(),
    },
    cliente: {
      type: String,
      trim: true,
      required: true,
    },
    // Se hace la relación aunque sea una base de datos no relacional
    creador: {
      type: moongose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    tareas: [
      {
        type: moongose.Schema.Types.ObjectId,
        ref: "Tarea",
      },
    ],
    colaboradores: [
      {
        type: moongose.Schema.Types.ObjectId,
        ref: "Usuario",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Proyecto = moongose.model("Proyecto", proyectosSchema);
export default Proyecto;
