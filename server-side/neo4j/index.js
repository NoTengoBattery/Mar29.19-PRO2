/* Todos los paquetes */
const express = require('express'); /* Pedir Express.js a Node.js */
const util = require('util'); /* Utilidades para objetos de JavaScript */
const bodyParser = require('body-parser'); /* Esta sirve para obtener los datos de una solicitud POST */
const dbi = require('./db'); /* Módulo para interactuar con la DB */
const spotify = require('./spotify'); /* Módulo para interactuar con v2 y Spotify */

/* Variables y constantes del programa */
var app = express(); /* Crear una aplicación de Express.js */
var port = 10000; /* Un puerto no privilegiado para alojar el servidor */
const router = express.Router(); /* El router de la aplicación */
var root_endpoint = '/api/v1'; /* El endpoint raíz de la app será este */
const myname = 'Index.JS';

/* ------------------------------------------------------------------------- */

/* Define el puerto y el endpoint raíz de la app */
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(root_endpoint, router);
app.listen(port);
console.log('Servidor iniciado y escuchando en el puerto ' + port);

/* El middleware raíz que se ejecuta antes del router */
router.use(function (req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('Router: Use: ' +
        '(URL: ' + util.inspect(req.originalUrl) + '), ' +
        '(query: ' + util.inspect(req.query) + '), ' +
        '(source: ' + ip + '), ' +
        '(x-www-form-urlencoded: ' + util.inspect(req.body) + ')');
    next();
});

/* Middleware para los endpoint que tienen a get como raíz */
router.get('/get/:token/', function (req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var token = req.params.token;
    console.log('GET: recibido en el endpoint //get ' +
        '(query: ' + util.inspect(req.query) + '), ' +
        '(token: ' + token + '), ' +
        '(source: ' + ip + ')');
    console.log('GET: Token: el token de autorización es `' + token + '`.');
    next();
});

/* Middleware para los endpoint que tienen a post como raíz */
router.post('/post/:token/', function (req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var token = req.params.token;
    console.log('POST: recibido en el endpoint //post ' +
        '(query: ' + util.inspect(req.query) + '), ' +
        '(token: ' + token + '), ' +
        '(source: ' + ip + '), ' +
        '(x-www-form-urlencoded: ' + util.inspect(req.body) + ')');
    console.log('POST: Token: el token de autorización es `' + token + '`.');
    next();
});

/* ------------------------------------------------------------------------- */
/* Las verdaderas solicitudes... ¿Cómo funciona esto?
 * Para empezar, la APIv2, de alguna forma oscura y mágica para nosotros,
 * debe ser capaz de darnos un token (como parámetro de la solicitud) de
 * Spotify para poder hacer query a la API de Spotify, dejando a un lado
 * el lado del cliente y manejando la base de datos de fora exclusiva
 * en este Node. De esta forma, la base de datos se abstrae totalmente para
 * cliente. */

function AddMe(req, res, next) {
    function ReturnError(status, body) {
        res.status(status).send(body);
    };
    AddMe.ReturnError = ReturnError;
    var token = req.params.token;
    spotify.SpotifyGetRequest(null, '/me', token, CurrentUserGetCallback, ReturnError);
}

function CurrentUserMergeCallback() {
    function Positive(TheUser) {
        console.log(myname + ': OK: Database: TheUser ' + TheUser + ' agregado');
    };

    function Negative(TheUser) {
        console.log(myname + ': NK: Database: TheUser ' + TheUser + ' no presente en la base de datos');
        AddMe.ReturnError(500, {
            message: 'El usuario no se pudo agregar a la base de datos.'
        })
    };

    function After(TheUser) {
        console.log(myname + ': OK: Database: TheUser ' + TheUser + ' agregado');
    };
    CurrentUserMergeCallback.Positive = Positive;
    CurrentUserMergeCallback.Negative = Negative;
    CurrentUserMergeCallback.After = After;
}

function CurrentUserGetCallback(SpotifyUser) {
    CurrentUserMergeCallback();
    console.log(myname + ': OK: Usuario ' + SpotifyUser.id + ' encontrado');
    console.log(CurrentUserMergeCallback.Positive);
    dbi.MergeSomeUser(SpotifyUser,
        CurrentUserMergeCallback.Positive,
        CurrentUserMergeCallback.Negative,
        CurrentUserMergeCallback.After);
}

router.post('/post/:token/addme', AddMe);

/* ------------------------------------------------------------------------- */
