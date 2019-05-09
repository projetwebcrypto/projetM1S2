// Variables de verification de support d'IndexedDB
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


// Variables a demarrer
var db;
var store;
var cryptogrammeComplet = "";
// Sale :
var testlogin = "";
var testpassword = "";

function createDb(){
  console.log("Init openDb ...");

  // Version 3 car seul chromium semble marcher à la fac, et uniquement sur cette version
  var request = window.indexedDB.open("MyTestDatabase", 3);

  // Fonction lancee si le demarrage reussit
  request.onsuccess = function (event){
    db = this.result;
    console.log("Creation: " + db);
    alert("Creation reussie");
  };

  // Fonction lancee si le demarrage rate
  request.onerror = function(event){
    alert("Erreur onerror:" + event.target.errorCode);
  };

  // Fonction lancee a l'appel une fois lancee
  request.onupgradeneeded = function(event){
    store = event.currentTarget.result.createObjectStore("Triplet", {keyPath: "Website"});
    store.createIndex("Website", "Website", { unique: true, multiEntry: true});
  };
};

// Fonction qui vérifie si les champs d' "ajouter un triplet" sont vides
function checkEmpty(){
  if((document.getElementById("Website").value !="") && (document.getElementById("Login").value!="") && (document.getElementById("Password").value!="")){
    document.getElementById('add_tuple').disabled = false;
  }
  else{
    document.getElementById('add_tuple').disabled = true;
  }
}

// Fonction qui vérifie si les champs de "modifier un triplet" sont vides
function checkEmptyMod(){
  if((document.getElementById("mod-Login").value!="") && (document.getElementById("mod-Password").value!="")){
    document.getElementById('mod_tuple').disabled = false;
  }
  else{
    document.getElementById('mod_tuple').disabled = true;
  }
}

// Initialisation de l'indexedDB
createDb();

$(document).ready(function(){

  // Dissimulation initiale des champs d'entrees d' "ajouter un triplet"
  $("#add-buttons").hide();
  $("#mod-buttons").hide();

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
  function reset_add(){
    document.getElementById("Website").value = "";
    document.getElementById("Login").value = "";
    document.getElementById("Password").value = "";
  };

  function reset_mod(){
    document.getElementById("mod-Login").value = "";
    document.getElementById("mod-Password").value = "";
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
    message = login.length + login+password;
    // var identifiants = (login.length + login+password).split('').map(ascii)
    // message = Uint8Array.from(identifiants);//
    encryptAES128(website, message);
    // addTriplet(website, login + password);
    // readTriplet();
    $("#add-buttons").hide();
  });

  // Initialisation du bouton "Annuler" sous les champs d'entrees d' "ajouter un triplet"
  $("#abort_add").click(function(){
    $("#add-buttons").hide();
    reset_add();
  });

  $("#abort_mod").click(function(){
    $("#mod-buttons").hide();
    reset_mod();
  });

  // Initialisation des champs d'entrees d' "ajouter un triplet" (champ site, login et mot de passe)
  $("#ADD").click(function(){
    $("#add-buttons").show();
    document.getElementById('add_tuple').disabled = true;
  });

  function promptLogs(login, password) {
    var newlog = prompt("Saisissez le nouvel identifiant:", login);
    var newpass = prompt("Saisissez le nouveau mot de passe:", password);
    return (newlog, newpass);
  }

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
      reset_add();
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
      // console.log("Suppression de la bd" + objectStore + "réussie !");
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
      tableau += '<th scope="col">Site</th><th scope="col">Crypto</th>';
      tableau += '<th score="col">Modifier</th><th score="col">Supprimer</th></tr></thead>';
      for (var i=0; i<myobj.length; i++){
        tableau += '<tbody><tr><th scope="row">' + i + '</th><td>';
        tableau += '<li class="list-group-item" id="website" onmouseover="this.style.cursor=\'pointer\'">' + myobj[i].Website + '</td>';
        tableau += '<td id="crypto">' + myobj[i].crypto + '</td>';
        tableau += '<td><a href="#"><img src="js/jquery-ui/images/modifier.png" id="edit" name="' + myobj[i].Website + '" onmouseover="this.style.cursor=\'pointer\'"></a></td>';
        tableau += '<td><img src="js/jquery-ui/images/effacer.png" id="deleteTrip" name="' + myobj[i].Website + '" onmouseover="this.style.cursor=\'pointer\'"></td></tr>';
      }
      // Fermeture des balises et du tableau
      tableau += '</tbody></table>';
      $("body").append(tableau);
    };
  };

  // Fonction qui ouvre une demande de confirmation de suppression de la base de donnees locale
  function confirmationSuppression(message){
    var conf = confirm(message);
    return conf;
  }

  // Initialisation du lien "Supprimer tout" qui supprime la base de données locale
  $("#Delete").click(function(){
    var store = getObjectStore('Triplet', 'readonly');
    var getdatas = store.getAll();
    var conf = 'true';
    getdatas.onsuccess = function(){
      if (getdatas.result != 0){
        conf = confirmationSuppression("Voulez-vous supprimer la base de donnée locale?");
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
        conf = confirmationSuppression("Voulez-vous supprimer la base de donnée locale?");
      }
      if (conf){
        deleteData();
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
                addTriplet(myobj.triplets[i].site, atob(myobj.triplets[i].crypto));
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
    var mdp = "bonjour";
    sel = new Uint8Array(16);
    text = convertStringToByteArray(word);
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
      promiseKey.then(function(key){
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
          // Chiffrement du texte avec l'IV aleatoire et la cle
          let promiseChiffre = crypto.subtle.encrypt(
            {name: "AES-CBC", iv: myiv2},
            key,
            text);
          promiseChiffre.then(function(chiffre) {
            // Construction du cryptogramme complet (sel + ivChiffre + chiffre)
            cryptogrammeComplet = convertByteArrayToString(ivChiffre)
            cryptogrammeComplet += convertByteArrayToString(sel.buffer) + convertByteArrayToString(chiffre);
            addTriplet(website, cryptogrammeComplet);
          })
        })
      })
    })
  };

  // Fonction de dechiffrement des identifiants
  async function decryptAES128(website){
    var store =  getObjectStore('Triplet', 'readonly');
    var objectStoreRequest = store.get(website);
    objectStoreRequest.onsuccess = function() {
      cryptogrammeComplet = objectStoreRequest.result.crypto;
      // console.log(objectStoreRequest);
      // console.log("crypto : "  + cryptogrammeComplet);
      if (cryptogrammeComplet.length != 0) {
        // On extrait les infos du cryptogramme complet
        // Taille du sel 16
        let ivChiffre = convertStringToByteArray(cryptogrammeComplet.slice(0, 32));
        // Taille du ivChiffre 32
        let sel = convertStringToByteArray(cryptogrammeComplet.slice(32, 48));
        // Taille du chiffre le reste
        let chiffre = convertStringToByteArray(cryptogrammeComplet.slice(48));
        // Generation du IV a 0 pour faire du ECB en CBC
        let ivZero = new Uint8Array(16);
        var mdp = "bonjour";
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
            promiseKey.then(function(key){
              // Dechiffrement de l'IV chiffre
              let promiseIv = crypto.subtle.decrypt(
                {name: "AES-CBC", iv: ivZero},
                key,
                ivChiffre);
              promiseIv.then(function(ivClair){
                // Dechiffrement du chiffre
                let promiseClair = crypto.subtle.decrypt(
                  {name: "AES-CBC", iv: ivClair},
                  key,
                  chiffre);
                promiseClair.then(function(clair){
                  messageClair = convertByteArrayToString(clair);
                  tailleLogin = parseInt(messageClair[0])
                  testpassword = messageClair.slice( tailleLogin + 1);
                  testlogin = messageClair.slice(1, tailleLogin + 1);
                })
              })
            })
          })
        }
      }
    }
  };

  // Fonction d'attente
  var resolveAfter = function() {
    return new Promise(resolve => {
      setTimeout(function() {
        resolve("rapide");
      }, 50);
    });
  };

  // Modification des identifiants d'un site
  $("#mod_tuple").click(function(){
    var website = document.getElementById("mod-Website").innerHTML;
    var login = document.getElementById("mod-Login").value;
    var password = document.getElementById("mod-Password").value;
    var message = login.length + login+password;
    // var identifiants = (login.length + login+password).split('').map(ascii)
    // message = Uint8Array.from(identifiants);//
    var store =  getObjectStore('Triplet', 'readonly');
    console.log(website)
    var objectStoreRequest = store.get(website);
    objectStoreRequest.onsuccess = function(){
      var transaction = db.transaction(["Triplet"], "readwrite");
      var objectStore = transaction.objectStore("Triplet");
      var supprStoreRequest = objectStore.delete(website);
      supprStoreRequest.onsuccess = function(){
        encryptAES128(website, message);
      }
    }
    // addTriplet(website, login + password);
    // readTriplet();
    $("#mod-buttons").hide();
    testlogin = testpassword = "";
  });

  // Initialisation d'interactions avec les champs site
  $("body").on("click", "#website", async function(){
    var website = $(this).text();
    var testvalid = decryptAES128(website);
    var waiting = await resolveAfter();
    alert("Identifiant :" + testlogin + "\n" + "mdp :" + testpassword);
    testlogin = testpassword = "";
  });

  // Initialisation d'interactions avec les images "Modifier"
  $("body").on("click", "#edit", async function(){
    $("#mod-buttons").show();
    document.getElementById('add_tuple').disabled = true;
    var website = $(this).attr('name');
    decryptAES128(website);
    var waiting = await resolveAfter();
    // document.getElementById("mod-Login").defaultValue = website;
    document.getElementById("mod-Login").placeholder = testlogin;
    document.getElementById("mod-Website").innerHTML = website;
    reset_mod();
  });

  // Initialisation d'interactions avec les images "Effacer"
  $("body").on("click", "#deleteTrip", function(){
    var conf = confirmationSuppression("Voulez-vous supprimer ce tuple de la base de donnée locale?");
    if (conf){
      var website = $(this).attr('name');
      var store =  getObjectStore('Triplet', 'readonly');
      var objectStoreRequest = store.get(website);
      objectStoreRequest.onsuccess = function(){
        var transaction = db.transaction(["Triplet"], "readwrite");
        var objectStore = transaction.objectStore("Triplet");
        var supprStoreRequest = objectStore.delete(website);
        supprStoreRequest.onsuccess = function(){
          readTriplet();
        }
      }
    }
  });
});
