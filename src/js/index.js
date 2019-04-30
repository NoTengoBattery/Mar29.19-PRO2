/* Este pequeño código centra el container en el punto de visión */
function centerContainer() {
    var $window = $(window),
        $parent = $('#main'),
        $element = $('#jumbo-container'),
        elementTop = $element.offset().top,
        elementHeight = $element.height(),
        viewportHeight = $window.height(),
        scrollIt = elementTop - ((viewportHeight - elementHeight) / 2);
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

