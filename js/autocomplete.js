var citiesAndAirports = new Array();
var citiesAndAirportsIDMap = {};

$(document).ready(function() {

	$(".wait-geodata").css("visibility", "hidden");

	$.ajax({
        url:"http://eiffel.itba.edu.ar/hci/service2/Geo.groovy?method=GetCities&page_size=40",
		dataType: "jsonp",
		jsonpCallback: "fillCities",
    });

	$( ".autocomplete" ).attr("autocomplete", "off");
	$( ".autocomplete" ).typeahead({
    	source: citiesAndAirports,
    	minLength: 3,
    	items: 4
	});
	
});

function validCityOrAirport(v) {
	return ($.inArray(v, citiesAndAirports) >= 0);
}

function cityOrAirportToID(v) {
	return (citiesAndAirportsIDMap[v]);
}

function fillCities(data){
	if(!data.hasOwnProperty("error")){
		for (var i=0;i<data['total'];i++){
			if (data['cities'][i]['hasAirport'] === 'Y') {
				citiesAndAirports[i] = data['cities'][i]['name']+" ("+data['cities'][i]['cityId']+")";
				citiesAndAirports[i] = citiesAndAirports[i].replace("&#241;","ñ");
				citiesAndAirportsIDMap[citiesAndAirports[i]] = data['cities'][i]['cityId'];
			}
		}
	}else{
		console.log(JSON.stringify(data));
	}
	$.ajax({
	    url:"http://eiffel.itba.edu.ar/hci/service2/Geo.groovy?method=GetAirports&page_size=52",
		dataType: "jsonp",
		jsonpCallback: "fillAirports",
    });
}

function fillAirports(data){
	if(!data.hasOwnProperty("error")){
		for (var i = citiesAndAirports.length, j=0; j<data['total']; j++,i++){
			citiesAndAirports[i] = data['airports'][j]['description']+" ("+data['airports'][j]['airportId']+")";
			citiesAndAirports[i] = citiesAndAirports[i].replace("R\uFFFD","Ri");
			citiesAndAirports[i] = citiesAndAirports[i].replace("\uFFFD","ñ");
			citiesAndAirportsIDMap[citiesAndAirports[i]] = data['airports'][j]['airportId'];
		}

		$(".wait-geodata").css("visibility", "visible");

	}else{
		console.log(JSON.stringify(data));
	}
}

function getCitiesAndAirportsArray(){
	return citiesAndAirports;
}
