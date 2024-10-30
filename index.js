const express = require("express");
const app = express();
app.listen(3000, console.log("Servidor levantado en el puerto 3000"));

const { obtenerJoyas, obtenerJoyasPorFiltros } = require("./consultas");

const reportarConsulta = async (req, res, next) => {
  const parametros = req.query;
  const url = req.url;
  console.log(
    `
    Hoy ${new Date()}
    Se ha recibido una consulta en la ruta ${url}
    con los parámetros:
    `,
    parametros
  );
  next();
};

const prepararHATEOAS = (joyas) => {
  const results = joyas
    .map((j) => {
      return {
        name: j.nombre,
        href: `/joyas/joya/${j.id}`,
      };
    })
    .slice(0, 4);
  const total = joyas.length;
  const HATEOAS = {
    total,
    results,
  };
  return HATEOAS;
};

app.get("/joyas", reportarConsulta, async (req, res) => {
  const queryStrings = req.query;
  const joyas = await obtenerJoyas(queryStrings);
  const HATEOAS = await prepararHATEOAS(joyas);
  res.json(HATEOAS);
});

app.get("/joyas/filtros", reportarConsulta, async (req, res) => {
  const queryStrings = req.query;
  try {
    const joyas = await obtenerJoyasPorFiltros(queryStrings);
    res.json(joyas);
  } catch ({ code, message }) {
    res.status(code).send(message);
  }
});
