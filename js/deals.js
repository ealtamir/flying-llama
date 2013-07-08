Fulldate = new Date();
day = Fulldate.getDate() +2;
month=Fulldate.getMonth()+1;

$(document).ready(function(){
	var city;
	var city_Id;
	var city_name;
	var radius=200;

	$.ajax({
			url: "http://freegeoip.net/json/",
			dataType: "jsonp",
			timeOut: 1000,

		}).done(function(data){
			city=data.city;
			var latitude=data.latitude.toString().substring(0,6);
			if(latitude>0){
				latitude=latitude.substring(0,5);
			}
			var longitude=data.longitude.toString().substring(0,6);
			if(longitude>0){
				longitude=longitude.substring(0,5);
			}
			// alert(latitude);
			// alert(longitude);
			$('#info-deal').append("<h5>Viaje El "+day+"/"+month+"/"+Fulldate.getFullYear()+"<br/> Desde "+city+"</h5>");

			$.ajax({
				url: "http://eiffel.itba.edu.ar/hci/service2/Geo.groovy?method=GetCitiesByPosition&latitude="+latitude+"&longitude="+longitude+"&radius="+radius,
				dataType: "jsonp",
				timeOut: 1000,

			}).done(function(data){
				var betterdistance=1000000000;
			
				function distance(longitud1, longitud2, latitud1, latitud2){
					return Math.pow((longitud1 - longitud2),2) +  Math.pow((latitud1 - latitud2),2) ;
				}

				for (var i = 0; i <= data.cities.length -1; i++) {
					var distance=distance(latitude,data.cities[i].latitude.toString().substring(0,6), longitude, data.cities[i].longitude.toString().substring(0,6));
					if(distance<betterdistance){
						betterdistance=distance;
						city_Id=data.cities[i].cityId;
						city_name=data.cities[i].name;
					}

				};

				$.ajax({
					url: "http://eiffel.itba.edu.ar/hci/service2/Booking.groovy?method=GetFlightDeals2&from="+city_Id,
					dataType: "jsonp",
					timeOut: 1000,

				}).done(function(data){
					if(data.deals.length==0){
						$('#deals-main').append('<div class="text-center"> No hay ofertas disponibles<br/></tr>');						
						$('.icon-spinner').remove();	
					}
					for (var i = 0; i < 6; i++) {
						$('#deals_div').append('<tr><td class="dealcity"><a href="#" class="deal">'+data.deals[i].cityName+' ('+data.deals[i].cityId+')</td><td>$'+data.deals[i].price+'</a></td></tr>');
					};
					for (var i = 8; i<13; i++) {
						$('#deals_div').append('<tr class="displaynone"><td class="dealcity"><a href="#" class="deal">'+data.deals[i].cityName+' ('+data.deals[i].cityId+')</td><td>$'+data.deals[i].price+'</a></td></tr>');
					};
						$('#deals-main').append('<a id="moredeals" class="pull-right"><i class="icon-plus"></i> Más</a>');
						$('#deals-main').append('<a id="lessdeals" class="displaynone pull-right"><i class="icon-minus"></i> Menos</a>');


						$('.deal').click(function(){
							var value=$(this).text();
							var mymonth;
							if(month<10){
								mymonth='0'+month;
							}else{
								mymonth=month;
							}
							var myday= day +'/'+mymonth+'/'+Fulldate.getFullYear(); 

							$('.desde').val(city_name+' ('+city_Id+')');
							$('.hasta').val(value);	
							$('.fechaida').val(myday);
							$('#one-way-button').click();
						});

						$('#moredeals').click(function(){
							$('#moredeals').hide();
							$('.displaynone').show();
						});

						$('#lessdeals').click(function(){
							$('.displaynone').hide();		
							$('#moredeals').show();
						});
				
						$('.icon-spinner').remove();			

				});
			});

		});
});