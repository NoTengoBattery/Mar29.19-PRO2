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
/* Delays y tiempos */
var fadeInDelayMs = 125;
var fadeOutDelayMs = fadeInDelayMs;
/* Tokens e identidades */
var token = 'BQCVltywVFlSjngd1hPDRKE0FxAW8hxp14CpCKlgiPAVDpp_DYsoiwEMM7qPIK59bkx2NBMbpi1Fv8tR52M_cZfkv9iLxMxTyBR7RA8lCWGscgLYL3ViRdO5Q0pcUEG5U2zUV80sdrQ10BbiJTiNHGnA_BLxJPc5KVRqd5w_Fp4JyWUtSIwtBcsdzkBoGGhH6vNA2NMQ91nLikBAv8zCLc1hVSCpy8EAS485H9uHzegvb9laJdxG7lxF8mrfKoSzIjOeIYpHaNTodEbl1NhostaD'
/* Arrays */
var randySongs = Array(
    "Fast Lane - Rationale",
    "4 Minutes - Madonna",
    "Take Me To Church - Hozier",
    "Shape Of You - Ed Sheeran",
    "Amárrame - Mon Laferte",
    "bury a friend - Billie Eilish",
    "You're Somebody Else - flora cash",
    "Naked - DNCE",
    "WDWGILY - SYML",
    "Faded - Alan Walker",
    "Wildest Dreams - Taylor Swift",
    "All That She Wants - Ace of Base",
    "Problem - Ariana Grande",
    "Homemade Dynamite - Lorde",
    "Somebody Else - 1975",
    "Gangsta's Paradise - Coolio",
    "Sin Miedo a Nada - Alex Ubago",
    "The Cave - Mumford and Sons");
/* Índices de array */
var currentRandyIndex = Math.floor(Math.random() * randySongs.length);
/* Otros */
const dbDriver = neo4j.v1.driver("bolt://localhost", neo4j.v1.auth.basic("neo4j", "db1"));
const dbSession = driver.session();

/* Utilidades ---------------------------------------------------------------------------------------------------------------- */
function msToMinSecs(duration) {
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
function querySpotify() {
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
querySpotify();

/* onDocumentReady ----------------------------------------------------------------------------------------------------------- */
function onDocumentReady() {
    /* Código runOnce */
    centerContainer();

    /* Configuración de handlers */
    $("#p-next").click(onNextClicked);
    $(window).resize(onWindowResize);
}
$(document).ready(onDocumentReady);

/* Handlers ------------------------------------------------------------------------------------------------------------------ */
/* onClick Handlers */
function onNextClicked() {
    querySpotify();
}

/* Handler functions */
function onWindowResize() {
    centerContainer();
}

function onSpotifyGetSuccess(spotifyObject) {
    var trackItem0 = spotifyObject.tracks.items[0];
    var trackItem0Album = trackItem0.album;
    var trackItem0AlbumImages0Url = trackItem0Album.images[0].url;
    var trackItem0AlbumImages0Url_construct = "url(" + trackItem0AlbumImages0Url + ")";
    var trackItem0AlbumName = trackItem0Album.name;
    var trackItem0Artist0Name = trackItem0.artists[0].name;
    var trackItem0Duration = msToMinSecs(trackItem0.duration_ms);
    var trackItem0Name = trackItem0.name;
    console.log(trackItem0);

    /* Precargar imagen */
    var preImg = new Image();
    /* Llamar a la animación cuando la imagen esté precargada. Esto
     * evita los glitches en conexiones lentas o con mucha latencia
     * (glitches donde la imagen se ve a medias o simplemente no
     * está). Debería funcionar en todos los navegadores modernos.
     */
    preImg.onload = function () {
        $('#main').fadeOut(fadeOutDelayMs, function () {
            $('#track-name').text(trackItem0Name);
            $('#track-artist').text(trackItem0Artist0Name);
            $('#track-album').text(trackItem0AlbumName);
            $('#track-length').text(trackItem0Duration);
            $('#album-art').attr("src", trackItem0AlbumImages0Url);

            $('#main').css("background-image", trackItem0AlbumImages0Url_construct).fadeIn(fadeInDelayMs * 4, function () {
                $('body').css("background-image", trackItem0AlbumImages0Url_construct);
            });
        });
        /* Limpiar el handler ya que si no se hace, siempre usa el primero
         * que se le enlaza, es decir: no cambia de acción */
        $("#p-open").unbind("click");
        $('#p-open').click(function () {
            window.open(trackItem0.external_urls.spotify, "_blank")
        });
    };
    preImg.src = trackItem0AlbumImages0Url;
}


/* Run Once onLoad ----------------------------------------------------------------------------------------------------------- */
function centerContainer() {
    var $window = $(window);
    var $parent = $('#main');
    var $element = $('#jumbo-container');
    var elementTop = $element.offset().top;
    var elementHeight = $element.height();
    var viewportHeight = $window.height();
    var scrollIt = elementTop - ((viewportHeight - elementHeight) / 2);
    $parent.scrollTop(scrollIt);
}

/* ! TEST CODE AREA ! -------------------------------------------------------------------------------------------------------- */
