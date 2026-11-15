var resultadosActuales = [];

/*
  Creación de una función personalizada para jQuery que detecta cuando se detiene el scroll en la página
*/
$.fn.scrollEnd = function(callback, timeout) {
  $(this).scroll(function(){
    var $this = $(this);
    if ($this.data('scrollTimeout')) {
      clearTimeout($this.data('scrollTimeout'));
    }
    $this.data('scrollTimeout', setTimeout(callback, timeout));
  });
};

/*
  Función que inicializa el elemento Slider
*/
function inicializarSlider(){
  $("#rangoPrecio").ionRangeSlider({
    type: "double",
    grid: false,
    min: 0,
    max: 100000,
    from: 200,
    to: 80000,
    prefix: "$"
  });
}

/*
  Función que reproduce el video de fondo al hacer scroll, y detiene la reproducción al detener el scroll
*/
function playVideoOnScroll(){
  var ultimoScroll = 0;
  var video = document.getElementById('vidFondo');
  $(window)
    .scroll(function(){
      var scrollActual = $(window).scrollTop();
      if (scrollActual > ultimoScroll){
        video.play();
      } else {
        video.play();
      }
      ultimoScroll = scrollActual;
    })
    .scrollEnd(function(){
      video.pause();
    }, 10);
}

/*
  Crea e inicializa la ventana modal para el botón "Ver más"
*/
function inicializarModalDetalle() {
  if ($('#modalDetalle').length === 0) {
    var modalHtml =
      '<div id="modalDetalle" class="modal">' +
        '<div class="modal-content" id="modalDetalleContenido"></div>' +
        '<div class="modal-footer">' +
          '<a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat">Cerrar</a>' +
        '</div>' +
      '</div>';
    $('body').append(modalHtml);
  }
  if (typeof $('.modal').modal === 'function') {
    $('.modal').modal();
  }
}

/*
  Función para cargar dinámicamente las ciudades y tipos sin repetir (Requerimiento 2)
*/
function cargarFiltros() {
  $.ajax({
    url: 'cargarFiltros.php',
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      if (data.ciudades) {
        data.ciudades.forEach(function(ciudad) {
          $('#selectCiudad').append('<option value="' + ciudad + '">' + ciudad + '</option>');
        });
      }
      if (data.tipos) {
        data.tipos.forEach(function(tipo) {
          $('#selectTipo').append('<option value="' + tipo + '">' + tipo + '</option>');
        });
      }
      $('select').material_select();
    },
    error: function() {
      console.error('Error al cargar los filtros desde cargarFiltros.php');
    }
  });
}

/*
  Función para dibujar las tarjetas de propiedades en la columna de resultados
*/
function mostrarResultados(propiedades) {
  resultadosActuales = propiedades || [];
  $('.colContenido .itemMostrado').remove();

  if (resultadosActuales.length === 0) {
    $('.colContenido').append(
      '<div class="itemMostrado card">' +
        '<div class="card-content">' +
          '<p><strong>No se encontraron viviendas con los filtros seleccionados.</strong></p>' +
        '</div>' +
      '</div>'
    );
    return;
  }

  resultadosActuales.forEach(function(item, index) {
    var tarjeta =
      '<div class="itemMostrado card">' +
        '<img src="img/home.jpg" alt="Propiedad">' +
        '<div class="card-stacked">' +
          '<div class="card-content">' +
            '<p><strong>Dirección:</strong> ' + item.Direccion + '</p>' +
            '<p><strong>Ciudad:</strong> ' + item.Ciudad + '</p>' +
            '<p><strong>Teléfono:</strong> ' + item.Telefono + '</p>' +
            '<p><strong>Código Postal:</strong> ' + item.Codigo_Postal + '</p>' +
            '<p><strong>Tipo:</strong> ' + item.Tipo + '</p>' +
            '<p><strong>Precio:</strong> <span class="precioTexto">' + item.Precio + '</span></p>' +
          '</div>' +
          '<div class="card-action">' +
            '<a href="#!" class="ver-mas" data-index="' + index + '">Ver más</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    $('.colContenido').append(tarjeta);
  });
}

$(document).ready(function() {
  inicializarSlider();
  playVideoOnScroll();
  inicializarModalDetalle();
  $('select').material_select();
  cargarFiltros();

  // Evento para abrir la ficha detallada al hacer clic en "Ver más"
  $(document).on('click', '.ver-mas', function(e) {
    e.preventDefault();
    var idx = $(this).data('index');
    var item = resultadosActuales[idx];

    if (item) {
      $('#modalDetalleContenido').html(
        '<h5>Ficha de la Propiedad #' + item.Id + '</h5>' +
        '<div class="divider" style="margin-bottom: 15px;"></div>' +
        '<div class="row" style="margin-bottom: 0;">' +
          '<div class="col s12 m5">' +
            '<img src="img/home.jpg" alt="Propiedad" style="width: 100%; border-radius: 6px;">' +
          '</div>' +
          '<div class="col s12 m7">' +
            '<p><strong>Dirección:</strong> ' + item.Direccion + '</p>' +
            '<p><strong>Ciudad:</strong> ' + item.Ciudad + '</p>' +
            '<p><strong>Código Postal:</strong> ' + item.Codigo_Postal + '</p>' +
            '<p><strong>Tipo de Vivienda:</strong> ' + item.Tipo + '</p>' +
            '<p><strong>Teléfono de Contacto:</strong> ' + item.Telefono + '</p>' +
            '<p><strong>Precio:</strong> <span class="precioTexto">' + item.Precio + '</span></p>' +
          '</div>' +
        '</div>'
      );

      if (typeof $('#modalDetalle').modal === 'function') {
        $('#modalDetalle').modal('open');
      } else if (typeof $('#modalDetalle').openModal === 'function') {
        $('#modalDetalle').openModal();
      }
    }
  });

  // Requerimiento 1: Botón "Mostrar Todos"
  $('#mostrarTodos').on('click', function() {
    $.ajax({
      url: 'buscador.php',
      type: 'POST',
      dataType: 'json',
      data: { todos: 'true' },
      success: function(respuesta) {
        mostrarResultados(respuesta);
      },
      error: function() {
        alert('Error al obtener todos los registros.');
      }
    });
  });

  // Requerimientos 3, 4, 5 y 6: Formulario de búsqueda con filtros
  $('#formulario').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
      url: 'buscador.php',
      type: 'POST',
      dataType: 'json',
      data: $(this).serialize(),
      success: function(respuesta) {
        mostrarResultados(respuesta);
      },
      error: function() {
        alert('Error al realizar la búsqueda filtrada.');
      }
    });
  });
});