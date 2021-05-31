"use strict"; // utiliza el modo estricto del lenguaje
const express = require("express"); // añade el paquete express al script
const mysql = require("mysql"); // añade el paquete mysql al script
const util = require("util"); // Permite asincronismo en las consultas a la base de datos
const port = 3000; // Establece el puerto donde funcionará el servidor
const app = express(); // crea la aplicación con express

app.use(express.json()); // permite el mapeo de la peticion json a object js

// crea la conexión con la base de datos
const conection = mysql.createConnection({
  host: "freedb.tech",
  user: "freedbtech_biblioutn",
  password: "A1B2C3",
  database: "freedbtech_bibliotecatpgrupalutn",
});
// comprueba la conexión con la base de datos
conection.connect((error) => {
  if (error) {
    throw error;
  }
  console.log('Conexión con la base de datos establecida');
});
const qy = util.promisify(conection.query).bind(conection); // Permite asincronismo en las consultas a la base de datos

// rutas
// muestra todas las categorías
app.get('/categoria', async (req, res) => {
  try {
    const query = 'SELECT * FROM categoria';
    const respuesta = await qy(query);
    res.send(respuesta);
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// muestra una categoría específica
app.get('/categoria/:id', async (req, res) => {
  try {
    // comprueba que exista la categoría
    const query = 'SELECT * FROM categoria WHERE id = ?';
    const respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('Esa categoría no existe');
    }
    console.log(respuesta);
    res.send(respuesta);
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// añade una categoría
app.post('/categoria', async (req, res) => {
  try {
    // comprobamos que se envíe el nombre de la categoria y que no sean solo espacios en blanco
    if (!req.body.nombre || !req.body.nombre.trim()) {
      throw new Error('Debes enviar un nombre de categoría válido. El campo no puede estar vacío ni contener solo espacios en blanco.');
    }
    const nombre = req.body.nombre.trim().toUpperCase();
    // comprobamos que la categoría no exista
    let query = 'SELECT id FROM categoria WHERE nombre = ?';
    let respuesta = await qy(query, [nombre]);
    if (respuesta.length > 0) {
      throw new Error('Esa categoría ya existe');
    }
    // Guardar categoría
    query = 'INSERT INTO categoria (nombre) VALUE (?)';
    respuesta = await qy(query, [nombre]);
    res.send({ "id": respuesta.insertId, "nombre": nombre });
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// eliminar una categoría
app.delete('/categoria/:id', async (req, res) => {
  try {
    // comprobamos que la categoría no tenga libros asociados
    let query = 'SELECT * FROM libro WHERE categoriaid = ?';
    let respuesta = await qy(query, [req.params.id]);
    if (respuesta.length > 0) {
      throw new Error('Esa categoría tiene libros asociados, no se puede borrar');
    }
    // comprobamos que la categoría exista
    query = 'SELECT * FROM categoria WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('Esa categoría no existe');
    }

    query = 'DELETE FROM categoria WHERE ID = ?';
    respuesta = await qy(query, [req.params.id]);
    res.send({ "Mensaje": "Se borró correctamente la categoría" });
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// Ruta Libro
// Muestra todos los libros
app.get('/libro', async (req, res) => {
  try {
    const query = 'SELECT * FROM libro';
    const respuesta = await qy(query);
    res.send(respuesta);
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// Muestra todos los libros de un género
app.get('/libro/:id', async (req, res) => {
  try {
    const query = 'SELECT * FROM libro WHERE categoriaid = ?';
    const respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('Esa categoría no existe');
    }
    console.log(respuesta);
    res.send(respuesta);
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// Agregar un libro
app.post('/libro', async (req,res) => { 
  try {
      if (!req.body.nombre || !req.body.categoriaid) {
          throw new Error("No enviaste los datos obligatorios: nombre y categoria");
      }

      let query = 'SELECT * FROM categoria WHERE id = ?';
      let respuesta = await qy (query,[req.body.categoriaid]);

      if (respuesta.length == 0) {
          throw new Error("Esa categoria no existe");
      }

      query = 'SELECT * FROM libro WHERE nombre = ?';
      respuesta = await qy (query, [req.body.nombre]);

      if (respuesta.length > 0) {
          throw new Error("Ese libro ya existe");
      }
      
      let descripcion = '';
      if (req.body.descripcion) {
          descripcion = req.body.descripcion;
      }

      query = 'INSERT INTO libro (nombre, descripcion, categoriaid, personaid) VALUES(?, ?, ?, ?)';
      respuesta = await qy(query, [req.body.nombre, descripcion, req.body.categoriaid, req.body.personaid]);

      res.send({'respuesta': respuesta.insertId});

  }
  catch(e){
      console.error(e.message);
      res.status(413).send({"Error": e.message});
  }
});


app.listen(port, () => {
  console.log('Servidor escuchando peticiones en el puerto ' + port);
});
