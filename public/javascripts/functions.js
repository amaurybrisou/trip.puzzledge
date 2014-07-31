window.onload = function(){

  function getTwits(){
    var xmlhttp;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp=new XMLHttpRequest();
    } else {// code for IE6, IE5
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }


    xmlhttp.onreadystatechange=function() {
      if (xmlhttp.readyState==4 && xmlhttp.status==200){

        document.getElementById("twits").innerHTML=xmlhttp.responseText;
      }
    }

    xmlhttp.open("GET","/twits",true);
    xmlhttp.send();
  }

  function getWord(){
    var xmlhttp;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp=new XMLHttpRequest();
    } else {// code for IE6, IE5
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }


    xmlhttp.onreadystatechange=function() {
      if (xmlhttp.readyState==4 && xmlhttp.status==200){
        var data = JSON.parse(xmlhttp.responseText);
        document.getElementById("word").innerHTML = data.word;
        document.getElementById("word").setAttribute('href', "https://www.wordnik.com/words/"+data.word);
      }
    }

    xmlhttp.open("GET","http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=false&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5",true);
    xmlhttp.send();
    
  }

  getWord();
  getTwits();
}

