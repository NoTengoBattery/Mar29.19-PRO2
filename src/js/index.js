/*
 * Este documento de JavaScript es el script principal del programa. En él se
 * definen todos los handlers y se incluye todo el código que ha de ejecutarse
 * cuando el navegador comienze a ejecutar JavaScript.
 *
 * Además, este código controla la GUI.
 *
 * ---
 *
 * El dilema de jQuery: yo (notengobattery) he decidido utilizar jQuery y
 * normalize.css en vista de simplificar el desarrollo. No es mi intención
 * reinventar la rueda. El precio a pagar por la dulce sintaxis de jQuery
 * y Ajax es en rendimiento.
 *
 * De todas formas, jQuery solo se usa para el DOM y el DOM que usa esta
 * aplicación no es que sea el más complicado del universo. Creo que vale
 * la pena más el beneficio de la sintaxis endulzada que el costo en el
 * rendimiento de la GUI.
 */

/* Globales ------------------------------------------------------------------------------------------------------------------ */
/*global $ */
/*global neo4j */
/*global window */
/*global Image */
/*global document */
/*global console */
/* Delays y tiempos */
var fadeInDelayMs = 100;
var fadeOutDelayMs = fadeInDelayMs;
var longFadeFactor = 4;
/* Tokens e identidades */
var token = '';
var userUID = "1";
/* Arrays */
var randySongs = [
    "Fast Lane - Rationale",
    "4 Minutes - Celebration (double disc version)",
    "La Isla Bonita - Celebration (double disc version)",
    "Material Girl - Celebration (double disc version)",
    "Take Me To Church - Hozier",
    "Angel Of Small Death And The Codeine Scene - Hozier",
    "Sedated - Hozier",
    "Shape Of You - Ed Sheeran",
    "Barcelona - Ed Sheeran",
    "Amárrame - Mon Laferte",
    "bury a friend - Billie Eilish",
    "You're Somebody Else - flora cash",
    "Naked - DNCE",
    "Cake By The Ocean - DNCE",
    "WDWGILY - SYML",
    "Where's My Love - SYML",
    "Faded - Alan Walker",
    "Wildest Dreams - Taylor Swift",
    "I Knew You Were Trouble - Taylor Swift",
    "22 - Taylor Swift",
    "All That She Wants - Ace of Base",
    "Problem - Ariana Grande",
    "Jason's Song - Ariana Grande",
    "Fancy - Iggy Azalea",
    "Homemade Dynamite - Lorde",
    "Royals - Lorde",
    "Bravado - Lorde",
    "Somebody Else - 1975",
    "Change Of Heart - 1975",
    "Sex - 1975",
    "Gangsta's Paradise - Coolio",
    "Sin Miedo a Nada - Alex Ubago",
    "The Cave - Mumford and Sons"];
/* Índices de array */
var currentRandyIndex = Math.floor(Math.random() * randySongs.length);
/* Base de datos */
var dbDriver = neo4j.v1.driver("bolt://localhost", neo4j.v1.auth.basic("neo4j", "db1")); /* Conexión al driver */
var dbSession = dbDriver.session(); /* Sesión de peticiones */

/* Utilidades ---------------------------------------------------------------------------------------------------------------- */
function msToMinSecs(duration) {
    "use strict";
    var seconds = Math.round((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    if (hours > 0) {
        return hours + ":" + minutes + ":" + seconds;
    } else {
        return minutes + ":" + seconds;
    }
}

/* Conexión con Spotify ------------------------------------------------------------------------------------------------------ */
function getAnAlbum(id) {
    "use strict";
    $.ajax({
        type: "GET",
        url: "https://api.spotify.com/v1/albums/" + id,
        headers: {
            Authorization: 'Bearer ' + token
        },
        success: onSpotifyGetAnAlbumSuccess
    });
}

function getAnArtist(id) {
    "use strict";
    $.ajax({
        type: "GET",
        url: "https://api.spotify.com/v1/artists/" + id,
        headers: {
            Authorization: 'Bearer ' + token
        },
        success: onSpotifyGetAnArtistSuccess
    });
}


/* Run Once onDocumentReady -------------------------------------------------------------------------------------------------- */
function centerContainer() {
    "use strict";
    var $window = $(window),
        $parent = $('#main'),
        $element = $('#jumbo-container'),
        elementTop = $element.offset().top,
        elementHeight = $element.height(),
        viewportHeight = $window.height(),
        scrollIt = elementTop - ((viewportHeight - elementHeight) / 2);
    //$parent.scrollTop(scrollIt);
    $parent.animate({
        scrollTop: scrollIt
    }, fadeInDelayMs * longFadeFactor);
}

function querySpotify() {
    "use strict";
    var randySong = randySongs[currentRandyIndex];
    currentRandyIndex = (currentRandyIndex + 1) % randySongs.length;
    $.ajax({
        type: "GET",
        url: "https://api.spotify.com/v1/search",
        headers: {
            Authorization: 'Bearer ' + token
        },
        data: {
            q: randySong,
            type: 'track',
            limit: '1',
            offset: '0'
        },
        success: onSpotifyGetSuccess
    });
}

/* Handlers ------------------------------------------------------------------------------------------------------------------ */
/* onClick Handlers */
function onNextClicked() {
    "use strict";
    querySpotify();
}

/* Handler functions */
function onWindowResize() {
    "use strict";
    centerContainer();
}

function onAlbumArtLoaded(spotifyObject) {
    "use strict";
    var trackItem0 = spotifyObject.tracks.items[0],
        trackItem0Album = trackItem0.album,
        trackItem0AlbumImages0Url = trackItem0Album.images[0].url,
        trackItem0AlbumImages0Url_construct = "url(" + trackItem0AlbumImages0Url + ")",
        trackItem0AlbumName = trackItem0Album.name,
        trackItem0Artists = trackItem0.artists,
        trackItem0Artist0 = trackItem0.artists[0],
        trackItem0Artist0Name = trackItem0Artist0.name,
        trackItem0Duration = msToMinSecs(trackItem0.duration_ms),
        trackItem0Name = trackItem0.name,
        trackItem0TrackNumber = trackItem0.track_number,
        currentArtistIdx = 0;
    getAnAlbum(trackItem0Album.id);
    trackItem0Artists.forEach(function (element) {
        getAnArtist(element.id);
    });

    /* Qué asco que la serialización no funcione en JavaScript */
    function albumInsertedCallback() {
        relateTrackToAlbum(trackItem0Album.id, trackItem0.id);
    }

    function artistInsertedCallback(spotifyArtist) {
        relateTrackToArtist(spotifyArtist.id, trackItem0.id);
        currentArtistIdx += 1;
        if (currentArtistIdx === trackItem0Artists.length) {
            allArtistInsertedCallback();
        }
    }

    function allArtistInsertedCallback() {
        /* Simula los gustos del usuario */
        var randyChoosed = Math.floor(Math.random() * 4);

        switch (randyChoosed) {
            case 0:
                relateUserToTrack_inLibrary(userUID, trackItem0.id);
                break;
            case 1:
                relateUserToTrack_Rated(userUID, trackItem0.id, Math.random() * 10);
                break;
            case 2:
                relateUserToTrack_Disliked(userUID, trackItem0.id);
                break;
            case 3:
                relateUserToArtist_Disliked(userUID, trackItem0Artist0.id);
                break;
            default:
                break;
        }
    }

    $('#main').fadeOut(fadeOutDelayMs, function () {
        $('#track-name').text(trackItem0TrackNumber + ". " + trackItem0Name);
        $('#track-artist').text(trackItem0Artist0Name);
        $('#track-album').text(trackItem0AlbumName);
        $('#track-length').text(trackItem0Duration);
        $('#album-art').attr("src", trackItem0AlbumImages0Url);

        $('#main').css("background-image", trackItem0AlbumImages0Url_construct).fadeIn(fadeInDelayMs * longFadeFactor, function () {
            $('body').css("background-image", trackItem0AlbumImages0Url_construct);
        });
    });
    /* Limpiar el handler ya que si no se hace, siempre usa el primero
     * que se le enlaza, es decir: no cambia de acción */
    $("#p-open").unbind("click");
    $('#p-open').click(function () {
        window.open(trackItem0.external_urls.spotify, "_blank");
    });

    onAlbumArtLoaded.albumInsertedCallback = albumInsertedCallback;
    onAlbumArtLoaded.artistInsertedCallback = artistInsertedCallback;
}

function onSpotifyGetSuccess(spotifyObject) {
    "use strict";
    var albumArtPreloadObject = new Image(),
        trackItem0 = spotifyObject.tracks.items[0],
        trackItem0Album = trackItem0.album,
        trackItem0AlbumImages0Url = trackItem0Album.images[0].url;
    console.log(spotifyObject);

    /* Insertar en la database */
    insertTrack(trackItem0);

    /* Precargar imagen */
    /* Llamar a la animación cuando la imagen esté precargada. Esto
     * evita los glitches en conexiones lentas o con mucha latencia
     * (glitches donde la imagen se ve a medias o simplemente no
     * está). Debería funcionar en todos los navegadores modernos.
     */
    albumArtPreloadObject.onload = function () {
        onAlbumArtLoaded(spotifyObject);
    };
    albumArtPreloadObject.src = trackItem0AlbumImages0Url;
}

function onSpotifyGetAnAlbumSuccess(spotifyAlbum) {
    "use strict";
    insertAlbum(spotifyAlbum);
    onAlbumArtLoaded.albumInsertedCallback();
}

function onSpotifyGetAnArtistSuccess(spotifyArtist) {
    "use strict";
    insertArtist(spotifyArtist);
    onAlbumArtLoaded.artistInsertedCallback(spotifyArtist);
}

/* onDocumentReady ----------------------------------------------------------------------------------------------------------- */
function onDocumentReady() {
    /* Código runOnce */
    "use strict";
    centerContainer();
    querySpotify();
    onLoadResetDatabase();
    onLoadPrepareDatabase();

    /* Configuración de handlers */
    $("#p-next").click(onNextClicked);
    $(window).resize(onWindowResize);
}
$(document).ready(onDocumentReady);

/* ! TEST CODE AREA ! -------------------------------------------------------------------------------------------------------- */

function onLoadResetDatabase() {
    "use strict";
    var resetDataBase = dbSession.run('MATCH (n) DETACH DELETE n');
    resetDataBase.then(function (result) {
        console.log(result);
    });
}

function onLoadPrepareDatabase() {
    "use strict";
    var fakeUser = dbSession.run('CREATE (TestUser:User {userID: $id, userDisplayName: $name, userIsPremium: $premium}) RETURN TestUser', {
        id: userUID,
        name: "User to test",
        premium: true
    });
    fakeUser.then(function (result) {
        console.log(result);
    });
}

/**
 * Inserta un track en la database.
 *
 * @param {spotifyTrack} el objeto de Spotify que representa un track
 * @param {spotifyTrack.id} el id del track
 * @param {spotifyTrack.disc_number} el número de disco al que pertenece el track
 * @param {spotifyTrack.duration_ms} la duración del track en milisegundos
 * @param {spotifyTrack.explicit} determina si el track es explícito
 * @param {spotifyTrack.name} el nombre comercial (buscable) del track
 * @param {spotifyTrack.track_number} el número de track en el disco
 */
function insertTrack(spotifyTrack) {
    "use strict";
    var track = dbSession.run('MERGE (track:Track { trackID: $id, discNumber: $discNo, durationMs: $duration, isExplicit: $explicit, trackName: $name, trackNumberInDisk: $trackNo, popularity: $popularity}) RETURN track', {
        id: spotifyTrack.id,
        discNo: spotifyTrack.disc_number,
        duration: spotifyTrack.duration_ms,
        explicit: spotifyTrack.explicit,
        name: spotifyTrack.name,
        trackNo: spotifyTrack.track_number,
        popularity: spotifyTrack.popularity
    });
    track.then(function (result) {
        console.log(result);
    });
}

/**
 * Inserta un album en la database.
 *
 * @param {spotifyAlbum} el objeto de Spotify que representa un álbum
 * @param {spotifyAlbum.id} el id del álbum
 * @param {spotifyAlbum.album_type} el tipo de álbum
 * @param {spotifyAlbum.name} el nombre comercial del álbum
 * @param {spotifyAlbum.popularity} la popularidad del álbum
 * @param {spotifyAlbum.total_tracks} el número total de pistas en el álbum
 * @param {spotifyAlbum.type} el tipo de álbum
 */
function insertAlbum(spotifyAlbum) {
    "use strict";
    var track = dbSession.run('MERGE (album:Album { albumID: $id, albumType: $atype, albumName: $name, albumPopularity: $popularity, totalTracks: $tracks, type: $type}) RETURN album', {
        id: spotifyAlbum.id,
        atype: spotifyAlbum.album_type,
        name: spotifyAlbum.name,
        popularity: spotifyAlbum.popularity,
        tracks: spotifyAlbum.total_tracks,
        type: spotifyAlbum.type
    });
    track.then(function (result) {
        console.log(result);
    });
}

/**
 * Inserta un artista en la database.
 *
 * @param {spotifyArtist} el objeto de Spotify que representa un artista
 * @param {spotifyArtist.id} el id del artista
 * @param {spotifyArtist.name} el nombre comercial del artista
 * @param {spotifyArtist.popularity} la popularidad del álbum
 * @param {spotifyArtist.type} el tipo de álbum
 */
function insertArtist(spotifyArtist) {
    "use strict";
    var track = dbSession.run('MERGE (artist:Artist { artistID: $id, artistName: $name, artistPopularity: $popularity, type: $type}) RETURN artist', {
        id: spotifyArtist.id,
        name: spotifyArtist.name,
        popularity: spotifyArtist.popularity,
        type: spotifyArtist.type
    });
    track.then(function (result) {
        console.log(result);
    });
}

/**
 * Crea una conexión entre el track y su respectivo álbum.
 *
 * @param {albumID} el ID del álbum
 * @param {trackID} el ID del track
 */
function relateTrackToAlbum(albumID, trackID) {
    "use strict";
    var relation = dbSession.run('MATCH (a:Album),(t:Track) WHERE a.albumID = $aid AND t.trackID = $tid MERGE (t)-[r:PRESENT_IN]->(a) RETURN type(r)', {
        aid: albumID,
        tid: trackID
    });
    relation.then(function (result) {
        console.log(result);
    });
}

/**
 * Crea una conexión entre el track y su respectivo artista.
 *
 * @param {atristID} el ID del artista
 * @param {trackID} el ID del track
 */
function relateTrackToArtist(atristID, trackID) {
    "use strict";
    var relation = dbSession.run('MATCH (a:Artist),(t:Track) WHERE a.artistID = $aid AND t.trackID = $tid MERGE (t)-[r:INTERPRETED_BY]->(a) RETURN type(r)', {
        aid: atristID,
        tid: trackID
    });
    relation.then(function (result) {
        console.log(result);
    });
}


/**
 * Crea una conexión entre el track y el usuario: el usuario tiene la canción en la biblioteca.
 *
 * @param {userID} el ID del usuario
 * @param {trackID} el ID del track
 */
function relateUserToTrack_inLibrary(userID, trackID) {
    "use strict";
    var relation = dbSession.run('MATCH (u:User),(t:Track) WHERE u.userID = $uid AND t.trackID = $tid MERGE (t)-[r:IN_LIBRARY]->(u) RETURN type(r)', {
        uid: userID,
        tid: trackID
    });
    relation.then(function (result) {
        console.log(result);
    });
}

/**
 * Crea una conexión entre el track y el usuario: ha calificado explícitamente esta canción.
 *
 * @param {userID} el ID del usuario
 * @param {trackID} el ID del track
 * @param {rating} el rating otorgado por parte del usuario
 */
function relateUserToTrack_Rated(userID, trackID, rating) {
    "use strict";
    var relation = dbSession.run('MATCH (u:User),(t:Track) WHERE u.userID = $uid AND t.trackID = $tid MERGE (u)-[r:RATED_TRACK { rating: $rate }]->(t) RETURN type(r)', {
        uid: userID,
        tid: trackID,
        rate: rating
    });
    relation.then(function (result) {
        console.log(result);
    });
}

/**
 * Crea una conexión entre el track y el usuario: el usuario no gusta esta canción.
 *
 * @param {userID} el ID del usuario
 * @param {trackID} el ID del track
 */
function relateUserToTrack_Disliked(userID, trackID) {
    "use strict";
    var relation = dbSession.run('MATCH (u:User),(t:Track) WHERE u.userID = $uid AND t.trackID = $tid MERGE (u)-[r:DISLIKED_TRACK]->(t) RETURN type(r)', {
        uid: userID,
        tid: trackID
    });
    relation.then(function (result) {
        console.log(result);
    });
}

/**
 * Crea una conexión entre el artista y el usuario: el usuario no gusta este artista.
 *
 * @param {userID} el ID del usuario
 * @param {artistID} el ID del artista
 */
function relateUserToArtist_Disliked(userID, artistID) {
    "use strict";
    var relation = dbSession.run('MATCH (u:User),(a:Artist) WHERE u.userID = $uid AND a.artistID = $aid MERGE (u)-[r:DISLIKED_ARTIST]->(a) RETURN type(r)', {
        uid: userID,
        aid: artistID
    });
    relation.then(function (result) {
        console.log(result);
    });
}
