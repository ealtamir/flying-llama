
citiesAndAirportsArray=undefined;
$(document).ready(function() {
    $("input[class*='validate']").focus(function() {
      $(this).removeClass('error');
    });

    $("input[class*='validate']").blur(function() {
      postponeValidate($(this));
    });

    $(".validate-monthyear").focus(function() {
        $(".validate-monthyear").removeClass("error");
    });

    $(".cardbank-select").change(function() {
        $(".validate-seccode,.validate-creditcard").each(function () {
            if ($(this).val() !== "")
                editClasses($(this), isValid($(this)));
        });
    });

    $('[class*="birth-date"]').blur(function(){
      var parent = $(this).parent();
      var complete = true;
      if(!validateNotEmpty($(this))){
        $(this).addClass('error empty-error');
      }
    $(parent.children(':input')).each(function(){
        if($(this).val() === '')
          complete = false;
      });
      if(complete)
        validateBirthDate(parent);
    });

    $('[class*="birth-date"]').focus(function(){
        var parent = $(this).parent();
        $(this).removeClass('empty-error');
        $(parent.children(':input')).each( function() {
            if(!$(this).hasClass('empty-error'))
                $(this).removeClass('error');
        });
    });

});

    function postponeValidate(elem){
        setTimeout( function() {
            editClasses(elem,isValid(elem));
        }, 300);
    }

    function editClasses(elem,valid){
        if(valid){
            elem.removeClass('error');
            if(elem.hasClass('city') || elem.hasClass('date'))
                elem.addClass('ok');
        }
        else{
            if(elem.hasClass('city') || elem.hasClass('date'))
                elem.removeClass('ok');
            elem.addClass('error');
        }
    }


    function sameCity(elem) {
        var desde = $("#desde");
        var hasta = $("#hasta");
        var same_city = validCityOrAirport(desde.val()) && validCityOrAirport(hasta.val()) && desde.val() == hasta.val();
        if(!same_city){
            var opposite = elem.attr('id') == desde.attr('id')?hasta:desde;
            if(opposite.val() !== ''){
                var valid = validCityOrAirport(opposite.val());
                editClasses(opposite,valid);
                setErrorMessage(opposite,valid?"":"Seleccione una ciudad o un aeropuerto de la lista");
            }
        }
        return same_city;
    }

    function hideErrorMessage(elem){
        $('#'+elem.attr('id')+'-'+"message").addClass("hidden");
    }


    function setErrorMessage(elem, message){
        var p = $('#'+elem.attr('id')+'-'+"message");
            p.text(message);
            p.removeClass("hidden");
    }

    function validateCity(elem){
        var valid = true;
        if(sameCity(elem)){
            valid = false;
            setErrorMessage(elem,"El destino y el origen deben ser distintos");
        }
        else if(!validCityOrAirport(elem.val())){
            valid = false;
            setErrorMessage(elem,"Seleccione una ciudad o un aeropuerto de la lista");
        }
        else
            hideErrorMessage(elem);
        return valid;
    }

    function validateAddressCity(elem){
        var valid = elem.val() !== "" && validCity(elem.val());
        if(!valid)
            setErrorMessage(elem,"Seleccione una ciudad de la lista");
        else
            hideErrorMessage(elem);
        return valid;
    }

    function isCorrectDate(elem){
        var d = new Date();
        var currentMonth = d.getMonth()+1;
        var currentDay = d.getDate();
        var currentYear = d.getFullYear();

        var strDate = elem.val();
        //Declare Regex
        var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{2,4})$/;
        var dtArray = strDate.match(rxDatePattern); // is format OK?
        if (dtArray === null)
            return false;
        //Checks for mm/dd/yyyy format.
        dtDay = ((dtArray[1].length == 1) ? "0" : '' )+dtArray[1];
        dtMonth = ((dtArray[3].length == 1) ? "0" : '' )+dtArray[3];
        dtYear = ((dtArray[5].length == 2) ? "20" : '' )+dtArray[5];
        if(dtYear < currentYear)
            return false;
        else if(dtYear == currentYear && (dtMonth < currentMonth || (dtMonth == currentMonth && dtDay < currentDay)))
            return false;

        if(dtMonth.length == 1){
                dtMonth="0"+dtMonth;
            }
        if(dtYear.length == 2){
                dtYear="20"+dtYear;
            }
        if (dtMonth < 1 || dtMonth > 12)
            return false;
        else if (dtDay < 1 || dtDay> 31)
            return false;
        else if (dtDay ==31 && (dtMonth==4 || dtMonth==6 || dtMonth==9 || dtMonth==11))
            return false;
        else if (dtMonth == 2) {
            var isleap = (dtYear % 4 === 0 && (dtYear % 100 !== 0 || dtYear % 400 === 0));
            if (dtDay> 29 || (dtDay ==29 && !isleap))
                return false;
        }
        elem.val(dtDay + '/' + dtMonth + '/' + dtYear);
        return true;
    }

    function validateDate(elem){
        var valid = (elem.val() !== "" && isCorrectDate(elem));
        if(valid && elem.attr('id') == 'vuelta-datepicker'){
            var newDate = $("#ida-datepicker").datepicker('getDate');
            if (newDate) { // Not null
                if(newDate >= elem.datepicker('getDate')) {
                    valid=false;
                }
            }
        }
        return valid;
        /*if(valid && elem.attr('id') == 'ida-datepicker'){
            var newDate = elem.datepicker('getDate');
            if(newDate >= $("#vuelta-datepicker").datepicker('getDate')) {
                $("#vuelta-datepicker").val('');
            }
        }*/
    }

    function validateEmail(elem){
        var email = elem.val();
        var rxEmailPattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
        return rxEmailPattern.test(email);
    }

    function validateNotEmpty(elem){
        return (elem.val() !=='');
    }

    function validateCreditCardNumber(elem){
        var t = $("#ccvisa").val();
        var start = elem.val().substr(0,2);
        var valid;
        switch(t) {
            case 'American Express':
                valid = (start == "34" || start == "37") && elem.val().length == 15;
                break;
            case 'Diners':
                valid = start == "36" && elem.val().length == 16;
                break;
            case 'MasterCard':
                valid = (start == "51" || start == "52" || start == "53") && elem.val().length == 16;
                break;
            case 'Visa':
                start = elem.val().substr(0,1);
                valid = start == "4" && (elem.val().length == 13 || elem.val().length == 16);
                break;
        }
        return valid;
    }
    function validateCreditCardSecCode(elem){
        var t = $("#ccvisa").val();
        var valid;
        switch(t) {
            case 'American Express':
                valid = elem.val().length == 4;
                break;
            default:
                valid = elem.val().length == 3;
                break;
        }
        return valid;
    }


    function checkAge(bornDay,bornMonth,bornYear,passengerType){
        var d = new Date();
        var currentMonth = d.getMonth()+1;
        var currentDay = d.getDate();
        var currentYear = d.getFullYear();
        var age = currentYear - bornYear - (((bornMonth == currentMonth) && (bornDay > currentDay))?1:(bornMonth>currentMonth)?1:0);
        var ageOK = true;
        switch(passengerType) {
            case "adulto":
                ageOK = age>=12;
                break;
            case 'niño':
                ageOK = age>=2 && age<12;
                break;
            case 'infante':
                ageOK = age<2;
                break;
        }
        return ageOK;
    }

    function validateBirthDate(elem){
        var day = elem.children('.day').val();
        var month = elem.children('.month').val();
        var year = elem.children('.year').val();
        var validDay = day !== '';
        var validMonth = month !== '';
        var validYear = year !== '';
        if (month < 1 || month > 12)
            validMonth = false;
        else if (day < 1 || day> 31)
            validDay = false;
        else if (day === 31 &&
                (month === 4 || month === 6 || month === 9 || month === 11)) {
            validDay = false;
            validMonth = false;
        }
        else if (month === 2) {
            var isleap = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
            if (day> 29 || (day === 29 && !isleap)){
              validDay = false;
              validMonth = false;
              validYear = false;
            }
        }
        else {
            var d = new Date();
            var currentMonth = d.getMonth()+1;
            var currentDay = d.getDate();
            var currentYear = d.getFullYear();
            if(year > currentYear || (year == currentYear && (month > currentMonth || (month == currentMonth && day > currentDay)))){
                validDay = false;
                validMonth = false;
                validYear = false;
            }
        }

        /*
        var passengerType = elem.parent().parent().parent().children('#passengertitle').text();
        passengerType = passengerType.slice(1,passengerType.length-2).toLowerCase();
        if(!checkAge(day,month,year,passengerType)){
            validDay = false;
            validMonth = false;
            validYear = false;
            //setErrorMessage(elem.attr('id'),"La fecha de nacimiento no se corresponde con el tipo de pasajero");
            alert("validation.js line 286:\nLa fecha de nacimiento no se corresponde con el tipo de pasajero");
        }
        else
            hideErrorMessage(elem.attr('id'));
        */
        validDay ? elem.children('.day').removeClass('error')
            : elem.children('.day').addClass('error');
        validMonth ? elem.children('.month').removeClass('error')
            : elem.children('.month').addClass('error');
        validYear ? elem.children('.year').removeClass('error')
            : elem.children('.year').addClass('error');
        return validDay && validMonth && validYear;

    }

    function validateBirthDateNotEmpty(elem){
      var complete = true;
      $(elem.children(':input')).each(function(){
          if( $(this).val() === '')
          complete = false;
      });

      if(!complete){
          $(elem.children(':input')).each(function(){
              $(this).addClass('error');
              $(this).removeClass('empty-error');
          });
      }
      return complete;
    }

    function isValid(elem){
        var valid = true; // Por default es valido. Si no tiene validacion, es siempre valido
        if(elem.hasClass('date'))
            valid = validateDate(elem);
        else if(elem.hasClass('city'))
            valid = validateCity(elem);
        else if(elem.hasClass('empty'))
            valid = validateNotEmpty(elem);
        else if(elem.hasClass('seccode'))
            valid = validateCreditCardSecCode(elem);
        else if(elem.hasClass('email'))
            valid = validateEmail(elem);
        else if(elem.hasClass('creditcard'))
            valid = validateCreditCardNumber(elem);
        else if(elem.hasClass('address-city'))
            valid = validateAddressCity(elem);
        else if(elem.hasClass('birth-date'))
            valid = validateBirthDateNotEmpty(elem);
        return valid;
    }
