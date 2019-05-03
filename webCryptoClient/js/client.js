
// variables de verification de support d'IndexedDB
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

// Test de support d'IndexedDB
if (!window.indexedDB) {
  window.alert("Votre navigateur ne supporte pas une version stable d'IndexedDB. Quelques fonctionnalités ne seront pas disponibles.")
}

var db;

function createDb() {
  console.log("Init openDb ...");

  // Version 3 car seul chromium semble marcher à la fac, et uniquement sur cette version
  var request = window.indexedDB.open("MyTestDatabase", 3);

  // fonction lancee si le demarrage reussit
  request.onsuccess = function (event) {
    db = this.result;
    console.log("Creation: " + db);
    alert("Creation reussie");
  };

  request.onerror = function(event) {
    alert("Erreur onerror:" + event.target.errorCode);
  };

  // fonction lancee
  request.onupgradeneeded = function(event) {
    var store = event.currentTarget.result.createObjectStore("Triplet", {keyPath: "Website"});
    store.createIndex("Website", "Website", { unique: true, multiEntry: true});
  };
}

createDb();

$(document).ready(function(){

  // Initialisation des entrées, et les cache de base.
  $( "#add-buttons" ).hide();

  // Test de raffraichissement en live de la bd
  function getObjectStore(store_name, mode){
    // console.log("Avant la transaction: " + store_name + " " + mode);
    // console.log(db);
    var tx = db.transaction(store_name, mode);
    // console.log("Après la transaction");
    return tx.objectStore(store_name);
  }

  //Function qui lit un triplet danss la base de donnees
  function readTriplet(){
    var store =  getObjectStore('Triplet', 'readonly');
    var getdatas = store.getAll();
    getdatas.onsuccess = function(){
      // console.log(getdatas.result);
      addTable(getdatas.result);
    }
  }
  $("#add_tuple").click(function(){
    var website = document.getElementById("Website").value;
    var login = document.getElementById("Login").value;
    var password = document.getElementById("Password").value;
    addTriplet(website, login + password);
    readTriplet();
  });

  // ajoute les champs html pour saisie pseudo + mdp + site
  $("#ADD").click(function(){
    $( "#add-buttons" ).show();
  });

  // Fonction qui ajoute un triplet a la base de donnees
  function addTriplet(webs, crypt){
    var tuple = {"Website":webs, "crypto":crypt};
    var store = getObjectStore('Triplet', 'readwrite');
    var req;
    try {
      req = store.add(tuple);
    } catch (e) {
      console.log("Error In addTriplet : " + e);
      throw e;
    }
    req.onsuccess = function (evt){
      console.log("Insertion in DB successful");
      // displayActionSuccess();
      // displayPubList(store);
    };
    req.onerror = function(){
      console.log(this.error.name);
      if(this.error.message == "A mutation operation in the transaction failed because a constraint was not satisfied."){
        console.error("addTriplet error", this.error);
        alert("Tuple(s) déjà présent(s)");
        // displayActionFailure(this.error);
      };
    };
  }

  // Function traitement donnees vers html
  function addTable(myobj){
    // Effacement d'eventuels precedents affichage
    $("table").remove();

    // Initialisation des champs du tableau
    var tableau = '<table class="table"><thead><tr><th scope="col">#</th>';
    tableau += '<th scope="col">Site</th><th scope="identifiants">Crypto</th>';
    tableau += '</tr></thead>';
    for (var i=0; i<myobj.length; i++){
      tableau += '<tbody><tr><th scope="row">' + i + '</th><td>';
      tableau += '<li class="list-group-item">' + myobj[i].Website+'</td>';
      tableau += '<td>' + decodeURIComponent(myobj[i].crypto) + '</td></tr>'
    }
    // fermeture des balise
    tableau += '</tbody></table>';
    $("body").append(tableau);
  };
  // Telechargement BD

  $("#Affichage").click(function(){
    readTriplet();
  })

  $("#DL").click(function(){
    data = {"login":'log',"bd":'passwords'};
    var urlc = 'http://192.168.99.100:8080/monCoffre/moncoffre';
    $.ajax({
      type:'POST',
      url:urlc + '/login',
      data:JSON.stringify(data),
      dataType:'text',
      contentType:'application/json',
      // accepts: "*/*",
      success:function(json,status){
        // variable de stockage ( liste de données post traitement)
        // variable stockage d'un triplet
        var myobj = JSON.parse(json);
        if (myobj.triplets.length > 0){
          for (var i=1; i<myobj.triplets.length; i++){
            addTriplet(myobj.triplets[i].site, myobj.triplets[i].crypto);
          }
        }
        readTriplet();
      },
      error:function(data,status){console.log("error POST"+data+" status :  "+status);}
    })
  })
});
