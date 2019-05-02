$(document).ready(function(){

  console.log("nimportequoi2");
  $("#DL").click(function(){
  data = {"login":'log',"bd":'passwords'};

    $.ajax({
      type:'POST',
      url:'http://192.168.99.100:8080/monCoffre/moncoffre/login',
      data:JSON.stringify(data),
      dataType:'text',
      contentType:'application/json',// OBLIGATOIRE !!!!!!!!!!!
      // accepts: "*/*",
      success:function(json,status){
        // crée la table html
        // alert(json);
        var ch = '<table class="table"><thead><tr><th scope="col">#</th>'
        ch = ch + '<th scope="col">Site</th><th scope="identifiants">Crypto</th>'
        ch = ch + '</tr></thead>';
        var myobj = JSON.parse(json);
        if (myobj.triplets.length > 0){
          for (var i=0; i<myobj.triplets.length; i++){
            // for each e€json e[i] devient un element de la table
            ch += '<tbody><tr><th scope="row">' + i + '</th><td>'
            ch += '<li class="list-group-item">' + myobj.triplets[i].site+'</td>';
            ch += '<td>' + myobj.triplets[i].crypto + '</td></tr>'
          }
          // fermeture des balise
          ch = ch+'</tbody></table>';
        }

        $('body').append(ch);
      },
      error:function(data,status){console.log("error POST"+data+" et "+status);}
    })
  })
});
