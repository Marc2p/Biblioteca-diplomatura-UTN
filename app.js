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
    res.status(200).send(respuesta);
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
      throw new Error('Categoria no encontrada');
    }
    console.log(respuesta);
    res.status(200).send(respuesta);
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
      throw new Error('Faltan datos');
    }
    const nombre = req.body.nombre.trim().toUpperCase();
    // comprobamos que la categoría no exista
    let query = 'SELECT id FROM categoria WHERE nombre = ?';
    let respuesta = await qy(query, [nombre]);
    if (respuesta.length > 0) {
      throw new Error('Ese nombre de categoría ya existe');
    }
    // Guardar categoría
    query = 'INSERT INTO categoria (nombre) VALUE (?)';
    respuesta = await qy(query, [nombre]);
    res.status(200).send({ "id": respuesta.insertId, "nombre": nombre });
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
      throw new Error('Categoria con libros asociados, no se puede eliminar');
    }
    // comprobamos que la categoría exista
    query = 'SELECT * FROM categoria WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('No existe la categoria indicada');
    }

    query = 'DELETE FROM categoria WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    res.status(200).send({ "Mensaje": "Se borró correctamente la categoría" });
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// Ruta Libro

// Muestra un libro específico

app.get('/libro/:id', async (req, res) => { 
  try {
    const query = 'SELECT * FROM libro WHERE id = ?';
    const respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('No se encuentra ese libro');
    }
    res.status(200).send(respuesta);
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// Muestra todos los libros

app.get('/libro', async (req, res) => {
  try {
    const query = 'SELECT * FROM libro';
    const respuesta = await qy(query);
    res.status(200).send(respuesta);
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// Muestra todos los libros de un género

app.get('/libro/categoria/:id', async (req, res) => {
  try {
    const query = 'SELECT * FROM libro WHERE categoriaid = ?';
    const respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('Esa categoría no existe');
    }
    res.status(200).send(respuesta);
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// Agregar un libro

app.post('/libro', async (req,res) => { 
  try {
    if (!req.body.nombre || !req.body.nombre.trim() || !req.body.categoriaid) {
      throw new Error('Nombre y categoría son datos obligatorios. El campo no puede estar vacío ni contener solo espacios en blanco.'); 
    }
    const categoriaid = req.body.categoriaid;
    let query = 'SELECT * FROM categoria WHERE id = ?';
    let respuesta = await qy (query,[categoriaid]);
    if (respuesta.length === 0) {
      throw new Error('No existe la categoría indicada');
    }
    const nombre = req.body.nombre.trim().toUpperCase();
    query = 'SELECT * FROM libro WHERE nombre = ?';
    respuesta = await qy (query, [nombre]);
    if (respuesta.length > 0) {
      throw new Error('Ese libro ya existe');
    }
    let personaid;
    if(req.body.personaid) {
      personaid = req.body.personaid;
      query = 'SELECT * FROM persona WHERE id = ?';
      respuesta = await qy (query,[personaid]);
      if (respuesta.length === 0) {
        throw new Error('No existe la persona indicada');
      }
    }
    let descripcion = '';
    if (req.body.descripcion) {
      descripcion = req.body.descripcion.toUpperCase();
    }
    query = 'INSERT INTO libro (nombre, descripcion, categoriaid, personaid) VALUES(?, ?, ?, ?)';
    respuesta = await qy(query, [nombre, descripcion, categoriaid, personaid]);
    res.status(200).send({"id": respuesta.insertId, "nombre": nombre, "descripcion": descripcion, "categoria_id": categoriaid, "persona_id": personaid});
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

//Modificar datos de un libro.

app.put('/libro/:id', async (req, res) => {
  try {
    if (req.body.nombre || req.body.categoriaid || req.body.personaid){
      throw new Error('Solo se puede modificar la descripción del libro');
    }
    
    let query = 'SELECT * FROM libro WHERE id = ?';
    let respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('Ese libro no existe');
    }

    query = 'UPDATE libro SET descripcion = ? WHERE id = ?';
    respuesta = qy(query, [req.body.descripcion, req.params.id]);
    query = 'SELECT * FROM libro WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    res.status(200).send(respuesta);
  }
  catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

//Prestar un libro.

app.put('/libro/prestar/:id', async (req, res) => {
  try {
    // comprobamos que exista el libro
    let query = 'SELECT * FROM libro WHERE id = ?';
    let respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('No se encontró el libro');
    }
    // comprobamos que el libro no esté prestado
    query = 'SELECT personaid FROM libro WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    if (respuesta[0].personaid != null) {
      throw new Error('El libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva');
    }
    // comprobamos que la persona a prestar exista
    query = 'SELECT * FROM persona WHERE id = ?';
    respuesta = await qy(query, [req.body.personaid]);
    if (respuesta.length === 0) {
      throw new Error('No se encontró la persona a la que se quiere prestar el libro');
    }

    // Prestamos el libro

    query = 'UPDATE libro SET personaid = ? WHERE id = ?';
    respuesta = qy(query, [req.body.personaid, req.params.id]);
    res.status(200).send('Se prestó correctamente');
  }
  catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

//Devolver un libro.

app.put('/libro/devolver/:id', async (req, res) => {
  try {
    // comprobamos que exista el libro
    let query = 'SELECT * FROM libro WHERE id = ?';
    let respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('Ese libro no existe');
    }
    // comprobamos que el libro esté prestado
    query = 'SELECT personaid FROM libro WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    if (respuesta[0].personaid === null) {
      throw new Error('Ese libro no estaba prestado!');
    }

    // Devolvemos el libro

    query = 'UPDATE libro SET personaid = null WHERE id = ?';
    respuesta = qy(query, [req.params.id]);
    res.status(200).send('Se realizó la devolución correctamente');
  }
  catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// Eliminar un libro

app.delete('/libro/:id', async (req, res) => { 
  try {
    let query = 'SELECT * FROM libro WHERE id = ?';
    let respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('No se encuentra ese libro');
    }
    query = 'SELECT * FROM libro WHERE id = ? AND personaid is not null';
    respuesta = await qy(query, [ req.params.id, req.params.personaid]);
    if (respuesta.length > 0) {
      throw new Error('Ese libro esta prestado no se puede borrar');
    }
    query = 'DELETE FROM libro WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    res.status(200).send({"Mensaje": "Se borró correctamente"});
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
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
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});


//muestra los datos de la persona con ese id

app.get('/persona/:id', async (req, res) => {
  try {
    const query = 'SELECT * FROM persona WHERE id = ?';
    const respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('No se encuentra esa persona');
    }
    console.log(respuesta);
    res.status(200).send(respuesta);
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

// agregamos una persona a la base de datos

app.post('/persona', async (req, res) => { 
  try {
    if (!req.body.nombre || !req.body.apellido || !req.body.email || !req.body.alias || 
      !req.body.nombre.trim || !req.body.apellido.trim || !req.body.email.trim || !req.body.alias.trim) {
      throw new Error('Faltan datos');
    }

    const nombre = req.body.nombre.trim().toUpperCase();
    const apellido = req.body.apellido.trim().toUpperCase();
    const email = req.body.email.trim().toUpperCase();
    const alias = req.body.alias.trim().toUpperCase();
    
// comprobamos que el mail no haya sido registrado previamente
    
    let query = 'SELECT * FROM persona WHERE email = ?';
    let respuesta = await qy(query, [email]);
    if (respuesta.length > 0) {
      throw new Error('El email ya se encuentra registrado');  
    }

// Guardar nueva persona

    query ='INSERT INTO persona (nombre, apellido, email, alias) VALUES (?, ?, ?, ?)';
    respuesta = await qy(query, [nombre, apellido, email, alias]);

    const persona = {id: respuesta.insertId, nombre, apellido, email, alias};
    
    res.status(200).send(persona);
  }
    catch (error) {
      console.error(error.message);
      res.status(413).send({ "Error": error.message });
    }
  });

// Modificar los datos de una persona en la base de datos

app.put('/persona/:id', async (req, res) => { 
  try {
    if (!req.body.nombre || !req.body.apellido || !req.body.email || !req.body.alias) 
    {
      throw new Error('Faltan datos');
    }
      
    const nombre = req.body.nombre.toUpperCase();
    const apellido = req.body.apellido.toUpperCase();
    const email = req.body.email.toUpperCase();
    const alias = req.body.alias.toUpperCase();


    let query = 'SELECT * FROM persona WHERE id = ?';
    let respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) 
    {
      throw new Error('No se encuentra esa persona');
    }

// Guardar datos modificados pero sin modificar el email
  
    query = 'UPDATE persona SET nombre = ?, apellido = ?, alias = ? WHERE id = ?';
    respuesta = await qy(query, [nombre, apellido, alias, req.params.id]);

    // Muestra la persona modificada pero con el email original

    query = 'SELECT * FROM persona WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    res.status(200).send(respuesta);}
      catch (error) 
      {console.error(error.message);
      res.status(413).send({ "mensaje": error.message});}
    });



  // eliminar persona
  
  // comprobamos que la persona no tenga libros asociados
    
app.delete('/persona/:id', async(req, res) => {
  try {
    let query = 'SELECT * FROM libro WHERE personaid = ?';
    let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length > 0) 
    {
      throw new Error('Esa persona tiene libros asociados, no se puede eliminar');
    }
     
    
  // comprobamos que la persona exista
    
    query = 'SELECT * FROM persona WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
      if (respuesta.length <= 0) 
    {
      throw new Error('No existe esa persona');
  }
    

  // eliminamos la persona 
    
    query = 'DELETE FROM persona WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    res.status(200).send({ "Mensaje": "Se borro correctamente" });
    } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }

});
app.listen(port, () => {
  console.log('Servidor escuchando peticiones en el puerto ' + port);
});


