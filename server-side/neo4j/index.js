/* Todos los paquetes */
const express = require('express'); /* Pedir Express.js a Node.js */
const util = require('util'); /* Utilidades para objetos de JavaScript */
const neode = require('neo4j-driver'); /* El driver de JavaScript */

/* Variables y constantes del programa */
var app = express(); /* Crear una aplicación de Express.js */
var port = 10000; /* Un puerto no privilegiado para alojar el servidor */
const router = express.Router(); /* El router de la aplicación */
var root_endpoint = '/api/v1'; /* El endpoint raíz de la app será este */

/* Define el puerto y el endpoint raíz de la app */
app.use(root_endpoint, router);
app.listen(port);

console.log('Servidor iniciado y escuchando en el puerto ' + port);

router.get('/', function (req, res) {
    res.json({
        message: root_endpoint + ' endpoint raíz en línea.'
    });
});

router.use(function (req, res, next) {
    console.log('Solicitud recibida, URL de petición: ' +
        util.inspect(req.originalUrl) + ' query: ' + util.inspect(req.query));
    next();
});

router.route('/numbers/:number').get((req, res) => {
    res.json({
        result: req.params.number + 1
    })
});

router.route('/letters/:letter').get((req, res) => {
    res.json({
        result: req.params.letter.toUpperCase()
    })
});
