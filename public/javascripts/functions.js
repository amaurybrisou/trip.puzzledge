window.onload = function() {

  function getTwits() {
    var xmlhttp;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }


    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

        document.getElementById("twits").innerHTML = xmlhttp.responseText;
      }
    }

    xmlhttp.open("GET", "/twits", true);
    xmlhttp.send();
  }

  function getWord() {
    var xmlhttp;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }


    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

        var data = JSON.parse(xmlhttp.responseText);

        if (data.Words != undefined) {

          $("#word").html(data.Words[0].Word);
          $("#word").attr('href', "https://wordreference.com/" + data.Words[0].Language.toLowerCase() + "fr/" + data.Words[0].Word);
          $('#word').attr('title', data.Words[0].Pos + ', ' + data.Words[0].Definition);
          $("#word").tooltip({
            tooltipClass: 'word_tooltip',
            position: {
              my: "left center",
              at: "left bottom+10",

            }
          });
        }
      }
    }

    xmlhttp.open("GET", "http://localhost:8083/words/random", true);
    xmlhttp.send();

  }

  getWord();
  // getTwits();
}