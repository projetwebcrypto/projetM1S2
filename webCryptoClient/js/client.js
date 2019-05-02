$(document).ready(function(){

  console.log("nimportequoi2");
  $("#DL").click(function(){


    $.ajax({
      type:'GET',
      url:'http://0.0.0.0:8080/myapp/chiens',// url serveur depot
      data:{"{ 'login' : log, 'bd' : passwords}"},
      dataType:'json',
      //beforeSend :function(){
      success:function(res){
        // crée la table html
        var ch = '<table class="table"><thead><tr><th scope="col">#</th>'
        ch += '<th scope="col">Site</th><th scope="Identifiants">Last</th>'
        ch += '</tr></thead>';
        console.log(res);
        if (res.length > 0){
          for (var i=0; i<res.length; i++){
            // for each e€res e[i] devient un element de la table
            ch += '<tbody><tr><th scope="row">' + i+1 + '</th><td>'
            ch += '<li class="list-group-item">' + res[i].site+'</td>';
            ch += '<td>' + res[i].crypto + '</td></tr>'
          }
          // fermeture des balise
          ch += '</tbody></table>';
        }

        $('body').append(ch);
      },
      error:function(){$('bd').html("");}
    })
  })
});
