import mongoose from "mongoose";

// Mongoose es el ORM de mongoDB parecido a lo que sería Prisma
export const conectarDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const url = `${connection.connection.host}: ${connection.connection.port}`;
    // console.log(url)
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1); // Obliga a terminar la conexión
  }
};
