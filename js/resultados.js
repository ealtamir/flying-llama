
$(function() {
    var searchParams = new SearchParams({}, {cookie: "search_params"});
    var searchView = new SearchView({searchParams: searchParams});
    var searchSummaryView = new SearchSummaryView({searchParams: searchParams});
    var searchResults = new SearchResults({searchParams: searchParams});

    var filters = [
        {
            obj: $('#slider-range'),
            handler: function(view, params) {
                view.defaults.filterState['slider-range'] = params;
                console.log(view.defaults.filterState);
            },
            init: function(params) {
                var response = {data: null, handler: this.handler};
                $("#price-range").text("$" + 0 + " - $" + 100000);
                this.obj.slider({
                    range: true,
                    min: 0,
                    max: 100000,
                    step: 1000,
                    values: [0, 100000],
                    slide: function(event, ui) {
                        $("#price-range").text("$" + ui.values[0] + " - $" + ui.values[1]);
                        response.data = ui;
                        params.view.eventResponse(response);
                    }
                });
            }
        },
        {
            obj: $('#airline-filter'),
            handler: function(view, params) {
                // params => Nombre de la aerolínea.
                view.defaults.filterState['airline-filter'] = params;
                console.log(view.defaults.filterState);
            },
            init: function(params) {
                var response = {data: null, handler: this.handler};
                var airlines = params.model.getAirlineNames();
                var $hook = $('#airline-filter #airline-filter-default');
                var str = '';
                var obj = this.obj;


                for(var i = 0; i < airlines.length; i += 1) {
                    str += '<option value="' + airlines[i].id + '">' + airlines[i].name + '</option>';
                }
                $hook.after(str);
                obj.change(function() {
                    var airlineId = obj.val();
                    for(i = 0; i < airlines.length; i += 1) {
                        if (airlines[i].id === airlineId)
                            break;
                    }
                    if(i === airlines.length) {
                        response.data = undefined; // No se eligió ninguna aerolínea
                    } else {
                        response.data = airlines[i];
                    }
                    params.view.eventResponse(response);
                });
            },
        },
        {
            obj: $('#spinner'),
            handler: function(view, params) {
                view.defaults.filterState.spinner = params;
                console.log(view.defaults.filterState);
            },
            init: function(params) {
                var response = {data: null, handler: this.handler};
                this.obj.spinner({
                    min: 0,
                    max: 10,
                    spin: function(event, ui) {
                        response.data = ui;
                        params.view.eventResponse(response);
                    }
                });
            }
        },
        {
            obj: $('#time-filter'),
            handler: function(view, params) {
                var interval = params.split('-');
                if (interval.length === 2) {
                    interval = { min: interval[0], max: interval[1] };
                } else {
                    interval = undefined;
                }
                view.defaults.filterState['time-filter'] = interval;
                console.log(view.defaults.filterState);
            },
            init: function(params) {
                var response = {data: null, handler: this.handler};
                var obj = this.obj;
                this.obj.change(function() {
                    response.data = obj.val();
                    params.view.eventResponse(response);
                });
            }
        },
        {
            obj: $('#filter-button'),
            handler: function(view, params) {
                var searchResults = params;
                var filterState = view.defaults.filterState;
                var filters = {
                    min_price: (filterState['slider-range'])? filterState['slider-range'].values[0]: 0,
                    max_price: (filterState['slider-range'])? filterState['slider-range'].values[1]: 10000,
                    stopovers: (filterState.spinner)? filterState.spinner.value : 0,
                    min_dep_time: (filterState['time-filter'])? filterState['time-filter'].min + ':00': '00:00',
                    max_dep_time: (filterState['time-filter'])? filterState['time-filter'].max + ':00': '23:00',
                    airline: (filterState['airline-filter'])? filterState['airline-filter']: {id: undefined, name: undefined},
                    page: 1
                };
                console.log('button clicked');
                console.log(filters);
                searchResults.get('searchParams').set(filters);
            },
            init: function(params) {
                var response = {data: params.model, handler: this.handler};
                var obj = this.obj;
                this.obj.click(function() {
                    params.view.eventResponse(response);
                });
            }
        }
    ];

    //
    //  Instancio la vista de resultados!
    //
    var resultsView = new FlightResultsView({
        model: searchResults,
        filtersList: filters,
    });


    $('#filters-panel').bind('affixed', function() {
        console.log('element got affixed');
    });
    $('#filters-panel').bind('unaffixed', function() {
        console.log('element got unaffixed');
    });
    $("#change-btn").click(function(){
        $("#search-div").fadeIn("fast");
        $("#change-btn").removeClass("visible");
        $("#change-btn").addClass("non-visible");
    });

    $("#hide-btn,#search-submit").click(function(){
        $("#search-div").fadeOut("fast");
        $("#change-btn").addClass("visible");
        $("#change-btn").removeClass("non-visible");
    });
});
