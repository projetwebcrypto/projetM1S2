$(document).ready(function(){
  /*
  * Ecoutons l'évènement click()
  */
  // function getXMLHttpRequest() {
  // 	var xhr = null;
  // 	if (window.XMLHttpRequest || window.ActiveXObject) {
  // 		if (window.ActiveXObject) {
  // 			try {
  // 				xhr = new ActiveXObject("Msxml2.XMLHTTP");
  // 			} catch(e) {
  // 				xhr = new ActiveXObject("Microsoft.XMLHTTP");
  // 			}
  // 		} else {
  // 			xhr = new XMLHttpRequest();
  // 		}
  // 	} else {
  // 		alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
  // 		return null;
  // 	}
  // 	return xhr;
  // }

  console.log("nimportequoi2");
  $("#DL").click(function(){
    $.ajax({
      type:'GET',
      url:'http://192.168.99.100:8080/myapp/chiens',
      data:{}, //'utilisateur=' + nom_user
      dataType:'json',
      beforeSend :function(){$('bd').html("<img src='img/wait.gif'>");},
      success:function(res){
        console.log("rentre dans success");
        var ch ='';
        if (res.length > 0){
          for (var i=0; i<res.length; i++){
            ch += '<option>'+res[i].nom+'</option>';
            console.log(res[i]);
          }
          // à modifier
          ch = '<select name="villes">'+ch+'</select>';
        }
        console.log(ch);
        $('bd').html(ch);
      },
      error:function(){$('bd').html("");}
    })
  })
});
