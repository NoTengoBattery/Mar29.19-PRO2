/* Todos los paquetes */
const express = require('express'); /* Pedir Express.js a Node.js */
const util = require('util'); /* Utilidades para objetos de JavaScript */
const bodyParser = require('body-parser'); /* Esta sirve para obtener los datos de una solicitud POST */
const dbi = require('./db'); /* Módulo para interactuar con la DB */
const spotify = require('./spotify'); /* Módulo para interactuar con v2 y Spotify */
const clases = require('./clases'); /* Módulo para interactuar con v2 y Spotify */

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

function VOID() {}

function AddMe(req, res, next) {
    var token = req.params.token;

    function ReturnError(ParentCallback, Status, Body) {
        try {
            ParentCallback.current.res.status(Status).send(Body);
        } catch (err) {
            return;
        }
    };
    AddMeCallback = new clases.Callback(CurrentUserGetCallback, ReturnError, VOID, {
        req: req,
        res: res,
        token: token
    });
    spotify.SpotifyGetRequest(AddMeCallback, null, '/me', token);
}

function CurrentUserGetCallback(ParentCallback, SpotifyUser) {
    console.log(myname + ': OK: Usuario ' + SpotifyUser.id + ' encontrado');
    dbi.MergeSomeUser(CurrentUserMergeCallback(ParentCallback), SpotifyUser);
}

function CurrentUserMergeCallback(Parent) {
    function positive(ParentCallback, SpotifyUser) {
        var TheUser = SpotifyUser.id;
        ParentCallback.current.user = SpotifyUser;
        console.log(myname + ': OK: Database: TheUser ' + TheUser + ' agregado y listo para agregar la biblioteca');
        spotify.SpotifyGetRequest(CurrentUserLibraryGetCallback(ParentCallback), {
            limit: 50
        }, '/me/tracks', ParentCallback.current.token);
    };

    function negative(ParentCallback, SpotifyUser) {
        var TheUser = SpotifyUser.id;
        console.log(myname + ': NK: Database: TheUser ' + TheUser + ' no está presente en la base de datos');
        try {
            ParentCallback.current.res.status(500).send({
                message: 'El usuario no se pudo agregar a la base de datos.',
                user: TheUser
            });
        } catch (err) {
            return;
        }

    };

    return new clases.Callback(positive, negative, VOID, Parent.current);
}

function CurrentUserLibraryGetCallback(Parent) {
    function positive(ParentCallback, Body) {
        console.log(myname + ': OK: CurrentUserLibraryGetCallback: Respuesta recibida de Spotify.');
        Body.items.forEach(function (Track) {
            var TheTrackObject = Track.track;
            var TheTrack = TheTrackObject.id;
            var TheAlbum = TheTrackObject.album.id;
            dbi.MergeSomeTrack(TrackMergeCallback(ParentCallback), TheTrackObject);
        });
    };

    function negative(ParentCallback, Status, Body) {
        console.log(myname + ': NK: CurrentUserLibraryGetCallback: Spotify ha rechazado la petición.');
        try {
            ParentCallback.current.res.status(Status).send(Body);
        } catch (err) {
            return;
        }
    };

    return new clases.Callback(positive, negative, VOID, Parent.current);
}

function TrackMergeCallback(Parent) {
    function positive(ParentCallback, SpotifyTrack) {
        var TheTrack = SpotifyTrack.id;
        var TheAlbum = SpotifyTrack.album.id;
        console.log(myname + ': OK: Database: TheTrack ' + TheTrack + ' agregado');

        spotify.SpotifyGetRequest(TrackAudioFeaturesGetCallback(ParentCallback),
            null,
            '/audio-features/' + TheTrack,
            ParentCallback.current.token);

        var albumGetCallback = AlbumGetCallback(ParentCallback);
        albumGetCallback.track = SpotifyTrack;
        spotify.SpotifyGetRequest(albumGetCallback,
            null,
            '/albums/' + TheAlbum,
            ParentCallback.current.token);
    };

    function negative(ParentCallback, SpotifyTrack) {
        var TheTrack = SpotifyTrack.id;
        console.log(myname + ': NK: Database: TheTrack ' + TheTrack + ' no está presente en la base de datos');
        try {
            ParentCallback.current.res.status(500).send({
                message: 'La pista no se pudo agregar a la base de datos.',
                track: TheTrack
            });
        } catch (err) {
            return;
        }
    };

    return new clases.Callback(positive, negative, VOID, Parent.current);
}

function AlbumGetCallback(Parent) {
    function positive(ParentCallback, Body) {
        console.log(myname + ': OK: AlbumGetCallback: Respuesta recibida de Spotify.');
        var albumMergeCallback = AlbumMergeCallback(ParentCallback);
        albumMergeCallback.track = this.track;
        dbi.MergeSomeAlbum(albumMergeCallback, Body);
    };

    function negative(ParentCallback, Status, Body) {
        console.log(myname + ': NK: AlbumGetCallback: Spotify ha rechazado la petición.');
        try {
            ParentCallback.current.res.status(Status).send(Body);
        } catch (err) {
            return;
        }
    };

    return new clases.Callback(positive, negative, VOID, Parent.current);
}

function AlbumMergeCallback(Parent) {
    function positive(ParentCallback, SpotifyAlbum) {
        var TheAlbum = SpotifyAlbum.id;
        console.log(myname + ': OK: Database: TheAlbum ' + TheAlbum + ' agregado');
    };

    function negative(ParentCallback, SpotifyAlbum) {
        var TheAlbum = SpotifyAlbum.id;
        console.log(myname + ': NK: Database: TheAlbum ' + TheAlbum + ' no está presente en la base de datos');
        try {
            ParentCallback.current.res.status(500).send({
                message: 'El álbum no se pudo actualizar en la base de datos.',
                album: TheAlbum
            });
        } catch (err) {
            return;
        }

    };

    return new clases.Callback(positive, negative, VOID, Parent.current);
}

function TrackAudioFeaturesGetCallback(Parent) {
    function positive(ParentCallback, Body) {
        console.log(myname + ': OK: TrackAudioFeaturesCallback: Respuesta recibida de Spotify.');
        dbi.UpdateAudioFeatures(TrackAudioFeaturesSetCallback(ParentCallback), Body);
    };

    function negative(ParentCallback, Status, Body) {
        console.log(myname + ': NK: TrackAudioFeaturesCallback: Spotify ha rechazado la petición.');
        try {
            ParentCallback.current.res.status(Status).send(Body);
        } catch (err) {
            return;
        }
    };

    return new clases.Callback(positive, negative, VOID, Parent.current);
}

function TrackAudioFeaturesSetCallback(Parent) {
    function positive(ParentCallback, TheTrack) {
        console.log(myname + ': OK: Database: TheTrack ' + TheTrack + ' actualizado');
        dbi.RelateUserToTrackInLibrary(RelateUserToTrackInLibraryCallback(ParentCallback),
            ParentCallback.current.user.id,
            TheTrack.id);
    };

    function negative(ParentCallback, TheTrack) {
        console.log(myname + ': NK: Database: TheTrack ' + TheTrack + ' no está presente en la base de datos');
        try {
            ParentCallback.current.res.status(500).send({
                message: 'La pista no se pudo actualizar en la base de datos.',
                track: TheTrack
            });
        } catch (err) {
            return;
        }
    };

    return new clases.Callback(positive, negative, VOID, Parent.current);
}

function RelateUserToTrackInLibraryCallback(Parent) {
    function positive(ParentCallback, TheUser, TheTrack) {
        ParentCallback.current.track = TheTrack;
        console.log(myname + ': OK: Database: TheTrack ' + TheTrack + ' asociado con TheUser ' + TheUser + ': InLibrary');

    };

    function negative(ParentCallback, TheUser, TheTrack) {
        console.log(myname + ': NK: Database: No se puede asociar TheTrack ' + TheTrack + ' con TheUser ' + TheUser);
        try {
            ParentCallback.current.res.status(500).send({
                message: 'La relación no pudo establecerse.',
                track: TheTrack,
                user: TheUser
            });
        } catch (err) {
            return;
        }
    };

    return new clases.Callback(positive, negative, VOID, Parent.current);
}

router.post('/post/:token/addme', AddMe);

/* ------------------------------------------------------------------------- */
