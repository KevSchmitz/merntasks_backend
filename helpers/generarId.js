const generarId = () => {
  const random = Math.random().toString(32).substring(2); // el toString transforma los dígitos en letras y en formato radix, substring remueve los 2 primero caractéres.
  const fecha = Date.now().toString(32);
  return random + fecha;
};

export default generarId;
