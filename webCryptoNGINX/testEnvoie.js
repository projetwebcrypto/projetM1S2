function balanceTout(){
  $.ajax({
    type:"POST",
    url: "192.168.99.100/envoie",
    // data:JSON.stringify(data),
    // dataType:"text",
    // contentType:"application/json",
    // accepts: "*/*",
    success:function(json,status){
      // console.log(json);
      alert("Envoie réussi");
    },
    error:function(data,status){
      alert("Echec de l'envoie");
      console.log("error POST"+data+" status :  "+status);
    }
  });
};

function upload(postUrl, fieldName, filePath)
{
  var formData = new FormData();
  formData.append(fieldName, new File(filePath));

  var req = new XMLHttpRequest();
  req.open("POST", postUrl);
  req.onload = function(event) { alert(event.target.responseText); };
  req.send(formData);
}
