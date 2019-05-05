
// variables de verification de support d'IndexedDB
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

// Test de support d'IndexedDB
if (!window.indexedDB) {
  window.alert("Votre navigateur ne supporte pas une version stable d'IndexedDB. Quelques fonctionnalités ne seront pas disponibles.")
}

var crypto = window.crypto ;

if(crypto.subtle)
{
    alert("Cryptography API Supported");

}
else
{
    alert("Cryptography API not Supported");
}

function convertByteArrayToString(buffer)
{
  let data_view = new DataView(buffer);
  chaine ="" ;
  len = data_view.byteLength;
  for(i = 0; i < len; i++)
    {
        chaine += String.fromCharCode(data_view.getUint8(i));
    }

    return chaine;
}

function ascii(lettre)
{
  return lettre.charCodeAt(0);
}

function convertStringToByteArray(str)
{
  return Uint8Array.from(str.split('').map(ascii));
}

var db;
function openDb() {
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

openDb();
$(document).ready(function(){

  // Test de raffraichissement en live de la bd
  function getObjectStore(store_name, mode) {
    console.log("Avant la transaction: " + store_name + " " + mode);
    console.log(db);
    var tx = db.transaction(store_name, mode);
    console.log("Après la transaction");
    return tx.objectStore(store_name);
  }

  // Fonction qui ajoute un triplet a la base de donnees
  function addTripletTest(webs, crypt){
    var site = {"Website":webs, "crypto":crypt};
    var store = getObjectStore('Triplet', 'readwrite');
    var req;
    try {
      req = store.add(site);
    } catch (e) {
      console.log("In addTripletTest"+e);
      throw e;
    }
    req.onsuccess = function (evt) {
      console.log("Insertion in DB successful");
      // displayActionSuccess();
      // displayPubList(store);
    };
    req.onerror = function() {
      console.error("addTripletTest error", this.error);
      // displayActionFailure(this.error);
    };
  }

  // Function traitement donnees vers html
  function addTable(myobj){

    // Initialisation des champs du tableau

    var tableau = '<table class="table"><thead><tr><th scope="col">#</th>';
    tableau += '<th scope="col">Site</th><th scope="identifiants">Crypto</th>';
    tableau += '</tr></thead>';
    for (var i=1; i<myobj.triplets.length; i++){
      tableau += '<tbody><tr><th scope="row">' + i + '</th><td>';
      tableau += '<li class="list-group-item">' + myobj.triplets[i].site+'</td>';
      tableau += '<td id="crypto">' + decodeURIComponent(myobj.triplets[i].crypto) + '</td></tr>';
    }
    // fermeture des balise
    tableau += '</tbody></table>';
    $("body").append(tableau);
  };
  // Telechargement BD

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

          addTripletTest(myobj.triplets[i].site, myobj.triplets[i].crypto);

        }

      }

      addTable(myobj);
    },
    error:function(data,status){console.log("error POST"+data+" status :  "+status);}
  })

  })

  $("body").on("click", "td", function(){
    let cryptogrammeComplet = $(this).text();
    console.log(cryptogrammeComplet);
    console.log(cryptogrammeComplet.length);
    if (cryptogrammeComplet.length != 0) {
      // On extrait les infos du cryptogramme complet
      // Taille du ivChiffre 16
      let ivChiffre = convertStringToByteArray(cryptogrammeComplet.slice(0, 16));
      // Taille du sel 16
      let sel = convertStringToByteArray(cryptogrammeComplet.slice(16, 32));
      // Taille du chiffre le reste
      let chiffre = convertStringToByteArray(cryptogrammeComplet.slice(32));
      // Generation du IV a 0 pour faire du ECB en CBC 
      let ivZero = new Uint8Array(16);
      var mdp = "moncul";
      console.log("test");
      if (mdp.length != 0) {
        // Recuperation du mdp en tant que cle
        let promiseMat = crypto.subtle.importKey(
          "raw", 
          convertStringToByteArray(mdp), 
          {name: "PBKDF2"}, 
          false, 
          ["deriveKey"]
          );
        promiseMat.then(function(mat){
          // Derivation de la cle
          console.log("test2");
          let promiseKey = crypto.subtle.deriveKey(
            {"name":"PBKDF2", salt: sel, "iterations":10000, "hash":"SHA-1"}, 
            mat, 
            {"name":"AES-CBC", length:128}, 
            false, 
            ["decrypt"]
            );
          promiseKey.then(function(key) {
            // Dechiffrement de l'IV chiffre
            console.log("test3");
            let promiseIv = crypto.subtle.decrypt(
              {name: "AES-CBC", iv: ivZero}, 
              key, 
              ivChiffre);
            promiseIv.then(function(ivClair) {
              // Dechiffrement du chiffre
              console.log("test4");
              let promiseClair = crypto.subtle.decrypt(
                {name: "AES-CBC", iv: ivClair}, 
                key, 
                chiffre);
              promiseClair.then(function(clair) {
                // $("#texteresult").html("<tt>"+convertByteArrayToString(clair)+"</tt>");
                console.log(convertByteArrayToString(clair));
              })
            })
          })
        })
      }
    }
  })

});
