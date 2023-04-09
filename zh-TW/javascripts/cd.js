var countdowns = document.currentScript.getAttribute('data-countdowns');
var lang = document.currentScript.getAttribute('lang');

countdowns = JSON.parse(countdowns);

countdowns.forEach(function(countdowns) {
  var countDownDate = new Date(countdowns.date + " GMT+0800").getTime();
  var id = countdowns.id;

  var x = setInterval(function() {
    var now = new Date().getTime();
    var distance = countDownDate - now;
    var strIn = lang == "Ch" ? "還有 " : "in ";
    var strAgo = "";
    
    if (distance < 0) {
      distance = -distance;
      strIn = "";
      strAgo = lang == "Ch" ? " 前" : " ago";
    }

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    //var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    //var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    var Eng = days + "d " + hours + "h ";
    var Ch = days + " 日 " + hours + " 時 ";
  
    document.getElementById(id).innerHTML = strIn + (lang == "Ch" ? Ch : Eng) + strAgo;
  }, 1000);
});
