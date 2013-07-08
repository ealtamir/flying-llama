$(document).ready(function(){

    var months= new Array();
    var options = {
    pattern: 'mm-yy', // Default is 'mm/yyyy' and separator char is not mandatory
    startYear: new Date().getFullYear(),
    monthNames: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    };

    $('#ccfecha').monthpicker(options);

});