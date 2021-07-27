/** @format */

'use strict'; // utiliza el modo estricto del lenguaje
const express = require('express'); // añade el paquete express al script
const mysql = require('mysql'); // añade el paquete mysql al script
const util = require('util'); // Permite asincronismo en las consultas a la base de datos
const port = 3000; // Establece el puerto donde funcionará el servidor
const app = express(); // crea la aplicación con express
const cors = require ('cors'); // Agrega CORS

app.use(express.json()); // permite el mapeo de la peticion json a object js
app.use(cors({origin: "http://localhost:3001", credentials: true})); // Permite el acceso del cliente React a los recursos servidor

// crea la conexión con la base de datos
const conection = mysql.createConnection({
  host: 'sql10.freemysqlhosting.net',
  user: 'sql10427392',
  password: 'PGamyf4lGQ',
  database: 'sql10427392',
});

// comprueba la conexión con la base de datos
conection.connect((error) => {
  if (error) {
    throw error;
  }
  console.log(
    'Conexión con la base de datos establecida'
  );
});
const qy = util
  .promisify(conection.query)
  .bind(conection); // Permite asincronismo en las consultas a la base de datos

// rutas
// muestra todas las categorías
app.get('/categoria', async (req, res) => {
  try {
    const query = 'SELECT * FROM categoria';
    const respuesta = await qy(query);
    res.status(200).send(respuesta);
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

// muestra una categoría específica
app.get('/categoria/:id', async (req, res) => {
  try {
    // comprueba que exista la categoría
    const query =
      'SELECT * FROM categoria WHERE id = ?';
    const respuesta = await qy(query, [
      req.params.id,
    ]);
    if (respuesta.length === 0) {
      res
      .status(413)
      .send({ Mensaje: 'Categoria no encontrada' });
     
    }
    console.log(respuesta);
    res.status(200).send(respuesta);
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

// añade una categoría
app.post('/categoria', async (req, res) => {
  try {
    // comprobamos que se envíe el nombre de la categoria y que no sean solo espacios en blanco
    if (
      !req.body.nombre ||
      !req.body.nombre.trim()
    ) {
      res
      .status(413)
      .send({ Mensaje: 'Faltan datos' });
      
    }
    const nombre = req.body.nombre
      .trim()
      .toUpperCase();
    // comprobamos que la categoría no exista
    let query =
      'SELECT id FROM categoria WHERE nombre = ?';
    let respuesta = await qy(query, [nombre]);
    if (respuesta.length > 0) {
      res
      .status(413)
      .send({ Mensaje: 'Ese nombre de categoría ya existe' });
      
    }
    // Guardar categoría
    query =
      'INSERT INTO categoria (nombre) VALUE (?)';
    respuesta = await qy(query, [nombre]);
    res
      .status(200)
      .send({
        id: respuesta.insertId,
        nombre,
      });
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

// eliminar una categoría
app.delete('/categoria/:id', async (req, res) => {
  try {
    // comprobamos que la categoría no tenga libros asociados
    let query =
      'SELECT * FROM libro WHERE categoriaid = ?';
    let respuesta = await qy(query, [
      req.params.id,
    ]);
    if (respuesta.length > 0) {
      res
      .status(413)
      .send({ Mensaje: 'Categoria con libros asociados, no se puede eliminar' });
     
    }
    // comprobamos que la categoría exista
    query =
      'SELECT * FROM categoria WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      res
      .status(413)
      .send({ Mensaje: 'No existe la categoria indicada' });
      
    }

    query = 'DELETE FROM categoria WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    res
      .status(200)
      .send({
        Mensaje:
          'Se borró correctamente la categoría',
      });
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

// Ruta Libro

// Muestra un libro específico

app.get('/libro/:id', async (req, res) => {
  try {
    const query =
      'SELECT * FROM libro WHERE id = ?';
    const respuesta = await qy(query, [
      req.params.id,
    ]);
    if (respuesta.length === 0) {
      res
      .status(413)
      .send({ Mensaje: 'No se encuentra ese libro' });
      
    }
    res.status(200).send(respuesta);
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

// Muestra todos los libros

app.get('/libro', async (req, res) => {
  try {
    const query = 'SELECT * FROM libro';
    const respuesta = await qy(query);
    res.status(200).send(respuesta);
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

// Muestra todos los libros de un género

app.get(
  '/libro/categoria/:id',
  async (req, res) => {
    try {
      let query =
        'SELECT * FROM categoria WHERE id = ?';
      let respuesta = await qy(query, [
        req.params.id,
      ]);
      if (respuesta.length === 0) {
        res
      .status(413)
      .send({ Mensaje: 'Categoria no encontrada' });
    }
      query =
        'SELECT * FROM libro WHERE categoriaid = ?';
      respuesta = await qy(query, [
        req.params.id,
      ]);
      if (respuesta.length === 0) {
        res
      .status(413)
      .send({ Mensaje: 'No hay libros asociados a esa categoria' });
       
      }
      res.status(200).send(respuesta);
    } catch (error) {
      res
        .status(413)
        .send({ Mensaje: 'Error inesperado' });
    }
  }
);

// Muestra todos los libros de una persona

app.get(
  '/libro/persona/:id',
  async (req, res) => {
    try {
      let query =
        'SELECT * FROM persona WHERE id = ?';
      let respuesta = await qy(query, [
        req.params.id,
      ]);
      if (respuesta.length === 0) {
        res
      .status(413)
      .send({ Mensaje: 'Persona no encontrada' });
    }
      query =
        'SELECT * FROM libro WHERE personaid = ?';
      respuesta = await qy(query, [
        req.params.id,
      ]);
      if (respuesta.length === 0) {
        res
      .status(413)
      .send({ Mensaje: 'No hay libros asociados a esta persona' });
       
      }
      res.status(200).send(respuesta);
    } catch (error) {
      res
        .status(413)
        .send({ Mensaje: 'Error inesperado' });
    }
  }
);

// Agregar un libro

app.post('/libro', async (req, res) => {
  try {
    if (
      !req.body.nombre ||
      !req.body.categoriaid ||
      !req.body.nombre.trim() 
      
      
    ) {
      res
        .status(413)
        .send({ Mensaje: 'Nombre y categoría son datos obligatorios' });
     
    }
    const categoriaid = req.body.categoriaid;
    let query =
      'SELECT * FROM categoria WHERE id = ?';
    let respuesta = await qy(query, [
      categoriaid,
    ]);
    if (respuesta.length === 0) {
      res
        .status(413)
        .send({ Mensaje: 'No existe la categoría indicada' });
      
    }
    const nombre = req.body.nombre
      .trim()
      .toUpperCase();
    query =
      'SELECT * FROM libro WHERE nombre = ?';
    respuesta = await qy(query, [nombre]);
    if (respuesta.length > 0) {
      res
        .status(413)
        .send({ Mensaje: 'Ese libro ya existe' });
      
    }
    let personaid;
    if (req.body.personaid) {
      personaid = req.body.personaid;
      query =
        'SELECT * FROM persona WHERE id = ?';
      respuesta = await qy(query, [personaid]);
      if (respuesta.length === 0) {
        res
        .status(413)
        .send({ Mensaje: 'No existe la persona indicada' });
       
      }
    }
    let descripcion = '';
    if (req.body.descripcion) {
      descripcion = req.body.descripcion
        .trim()
        .toUpperCase();
    }
    query =
      'INSERT INTO libro (nombre, descripcion, categoriaid, personaid) VALUES(?, ?, ?, ?)';
    respuesta = await qy(query, [
      nombre,
      descripcion,
      categoriaid,
      personaid,
    ]);
    res
      .status(200)
      .send({
        id: respuesta.insertId,
        nombre,
        descripcion,
        categoria_id: categoriaid,
        persona_id: personaid,
      });
  } catch (error) {
    res
      
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

//Modificar datos de un libro.

app.put('/libro/:id', async (req, res) => {
  try {
    if (
      req.body.nombre ||
      req.body.categoriaid ||
      req.body.personaid ||
      !req.body.descripcion ||
      !req.body.descripcion.trim()
    ) {
      res
      .status(413)
      .send({ Mensaje: 'Solo se puede modificar la descripción del libro' });
      
    }
    const descripcion = req.body.descripcion
      .trim()
      .toUpperCase();
    let query =
      'SELECT * FROM libro WHERE id = ?';
    let respuesta = await qy(query, [
      req.params.id,
    ]);
    if (respuesta.length === 0) {
      res
      .status(413)
      .send({ Mensaje: 'Ese libro no existe' });
      
    }
    query =
      'UPDATE libro SET descripcion = ? WHERE id = ?';
    respuesta = qy(query, [
      descripcion,
      req.params.id,
    ]);
    query = 'SELECT * FROM libro WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    res.status(200).send(respuesta);
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

//Prestar un libro.

app.put(
  '/libro/prestar/:id',
  async (req, res) => {
    try {
      // comprobamos que exista el libro
      let query =
        'SELECT * FROM libro WHERE id = ?';
      let respuesta = await qy(query, [
        req.params.id,
      ]);
      if (respuesta.length === 0) {
        res
          .status(413)
          .send({
            Mensaje: 'No se encontró el libro',
          });
      }
      // comprobamos que el libro no esté prestado
      query =
        'SELECT personaid FROM libro WHERE id = ?';
      respuesta = await qy(query, [
        req.params.id,
      ]);
      if (respuesta[0].personaid != null) {
        res
          .status(413)
          .send({
            Mensaje:
              'El libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva',
          });
      }
      // comprobamos que la persona a prestar exista
      query =
        'SELECT * FROM persona WHERE id = ?';
      respuesta = await qy(query, [
        req.body.personaid,
      ]);
      if (respuesta.length === 0) {
        res
          .status(413)
          .send({
            Mensaje: 'esa persona no existe'
          });
      }

      // Prestamos el libro

      query =
        'UPDATE libro SET personaid = ? WHERE id = ?';
      respuesta = qy(query, [
        req.body.personaid,
        req.params.id,
      ]);
      res
        .status(200)
        .send({Mensaje:'Se prestó correctamente'});
    } catch (error) {
      res
        .status(413)
        .send({ Mensaje: 'Error inesperado' });
    }
  }
);

//Devolver un libro.

app.put(
  '/libro/devolver/:id',
  async (req, res) => {
    try {
      // comprobamos que exista el libro
      let query =
        'SELECT * FROM libro WHERE id = ?';
      let respuesta = await qy(query, [
        req.params.id,
      ]);
      if (respuesta.length === 0) {
        res
          .status(413)
          .send({
            Mensaje: 'Ese libro no existe'
          });
       
      }
      // comprobamos que el libro esté prestado
      query =
        'SELECT personaid FROM libro WHERE id = ?';
      respuesta = await qy(query, [
        req.params.id,
      ]);
      if (respuesta[0].personaid === null) {
        res
          .status(413)
          .send({
            Mensaje: 'Ese libro no estaba prestado!'
          });
       
      }

      // Devolvemos el libro

      query =
        'UPDATE libro SET personaid = null WHERE id = ?';
      respuesta = qy(query, [req.params.id]);
      res
        .status(200)
        .send(
          {Mensaje:'Se realizó la devolución correctamente'}
        );
    } catch (error) {
      res
        .status(413)
        .send({ Mensaje: 'Error inesperado' });
    }
  }
);

// Eliminar un libro

app.delete('/libro/:id', async (req, res) => {
  try {
    let query =
      'SELECT * FROM libro WHERE id = ?';
    let respuesta = await qy(query, [
      req.params.id,
    ]);
    if (respuesta.length === 0) {
      res
        .status(413)
        .send({ Mensaje: 'No se encuentra ese libro' });
      
    }
    query =
      'SELECT * FROM libro WHERE id = ? AND personaid is not null';
    respuesta = await qy(query, [
      req.params.id,
      
    ]);
    if (respuesta.length > 0) {
      res
        .status(413)
        .send({ Mensaje: 'Ese libro esta prestado no se puede borrar' });
      
    }
    query = 'DELETE FROM libro WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    res
      .status(200)
      .send({
        Mensaje: 'Se borró correctamente',
      });
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

// ruta persona

// muestra todas las personas en la base de datos

app.get('/persona', async (req, res) => {
  try {
    const query = 'SELECT * FROM persona';
    const respuesta = await qy(query);
    res.status(200).send(respuesta);
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

//muestra los datos de la persona con ese id

app.get('/persona/:id', async (req, res) => {
  try {
    const query =
      'SELECT * FROM persona WHERE id = ?';
    const respuesta = await qy(query, [
      req.params.id,
    ]);
    if (respuesta.length === 0) {
      res
        .status(413)
        .send({ Mensaje: 'No se encuentra esa persona' });
      
    }
    console.log(respuesta);
    res.status(200).send(respuesta);
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

// agregamos una persona a la base de datos

app.post('/persona', async (req, res) => {
  try {
    if (
      !req.body.nombre ||
      !req.body.apellido ||
      !req.body.email ||
      !req.body.alias ||
      !req.body.nombre.trim() ||
      !req.body.apellido.trim() ||
      !req.body.email.trim() ||
      !req.body.alias.trim()
    ) {
      res
      .status(413)
      .send({ Mensaje: 'Faltan datos' });
      
    }

    const nombre = req.body.nombre
      .trim()
      .toUpperCase();
    const apellido = req.body.apellido
      .trim()
      .toUpperCase();
    const email = req.body.email
      .trim()
      .toUpperCase();
    const alias = req.body.alias
      .trim()
      .toUpperCase();

    // comprobamos que el mail no haya sido registrado previamente

    let query =
      'SELECT * FROM persona WHERE email = ?';
    let respuesta = await qy(query, [email]);
    if (respuesta.length > 0) {
      res
      .status(413)
      .send({ Mensaje: 'El email ya se encuentra registrado' });
      
    }

    // Guardar nueva persona

    query =
      'INSERT INTO persona (nombre, apellido, email, alias) VALUES (?, ?, ?, ?)';
    respuesta = await qy(query, [
      nombre,
      apellido,
      email,
      alias,
    ]);

    const persona = {
      id: respuesta.insertId,
      nombre:nombre,
      apellido:apellido,
      email:email,
      alias:alias,
    };

    res.status(200).send(persona);
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

// Modificar los datos de una persona en la base de datos

app.put('/persona/:id', async (req, res) => {
  try {
    if (
      !req.body.nombre ||
      !req.body.apellido ||
      !req.body.email ||
      !req.body.alias ||
      !req.body.nombre.trim() ||
      !req.body.apellido.trim() ||
      !req.body.email.trim() ||
      !req.body.alias.trim()
    ) {
      res
      .status(413)
      .send({ Mensaje: 'Faltan datos' });
      
    }

    const nombre = req.body.nombre
      .trim()
      .toUpperCase();
    const apellido = req.body.apellido
      .trim()
      .toUpperCase();
    const alias = req.body.alias
      .trim()
      .toUpperCase();

    let query =
      'SELECT * FROM persona WHERE id = ?';
    let respuesta = await qy(query, [
      req.params.id,
    ]);
    if (respuesta.length === 0) {
      res
      .status(413)
      .send({ Mensaje: 'No se encuentra esa persona' });
      
    }

    // Guardar datos modificados pero sin modificar el email

    query =
      'UPDATE persona SET nombre = ?, apellido = ?, alias = ? WHERE id = ?';
    respuesta = await qy(query, [
      nombre,
      apellido,
      alias,
      req.params.id,
    ]);

    // Muestra la persona modificada pero con el email original

    query = 'SELECT * FROM persona WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    res.status(200).send(respuesta);
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});

// eliminar persona

// comprobamos que la persona no tenga libros asociados

app.delete('/persona/:id', async (req, res) => {
  try {
    let query =
      'SELECT * FROM libro WHERE personaid = ?';
    let respuesta = await qy(query, [
      req.params.id,
    ]);
    if (respuesta.length > 0) {
      res
      .status(413)
      .send({ Mensaje: 'Esa persona tiene libros asociados, no se puede eliminar' });
     
    }

    // comprobamos que la persona exista

    query = 'SELECT * FROM persona WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    if (respuesta.length <= 0) {
      res
      .status(413)
      .send({ Mensaje: 'No existe esa persona' });
   
    }

    // eliminamos la persona

    query = 'DELETE FROM persona WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    res
      .status(200)
      .send({
        Mensaje: 'Se borro correctamente',
      });
  } catch (error) {
    res
      .status(413)
      .send({ Mensaje: 'Error inesperado' });
  }
});
app.listen(port, () => {
  console.log(
    'Servidor escuchando peticiones en el puerto ' +
      port
  );
});
