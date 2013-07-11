    PassengerView = ValidatedView.extend({
        events: {
            'click [class*="validate"]': "hideValidationError",
            "change input": "save",
            "change select": "save"
        },
        initialize: function(attrs) {

            var template;
            this.searchParams = attrs.searchParams;
            this.passengerData = attrs.passengerData;
            this.friendlyName = attrs.friendlyName;
            this.passengerType = attrs.passengerType;
            this.passengerId = attrs.passengerId;

            template = _.template($("#passenger-template").html(), {
                passengerId: this.passengerId,
                friendlyName: this.friendlyName
            });

            this.$el.append('<div id="p' + this.passengerId + '"></div>');
            this.setElement(this.$("#p" + this.passengerId));
            this.$el.append(template);

            this.listenTo(this.passengerData, "change:"+this.passengerId, this.render);

            this.render();

        },

        el: $("#passenger-form"),

        fixedSerialize: function() {
            var prefix = this.passengerId + "-";
            var data = this.serialize();

            var birthdate = {
                day: parseInt(data[prefix + "bornday"], 10),
                month: parseInt(data[prefix + "bornmonth"], 10),
                year: parseInt(data[prefix + "bornyear"], 10)
            };

            try{
                $.datepicker.parseDate("dd/mm", birthdate.day + "/" + birthdate.month, null);
                if (birthdate.year > (new Date()).getFullYear() || birthdate.year < 1900)
                    birthdate = undefined;
            }
            catch(error){
                birthdate = undefined;
            }

            return {
                firstname: data[prefix + "firstname"],
                lastname: data[prefix + "lastname"],
                birthdate: birthdate,
                gender: data[prefix + "gender"],
                idtype: parseInt(data[prefix + "idtype"]),
                idnumber: data[prefix + "idnumber"]
            };
        },

        save: function() {
            var data = this.fixedSerialize();
            var birthdate;
            if (data.birthdate !== undefined &&
                isFinite(data.birthdate.day) &&
                isFinite(data.birthdate.month) &&
                isFinite(data.birthdate.year))
                    birthdate = new Date(data.birthdate.year, data.birthdate.month-1, data.birthdate.day);

            this.passengerData.set(this.passengerId, {
                type: this.passengerType,
                firstname: data.firstname,
                lastname: data.lastname,
                birthdate: birthdate,
                gender: data.gender,
                idNumber: data.idnumber,
                idType: data.idtype,
                friendlyName: this.friendlyName
            });
        },
        submit: function () {
            this.save();
            this.confirm();
        },
        confirm: function () {},
        setFocus: function () {
            $('html, body').stop().animate({
                scrollTop: this.$el.offset().top - $(window).height()/5
            }, 1500,'easeInOutExpo');
        },
        render: function() {
            var prefix = "#" + this.passengerId + "-";
            var passenger;

            if (this.passengerData.get(this.passengerId)) {
                passenger = this.passengerData.get(this.passengerId);
                this.passengerType = passenger.type;
                this.$(prefix + "firstname").val(passenger.firstname);
                this.$(prefix + "lastname").val(passenger.lastname);
                this.$(prefix + "gender").val(passenger.gender);

                if (passenger.birthdate !== undefined &&
                    passenger.birthdate.constructor === Date) {
                    this.$(prefix + "bornday").val($.datepicker.formatDate("dd", passenger.birthdate));
                    this.$(prefix + "bornmonth").val($.datepicker.formatDate("mm", passenger.birthdate));
                    this.$(prefix + "bornyear").val($.datepicker.formatDate("yy", passenger.birthdate));
                }

                this.$(prefix + "idtype").val(passenger.idType);
                this.$(prefix + "idnumber").val(passenger.idNumber);
            }
        }
    });

    ViewHandler = Backbone.View.extend({
        el: $("body"),
        events: {
            "click #submit": "submit"
        },
        initialize: function(attrs) {
            this.views = attrs.views;
            this.confirm = attrs.confirm;
        },
        submit: function (e) {
            var me = this;
            var valid = true;
            var confirmation = function () {
                me.toConfirm--;
                if (me.toConfirm === 0)
                    me.confirm();
            };
            e.preventDefault();
            me.toConfirm = this.views.length;
            for (var viewId in this.views) {
                if (!this.views[viewId].isValid(true))
                    valid = false;
            }

            if (!valid) {
                this.invalid();
                return;
            }

            for (viewId in this.views) {
                this.views[viewId].confirm = confirmation;
                this.views[viewId].submit();
            }

        },
        confirm: function () {},
        invalid: function () {}
    });

    PassengerListView = ViewHandler.extend({

        el: $("#passenger-div"),

        initialize: function(attrs) {
            var passengerTypes;
            var passengerCount = 0;
            var passengerViews = [];

            this.searchParams = attrs.searchParams;
            this.passengerData = attrs.passengerData;

            passengerTypes = this.searchParams.get("passengers");

            for (var i = 0; i < passengerTypes.adults; i++) {
                passengerViews.push(new PassengerView({
                    searchParams: this.searchParams,
                    passengerData: this.passengerData,
                    passengerId: passengerCount,
                    passengerType: "adult",
                    friendlyName: "Adulto " + (i+1)
                }));
                passengerCount++;
            }

            for (i = 0; i < passengerTypes.children; i++) {
                passengerViews.push(new PassengerView({
                    searchParams: this.searchParams,
                    passengerData: this.passengerData,
                    passengerId: passengerCount,
                    passengerType: "child",
                    friendlyName: "Niño " + (i+1)
                }));
                passengerCount++;
            }

            for (i = 0; i < passengerTypes.infants; i++) {
                passengerViews.push(new PassengerView({
                    searchParams: this.searchParams,
                    passengerData: this.passengerData,
                    passengerId: passengerCount,
                    passengerType: "infant",
                    friendlyName: "Infante " + (i+1)
                }));
                passengerCount++;
            }

            ViewHandler.prototype.initialize.apply(this, [{
                views: passengerViews,
                confirm: function () {
                    var redirect = $("#passenger-div #submit").attr("href");
                    console.log(redirect);
                    window.location.href = redirect;
                }
            }]);
        },
        invalid: function () {
            for (var viewId in this.views) {
                if (!this.views[viewId].isValid(false)) {
                    this.views[viewId].setFocus();
                    return;
                }
            }
        }
    });


    PaymentView = ValidatedView.extend({

        el: $("#payment-form"),

        events: {
            "change input": "save",
            "click #creditcard-cancel": "creditCardCancel",
            "click #creditcard-retry": "creditCardRetry",
            'click [class*="validate"]': "hideValidationError",
            "click input,select": "hideInvalidCardError"
        },

        initialize: function (attrs) {
            this.paymentData = attrs.paymentData;
            this.listenTo(this.paymentData, "change", this.render);
            this.listenTo(this.paymentData, "card:valid", this.creditCardValid);
            this.listenTo(this.paymentData, "card:invalid", this.creditCardInvalid);
            this.listenTo(this.paymentData, "card:invalid:number", this.creditCardInvalidNumber);
            this.listenTo(this.paymentData, "card:invalid:expiration", this.creditCardInvalidExpirationDate);
            this.listenTo(this.paymentData, "card:invalid:securitycode", this.creditCardSecurityCode);
            this.listenTo(this.paymentData, "card:error", this.creditCardValidationError);
            this.listenTo(this.paymentData, "card:validating", this.creditCardValidating);
            this.render();
        },
        deserialize: function (data) {
            for (var key in data) {
                this.$("#" + key).val(data[key]);
            }
        },
        save: function () {
            var data = this.serialize();
            var exp_date = new Date(parseInt(data.ccfechaanio, 10), parseInt(data.ccfechames, 10) - 1, 1);
            this.paymentData.set({
                creditCard: {
                    type: data.cctype,
                    valid: undefined,
                    bank: data.ccvisa,
                    number: data.ccnumber,
                    expiration: exp_date,
                    securitycode: data.cccode,
                    firstName: data.ccpfirstname,
                    lastName: data.ccplastname
                },
                billingAddress: {
                    country: "AR", // TODO: Obtener el pais
                    state: "Buenos Aires", // TODO: Poner estado
                    city: "BUE",
                    cityFull: data.city,
                    postalCode: parseInt(data.postalcode),
                    street: data.address,
                    floor: data.floor,
                    apartment: data.apartment
                }
            });
        },
        render: function () {
            var creditCard = this.paymentData.get("creditCard");
            var billingAddress = this.paymentData.get("billingAddress");
            var data;

            if (creditCard !== undefined &&
                billingAddress !== undefined) {
                    data = {
                        // ccnumber: creditCard.number,
                        // cccode: creditCard.securitycode,
                        // ccfechaanio: creditCard.expiration.getFullYear(),
                        // ccfechames: creditCard.expiration.getMonth()+1
                        ccpfirstname: creditCard.firstName,
                        ccplastname: creditCard.lastName,
                        city: billingAddress.cityFull,
                        postalcode: billingAddress.postalCode,
                        address: billingAddress.street,
                        floor: billingAddress.floor,
                        apartment: billingAddress.apartment

                    };
                    this.deserialize(data);
            }
        },
        creditCardValid: function () {
            this.confirm();
        },
        creditCardInvalid: function () {
            this.$("#creditcard-validating").modal("hide");
            $("#creditcard-invalid-error").fadeIn("fast");
            $('html, body').stop().animate({
                scrollTop: $("#creditcard-invalid-error").offset().top - $(window).height()/5
            }, 1500,'easeInOutExpo');
        },
        creditCardInvalidNumber: function () {
            this.$("#ccnumber").addClass("error");
        },
        creditCardInvalidSecurityCode: function () {
            this.$("#cccode").addClass("error");
        },
        creditCardInvalidExpirationDate: function () {
            this.$("#ccfechames").addClass("error");
            this.$("#ccfechaanio").addClass("error");
        },
        creditCardValidationError: function () {
            this.$(".validating-msg").addClass("no-display");
            this.$(".validation-error-msg").removeClass("no-display");
        },
        creditCardValidating: function () {
            this.$(".validating-msg").removeClass("no-display");
            this.$(".validation-error-msg").addClass("no-display");
            this.$("#creditcard-validating").modal("show");
        },
        creditCardCancel: function (e) {
            if (e !== undefined)
                e.preventDefault();
            this.paymentData.abortCreditCard();
            this.$("#creditcard-validating").modal("hide");
        },
        creditCardRetry: function (e) {
            if (e !== undefined)
                e.preventDefault();
            this.paymentData.validateCreditCard();
        },
        hideInvalidCardError: function () {
            $("#creditcard-invalid-error").fadeOut("fast");
        },
        submit: function () {

            if (this.paymentData.get("creditCard").valid === true) {
                this.confirm();
                return;
            }

            this.save();
            this.paymentData.validateCreditCard();
        },
        confirm: function () {}

    });

    ContactView = ValidatedView.extend({
        el: $("#contact-form"),
        events: {
            "change input": "save",
            'click [class*="validate"]': "hideValidationError"
        },
        initialize: function (attrs) {
            this.contactData = attrs.contactData;
            this.listenTo(this.contactData, "change", this.render);
            this.render();
        },
        save: function () {
            var data = this.serialize();
            this.contactData.set({
                email: data.pemail,
                phones: [data.phone1, data.phone2]
            });
        },
        render: function () {
            var phones = this.contactData.get("phones");
            this.$("#pemail").val(this.contactData.get("email"));
            this.$("#phone1").val(phones[0]);
            this.$("#phone2").val(phones[1]);
        },
        submit: function () {
            this.save();
            this.confirm();
        },
        confirm: function () {}

    });

    ConfirmationView = Backbone.View.extend({
        el: $("#confirmation-info"),
        initialize: function (attrs) {

            var data;
            var outboundSegment;
            var inboundSegment;
            var prices;

            this.tripData = attrs.tripData;
            this.passengerData = attrs.passengerData;
            this.paymentData = attrs.paymentData;
            this.contactData = attrs.contactData;

            prices = this.tripData.get("price");

            data = {
                passengers: this.passengerData.toJSON(),
                outbound: undefined,
                inbound: undefined,
                payment: this.paymentData.toJSON(),
                contact: {
                    email: this.contactData.get("email"),
                    phone1: this.contactData.get("phones")[0],
                    phone2: this.contactData.get("phones")[1]
                },
                passengerCount: 0,
                price: {
                    adults: (prices.adults !== null ?
                                prices.adults.baseFare*prices.adults.quantity:
                                0),
                    children: (prices.children !== null ?
                                prices.children.baseFare*prices.children.quantity:
                                0),
                    infants: (prices.infants !== null ?
                                prices.infants.baseFare*prices.infants.quantity:
                                0),
                    taxes: prices.total.taxes+prices.total.charges,
                    total: prices.total.total
                }
            };

            data.price.subtotal = data.price.adults +
                                    data.price.children +
                                    data.price.infants;

            for (var passengerId in data.passengers) {
                data.passengerCount++;
            }

            if (this.tripData.get("outboundRoutes") !== undefined) {
                outboundSegment = this.tripData.get("outboundRoutes")[0].segments[0];

                data.outbound = {
                        airline: outboundSegment.airlineName,
                        flightId: outboundSegment.flightId,
                        departure: outboundSegment.departure,
                        arrival: outboundSegment.arrival,
                        stopovers: outboundSegment.stopovers.length

                    };

                }

            if (this.tripData.get("inboundRoutes") !== undefined) {
                inboundSegment = this.tripData.get("inboundRoutes")[0].segments[0];

                data.inbound = {
                        airline: inboundSegment.airlineName,
                        flightId: inboundSegment.flightId,
                        departure: inboundSegment.departure,
                        arrival: inboundSegment.arrival,
                        stopovers: inboundSegment.stopovers.length
                    };

                }

            if (prices) {
                if (prices.adults !== null)
                    data.adults = prices.adults.quantity;
                else
                    data.adults = 0;
                if (prices.children !== null)
                    data.children = prices.children.quantity;
                else
                    data.children = 0;
                if (prices.infants !== null)
                    data.infants = prices.infants.quantity;
                else
                    data.infants = 0;
            }

            template = _.template($("#confirmation-info-template").html(), data);

            this.$el.append(template);
        }
    });


    BookerView = Backbone.View.extend({
        el: $("#booking-panel"),
        events: {
            "click #submit": "submit",
            "click #booking-retry": "bookingRetry",
            "click #booking-cancel": "bookingCancel"
        },
        initialize: function (attrs) {
            this.booker = attrs.booker;
            this.confirm = attrs.confirm;
            this.listenTo(this.booker, "booking:issuing", this.bookingIssuing);
            this.listenTo(this.booker, "booking:error", this.bookingError);
            this.listenTo(this.booker, "booking:done", this.bookingDone);
        },
        bookingIssuing: function () {
            this.$("#booking-issuing").modal("show");
            this.$(".booking-msg").removeClass("no-display");
            this.$(".booking-error-msg").addClass("no-display");
        },
        bookingDone: function () {
            this.confirm();
        },
        bookingError: function () {
            this.$(".booking-msg").addClass("no-display");
            this.$(".booking-error-msg").removeClass("no-display");
        },
        bookingRetry: function (e) {
            if (e !== undefined)
                e.preventDefault();
            this.booker.book();
        },
        bookingCancel: function (e) {
            if (e !== undefined)
                e.preventDefault();
            this.$("#booking-issuing").modal("hide");
        },
        submit: function (e) {
            if (e !== undefined)
                e.preventDefault();
            this.booker.book();
        },
        confirm: function () {}

    });
