Persistent = Backbone.Model.extend({
    initialize: function(attributes, options) {
        if (options !== undefined &&
            options.cookie !== undefined) {
            this.attachCookie(options.cookie);
            this.set(attributes, "silent");
        }
    },
    cookieSave: function(cookieName) {
        $.cookie(cookieName, JSON.stringify(this.toJSON()));
        //console.log($.cookie());
        //console.log('cookie read');
    },

    cookieLoad: function(cookieName) {
        var data = $.cookie(cookieName);
        this.set(_.clone(this.defaults), "silent");
        if (data !== undefined) {
            this.set($.parseJSON(data), "silent");
            this.restoreDates();
            this.trigger("change");
        }
            //this.set(eval("(" + data + ")"));
    },

    attachCookie: function(cookieName) {
        this.cookieLoad(cookieName);
        this.on("change", function() {
            this.cookieSave(cookieName);
        });
    },

    restoreDates: function () {},

    cookieOnChange: function(cookieName) {
        this.on("change", function() {
            this.cookieSave(cookieName);
        });
    }
});

//function formatPrice(number) {
//    return 'U$S' + parseInt(number, 0).split('.')[0];
//}
function formatDate(s) {
    var time = s.substring(11, 16);
    var date = s.substring(0, 10);
    time = time.split(':');
    date = date.split('-');
    return time[0] + ':' + time[1] +
        ' - ' + date[2] + '/' + date[1] +
        '/' + date[0];
}

// Gets time in minutes from a string of format HH:MM
function getMinutes(s) {
    var results = s.split(':');
    return results[0]*60 + results[1];

}

function ISOStringTrimHHmm(d) {
    return d.toISOString().substring(11, 16);
}

function ISOStringTrimDate(d) {
    return d.toISOString().substring(0, 10);
}

function restoreDate(s) {
    if (s !== undefined) {
        return new Date(s);
    } else {
        return undefined;
    }

}
getCabinType = function(cabinType) {
    if (cabinType === 'ECONOMY') return 'Turista';
    if (cabinType === 'BUSINESS') return 'Business';
    if (cabinType === 'FIRST_CLASS') return 'First Class';
    return null;
};

SearchParams = Persistent.extend({
    defaults: {
        from: {id: '', name: ''},
        to: {id: '', name: ''},
        dep_date: undefined,
        ret_date: undefined,
        passengers: {adults: 1, children: 0, infants: 0},
        airline: {id: undefined, name: undefined},
        cabin_type: undefined,
        min_price: undefined,
        max_price: undefined,
        stopovers: undefined,

        min_dep_time: undefined,
        max_dep_time: undefined,
        min_ret_time: undefined,
        max_ret_time: undefined,

        page: 1,
        page_size: 7,
        sort_key: 'total',
        sort_order: 'asc'
    },

    classNames: {
        any: "Cualquiera",
        ECONOMY: "Turista",
        BUSINESS: "Ejecutiva",
        FIRST_CLASS: "Primera Clase"
    },


    restoreDates: function () {
        this.set({
            dep_date: restoreDate(this.get("dep_date")),
            ret_date: restoreDate(this.get("ret_date"))
        });
    },

    clearFilters: function() {
        this.set({
            airline: this.defaults.airline,
            min_price: this.defaults.min_price,
            max_price: this.defaults.max_price,
            stopovers: this.defaults.stopovers,
            min_dep_time: this.defaults.min_dep_time,
            max_dep_time: this.defaults.max_dep_time,
            min_ret_time: this.defaults.min_ret_time,
            max_ret_time: this.defaults.max_ret_time
        }, "silent");
    },

    clearOrdering: function() {
        this.set({
            page: this.defaults.page,
            page_size: this.defaults.page_size,
            sort_key: this.defaults.sort_key,
            sort_order: this.defaults.sort_order
        }, "silent");
    },


    getAPIData: function () {

        var data = this.toJSON();


        // alert(this.getType());

        switch (this.getType()) {
            case "oneway":
                data.method = "GetOneWayFlights";
                break;
            case "roundtrip":
                data.method = "GetRoundTripFlights2";
                break;
            default:
                throw "Undefined trip type";
        }

        data.from = data.from.id;
        data.to = data.to.id;

        data.airline_id = data.airline.id;
        data.airline = undefined;

        data.adults = data.passengers.adults;
        data.children = data.passengers.children;
        data.infants = data.passengers.infants;

        data.passengers = undefined;

        if (data.dep_date !== undefined)
            data.dep_date = ISOStringTrimDate(data.dep_date);

        if (data.ret_date !== undefined)
            data.ret_date = ISOStringTrimDate(data.ret_date);

        if (data.cabin_type === "any")
            data.cabin_type = undefined;

        return data;

    },

    getType: function() {
        if (this.get("ret_date") === undefined) {
            return "oneway";
        } else {
            return "roundtrip";
        }
    },

    getClassName: function() {
        if (this.get("cabin_type") === undefined) {
            return this.classNames.any;
        } else {
            return this.classNames[this.get("cabin_type")];
        }

    },

    validate: function() {
        if (this.get("from").id === '' ||
            this.get("to").id === '' ||
            this.get("dep_date") === undefined)
                return 'Missing fields';
    },

    getSortData: function() {
        return {
            sort_key: this.get('sort_key'),
            sort_order: this.get('sort_order')
        };
    },
    initialize: function(attributes, options) {
        Persistent.prototype.initialize.apply(this, [attributes, options]);
        this.clearFilters();
    }


});

SearchResults = Backbone.Model.extend({
    defaults: {
        state: "done",
        searchParams: new SearchParams(),
        data: null,
        timeout: 10000
    },

    initialize: function() {
        var searchParams = this.get("searchParams");

        this.on("change:searchParams", function() {
            this.listenTo(this.get("searchParams"), "change", this.update);
            this.stopListening(this.previous("searchParams"));
            this.update();
        });

        // this.on("change", function () {
        //     if (this.get("state") != "busy")
        //         console.log(JSON.stringify(this));
        // });

        this.on("change:state", function() {
            this.trigger("state:" + this.get("state"));
        });

        this.listenTo(this.get("searchParams"), "change", this.update);
        this.update();
    },

    update: function() {

        if (this.get("searchParams").isValid()) {


            if (this.xhr !== undefined)
                this.xhr.abort();

            this.xhr = $.ajax({
                url: "http://eiffel.itba.edu.ar/hci/service2/Booking.groovy",
                dataType: "jsonp",
                data: this.get("searchParams").getAPIData(),
                timeout: this.get("timeout")
            });

            var results = this;

            results.set({state: "busy"});

            this.xhr.done(function(data) {
                if (data.error === undefined) {
                    results.set({data: data}, "silent");
                    results.set({state: "done"});
                } else {
                    results.set({data: data}, "silent");
                    results.set({state: "failed"});
                }
            });

            this.xhr.fail(function() {
                results.set({state: "failed"});
            });
        }
    },

    cancel: function () {
        this.xhr.abort();
        this.set({state: "done"});
    },

    getType: function () {
        return this.get("searchParams").getType();
    },

    getFlights: function () {
        var data = this.get("data");
        if (data && data.flights)
            return _.clone(data.flights);
        else
            return [];
    },

    flightIsOneWay: function() {
        return true;
    },

    getFilters: function () {
        var data = this.get("data");
        if (data && data.filters) {
            return _.clone(data.filters);
        } else {
            return null;
        }
    },

    getAirlineLogos: function() {
        var data = this.get("data");
        if (data && data.filters) {
            var airlines = data.filters[0].values;
            var airline_data = {};
            var airline;
            for(var i = 0; i < airlines.length; i += 1) {
                airline = airlines[i];
                airline_data[airline.id] = {
                    name: airline.name,
                    logo: airline.logo
                };
            }
            return airline_data;
        } else {
            return null;
        }
    },

    getNumFlights: function () {
        var data = this.get("data");
        console.log(data);
        if (data !== undefined && data.flights)
            return data.total;
        else
            return 0;
    },

    getAirlineNames: function() {
        var dict = this.getAirlineLogos();
        var names = [];
        for(var obj in dict) {
            names.push({
                id: obj,
                name: dict[obj].name
            });
        }
        return names.sort(function(a, b) {
            if (a.name < b.name) { return -1; }
            if (a.name > b.name) { return 1; }
            return 0;
        });
    },

    getFlightById: function(id) {
        if (id) {
            var flights = this.getFlights();
            var numFlights = this.getNumFlights();
            for (var i = 0; i < numFlights; i += 1) {
                var flight_id = flights[i].outboundRoutes[0].segments[0].flightId;
                if(flight_id === id)
                    break;
            }
            if (i !== numFlights)
                return flights[i];
        }
        return null;
    },
    getCabinType: function(cabinType) {
        if (cabinType === 'ECONOMY') return 'Turista';
        if (cabinType === 'BUSINESS') return 'Business';
        if (cabinType === 'FIRST_CLASS') return 'First Class';
        return null;
    }
});
TripData = Persistent.extend({
    defaults: {
        price: {
            adults: {
                baseFare: 0,
                quantity: 0
            },
            children: {
                baseFare: 0,
                quantity: 0
            },
            infants: {
                baseFare: 0,
                quantity: 0
            },
            total: {
                charges: 0,
                taxes: 0,
                fares: 0,
                total: 0
            }
        },
        outboundRoutes: [
            {
                segments: [
                    {
                        arrival: undefined,
                        departure: undefined,
                        flightId: 0,
                        airlineId: 0,
                        airlineName: "",
                        arilineRating: 0,
                        duration: "",
                        stopovers: []
                    }
                ],
                duration: ""
            }
        ],
        inboundRoutes: undefined

    },

    getType: function () {
        if (this.get("inboundRoutes") === undefined)
            return "oneway";
        else
            return "roundtrip";
    },

    getIds: function () {
        var ids = [];
        ids.push(this.get("outboundRoutes")[0].segments[0].flightId);
        if (this.getType() === "roundtrip") {
            ids.push(this.get("inboundRoutes")[0].segments[0].flightId);
        }
    }
});
