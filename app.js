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

//Muestra un libro específico

app.get('/libro/:id', async (req, res) => { 
  try {
    const query = 'SELECT * FROM libro WHERE id = ?';
    const respuesta = await qy(query, [req.params.id]);
    if (respuesta.length === 0) {
      throw new Error('Libro no encontrado');
    }
    res.send(respuesta);
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
    res.send(respuesta);
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
      throw new Error('No enviaste los datos obligatorios: nombre y categoria');
    }
    let query = 'SELECT * FROM categoria WHERE id = ?';
    let respuesta = await qy (query,[req.body.categoriaid]);
    if (respuesta.length === 0) {
      throw new Error('Esa categoria no existe');
    }
    if(req.body.personaid) {
      query = 'SELECT * FROM persona WHERE id = ?';
      respuesta = await qy (query,[req.body.personaid]);
      if (respuesta.length === 0) {
        throw new Error('Esa persona no existe');
      }
    }
    query = 'SELECT * FROM libro WHERE nombre = ?';
    respuesta = await qy (query, [req.body.nombre]);
    if (respuesta.length > 0) {
      throw new Error('Ese libro ya existe');
    }
    let descripcion = '';
    if (req.body.descripcion) {
      descripcion = req.body.descripcion;
    }
    query = 'INSERT INTO libro (nombre, descripcion, categoriaid, personaid) VALUES(?, ?, ?, ?)';
    respuesta = await qy(query, [req.body.nombre, descripcion, req.body.categoriaid, req.body.personaid]);
    res.send({"id": respuesta.insertId, "nombre": req.body.nombre, "descripcion": descripcion, "categoria_id": req.body.categoriaid, "persona_id": req.body.personaid});
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }
});

//Modificar datos de un libro

app.put('/libro/:id', async (req, res) => {
  try {
    if (!req.body.nombre || !req.body.categoriaid){
      throw new Error('Error inesperado');
    }
    const nombre =  req.body.nombre.toUpperCase();
    
    let query = 'SELECT * FROM libro WHERE nombre = ? AND id <> ?';
    let respuesta = await qy(query, [req.body.nombre, req.params.id]);
    if (respuesta.length > 0) {
      throw new Error('El nombre del libro ya existe');
    }

    query = 'UPDATE libro SET nombre = ? WHERE id = ?';
    respuesta = qy(query, [req.body.nombre, req.params.id]);
    res.send({"respuesta": respuesta})
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
      throw new Error('Ese libro no existe');
    }
    query = 'SELECT * FROM libro WHERE personaid = ?';
    respuesta = await qy(query, [req.params.personaid]);
    if (respuesta.length > 0) {
      throw new Error('Este libro esta prestado, no se puede borrar.');
    }
    query = 'DELETE FROM libro WHERE id = ?';
    respuesta = await qy(query, [req.params.id]);
    res.send({"Mensaje": "El libro ha sido eliminado."});
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
    if (!req.body.nombre || !req.body.apellido || !req.body.email || !req.body.alias) 
    
    
    {throw new Error('Faltan datos');}
    
    const nombre = req.body.nombre.toUpperCase();
    const apellido = req.body.apellido.toUpperCase();
    const email = req.body.email.toUpperCase();
    const alias = req.body.alias.toUpperCase();
    
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
    let respuesta = await qy(query, [email]);
    if (respuesta.length > 0) 
    {
      throw new Error('No se encuentra esa persona');
    }

// Guardar datos modificados pero sin modificar el email
  
    query = 'UPDATE persona SET nombre = ?, apellido = ?, alias = ? WHERE id = ?';
    respuesta = await qy(query, [nombre, apellido, alias, req.params.id]);
    const person = {id: parseInt(req.params.id), nombre, apellido, 
    email: respuesta.email, alias};
    res.status(200).send(person);}
      catch (error) 
      {console.error(error.message);
      res.status(413).send({ mensaje: 'Error inesperado' });}
    });



  // eliminar persona
  
  // comprobamos que la persona no tenga libros asociados
    
app.delete('/persona/:id', async(req, res) => {
  try {
    let query = 'SELECT * FROM libro WHERE personaid = ?';
    let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length > 0) 
    {
      throw new Error('esa persona tiene libros asociados, no se puede eliminar');
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
    res.send({ "Mensaje": "se borro correctamente" });
    } catch (error) {
    console.error(error.message);
    res.status(413).send({ "Error": error.message });
  }

});
app.listen(port, () => {
  console.log('Servidor escuchando peticiones en el puerto ' + port);
});


