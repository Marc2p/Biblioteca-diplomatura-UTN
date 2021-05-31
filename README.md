# Biblioteca-diplomatura-UTN

Trabajo práctico grupal de la diplomatura en desarrollo Full Stack brindada por la UTN

## Grupo 9, integrantes:

- Amaya, Gastón
- Barajas, Valentín
- De Giovannini, Augusto
- Melani Ghirardi, Maximiliano
- Peirone, Marcos
- Rossi, Bruno

## Consigna y objetivos:

Se trata de un proyecto de desarrollo backend en NodeJS, utilizando API Rest y base de datos MySQL para conocer si los libros del usuario se encuentran en su biblioteca o prestados. En caso de estar prestado, a quien se los prestó.

### Se requiere conocer:

- De la persona a prestar los libros:
  - Nombre
  - Apellido
  - Email (debe ser único)
  - Alias
  - Todos los datos son requeridos.
- De los géneros de los libros:
  - Nombre: Las categorías no se pueden repetir y el campo no puede estar vacío.
- De los libros:
  - Nombre
  - Descripción
  - Categoría/género
  - Persona a la cual se le ha prestado (si está prestado)

## Instalación y ejecución

Se requiere tener instalado Node/Npm.
Tras clonar el repo ingresar al directorio raíz y ejecutar 'npm install' y luego 'node app.js' para lanzar el servidor.
