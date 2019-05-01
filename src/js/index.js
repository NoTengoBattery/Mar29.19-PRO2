/* Este pequeño código centra el container en el punto de visión */
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

/* Se ejecuta cuando el documento está listo */
function onDocumentReady() {
    centerContainer();
}
$(document).ready(onDocumentReady);

/* Se ejecuta cuando la ventana cambia de dimensiones */
function onWindowResize() {
    centerContainer();
}
$(window).resize(onWindowResize);

/* Utilidades */
function msToTime(duration) {
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

/* Globales */
var fadeInDelayMs = 125;
var fadeOutDelayMs = fadeInDelayMs;
var token = ''

/* Conexión con Spotify */
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
    "Sin Miedo a Nada - Alex Ubago");
var currIdx = Math.floor(Math.random() * randySongs.length);

function updateTrack() {
    var randySong = randySongs[currIdx];
    currIdx = (currIdx + 1) % randySongs.length;
    $.ajax({
        url: "https://api.spotify.com/v1/search",
        data: {
            q: randySong,
            type: 'track',
            limit: '1',
            offset: '0'
        },
        type: "GET",
        headers: {
            Authorization: 'Bearer ' + token
        },
        success: function (object) {
            var trackItem0 = object.tracks.items[0];
            var trackItem0Album = trackItem0.album;
            var trackItem0AlbumImages0Url = trackItem0Album.images[0].url;
            var trackItem0AlbumImages0Url_construct = "url(" + trackItem0AlbumImages0Url + ")";
            var trackItem0AlbumName = trackItem0Album.name;
            var trackItem0Artist0Name = trackItem0.artists[0].name;
            var trackItem0Duration = msToTime(trackItem0.duration_ms);
            var trackItem0Name = trackItem0.name;
            console.log(trackItem0);

            /* Precargar imagen */
            var preImg = new Image();
            preImg.src = trackItem0AlbumImages0Url;
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
            }
        }
    });
}
updateTrack();

/* Click handlers */
$("#p-next").click(function () {
    updateTrack();
});
