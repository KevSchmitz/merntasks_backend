import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = mongoose.Schema(
  {
    // Se crea un objeto en el Schema
    nombre: {
      type: String,
      required: true,
      trim: true, // quita los espacios al principio y al final ejemplo: '  Kevin  ' => 'Kevin' || ' Kev in  ' => 'Kev in'
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true, // No permite que se repita el mismo valor en la base de datos
    },
    token: {
      type: String,
    },
    confirmado: {
      type: Boolean,
      default: false, // El valor por ddefecto cuando se cree el usuario va a ser false
    },
  },
  {
    timestamps: true, // Crea 2 columnas mas, una de creado y otra de actualizado
  }
);

usuarioSchema.pre("save", async function (next) {
  // Se utiliza function y no arrow function porque vamos a usar 'this.'

  if (!this.isModified("password")) {
    next(); // la líneas de código en node están se llaman middleware, el código se lee por middlewares, next lo que hace es saltar al siguiente middleware y no frena la ejecución del siguiente código, mientras que el 'return' frena el resto del código.
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
  return await bcrypt.compare(passwordFormulario, this.password);
};

const Usuario = mongoose.model("Usuario", usuarioSchema);

export { Usuario };
