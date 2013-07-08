var cities = new Array();
var citiesAndCountryIDMap = {};
$(document).ready(function() {

	$(".wait-geodata").css("visibility", "hidden");
	$.ajax({
        url:"http://eiffel.itba.edu.ar/hci/service2/Geo.groovy?method=GetCities&page_size=40",
		dataType: "jsonp",
		jsonpCallback: "fillCities",
    });

	$( ".autocomplete" ).attr("autocomplete", "off");
	$( ".autocomplete" ).typeahead({
    	source: cities,
    	minLength: 3,
    	items: 4
	});
});

function validCity(v) {
	return ($.inArray(v, cities) >= 0);
}

function fillCities(data){
	if(!data.hasOwnProperty("error")){
		for (var i=0;i<data['total'];i++){
			cities[i] = data['cities'][i]['name'];
			cities[i] = cities[i].replace("&#241;","ñ");
			citiesAndCountryIDMap[cities[i]] = {
				cityID: data['cities'][i]['cityId'],
				countryID: data['cities'][i]['countryID'],
				state: data['cities'][i]['name']
			};
		}
	}
	else{
		console.log(JSON.stringify(data));
	}
}