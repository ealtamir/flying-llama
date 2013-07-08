
$(function () {
	var searchParams = new SearchParams();
	var passengerData = new PassengerData();
    var tripData = new TripData();
	var passengerView;
	var searchSummaryView;

	searchParams.attachCookie("search_params");
	passengerData.attachCookie("passenger_data");
    tripData.attachCookie("trip_data");
	passengerData.forceConsistency(searchParams);

	searchSummaryView = new SearchSummaryView({searchParams: searchParams});

	passengerListView = new PassengerListView({
		searchParams: searchParams,
		passengerData: passengerData
	});

});
