$(function() {
    /////////////////////////////////////////////////////////
    //
    //                  Página PRINCIPAL
    //
    /////////////////////////////////////////////////////////

    ValidatedView = Backbone.View.extend({
        events: {
            'click [class*="validate"]': "hideValidationError"
        },
        fieldIsValid: function (field, validate) {
            var valid = isValid($(field));
            if ((!valid) && validate === true)
                editClasses($(field), false);
            return valid;
        },
        isValid: function (validate) {
            var self = this;
            var valid = true;
            this.$('[class*="validate"]').each(function() {
                if (!self.fieldIsValid(this, validate))
                    valid = false;
            });
            if ((!valid) && validate === true)
                this.showValidationError();

            return valid;
        },
        hideValidationError: function() {
            this.$(".validation-error").fadeOut("fast");
        },
        showValidationError: function () {
            this.$(".validation-error").fadeIn("fast");
        },
        serialize: function () {
            var data = {};
            var self = this;
            this.$("input,select").each(function () {
                var $this = $(this);
                if (self.fieldIsValid(this))
                    data[$this.attr("id")] = $this.val();
                else {
                    data[$this.attr("id")] = $this.attr("value");
                }
            });
            return data;
        }
    });

    SearchView = ValidatedView.extend({
        initialize: function(attrs) {

            this.searchParams = attrs.searchParams;

            $("#ida-datepicker").datepicker('option', 'onSelect', this.depDatepickerLogic);
            $("#vuelta-datepicker").datepicker('option', 'beforeShow', this.retDatepickerLogic);

            this.listenTo(this.searchParams, "change", this.render);
            this.render();
        },

        events: {
            "submit #search-form": "submitSearch",
            "click #one-way-button": "setOneWay",
            "click #round-trip-button": "setRoundtrip",
            'click [class*="validate"]': "hideValidationError"
        },

        el: $("#search-div"),

        serialize: function() {
            var fromName = this.$("#desde").val();
            var toName = this.$("#hasta").val();

            var data = {
                from: {
                    id: cityOrAirportToID(fromName),
                    name: fromName
                },
                to: {
                    id: cityOrAirportToID(toName),
                    name: toName
                },

                dep_date: this.$("#ida-datepicker").datepicker("getDate"),
                passengers: {
                    adults: parseInt(this.$("#adults").val(), 10),
                    children: parseInt(this.$("#children").val(), 10),
                    infants: parseInt(this.$("#infants").val(), 10)
                }
            };

            if (this.trip_type == "roundtrip") {
                data.ret_date = this.$("#vuelta-datepicker").datepicker("getDate");
            } else {
                data.ret_date = undefined;
            }

            data.cabin_type = this.$("#clase").val();

            return data;


        },

        submitSearch: function(e) {
            e.preventDefault();
            if (this.isValid(true)) {
                this.searchParams.set(this.serialize());
                if (this.$("#search-form").hasClass("submit"))
                   window.location.href = this.$("#search-form").attr("action");
            }

        },

        setOneWay: function() {
            this.hideValidationError();
            this.trip_type = "oneway";
            $("#round-trip-button").removeClass("active");
            $("#one-way-button").addClass("active");
            $("#return-div").fadeOut("fast");
            $("#vuelta-datepicker").removeClass("validate-date");
        },

        setRoundtrip: function() {
            this.hideValidationError();

            if (this.trip_type === "oneway")
                $("#vuelta-datepicker").removeClass('error');

            this.trip_type = "roundtrip";
            $("#vuelta-datepicker").addClass("validate-date");
            $("#round-trip-button").addClass("active");
            $("#one-way-button").removeClass("active");
            $("#return-div").fadeIn("fast");
        },

        render: function() {

            if (this.searchParams.isValid()) {
                var cabin_type = this.searchParams.get("cabin_type");

                if (cabin_type === undefined)
                    cabin_type = "any";

                $("#desde").val(this.searchParams.get("from").name);
                $("#hasta").val(this.searchParams.get("to").name);
                $("#ida-datepicker").datepicker("setDate", this.searchParams.get("dep_date"));
                $("#vuelta-datepicker").datepicker("setDate", this.searchParams.get("ret_date"));
                $("#adults").val(this.searchParams.get("passengers").adults);
                $("#children").val(this.searchParams.get("passengers").children);
                $("#infants").val(this.searchParams.get("passengers").infants);

                $("#clase").val(cabin_type);

                switch (this.searchParams.getType()) {
                    case "oneway":
                        this.setOneWay();
                        break;
                    case "roundtrip":
                        this.setRoundtrip();
                        break;
                    default:
                        this.setRoundtrip();
                        break;
                }


                this.depDatepickerLogic();
                this.retDatepickerLogic();
            } else {
                this.setRoundtrip();
            }
        },

        depDatepickerLogic: function () {
            var newDate = $(this).datepicker('getDate');
            if (newDate) { // Not null
                if(newDate >= $("#vuelta-datepicker").datepicker('getDate')) {
                    $("#vuelta-datepicker").val('');
                }
            }
        },

        retDatepickerLogic: function () {
            var newDate = $("#ida-datepicker").datepicker('getDate');
            if (newDate) { // Not null
                newDate.setDate(newDate.getDate() + 1);
                $("#vuelta-datepicker").datepicker('option', 'minDate', newDate);
            }
        }
    });

    SearchSummaryView = Backbone.View.extend({

        initialize: function(attrs) {
            this.searchParams = attrs.searchParams;
            this.listenTo(this.searchParams, "change", this.render);
            this.render();
        },

        el: $("#search-summary-div"),

        render: function () {
            var passengers;

            passengers = this.searchParams.get("passengers");
            passengers = (passengers.adults + passengers.children + passengers.infants);

            if (this.searchParams.getType() == "roundtrip") {
                this.$("#search-summary").text(this.searchParams.get("from").id + " > " +
                this.searchParams.get("to").id +
                " | Ida: " + $.datepicker.formatDate("dd/mm/yy", this.searchParams.get("dep_date")) +
                " | Vuelta: " + $.datepicker.formatDate("dd/mm/yy", this.searchParams.get("ret_date")) +
                " | Pasajeros: " + passengers +
                " | " + this.searchParams.getClassName());
            } else {
                this.$("#search-summary").text(this.searchParams.get("from").id + " > " +
                this.searchParams.get("to").id +
                " | Ida: " + $.datepicker.formatDate("dd/mm/yy", this.searchParams.get("dep_date")) +
                " | Pasajeros: " + passengers +
                " | " + this.searchParams.getClassName());
            }
        }

    });


    /////////////////////////////////////////////////////////
    //
    //                  Página de RESULTADOS
    //
    /////////////////////////////////////////////////////////
    /************************************
    *              SORTS
    ************************************/
    SortButtonsView = Backbone.View.extend({
        initialize: function() {
            this.setElement($('#sort-buttons'));
            this.render();
            this.listenTo(this.model, 'change', this.render);
        },
        render: function() {
            var state = this.model.getSortData();
            var id = '#' + state.sort_key;
            $('#sort-buttons button').removeClass('active');
            $(id).addClass('active');

            $('#sort-buttons i').removeClass();
            $(id + ' i').addClass(
                (state.sort_order === 'asc')? 'icon-arrow-down': 'icon-arrow-up'
            );
        },
        events: {
            'click #total': 'precioClicked',
            'click #airline': 'aerolineaClicked',
            'click #stopovers': 'escalasClicked',
            'click #duration': 'duracionClicked'
        },
        precioClicked: function()   { this.setState('total'); },
        aerolineaClicked: function(){ this.setState('airline'); },
        escalasClicked: function()  { this.setState('stopovers'); },
        duracionClicked: function() { this.setState('duration'); },

        setState: function(clicked_button) {
            var state = this.model.getSortData();
            if(state.sort_key === clicked_button) {
                state.sort_order = (state.sort_order === 'asc')? 'desc': 'asc';
            } else {
                state.sort_key = clicked_button;
                state.sort_order = 'asc';
            }
            this.model.set(state);
        },
    });

    /************************************
    *              FILTERS
    ************************************/
    FilterWidget = Backbone.View.extend({
        initialize: function() {
            params = this.options.params;
            this.setElement(params.obj);
            params.init({
                view: this, model: this.options.model
            });
        },
        eventResponse: function(params) {
            this.trigger('change', {
                filterWidget: this,
                data: params.data,
                handler: params.handler,
            });
      },
    });

    /************************************
    *              PaginationView
    ************************************/
    PaginationView = Backbone.View.extend({
        initialize: function() {
            this.render();
            this.listenTo(
                this.model,
                'change',
                this.render
            );
            //this.model.get('searchParams').set({page: 1});
        },
        render: function() {
            this.$el.empty();
            var str = ''; // Armo el paginador a partir de un str.
            var data = this.getPagesData();

            if (data.pagesNum > 1) {
                str += '<li><a id="paginator-page-left" href="#">«</a></li>';
                for (var i = 0; i < data.pagesNum; i += 1) {
                    str += '<li id="" class="';
                    str += (parseInt(data.currentPage, 10) === (i+1))? 'active': '';
                    str += '"><a id="paginator-page-' +
                        (i + 1) +'" href="">' + (i + 1) + '</a></li>';
                }
                str += '<li><a id="paginator-page-right" href="">»</a></li>';
                this.$el.append('<ul>' + str + '</ul>');
            }

        },
        getPagesData: function() {
            var searchParams = this.model.get('searchParams');
            var flightNum = this.model.getNumFlights();
            var itemsPerPage = searchParams.get('page_size');
            var currentPage = searchParams.get('page');
            var pagesNum = Math.ceil(flightNum / itemsPerPage);
            return {
                pagesNum: pagesNum,
                currentPage: currentPage,
                itemsPerPage: itemsPerPage,
                flightNum: flightNum,
            };
        },
        events: {
            'click a': 'eventResponse'

        },
        eventResponse: function(e) {
            var id = e.target.id;
            var page = id.split('-')[2];
            console.log(page);
            var data = this.getPagesData();
            var newPage = parseInt(data.currentPage, 10);
            if (page !== undefined ) {
                switch (page) {
                    case 'right':
                        newPage += (newPage < data.pagesNum)? 1: null;
                        break;
                    case 'left':
                        newPage -= (newPage > 1)? 1: null;
                        break;
                    default:
                        page = parseInt(page, 10);
                        console.log(page);
                        newPage = (page >= 1 && page <= data.pagesNum)?
                            page: 1;
                        break;
                }
            }
            if(newPage !== null) {
                this.model.get('searchParams').set({page: newPage});
            }
        }

    });

    /************************************
    *              FLIGHTS
    ************************************/
    MessageView = Backbone.View.extend({
        initialize: function() {
            this.render();
            this.listenTo(this.model, 'change:state', this.render);
        },
        render: function() {
            var state = this.model.get('state');
            var template = '';
            this.$el.empty();
            switch (state) {
            case 'busy':
                template = _.template(
                    $('#search-results-messages').html(), {
                        message_image_url: 'img/llama-loading.gif',
                        message_title: 'Buscando Vuelos',
                        message_explanation: 'Por favor, espere.',
                    }
                );
                this.$el.removeClass('hidden');
                break;
            case 'done':
                this.$el.addClass('hidden');
                break;
            case 'failed':
                template = _.template(
                    $('#search-results-messages').html(), {
                        message_image_url: 'img/llama-loading.gif',
                        message_title: 'Ningún Vuelo Encontrado',
                        message_explanation: 'Por favor, intenta buscar nuevamente.',
                    }
                );
                this.$el.removeClass('hidden');
                break;
            default:
                alert('Llegue al default de MessageView.render');
                break;
            }
            this.$el.html(template);
        }
    });
    ConfirmationModal = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        render: function() {
            var flight_logos = this.model.getAirlineLogos();
            var flightData = this.model.getFlightById(this.options.flight_id);
            var outboundRoutes = flightData.outboundRoutes[0];
            var inboundRoutes;

            var html = '';

            var $temp = $('#confirm-modal-header').html();
            html += _.template($temp, {});

            $temp = $('#confirm-modal-flights').html();
            html += _.template(
                $temp, this.genFlightParams(outboundRoutes, flight_logos, 'Ida')
            );

            // Last minute fix (Fede) not sure its appropriate
            if (flightData.inboundRoutes !== undefined) {
                inboundRoutes = flightData.inboundRoutes[0];
                html += _.template(
                    $temp, this.genFlightParams(inboundRoutes, flight_logos, 'Vuelta')
                );
            }

            $temp = $('#confirm-modal-template').html();
            html += _.template(
                $temp, this.genPurchaseParams(flightData)
            );
            html = '<div class="modal-body">' + html + '</div>';


            this.$el.prepend(html);
            this.$el.modal('show');
        },
        genFlightParams: function(route, flight_logos, title) {
            var segmentData = route.segments[0];
            return {
                title: title,
                image_logo_url: flight_logos[segmentData.airlineId].logo,
                depart_time: segmentData.departure.date,
                depart_airport: segmentData.departure.airportDescription,
                arrival_time: segmentData.arrival.date,
                arrival_airport: segmentData.arrival.airportDescription,
                flight_duration: route.duration,
                flight_id: segmentData.flightId,
                cabin_type: this.model.getCabinType(segmentData.cabinType),
            };
        },
        genPurchaseParams: function(flightData) {
            var children_quantity = flightData.price.children?
                flightData.price.children.quantity: 0;
            var infants_quantity = flightData.price.infants?
                flightData.price.infants.quantity: 0;
            var passengers_total = flightData.price.adults.quantity +
                children_quantity + infants_quantity;
            return {
                num_adults: flightData.price.adults.quantity,
                num_kids: children_quantity,
                num_infants: infants_quantity,
                passengers_total: passengers_total,
                charges: flightData.price.total.charges,
                taxes: flightData.price.total.taxes,
                fare: flightData.price.total.fare,
                total: flightData.price.total.total,
            };
        },
        events: {
            'click .confirm-modal-confirm': 'confirmSelection',
        },
        confirmSelection: function() {
            var flightInfo = this.model.getFlightById(this.options.flight_id);
            var tripData = new TripData(flightInfo, {cookie: "trip_data"});
            if (flightInfo.inboundRoutes === undefined) {
                tripData.set("inboundRoutes", undefined);
            }
        },
    });

    FlightResultsView = Backbone.View.extend({
        defaults: {
            sortButtonsView: null,
            filtersList: [],
            filterState: {},
        },
        initialize: function() {
            var view = this;

            new MessageView({
                el: '#messages-view',
                model: this.model,
            });

            this.model.once('change:state', function() {
                var searchResults = view.model;
                var filters = searchResults.getFilters();
                view.defaults.sortButtonsView = new SortButtonsView({
                    model: searchResults.get("searchParams"),
                });

                var paramsFiltersList = view.options.filtersList;
                if( paramsFiltersList !== undefined) {
                    for(i = 0; i < paramsFiltersList.length; i += 1) {
                        view.defaults.filtersList.push(
                            new FilterWidget({
                                params: paramsFiltersList[i],
                                model: searchResults,
                            })
                        );
                        view.listenTo(
                            view.defaults.filtersList[i],
                            'change',
                            view.filterActivated
                        );
                    }
                } else {
                    console.log('Filters Not Available');
                }

                new PaginationView({
                    el: '.pagination',
                    model: searchResults,
                });
                view.listenTo(this, 'change:state', view.render);
                view.render();
            });
        },
        render: function() {
            var state = this.model.get('state');
            var searchResults = this.model;
            var numFlights = searchResults.getNumFlights();

            console.log('numFlights: ' + numFlights + ' State: ' + state);
            if (state === 'done' && numFlights > 0) {
                $('#search-results').empty();
                // Ojo al borrar esto, fijarse en el último if else
                $('#results-messages').empty();
                $('#search-results-space').removeClass('hidden');
                $('#main').removeClass('hidden');
                var flights = searchResults.getFlights();
                var flightCount = 0;
                var airlineLogos = searchResults.getAirlineLogos();
                var flightViews = [];

                for (var i = 0; i < flights.length; i += 1) {
                    flightViews.push(
                        new FlightView({
                            flight: flights[i],
                            airline_logos: airlineLogos,
                        })
                    );
                }

                for(i = 0; i < flights.length; i += 1) {
                    flightViews[i].render();
                    this.listenTo(flightViews[i], 'change', this.flight_selected);
                }
            } else if (state === 'busy' || state === 'failed') {
                $('#main').addClass('hidden');
            } else if (numFlights === 0 && state === 'done') {
                console.log('no encontré ningún vuelo');
                $('#main').removeClass('hidden');
                $('#search-results').empty();
                $('#search-results-space').addClass('hidden');
                $('#results-messages').html('<h3>No se encontraron resultados</h3> <p>Por favor, cambia los filtros o realiza una nueva búsqueda.</p>');
            }
        },
        flight_selected: function(flightId) {
            $('#confirmationModal').empty();
            new ConfirmationModal({
                el: '#confirmationModal',
                model: this.model,
                flight_id: flightId,
            });
        },
        filterActivated: function(params) {
            params.handler(this, params.data);
        }
    });

    FlightView = Backbone.View.extend({
        render: function() {
            var flight = this.options.flight;
            var inboundRoutes = (flight.inboundRoutes)? flight.inboundRoutes[0]: undefined;
            var outboundRoutes = flight.outboundRoutes[0];
            var airline_logos = this.options.airline_logos;
            var flight_id = flight.outboundRoutes[0].segments[0].flightId;
            var ticket_price = flight.price.total.total;

            var $view;
            var newDiv = $('<div class="vuelo"></div>');
            var flightDetails = $('#flight-details').html();

            var flightDetailsString = '';
            var params;

            $('#search-results').append(newDiv);
            this.setElement(newDiv);


            for (var i = 0; i < outboundRoutes.segments.length; i += 1) {
                params = this.getDetailsParams(
                    outboundRoutes.segments[i], airline_logos, 'Ida'
                );
                flightDetailsString += _.template(flightDetails, params);
            }
            if (inboundRoutes) {
                flightDetailsString += '<hr />';
                for (i = 0; i < inboundRoutes.segments.length; i += 1) {
                    params = this.getDetailsParams(
                        inboundRoutes.segments[i], airline_logos, 'Regreso'
                    );
                    flightDetailsString += _.template(flightDetails, params);
                }
            }

            var outboundParams = this.getFlightParams(
                outboundRoutes.segments[0], ticket_price, airline_logos
            );
            outboundParams.extra_class = 'right-divider';

            if (inboundRoutes) {
                var inboundParams = this.getFlightParams(
                    inboundRoutes.segments[0], ticket_price, airline_logos
                );
                inboundParams.extra_class = '';

                outboundRoutes = _.template($('#flight-view-template').html(), outboundParams);
                inboundRoutes = _.template($('#flight-view-template').html(), inboundParams);
                $view = outboundRoutes + inboundRoutes;
                $('#results-titles').removeClass('hidden');
            } else {
                $('#ida').removeClass('span4').addClass('span6 text-center');
                $('#regreso').removeClass('span4').addClass('hidden');
                $('#precio').removeClass('span4').addClass('span6 text-center');
                $('#results-titles').removeClass('hidden');
                $view = _.template($('#outbound-only-template').html(), outboundParams);
            }
            var ticketPricePart = _.template($('#flight-view-price').html(), {ticket_price: Math.round(ticket_price)});
            $view = $('<div class="row-fluid"></div>').html($view + ticketPricePart);
            this.$el.html($view);

            var flightViewFooter = _.template(
                $('#flight-view-footer-template').html(), {flight_id: flight_id}
            );
            var modalDetailsWindow = _.template(
                $('#flight-result-template').html(), {flight_id: flight_id}
            );
            var modalDetailsWindowHeader = _.template(
                $('#flight-details-modal-window-header').html(), {}
            );
            this.$el.append(flightViewFooter);
            this.$el.append(modalDetailsWindow);

            $('#' + flight_id).prepend(flightDetailsString);
            $('#' + flight_id).prepend(modalDetailsWindowHeader);
            if (!inboundRoutes) {
                // Corrijo la posición de los precios para vuelos de sólo ida.
                $('.priceSpan').removeClass('span4').addClass('span6');
            }
        },

        getDetailsParams: function(segment, airline_logos, title) {
            return {
                airline_logo_link: airline_logos[segment.airlineId].logo,
                airline_name: segment.airlineName,
                departure_time: formatDate(segment.departure.date),
                depart_airport_name: segment.departure.airportDescription,
                depart_airport_code: segment.departure.airportId,
                arrival_time: formatDate(segment.arrival.date),
                arrival_airport_name: segment.arrival.airportDescription,
                arrival_airport_code: segment.arrival.airportId,
                flight_duration: segment.duration,
                flight_id: segment.flightId,
                cabin_type: getCabinType(segment.cabinType),
                stopovers: segment.stopovers.length,
                title: title,
            };

        },
        getFlightParams: function(segment, ticketPrice, airline_logos) {
            return {
                flight_id: segment.flightId,
                airline_logo_link: airline_logos[segment.airlineId].logo,
                airline_name: segment.airlineName,
                ticket_price: Math.round(ticketPrice),
                datetime_departure: formatDate(segment.departure.date),
                datetime_arrival: formatDate(segment.arrival.date),
                flight_duration: segment.duration,
                stopovers: segment.stopovers.length,
                duration: segment.duration,
            };

        },
        events: {
            "click .select-button": "selected"
        },
        selected: function() {
            var flight = this.options.flight;
            var flightId = flight.outboundRoutes[0].segments[0].flightId;
            this.trigger('change', flightId);
        },
        genTemplateParams: function() {

        }
    });
}());
