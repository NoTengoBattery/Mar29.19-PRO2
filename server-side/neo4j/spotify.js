/* Funciones que interactúan con /api/v2 y Spotify */
const request = require('request'); /* Sirve para realizar solicitudes http/https */
const util = require('util'); /* Utilidades para objetos de JavaScript */
const myname = 'Spotify.JS';

module.exports = {
    SpotifyGetRequest: function (query, endpoint, token, positive, negative) {
        // Los headers (de hecho solo requiere el token)
        var headers = {
            'Authorization': 'Bearer ' + token
        }
        // Configure the request
        var options = {
            url: 'https://api.spotify.com/v1' + endpoint,
            method: 'GET',
            headers: headers,
            qs: query
        }
        // Start the request
        request(options, function (error, response, body) {
            var status = response && response.statusCode;
            if (status != 200) {
                console.log('SpotifyGetRequest: error ' + status + ': ' + body + ' for token ' + token)
            }
            CheckStatusAndAct(status, JSON.parse(body), positive, negative);
        })
    }
};

function CheckStatusAndAct(status, body, positive, negative) {
    if (status != 200) {
        console.error(myname + ': ERROR: Regresando debido a respuesta de error de Spotify: ' +
            util.inspect({
                status: status,
                body: body
            }));
        negative(status, body);
    } else {
        positive(body);
    }
}
