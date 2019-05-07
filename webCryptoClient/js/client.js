// variables de verification de support d'IndexedDB
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

// Test de support d'IndexedDB
if (!window.indexedDB){
  window.alert("Votre navigateur ne supporte pas une version stable d'IndexedDB. Quelques fonctionnalités ne seront pas disponibles.")
};

var crypto = window.crypto;


if(crypto.subtle){
  // alert("Cryptography API Supported");
}
else{
  alert("Cryptography API not Supported");
};

function convertByteArrayToString(buffer){
  let data_view = new DataView(buffer);
  chaine ="";
  len = data_view.byteLength;
  for(i = 0; i < len; i++){
    chaine += String.fromCharCode(data_view.getUint8(i));
  };
  return chaine;
};

function convertArrayBufferToHexa(buffer)
{
    var data_view = new DataView(buffer);
    var i, len, hex = '', c;

    len = data_view.byteLength;
    for(i = 0; i < len; i++)
    {
        c = data_view.getUint8(i).toString(16);
        if(c.length < 2)
        {
            c = '0' + c;
        }

        hex += c;
    }

    return hex;
}

function ascii(lettre){
  return lettre.charCodeAt(0);
};

function convertStringToByteArray(str){
  return Uint8Array.from(str.split('').map(ascii));
};


// variables à démarrer
var db;
var store;
var cryptogrammeComplet = "";

function createDb(){
  console.log("Init openDb ...");

  // Version 3 car seul chromium semble marcher à la fac, et uniquement sur cette version
  var request = window.indexedDB.open("MyTestDatabase", 3);

  // fonction lancee si le demarrage reussit
  request.onsuccess = function (event){
    db = this.result;
    console.log("Creation: " + db);
    alert("Creation reussie");
  };

  // fonction lancee si demarrage rate
  request.onerror = function(event){
    alert("Erreur onerror:" + event.target.errorCode);
  };

  // fonction lancee
  request.onupgradeneeded = function(event){
    store = event.currentTarget.result.createObjectStore("Triplet", {keyPath: "Website"});
    store.createIndex("Website", "Website", { unique: true, multiEntry: true});
  };
};

// fonction qui vérifie si les champs d' "ajouter un triplet" sont vides
function checkEmpty(){
  if((document.getElementById("Website").value !="") && (document.getElementById("Login").value!="") && (document.getElementById("Password").value!="")){
    document.getElementById('add_tuple').disabled = false;
  }
  else{
    document.getElementById('add_tuple').disabled = true;
  }
}

// Initialisation de l'indexedDB
createDb();

$(document).ready(function(){

  // Dissimulation initiale des champs d'entrees d' "ajouter un triplet"
  $("#add-buttons").hide();

  // Test de raffraichissement en live de la bd
  function getObjectStore(store_name, mode){
    // console.log("Avant la transaction: " + store_name + " " + mode);
    // console.log(db);
    var tx = db.transaction(store_name, mode);
    // console.log("Après la transaction");
    return tx.objectStore(store_name);
  };

  // Fonction qui lit un triplet dans la base de donnees
  function readTriplet(){
    var store =  getObjectStore('Triplet', 'readonly');
    var getdatas = store.getAll();
    getdatas.onsuccess = function(){
      // console.log(getdatas.result);
      addTable(getdatas.result);
    };
  };

  // Fonction qui reinitialise les champs d'entrees d' "ajouter un triplet"
  function reset(){
    document.getElementById("Website").value = "";
    document.getElementById("Login").value = "";
    document.getElementById("Password").value = "";
  };

  // Initialisation d'un bouton "reset" des champs d'entrees d' "ajouter un triplet"
  // $("#reset").click(function(){
  //   reset();
  // })

  // Initialisation du bouton "Ajouter" sous les champs d'entrees d' "ajouter un triplet"
  $("#add_tuple").click(function(){
    var website = document.getElementById("Website").value;
    var login = document.getElementById("Login").value;
    var password = document.getElementById("Password").value;
    encryptAES128(website, login+password);
    // addTriplet(website, login + password);
    // readTriplet();
    $("#add-buttons").hide();
  });

  // Initialisation du bouton "Annuler" sous les champs d'entrees d' "ajouter un triplet"
  $("#abort").click(function(){
    reset();
    $("#add-buttons").hide();
  });

  // Initialisation des champs d'entrees d' "ajouter un triplet" (champ site, login et mot de passe)
  $("#ADD").click(function(){
    $("#add-buttons").show();
    document.getElementById('add_tuple').disabled = true;
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
      readTriplet();
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
  };

  // Fonction qui supprime la base de donnees locale
  function deleteData(){
    var transaction = db.transaction(["Triplet"], "readwrite");
    var objectStore = transaction.objectStore("Triplet");
    var objectStoreRequest = objectStore.clear();
    objectStoreRequest.onsuccess = function(event){
      console.log("Suppression de la bd" + objectStore + "réussie !");
    };
  };

  // Fonction de traitement de la base de donnees pour un affichage sur le client html
  function addTable(myobj){
    // Effacement d'eventuels affichage precedents
    $("table").remove();
    if(myobj == 0){
      alert("Aucun tuple contenu dans la base de données !")
    }
    else{
      // Initialisation des champs du tableau
      var tableau = '<table class="table"><thead><tr><th scope="col">#</th>';
      tableau += '<th scope="col">Site</th><th scope="identifiants">Crypto</th>';
      tableau += '</tr></thead>';
      for (var i=0; i<myobj.length; i++){
        tableau += '<tbody><tr><th scope="row">' + i + '</th><td>';
        tableau += '<li class="list-group-item" id="website" onmouseover="this.style.cursor=\'pointer\'">' + myobj[i].Website+'</td>';
        tableau += '<td id="crypto">' + myobj[i].crypto + '</td></tr>';
      }
      // Fermeture des balises et du tableau
      tableau += '</tbody></table>';
      $("body").append(tableau);
    };
  };

  // Fonction qui ouvre une demande de confirmation de suppression de la base de donnees locale
  function confirmationSuppression(){
    var conf = confirm("Voulez-vous supprimer la base de donnée locale?");
    return conf;
  }

  // Initialisation du lien "Supprimer tout" qui supprime la base de données locale
  $("#Delete").click(function(){
    var store = getObjectStore('Triplet', 'readonly');
    var getdatas = store.getAll();
    var conf = 'true';
    getdatas.onsuccess = function(){
      if (getdatas.result != 0){
        conf = confirmationSuppression();
      };
      if (conf){
        deleteData();
        readTriplet();
      };
    };
  });

  // Initialisation du lien "Afficher les sites" qui affiche une table contenant les sites et leurs cryptogrammes associes
  $("#Affichage").click(function(){
    readTriplet();
  });

  // Initialisation du lien "Recuperer les sites" qui recupere les triplets d'une base de donnees situee sur le serveur
  $("#DL").click(function(){
    var store = getObjectStore('Triplet', 'readonly');
    var getdatas = store.getAll();
    var conf = 'true';
    getdatas.onsuccess = function(){
      if (getdatas.result != 0){
        conf = confirmationSuppression();
      }
      if (conf){
        deleteData();
        data = {"login":'log',"bd":'passwords'};
        var urlc = 'https://192.168.99.100:8080/monCoffre/moncoffre';
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
                addTriplet(myobj.triplets[i].site, decodeURIComponent(myobj.triplets[i].crypto));
              };
            };
            readTriplet();
          },
          error:function(data,status){console.log("error POST"+data+" status :  "+status);}
        });
      }
    }
  });

  // Fonction de chiffrement des identifiants
  function encryptAES128(website, word){
      var mdp = "moncul";
      var texte = word;
      sel = new Uint8Array(16);
      window.crypto.getRandomValues(sel);
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
        let promiseKey = crypto.subtle.deriveKey(
          {"name":"PBKDF2", salt: sel, "iterations":10000, "hash":"SHA-1"},
          mat,
          {"name":"AES-CBC", length:128},
          false,
          ["encrypt"]
          );
        promiseKey.then(function(key) {
          // Generation du IV aleatoire
          let myiv2 = new Uint8Array(16);
          crypto.getRandomValues(myiv2);
          // Generation du IV a 0 pour faire du ECB en CBC
          let ivZero = new Uint8Array(16);
          // Chiffrement de l'IV aleatoire
          let promiseIv = crypto.subtle.encrypt(
            {name: "AES-CBC", iv: ivZero},
            key,
            myiv2);
          promiseIv.then(function(ivChiffre) {
            let texteAr = convertStringToByteArray(texte);
            // Chiffrement du texte avec l'IV aleatoire et la cle
            let promiseChiffre = crypto.subtle.encrypt(
              {name: "AES-CBC", iv: myiv2},
              key,
              texteAr);
            promiseChiffre.then(function(chiffre) {
              // Construction du cryptogramme complet (sel + ivChiffre + chiffre)
              cryptogrammeComplet = convertByteArrayToString(sel.buffer)
              cryptogrammeComplet += convertByteArrayToString(ivChiffre) + convertByteArrayToString(chiffre);
              addTriplet(website, cryptogrammeComplet);
            })
          })
        })
      })
    };

  // Initialisation d'interactions avec les champs site
  $("body").on("click", "#website", function(){
    let website = $(this).text();
    var store =  getObjectStore('Triplet', 'readonly');
    var objectStoreRequest = store.get(website);
    objectStoreRequest.onsuccess = function() {
      cryptogrammeComplet = objectStoreRequest.result.crypto;
      console.log(objectStoreRequest);
      console.log("crypto : "  + cryptogrammeComplet);
      if (cryptogrammeComplet.length != 0) {
        // On extrait les infos du cryptogramme complet
        // Taille du sel 16
        let sel = convertStringToByteArray(cryptogrammeComplet.slice(0, 16));
        // Taille du ivChiffre 32
        let ivChiffre = convertStringToByteArray(cryptogrammeComplet.slice(16, 48));
        // Taille du chiffre le reste
        let chiffre = convertStringToByteArray(cryptogrammeComplet.slice(48));
        // Generation du IV a 0 pour faire du ECB en CBC
        let ivZero = new Uint8Array(16);
        var mdp = "moncul";
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
            let promiseKey = crypto.subtle.deriveKey(
              {"name":"PBKDF2", salt: sel, "iterations":10000, "hash":"SHA-1"},
              mat,
              {"name":"AES-CBC", length:128},
              false,
              ["decrypt"]
              );
            promiseKey.then(function(key) {
              // Dechiffrement de l'IV chiffre
              let promiseIv = crypto.subtle.decrypt(
                {name: "AES-CBC", iv: ivZero},
                key,
                ivChiffre);
              promiseIv.then(function(ivClair) {
                // Dechiffrement du chiffre
                let promiseClair = crypto.subtle.decrypt(
                  {name: "AES-CBC", iv: ivClair},
                  key,
                  chiffre);
                promiseClair.then(function(clair) {
                  alert(convertByteArrayToString(clair));
                })
              })
            })
          })
        }
      }
    }
  });
});
