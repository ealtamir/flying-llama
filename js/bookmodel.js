

PassengerData = Persistent.extend({

	restoreDates: function () {
		for (var key in this.attributes) {
			this.attributes[key].birthdate = restoreDate(this.attributes[key].birthdate);
		}
	},

	consistent: function(searchParams) {
		var adults = 0;
		var children = 0;
		var infants = 0;
		var passengers = searchParams.get("passengers");

		for (var id in this.attributes) {
			switch (this.get(id).type) {
				case "adult":
					adults++;
					break;
				case "child":
					children++;
					break;
				case "infant":
					infants++;
					break;
				default:
					break;
			}
		}

		return (adults === passengers.adults &&
				children === passengers.children &&
				infants === passengers.infants);

	},

	forceConsistency: function(searchParams) {
		if (!this.consistent(searchParams)) {
			for (var key in this.attributes) {
				this.set(key, undefined);
			}
		}
	},

	getPassengerArray: function () {
		var passengers = [];
		for (var id in this.attributes) {
			var passenger = this.attributes[id];
			passenger = {
				firstName: passenger.firstname,
				lastName: passenger.lastname,
				birthdate: $.datepicker.formatDate("yy-mm-dd", passenger.birthdate),
				idType: passenger.idType,
				idNumber: passenger.idNumber
			};
			passengers.push(passenger);
		}
		return passengers;
	}

});


ContactData = Persistent.extend({
	defaults: {
		email: "",
		phones: ["", ""]
	}
});


PaymentData = Persistent.extend({

	defaults: {
		installments: 1,
		creditCard: {
			valid: undefined,
			number: undefined,
			expiration: undefined,
			securitycode: undefined,
			firstName: "",
			lastName: "",
			birthDate: undefined
		},
		billingAddress: {
			country: "",
			state: "",
			city: "",
			cityFull: "",
			postalCode: "",
			street: "",
			floor: "",
			apartment: ""
		}
	},

	restoreDates: function () {
		this.attributes.creditCard.expiration = restoreDate(this.attributes.creditCard.expiration);
		this.attributes.birthdate = restoreDate(this.attributes.birthdate);
	},

	abortCreditCard: function () {
		if (this.xhr !== undefined) {
			this.xhr.abort();
		}
	},

	validateCreditCard: function () {

		var exp_date = $.datepicker.formatDate("mmy", this.get("creditCard").expiration);
		var me = this;

		if (this.xhr !== undefined) {
			this.xhr.abort();
		}

		this.xhr = $.ajax({
			url: "http://eiffel.itba.edu.ar/hci/service2/Booking.groovy",
			dataType: "jsonp",
			data: {
				method: "ValidateCreditCard",
				number: this.get("creditCard").number,
				exp_date: exp_date,
				sec_code: this.get("creditCard").securitycode,
				timeout: 8000,
				error: function () {
					me.get("creditCard").valid = undefined;
					me.trigger("card:error");
				}
			}
		});

		me.trigger("card:validating");

		this.xhr.done(function(data) {
			if (data.error === undefined) {
				if (data.valid) {
					me.get("creditCard").valid = true;
					me.trigger("card:valid");
				} else {
					me.get("creditCard").valid = false;
					me.trigger("card:invalid");
				}
			} else {

				switch (data.error.code) {
					case 106: //Invalid number
						me.get("creditCard").valid = false;
						me.trigger("card:invalid");
						me.trigger("card:invalid:number");
						break;
					case 107: //Invalid expiration date
						me.get("creditCard").valid = false;
						me.trigger("card:invalid");
						me.trigger("card:invalid:expiration");
						break;
					case 111: //Invalid security code
						me.get("creditCard").valid = false;
						me.trigger("card:invalid");
						me.trigger("card:invalid:securitycode");
						break;
					default:
						me.get("creditCard").valid = undefined;
						me.trigger("card:error");
						break;
				}
			}
		});

		this.xhr.fail(function() {
			me.get("creditCard").valid = undefined;
			me.trigger("card:error");
		});

		window.setTimeout(function () {
			me.get("creditCard").valid = undefined;
			me.trigger("card:error");
			me.xhr.abort();
		} , 8000);
	}


});


Booker = Backbone.Model.extend({
	initialize: function() {
		this.xhrs = [];
		this.xhrsBusy = 0;
	},

	cleanup: function () {
		for (xhrId in this.xhrs) {
			this.xhrs[xhrId].abort();
		}
		this.xhrs = [];
		this.xhrsBusy = 0;
	},

	xhrFail: function () {
		this.cleanup();
		this.trigger("booking:error");
	},

	xhrOK: function () {
		this.xhrsBusy--;
		if (this.xhrsBusy === 0) {
			this.cleanup();
			this.trigger("booking:done");
		}
	},
	book: function () {
		var outboundRoutes = this.get("tripData").get("outboundRoutes");
		var inboundRoutes = this.get("tripData").get("inboundRoutes");
		this.cleanup();
		this.trigger("booking:issuing");
		this.bookFlight(outboundRoutes[0].segments[0].flightId);
		if (inboundRoutes !== undefined)
			this.bookFlight(inboundRoutes[0].segments[0].flightId);
	},
	cancel: function () {
		this.cleanup();
	},
	bookFlight: function (id) {

		var me = this;

		var data = {
			flightId: id,
			passengers: this.get("passengerData").getPassengerArray(),
			payment: this.get("paymentData").toJSON(),
			contact: this.get("contactData").toJSON()
		}

		data.payment = {
			installments: data.payment.installments,
			creditCard: {
				number: data.payment.creditCard.number,
				expiration: $.datepicker.formatDate("mmy", data.payment.creditCard.expiration),
				securityCode: data.payment.creditCard.securitycode,
				firstName: data.payment.creditCard.firstName,
				lastName: data.payment.creditCard.lastName
			},
			billingAddress: {
				country: data.payment.billingAddress.country,
				state: data.payment.billingAddress.state,
				City: data.payment.billingAddress.city,
				postalCode: data.payment.billingAddress.postalCode,
				street: data.payment.billingAddress.street,
				floor: data.payment.billingAddress.floor,
				apartment: data.payment.billingAddress.apartment
			}
		};

		data.contact = {
			email: data.contact.email,
			phones: data.contact.phones
		};


		var xhr = $.ajax({
			url: "http://eiffel.itba.edu.ar/hci/service2/Booking.groovy",
			dataType: "jsonp",
			data: {
				method: "BookFlight2",
				data: JSON.stringify(data)
			},
			timeout: 8000,
			error: function () {
				me.xhrFail();
			}
		});

		this.xhrsBusy++;
		this.xhrs.push(xhr);

		xhr.done(function(data) {
			if (data.error === undefined) {
				if (data.booking) {
					me.xhrOK();
				} else {
					me.xhrFail();
				}
			} else {
				me.xhrFail();
			}
		});

		xhr.fail(function() {
			me.xhrFail();
		});

		// window.setTimeout(function () {
		// 	me.xhrFail();
		// } , 8000);
	}

})