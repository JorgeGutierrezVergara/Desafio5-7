const { Pool } = require("pg");
const format = require("pg-format");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "12345",
  database: "joyas",
  port: 5432,
  allowExitOnIdle: true,
});

const obtenerJoyas = async ({ limits = 10, order_by = "id_ASC", page = 1 }) => {
  const [campo, direccion] = order_by.split("_");
  const offset = (page - 1) * limits; //con el offset, se agrupan los resultados como paginas de google
  const formattedQuery = format(
    "SELECT * FROM inventario order by  %s %s LIMIT %s OFFSET %s",
    campo,
    direccion,
    limits,
    offset
  );
  pool.query(formattedQuery);
  const { rows: joyas } = await pool.query(formattedQuery);
  return joyas;
};

const obtenerJoyasPorFiltros = async ({
  precio_max,
  precio_min,
  categoria,
  metal,
}) => {
  let filtros = [];
  const values = [];
  const agregarFiltro = (campo, comparador, valor) => {
    values.push(valor);
    const { length } = filtros;
    filtros.push(`${campo} ${comparador} $${length + 1}`);
  };
  if (precio_max) agregarFiltro("precio", "<=", precio_max);
  if (precio_min) agregarFiltro("precio", ">=", precio_min);
  if (categoria) agregarFiltro("categoria", "= ", categoria);
  if (metal) agregarFiltro("metal", "= ", metal);
  let consulta = "SELECT * FROM inventario";
  if (filtros.length > 0) {
    filtros = filtros.join(" AND ");
    consulta += ` WHERE ${filtros}`;
  }
  const { rows: joyas } = await pool.query(consulta, values);
  console.log("rows: " + joyas.length);
  if (joyas.length === 0) {
    throw {
      code: 404,
      message: "No se consiguió ninguna joya con estas características",
    };
  }
  return joyas;
};

module.exports = {
  obtenerJoyas,
  obtenerJoyasPorFiltros,
};
