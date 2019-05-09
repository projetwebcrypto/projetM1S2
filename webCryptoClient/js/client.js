var passwordCourant = '' // variables de verification de support d'IndexedDB
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
    console.log(typeof login.length)
    var array = [login.length];
    var message = (login+password).split('').map(ascii)
    // message = login.length + login+password;
    // var identifiants = (login.length + login+password).split('').map(ascii)
    // message = Uint8Array.from(identifiants);//
    encryptAES128(website, Uint8Array.from(array.concat(message)));
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
      reset();
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

  /* Base64 string to array encoding */

  function uint6ToB64 (nUint6) {

    return nUint6 < 26 ?
        nUint6 + 65
      : nUint6 < 52 ?
        nUint6 + 71
      : nUint6 < 62 ?
        nUint6 - 4
      : nUint6 === 62 ?
        43
      : nUint6 === 63 ?
        47
      :
        65;

  }

  function base64EncArr(aBytes){

    var eqLen = (3 - (aBytes.length % 3)) % 3, sB64Enc = "";

    for (var nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
      nMod3 = nIdx % 3;
      /* Uncomment the following line in order to split the output in lines 76-character long: */
      /*
      if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
      */
      nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
      if (nMod3 === 2 || aBytes.length - nIdx === 1) {
        sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
        nUint24 = 0;
      }
    }

    return  eqLen === 0 ?
        sB64Enc
      :
        sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");

  }


  /* Décoder un tableau d'octets depuis une chaîne en base64 */
  function b64ToUint6 (nChr) {

    return nChr > 64 && nChr < 91 ?
        nChr - 65
      : nChr > 96 && nChr < 123 ?
        nChr - 71
      : nChr > 47 && nChr < 58 ?
        nChr + 4
      : nChr === 43 ?
        62
      : nChr === 47 ?
        63
      :
        0;

  }
  function base64DecToArr (sBase64, nBlockSize) {

    var
      sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
      nOutLen = nBlockSize ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockSize) * nBlockSize : nInLen * 3 + 1 >>> 2, aBytes = new Uint8Array(nOutLen);

    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
      nMod4 = nInIdx & 3;
      nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
      if (nMod4 === 3 || nInLen - nInIdx === 1) {
        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
          aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
        }
        nUint24 = 0;
      }
    }

    return aBytes;
  }

  // var myArray = base64DecToArr("tWuTrJyzoWGAFuwRGVWeTe7Ts5wvLGy1e1bkkO57mMEFY9fnAi3XbEFWx/iH+Q+5s8/IGt5DXSw85+NVT2H8aw=="); // "Base 64 \u2014 Mozilla Developer Network" (as UTF-8)
  // console.log(myArray);
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
      tableau += '<th scope="col">Site</th><th scope="col">Crypto</th>';
      tableau += '<th score="col">Modifier</th><th score="col">Supprimer</th></tr></thead>';
      for (var i=0; i<myobj.length; i++){
        tableau += '<tbody><tr><th scope="row">' + i + '</th><td>';
        tableau += '<li class="list-group-item" id="website" onmouseover="this.style.cursor=\'pointer\'">' + myobj[i].Website + '</td>';
        tableau += '<td id="crypto">' + myobj[i].crypto + '</td>';
        tableau += '<td id="edit" name="' + myobj[i].Website + '"><img src="js/jquery-ui/images/modifier.png" onmouseover="this.style.cursor=\'pointer\'"></td>';
        tableau += '<td id="deleteTrip" name="' + myobj[i].Website + '"><img src="js/jquery-ui/images/effacer.png" onmouseover="this.style.cursor=\'pointer\'"></td></tr>';
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
                addTriplet(myobj.triplets[i].site, myobj.triplets[i].crypto);
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
    var mdp = "azerty";
    sel = new Uint8Array(16);
    console.log("word " + word);
    // text = convertStringToByteArray(word);// word[0] == taille de login
    text = word;
    console.log("TEXT");
    console.log(text);
    // text[0] = text[0] - 48
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
            console.log(btoa(cryptogrammeComplet));
            addTriplet(website, btoa(cryptogrammeComplet));
          })
        })
      })
    })
  };

  function decryptAES128(website){
    var store =  getObjectStore('Triplet', 'readonly');
    var objectStoreRequest = store.get(website);
    objectStoreRequest.onsuccess = function() {
      cryptogrammeCompletB64 = objectStoreRequest.result.crypto;
      cryptogrammeComplet = base64DecToArr(cryptogrammeCompletB64);
      if (cryptogrammeComplet.length != 0) {
        // On extrait les infos du cryptogramme complet
        // Taille du sel 16
        let ivChiffre = cryptogrammeComplet.slice(0, 32)
        console.log(ivChiffre);
        // Taille du ivChiffre 32
        let sel = cryptogrammeComplet.slice(32, 48)
        console.log(sel);
        // Taille du chiffre le reste
        let chiffre = cryptogrammeComplet.slice(48)
        // Generation du IV a 0 pour faire du ECB en CBC
        let ivZero = new Uint8Array(16);
        var mdp = convertStringToByteArray("azerty");
        if (mdp.length != 0) {
          // Recuperation du mdp en tant que cle
          let promiseMat = crypto.subtle.importKey(
            "raw",
            mdp,
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
                  passwordCourant = new Uint8Array(clair)[0] + messageClair.slice(1);
                })
              })
            })
          })
        }
      }
    }
  };

  function decoupage(message){
    // messageClair = convertByteArrayToString(message);
    tailleLogin = parseInt(message[0]);
    var array = [message.slice(1, tailleLogin + 1), message.slice( tailleLogin + 1)]
    console.log("array :" + array);
    return(array);
  }

  // Initialisation d'interactions avec les champs site
  $("body").on("click", "#website", function(){
    var website = $(this).text();
    decryptAES128(website);
    var identifiants = decoupage(passwordCourant)
    alert("Identifiants :" + identifiants[0] + " mdp : " + identifiants[1]);
    passwordCourant = '';
  })


  // Initialisation d'interactions avec les images "Modifier"
  $("body").on("click", "#edit", function(){
    var website = $(this).attr('name');
    var store =  getObjectStore('Triplet', 'readonly');
    var objectStoreRequest = store.get(website);
    objectStoreRequest.onsuccess = function(){
    }
  });

  // Initialisation d'interactions avec les images "Effacer"
  $("body").on("click", "#deleteTrip", function(){
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
  });
});
