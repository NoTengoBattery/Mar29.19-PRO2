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
var fadeInDelayMs = 150;
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
    "Homemade Dynamite");
var currIdx = 0;

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
            console.log(trackItem0);

            $('#track-name').fadeOut(fadeOutDelayMs, function () {
                var trackItem0Name = trackItem0.name;
                $('#track-name').text(trackItem0Name).fadeIn(fadeInDelayMs);
            });
            $('#track-artist').fadeOut(fadeOutDelayMs, function () {
                var trackItem0Artist0Name = trackItem0.artists[0].name;
                $('#track-artist').text(trackItem0Artist0Name).fadeIn(fadeInDelayMs);
            });
            $('#track-album').fadeOut(fadeOutDelayMs, function () {
                var trackItem0AlbumName = trackItem0Album.name;
                $('#track-album').text(trackItem0AlbumName).fadeIn(fadeInDelayMs);
            });
            $('#track-length').fadeOut(fadeOutDelayMs, function () {
                var trackItem0Duration = msToTime(trackItem0.duration_ms);
                $('#track-length').text(trackItem0Duration).fadeIn(fadeInDelayMs);
            });
            $('#album-art').fadeOut(fadeOutDelayMs, function () {
                $('#album-art').attr("src", trackItem0AlbumImages0Url).fadeIn(fadeInDelayMs);
            });
            $('#main').fadeOut(fadeOutDelayMs, function () {
                $('#main').css("background-image", trackItem0AlbumImages0Url_construct).fadeIn(fadeInDelayMs);
            });

            $('body').css("background-image", trackItem0AlbumImages0Url_construct);
            /* Limpiar el handler ya que si no se hace, siempre usa el primero
             * que se le pone, es decir: no cambia de acción */
            $("#p-open").unbind("click");
            $('#p-open').click(function () {
                window.open(trackItem0.external_urls.spotify, "_blank")
            });
        }
    });
}
updateTrack();

/* Click handlers */
$("#p-next").click(function () {
    updateTrack();
});
