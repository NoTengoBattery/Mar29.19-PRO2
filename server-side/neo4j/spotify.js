/* Funciones que interactúan con /api/v2 y Spotify */
const request = require('request'); /* Sirve para realizar solicitudes http/https */
const util = require('util'); /* Utilidades para objetos de JavaScript */
const myname = 'Spotify.JS';

module.exports = {
    SpotifyGetRequest: function (callback, Query, Endpoint, Token) {
        // Los headers (de hecho solo requiere el token)
        var headers = {
            'Authorization': 'Bearer ' + Token
        }
        // Configure the request
        var options = {
            url: 'https://api.spotify.com/v1' + Endpoint,
            method: 'GET',
            headers: headers,
            qs: Query
        }
        // Start the request
        request(options, function (error, response, body) {
            var status = response && response.statusCode;
            CheckStatusAndAct(callback, status, JSON.parse(body), Token);
        })
    }
};

function CheckStatusAndAct(callback, Status, Body, Token) {
    if (Status != 200) {
        console.error(myname + ': ERROR: Regresando debido a respuesta de error de Spotify: ' +
            util.inspect({
                status: Status,
                body: Body
            }) + '; para el token \'' + Token + '\'');
        callback.negative(callback, Status, Body);
        callback.after(callback, false);
    } else {
        callback.positive(callback, Body);
        callback.after(callback, true);
    }
}
