var countdowns = document.currentScript.getAttribute('data-countdowns');
var lang = document.currentScript.getAttribute('lang');

countdowns = JSON.parse(countdowns);

countdowns.forEach(function(countdowns) {
  var countDownDate = new Date(countdowns.date + " GMT+0800").getTime();
  var id = countdowns.id;

  var x = setInterval(function() {
    var now = new Date().getTime();
    var distance = countDownDate - now;
    var strIn = lang == "Ch" ? "尚餘" : "in";
    strIn = "<span class=\"cdtext\">" + strIn + "</span>";
    var strAgo = "<span class=\"cdtext\">";
    
    if (distance < 0) {
      distance = -distance;
      strIn = "";
      strAgo += (lang == "Ch" ? "前" : "ago") + "</span>";
    }

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    var Eng = "";
    var Ch = "";

    if (days > 7) {
      Eng = days + "d";
      Ch = days + " 日";
    }
    else if (days > 0) {
      Eng = days + "d " + hours + "h";
      Ch = days + " 日 " + hours + " 時";
    }
    else {
      Eng = (hours > 0 ? hours + "h " : "") + minutes + "m" + (hours < 1 ? " " + seconds + "s" : "");
      Ch = (hours > 0 ? hours + " 時 " : "") + minutes + " 分" + (hours < 1 ? " " + seconds + " 秒" : "");
    }
  
    document.getElementById(id).innerHTML = strIn + " " + (lang == "Ch" ? Ch : Eng) + " " + strAgo;
  }, 1000);
});
