// function missingCookies(targetMap) {
//   for (var cookieName in targetMap) {
//     if ($.cookie(cookieName) === undefined) {
//       window.location.href = targetMap[cookieName];
//       return;
//     }
//   }
// }

// missingCookies({
//     "search_params": "index.html",
//     "trip_data": "resultados.html",
//     "passenger_data": "ingresoinfo.html",
//     "payment_data": "ingresoinfopago.html",
//     "contact_data": "ingresoinfopago.html"
// });


$(document).ready(function() {

    $(".bootstrap-tooltip").tooltip({
      html: true
    });


    $(".datepicker").attr("autocomplete", "off");
    $(".datepicker").keypress(function(event) {event.preventDefault();});
    $(".datepicker").keydown(function() {
      var key = event.keyCode || event.charCode;
      if( key == 8 || key == 46 )
        return false;
    });
    $(".datepicker").datepicker({
      minDate: "+2d",
      numberOfMonths: 2,
      showButtonPanel: false,
      dateFormat: 'dd/mm/yy',
      monthNames: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
      monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      dayNames: ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"],
      dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
      dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],

      onSelect: function() {},

      // Esto evita que se vean elementos por arriba del calendario.
      // TODO: Hay alguna manera de hacer esto mejor?
      beforeShow: function() {
        setTimeout(function(){
            $('.ui-datepicker').css('z-index', 0x10000);
        }, 0);
      }
    });

    $('.numeric-input').filter_input({regex:'[0-9]'});
    $('.alphanumeric-input').filter_input({regex:'[0-9a-zA-zñÑ]'});
    $('.alphanumericNspace-input').filter_input({regex:'[0-9a-zA-zñÑ ]'});
    $('.letters-input').filter_input({regex:'[a-zA-Z ñÑáÁéÉíÍóÓúÚäÄëËïÏöÖüÜ]'});
    $('.city-input').filter_input({regex:'[a-zA-Z ,()ñÑ]'});
    $('.email').filter_input({regex:'[^ ]'});
    $('.phone').filter_input({regex:'[0-9+]'});


    $("#ccvisa").change(function(){
      if($(this).val() == 'American Express')
        $("#cccode").attr('placeholder',"Los 4 dígitos arriba a la derecha del número de la tarjeta");
      else
        $("#cccode").attr('placeholder',"Los 3 dígitos detrás de la tarjeta");
    });

    $(".ast").attr('title',"Campo obligatorio");
});
