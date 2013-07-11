$(document).ready(function(){

    var models = {
        tripData: new TripData({}, {cookie: "trip_data"}),
        passengerData: new PassengerData({}, {cookie: "passenger_data"}),
        paymentData: new PaymentData({}, {cookie: "payment_data"}),
        contactData: new ContactData({}, {cookie: "contact_data"})
    };

    var confirmationView = new ConfirmationView(models);
    var booker = new Booker(models);
    var bookerView = new BookerView({
        booker: booker,
        confirm: function () {
            var redirect = $("#submit").attr("href");
            window.location.href = redirect;
        }
    });



    // $('#conf-ida-div').append('<p class="text-center conf-click"><a id="less-ida"><i class="icon-minus"></i> Ocultar </a></p>');
    // $('#conf-vuelta-div').append('<p class="text-center conf-click"><a id="less-vuelta"><i class="icon-minus"></i> Ocultar </a></p>');
    $('#conf-passengers-div').append('<p class="text-center conf-click"><a id="less-passengers"><i class="icon-minus"></i> Ocultar </a></p>');
    // $('#conf-pay-div').append('<p class="text-center conf-click"><a id="less-pay"><i class="icon-minus"></i> Ocultar </a></p>');
    // $('#conf-cc-div').append('<p class="text-center conf-click"><a id="less-cc"><i class="icon-minus"></i> Ocultar </a></p>');
    $('#conf-contact-div').append('<p class="text-center conf-click"><a id="less-contact"><i class="icon-minus"></i> Ocultar </a></p>');

    // $('#conf-ida-div').append('<p class="text-center conf-click"><a id="more-ida" class="displaynone"><i class="icon-plus"></i> Mostrar </a></p>');
    // $('#conf-vuelta-div').append('<p class="text-center conf-click"><a id="more-vuelta" class="displaynone"><i class="icon-plus"></i> Mostrar </a></p>');
    $('#conf-passengers-div').append('<p class="text-center conf-click"><a id="more-passengers" class="displaynone"><i class="icon-plus"></i> Mostrar </a></p>');
    // $('#conf-pay-div').append('<p class="text-center conf-click"><a id="more-pay" class="displaynone"><i class="icon-plus"></i> Mostrar </a></p>');
    // $('#conf-cc-div').append('<p class="text-center conf-click"><a id="more-cc" class="displaynone"><i class="icon-plus"></i> Mostrar </a></p>');
    $('#conf-contact-div').append('<p class="text-center conf-click"><a id="more-contact" class="displaynone"><i class="icon-plus"></i> Mostrar </a></p>');

    // $('#less-ida').click(function(){
    //     $('.conf-ida-less').fadeOut();
    //     $('#less-ida').hide();
    //     $('#more-ida').fadeIn();
    // });

    // $('#more-ida').click(function(){
    //     $('.conf-ida-less').fadeIn();
    //     $('#more-ida').hide();
    //     $('#less-ida').fadeIn();
    // });


    // $('#less-vuelta').click(function(){
    //     $('.conf-vuelta-less').fadeOut();
    //     $('#less-vuelta').hide();
    //     $('#more-vuelta').fadeIn();
    // });

    // $('#more-vuelta').click(function(){
    //     $('.conf-vuelta-less').fadeIn();
    //     $('#more-vuelta').hide();
    //     $('#less-vuelta').fadeIn();
    // });

    $('#less-passengers').click(function(){
        $('.conf-passengers-less').fadeOut();
        $('#less-passengers').hide();
        $('#more-passengers').fadeIn();
    });

    $('#more-passengers').click(function(){
        $('.conf-passengers-less').fadeIn();
        $('#more-passengers').hide();
        $('#less-passengers').fadeIn();
    });


    // $('#less-pay').click(function(){
    //     $('.conf-pay-less').fadeOut();
    //     $('#less-pay').hide();
    //     $('#more-pay').fadeIn();
    // });

    // $('#more-pay').click(function(){
    //     $('.conf-pay-less').fadeIn();
    //     $('#more-pay').hide();
    //     $('#less-pay').fadeIn();
    // });

    // $('#less-cc').click(function(){
    //     $('.conf-cc-less').fadeOut();
    //     $('#less-cc').hide();
    //     $('#more-cc').fadeIn();
    // });

    // $('#more-cc').click(function(){
    //     $('.conf-cc-less').fadeIn();
    //     $('#more-cc').hide();
    //     $('#less-cc').fadeIn();
    // });

    $('#less-contact').click(function(){
        $('.conf-contact-less').fadeOut();
        $('#less-contact').hide();
        $('#more-contact').fadeIn();
    });

    $('#more-contact').click(function(){
        $('.conf-contact-less').fadeIn();
        $('#more-contact').hide();
        $('#less-contact').fadeIn();
    });

    $('.conf-contact-less').fadeOut();
    $('#less-contact').hide();
    $('#more-contact').fadeIn();
    $('.conf-passengers-less').fadeOut();
    $('#less-passengers').hide();
    $('#more-passengers').fadeIn();

});
