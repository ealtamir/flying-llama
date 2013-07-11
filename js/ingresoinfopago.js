
$(function () {
    var contactData = new ContactData({}, {cookie: "contact_data"});
    var contactView = new ContactView({contactData: contactData});
    var paymentData = new PaymentData({}, {cookie: "payment_data"});
    var paymentView = new PaymentView({paymentData: paymentData});
    var searchParams = new SearchParams({}, {cookie: "search_params"});
    var searchSummaryView = new SearchSummaryView({searchParams: searchParams});

    var viewHandler = new ViewHandler({
        views: [paymentView, contactView],
        confirm: function () {
            var redirect = $("#submit").attr("href");
            window.location.href = redirect;
        }
    });

    for (var j=1; j<=12; j++) {
        if (j >= 10)
            $('#ccfechames').append('<option>'+j+'</option>');
        else
            $('#ccfechames').append('<option>0'+j+'</option>');
    }

    var curYear = (new Date()).getFullYear();
    for (var i = curYear; i <= (curYear+10); i++) {
        $('#ccfechaanio').append('<option>'+i+'</option>');
    }

    $(".phone-mask").mask('+00 00 0000-0000');


});
