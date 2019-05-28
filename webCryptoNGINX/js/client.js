// Variables de verification de support d'IndexedDB
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

// Variables a demarrer
var db;
var store;
var cryptogrammeComplet = "";
var currentPassword = "";
var liste = []
var urlc = "https://192.168.99.100:443/myresource";
var crypto = window.crypto;
var dbName = "";
var keycloak = Keycloak({
"realm": "ragnarok",
"auth-server-url": "https://192.168.99.100/keycloak/auth",
"url": "https://192.168.99.100/keycloak/auth",
"clientId": 'customer-portal',
"ssl-required": "external",
"resource": "customer-portal",
"credentials": {
"secret": "91ba6cd3-a905-4e00-af7c-b6e4ad777011"
},
"enable-cors": true
});
// Test de support d'IndexedDB
if (!window.indexedDB){
  window.alert("Votre navigateur ne supporte pas une version stable d'IndexedDB. Quelques fonctionnalités ne seront pas disponibles.")
};

if(crypto.subtle){
  // alert("Cryptography API Supported");
}
else{
  alert("Cryptography API not Supported");
};
// Fonction qui convertit un array en string
function convertByteArrayToString(buffer){
  let data_view = new DataView(buffer);
  chaine = "";
  len = data_view.byteLength;
  for(i = 0; i < len; i++){
    chaine += String.fromCharCode(data_view.getUint8(i));
  };
  return chaine;
};

// Fonction qui convertit un array en hexadecimal
function convertArrayBufferToHexa(buffer){
    var data_view = new DataView(buffer);
    var i, len, hex = "", c;
    len = data_view.byteLength;
    for(i = 0; i < len; i++){
        c = data_view.getUint8(i).toString(16);
        if(c.length < 2){
            c = "0" + c;
        }
        hex += c;
    }
    return hex;
};

// Fonction qui retourne le code ascii d'une lettre
function ascii(lettre){
  return lettre.charCodeAt(0);
};

// Fonction qui convertit un string en array
function convertStringToByteArray(str){
  return Uint8Array.from(str.split("").map(ascii));
};

// Fonction d'initialisation d'indexedDB
function createDb(){
  console.log("Init openDb ...");

  // Version 3 car seul chromium semble marcher à la fac, et uniquement sur cette version
  var request = window.indexedDB.open("MyTestDatabase", 3);

  // Fonction lancee si le demarrage reussit
  request.onsuccess = function (event){
    db = this.result;
    console.log("Creation: " + db);
    // alert("Creation reussie");
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
    document.getElementById("add_tuple").disabled = false;
  }
  else{
    document.getElementById("add_tuple").disabled = true;
  };
};

// Fonction qui vérifie si les champs de "modifier un triplet" sont vides
function checkEmptyMod(){
  if((document.getElementById("mod-Login").value!="") && (document.getElementById("mod-Password").value!="") && (document.getElementById("new-Website").value !="")){
    document.getElementById("mod_tuple").disabled = false;
  }
  else{
    document.getElementById("mod_tuple").disabled = true;
  };
};

// Fonction qui vérifie si les champs de "modifier le mot de passe maître" sont vides
// et qui vérifie si les deux derniers champs de "modifier le mot de passe maître" sont identiques
function checkMstr(){
  if((document.getElementById("OldMstrPsw").value !="") && (document.getElementById("NewMstrPsw").value!="") && (document.getElementById("ConfMstrPsw").value!="") && (document.getElementById("NewMstrPsw").value == document.getElementById("ConfMstrPsw").value)){
    document.getElementById("chng_psw").disabled = false;
    $("#failpsw").hide();
  }
  else if ((document.getElementById("NewMstrPsw").value == document.getElementById("ConfMstrPsw").value)){
      $("#failpsw").hide();
      document.getElementById("chng_psw").disabled = true;
  }
  else{
    document.getElementById("chng_psw").disabled = true;
    $("#failpsw").show();
  };
};

// Fonction de vérification de validité du fichier à envoyer au serveur
function checkSend(){
  if(document.getElementById("select_db").value != ""){
    document.getElementById("send_db").disabled = false;
  }
  else{
    document.getElementById("send_db").disabled = true;
  };
};

// Initialisation de l'indexedDB
createDb();

// S'assure que le .html est bien lance.
$(document).ready(function(){
  $("#grabmstrpswd").modal();

//   function stateMstrPsw(){
//   var newpassw = window.prompt("Entrez le mot de passe maitre : ");
//   currentPassword = newpassw;
// };

  keycloak.init({})
          .success(function(){if (keycloak.authenticated){
                                $("#loged1").show();
                                $("#loged2").show();
                                $("#unloged").hide();
                              }
                              else{
                                console.log("Erreur keycloak");
                                $("#loged1").hide();
                                $("#loged2").hide();
                                $("#unloged").show();}})
          .error(function(){return false;})

  // Fonction qui definit le mot de passe maitre initial. Si base de donnée locale existante,
  // verifie la valeur du mot de passe donne.
  // function stateMstrPsw(){
  //   var newpassw = window.prompt("Entrez le mot de passe maitre : ");
  //   currentPassword = newpassw;
  // };
  //
  //  stateMstrPsw();

  // Test de raffraichissement en live de la bd
  function getObjectStore(store_name, mode){
    var tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
  };

  // Fonction qui lit un triplet dans la base de donnees
  function readTriplet(){
    var store =  getObjectStore("Triplet", "readonly");
    var getdatas = store.getAll();
    getdatas.onsuccess = function(){
      // console.log(getdatas.result);
      $("#show-menu").show();
      $('.collapse').collapse();
      addTable(getdatas.result);
    };
  };

  // Fonction qui mets en placeholder du champ "modifier login" le login actuel
  function placement(testlogin, testpassword, website){
    document.getElementById("mod-Password").value = testpassword;
    document.getElementById("mod-Login").value = testlogin;
    document.getElementById("mod-Login").placeholder = testlogin;
    document.getElementById("mod-Website").innerHTML = "Website";
    document.getElementById("new-Website").value = website;
  }

  // Fonction qui affiche le login et le mdp en clair du site demande.
  function afficheClair(testlogin, testpassword, website){
    document.getElementById("pseudo").innerHTML = "Identifiant : " + testlogin;
    document.getElementById("motdepasseclair").innerHTML = "mdp : " + testpassword;
    $("#afficheClairModal").modal();
  }

  // Fonction qui reinitialise les champs d'entrees d' "ajouter un triplet"
  function reset_add(){
    document.getElementById("Website").value = "";
    document.getElementById("Login").value = "";
    document.getElementById("Password").value = "";
  };

  // Fonction qui reinitialise les champs d'entrees de "modifier un triplet"
  function reset_mod(){
    document.getElementById("mod-Login").value = "";
    document.getElementById("mod-Password").value = "";
  };

  // Fonction qui reinitialise les champs d'entrees d' "ajouter un triplet"
  function reset_psw(){
    document.getElementById("OldMstrPsw").value = "";
    document.getElementById("NewMstrPsw").value = "";
    document.getElementById("ConfMstrPsw").value = "";
  };

  // Fonction qui reinitialise le
  function reset_send(){
    $('#send-buttons').empty();
  }

  // Fonction de traitement de la base de donnees pour un affichage sur le client html
  function addBase(myobj){
    console.log("inaddBase");
    $("#show-menu").show();
    $('.collapse').collapse();
    // Effacement d'eventuels affichage precedents
    $("table").remove();
      // Initialisation des champs du tableau
      var tableau = '<div class="container"><table class="table"><thead><tr>';
      tableau += '<th scope="col">Base de données :</th>';

      for (var i=0; i<myobj.Base.length; i++){
        console.log("in for")
        tableau += '<tr><td>';
        tableau += '<li class="list-group-item">  ' + myobj.Base[i] + '</td>';
        tableau += '<td><span class="glyphicon glyphicon-download-alt" id="base" name="' + myobj.Base[i] + '" style="cursor:pointer"></td></tr>';
      }
      // Fermeture des balises et du tableau
      tableau += '</tbody></table></div>';
      $("body").append(tableau);

  };


  // Fonction qui ajoute un triplet a la base de donnees
  function addTriplet(webs, crypt){
    var tuple = {"Website":webs, "crypto":crypt};
    var store = getObjectStore("Triplet", "readwrite");
    var req;
    try {
      req = store.add(tuple);
    } catch (e) {
      console.log("Error In addTriplet : " + e);
      throw e;
    }
    req.onsuccess = function (evt){
      document.getElementById("button-onload").className = "dot red";
      readTriplet();
      console.log("Insertion in DB successful");
      reset_add();
      return 0;
      // displayActionSuccess();
      // displayPubList(store);
    };
    req.onerror = function(){
      // console.log(this.error.name);
      if(this.error.message == "A mutation operation in the transaction failed because a constraint was not satisfied."){
        console.error("addTriplet error", this.error);
        // alert("Tuple(s) déjà présent(s)");
        // displayActionFailure(this.error);
        $("#OnabbortaddTriplet").modal();
      };
    };
  };

  // Fonction qui ajoute un triplet a la base de donnees
  function modTriplet(webs, crypt){
    var website = document.getElementById("new-Website").value;
    if (website != webs){
      var store = getObjectStore("Triplet", "readwrite");
      store.delete(webs);
      webs = website
    }
    var tuple = {"Website":webs, "crypto":crypt};
    var store = getObjectStore("Triplet", "readwrite");
    var req;
    try {
      req = store.put(tuple);
      } catch (e) {
        console.log("Error In modTriplet : " + e);
        throw e;
      }
    req.onsuccess = function (evt){
      document.getElementById("button-onload").className = "dot red";
      readTriplet();
      console.log("Insertion in DB successful");
      reset_mod();
      return 0;
      };
    };

  // Fonction qui decode une chaine en Base64 depuis un tableau d'octets
  function uint6ToB64(nUint6) {
    return nUint6 < 26 ? // si mon caracteres est compris dans [0-25] c'est un caracteres
        nUint6 + 65     // non imprimable, on fais donc +65 (ascii (A) = 65)
      : nUint6 < 52 ?  // si le caracteres est une lettre minuscule +71 pour correspondre
        nUint6 + 71   // au code ascii de la minuscule
      : nUint6 < 62 ?   // si le caracteres est un chiffre -4 pour correspondre
        nUint6 - 4        // au code ascii du chiffre
      : nUint6 === 62 ? // si le caracteres est + le codage deviens r
        43
      : nUint6 === 63 ? // si le caracteres est / le codage deviens v
        47
      :
        65;
  };

  // Fonction d'encodage array en Base64
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

  // Fonction qui decode un tableau d'octets depuis une chaine en Base64
  function b64ToUint6(nChr) {
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
  };

  // Fonction de decode d'une chaine de caracteres en Base64 en un tableau d'octets
  function base64DecToArr (sBase64, nBlockSize) {
    // enleve les caracteres de fin du base64, stock la taile
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
      };
    };
    return aBytes;
  };

  // Fonction qui supprime la base de donnees locale
  function deleteData(){
    var transaction = db.transaction(["Triplet"], "readwrite");
    var objectStore = transaction.objectStore("Triplet");
    var objectStoreRequest = objectStore.clear();
    objectStoreRequest.onsuccess = function(event){
      dbName = "";
      currentPassword = "";
      $("#grabmstrpswd").modal();
    };
    objectStoreRequest.onerror = function(event){
      alert("Erreur onerror:" + event.target.errorCode);
    };
  };

  // Fonction de traitement de la base de donnees avant envoie serveur
  function encodeB64(myobj){
    for (var i=0; i<myobj.length; i++){
      myobj[i].crypto = base64EncArr(myobj[i].crypto);
    }
    return(myobj);
  };

  // Fonction de traitement de la base de donnees pour un affichage sur le client html
  function addTable(myobj){
    // Effacement d'eventuels affichage precedents
    $("table").remove();
    if(myobj == 0){
      $("#OnabbortreadTriplet").modal();
    }
    else{
      // Initialisation des champs du tableau
      var tableau = '<div class="container"><table class="table"><thead><tr>';
      tableau += '<th scope="col">Site</th>';
      for (var i=0; i<myobj.length; i++){
        if(myobj[i].Website != "0________"){
          tableau += '<tr><td>';
          tableau += '<li class="list-group-item" id="website" onmouseover="this.style.cursor=\'pointer\'">  ' + myobj[i].Website + '</td>';
          tableau += '<td><a href="#mod-buttons"><img src="js/jquery-ui/images/modifier.png" id="edit" name="' + myobj[i].Website + '" onmouseover="this.style.cursor=\'pointer\'"></a></td>';
          tableau += '<td><img src="js/jquery-ui/images/effacer.png" id="deleteTrip" name="' + myobj[i].Website + '" onmouseover="this.style.cursor=\'pointer\'"></td></tr>';
        }
      }
      // Fermeture des balises et du tableau
      tableau += '</tbody></table></div>';
      $("body").append(tableau);
    };
  };;


  // Fonction qui ouvre une demande de confirmation de suppression de la base de donnees locale
  function confirmationSuppression(message){
    var conf = confirm(message);
    return conf;
  }

  // Fonction qui garde la transaction ouverte pour rentrer tous les
  // tuples en bdd en une seule fois
  function put_record(data_array,objectStore,row_index){
    if(row_index<data_array.length){
      var req=objectStore.put(data_array[row_index]);
      req.onsuccess=function(e){
        row_index+=1;
        put_record(data_array,objectStore,row_index);
      };
      req.onerror = function(){
        console.error("error", this.error);
        row_index+=1;
        put_record(data_array,objectStore,row_index);
      };
    }
    if(row_index == data_array.length){
      liste = [];
    }
  };

  // Fonction qui prend en parametre un site et son chiffre et les stocke dans une
  // variable globale pour les rentrer en BDD plus tard.
  function addListe(website, cryptogrammeComplet){
    tuple = {"Website":website, "crypto":cryptogrammeComplet}
    liste = liste.concat([tuple]);
    var store = getObjectStore("Triplet", "readonly");
    var countRequest = store.count();
    countRequest.onsuccess = function() {
      if( liste.length == countRequest.result){
        store = getObjectStore("Triplet", "readwrite");
        cpt = 0;
        put_record(liste, store, cpt);
      }
    };
  };

  var loadFailure = function () {
    console.log("Erreur de chargement");
  };

  var reloadData = function () {
    keycloak.updateToken(30)
            .success(loadData)
            .error(function() {
              console.log("Déconnecté");
            });
  };

  /*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  Fonctions de chiffrement - dechiffrement
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/

  // Fonction de chiffrement des identifiants
  function encryptAES128(testlogin, testpassword, website, newmstrpsw, myobj, fonction, isCheckpwd){
    var message = (testlogin+testpassword).split("").map(ascii);
    var mdp = currentPassword;
    if (isCheckpwd){
      var word = Uint8Array.from(message);
    }
    else {
      var taille = [testlogin.length];
      var word = Uint8Array.from(taille.concat(message));
    }
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
            word);
          promiseChiffre.then(function(chiffre) {
            cryptogrammeComplet = convertByteArrayToString(ivChiffre);
            cryptogrammeComplet += convertByteArrayToString(sel.buffer) + convertByteArrayToString(chiffre);
            cryptogrammeComplet = convertStringToByteArray(cryptogrammeComplet);
            fonction(website, cryptogrammeComplet);
          })
        })
      })
    })
};

  // Fonction de dechiffrement avec oldmstrpsw et chiffrement avec newmstrpsw
  function updateAES128(website, oldmstrpsw, fonction, newmstrpsw){
    // récupération du store
    var store =  getObjectStore("Triplet", "readonly");
    // récupération du site
    var objectStoreRequest = store.get(website);
    objectStoreRequest.onsuccess = function() {
      cryptogrammeComplet = objectStoreRequest.result.crypto;
      if (cryptogrammeComplet.length != 0) {
        // On extrait les infos du cryptogramme complet
        let ivChiffre = cryptogrammeComplet.slice(0, 32);
        let sel = cryptogrammeComplet.slice(32, 48);
        let chiffre = cryptogrammeComplet.slice(48);

        // Generation du IV a 0 pour faire du ECB en CBC
        let ivZero = new Uint8Array(16);
        var mdp = convertStringToByteArray(oldmstrpsw);
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
                  var mdp = newmstrpsw;
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
                          clair);
                        promiseChiffre.then(function(chiffre) {
                          cryptogrammeComplet = convertByteArrayToString(ivChiffre);
                          cryptogrammeComplet += convertByteArrayToString(sel.buffer) + convertByteArrayToString(chiffre);
                          cryptogrammeComplet = convertStringToByteArray(cryptogrammeComplet);
                          addListe(website, cryptogrammeComplet);
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        }
      }
    }
  };

    // Fonction de dechiffrement des identifiants
    function decryptAES128(website, currentPassword, fonction, newmstrpsw, myobj){
      var store =  getObjectStore("Triplet", "readonly");
      var objectStoreRequest = store.get(website);
      objectStoreRequest.onsuccess = function() {
        cryptogrammeComplet = objectStoreRequest.result.crypto;
        if (cryptogrammeComplet.length != 0) {
          // On extrait les infos du cryptogramme complet
          // Taille du sel 16
          let ivChiffre = cryptogrammeComplet.slice(0, 32);
          // Taille du ivChiffre 32
          let sel = cryptogrammeComplet.slice(32, 48);
          // Taille du chiffre le reste
          let chiffre = cryptogrammeComplet.slice(48);
          // Generation du IV a 0 pour faire du ECB en CBC
          let ivZero = new Uint8Array(16);
          var mdp = convertStringToByteArray(currentPassword);
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
                    traitement(clair, currentPassword, website, newmstrpsw, myobj, fonction);
                  })
                })
              })
            })
          }
        }
      }
    };

  // Fonction qui fait les traitements necessaire sur l'objet "clair" (uint8array[taille+chiffré(login+mdp)])
  // puis envois le résultat du traitement a "fctn"
  // Accepte : afficheClair(), function placement(),checkTest()
  function traitement(clair, currentPassword, website, newmstrpsw, myobj, fonction){
    messageClair = convertByteArrayToString(clair);
    tailleLogin = new Uint8Array(clair)[0];
    testpassword = messageClair.slice( tailleLogin + 1);
    testlogin = messageClair.slice(1, tailleLogin + 1);
    fonction(testlogin, testpassword, website, newmstrpsw, myobj);
  };

  // Fonction de verification du site de l'entree 0
  function modMstrPsw(testlogin, toverify, website, newmstrpsw, myobj){
    if (myobj[0].Website == "0________"){
      decryptAES128(myobj[0].Website, currentPassword, checkTest, newmstrpsw, myobj);
    }
  };

  // Fonction de verification du contenu du decrypte de l'entree 0
  function checkTest(testlogin, testpassword, website, newmstrpsw, myobj, tailleLogin){
    var verif = new Uint8Array([0xff, 0, 0xff, 0, 0xff, 0, 0xff, 0, 0xff, 0, 0xff, 0, 0xff, 0, 0xff, 0]);
    byteLogin = new Uint8Array(convertStringToByteArray(testlogin));
    console.log(verif.length+"&&"+(byteLogin.length) + 1);
    var val = false;
    if (verif.length == (byteLogin.length) + 1){
      var tentative = promCheckModPsw(verif, byteLogin, newmstrpsw, myobj);
      tentative.then(effectiveChangeMstrPsw(true, newmstrpsw, myobj));
    }
  };

  // Fonction de vérification de validite du mot de passe maitre
  function promCheckModPsw(verif, byteLogin, newmstrpsw, myobj){
    return new Promise((resolve) => {
      if (verif[0] == tailleLogin){
        for (var i=1; i<verif.length; i++){
          if (verif[i] != byteLogin[i-1]){
            alert("Ancien Mot de passe erroné1.");
            resolve(false);
          };
        };
        resolve(true, newmstrpsw, myobj);
      }
      else{
        alert("Ancien Mot de passe erroné2.");
        resolve(false);
      }
    });
  };

  // Fonction de changement du contenu de la base de donnee locale avec le nouveau mot de passe maitre
  function effectiveChangeMstrPsw(booleanVal, newmstrpsw, myobj){
    if (booleanVal){
      for (var i=0; i<myobj.length; i++){
        updateAES128(myobj[i].Website, currentPassword, addListe, newmstrpsw)
      }
      $("#psw-buttons").hide();
      reset_psw();
      readTriplet();
      currentPassword = newmstrpsw;
    }
  };

  /*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  Affichage et interactions avec le client.html
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/

   // Dissimulation initiale des champs d'entrees d' "ajouter un triplet"
  $("#add-buttons").hide();
  $("#mod-buttons").hide();
  $("#psw-buttons").hide();
  $('#add-MstrPsw').hide();
  $("#show-menu").hide();
  $("#send-buttons").hide();

  $("#show-menu").click(function(){
    // $("#show-menu").hide();
    $(this).toggleClass('glyphicon-minus');
  });

  // Initialisation du lien "Supprimer tout" qui supprime la base de données locale
  $("#Delete").click(function(){
    var store = getObjectStore("Triplet", "readonly");
    var getdatas = store.getAll();
    var conf = "true";
    getdatas.onsuccess = function(){
      if (getdatas.result != 0){
        conf = confirmationSuppression("Voulez-vous supprimer la base de donnée locale?");
      };
      if (conf){
        deleteData();
        document.getElementById("button-onload").className = "dot grey";
        // readTriplet();
        $("table").remove();

      };
    };
  });

  // Initialisation du lien "Afficher les sites" qui affiche une table contenant les sites et leurs cryptogrammes associes
  $("#Affichage").click(function(){
    readTriplet();

  });

  // Envoie de la base de donnée sur serveur
  $("#upload").click(function(){
    if(dbName === ""){
      let tmpname = window.prompt("Entrez un nom de base de données : ");
      dbName = tmpname
    }
    var store = getObjectStore("Triplet", "readonly");
    var getdatas = store.getAll();
    var conf = "true";
    getdatas.onsuccess = function(){
      if (getdatas.result != 0){
        var tmp = encodeB64(getdatas.result);
        keycloak.updateToken(30).success(function(){console.log("Token rafraichit");}).error(function(){console.log("Token NON rafraichit");});

        data = {"triplets": tmp};
        if((dbName)){
        if (keycloak.authenticated){
          $.ajax({
            type:"POST",
            headers:{"Authorization": "Bearer " + keycloak.token},
            url:urlc + "/pushdb" + "?name=" + dbName,
            data:JSON.stringify(data),
            dataType:"text",
            contentType:"application/json",
            // accepts: "*/*",
            success:function(json,status){
              // console.log(json);
              document.getElementById("button-onload").className = "dot";
              alert("Envoie réussi");
            },
            error:function(data,status){
              alert("Echec de l'envoie");
              console.log("error POST"+data+" status :  "+status);
            }
          });
        }
      }
        else {
          alert("Echec de l'envoie, nom de base de données vide.");
        }
      }
    }
  });
  // Initialisation du lien "Recuperer les bases de données" qui recupere la liste des bases de donnees présente sur le serveur
  $("#DL-allBase").click(function(){
      // data = {"login":"log"};
      keycloak.updateToken(30).success(function(){console.log("Token rafraichit");}).error(function(){console.log("Token NON rafraichit");});
      if (keycloak.authenticated){
        $.ajax({
          type:"GET",
          headers:{"Authorization": "Bearer " + keycloak.token},
          url:urlc + "/listeBd",
          contentType:"application/json",
          success:function(json,status){
            // variable de stockage ( liste de données post traitement)
            // variable stockage d'un triplet
            var myobj = json;
            if (myobj.Base.length > 0){
              addBase(myobj);

            };
          },
          error:function(data,status){
            $("#OnabbortAjax").modal();
            console.log("error GET"+ data + " status :  " + status);
          }
        });
    }
  });

  // Initialisation du lien "Recuperer les sites" qui recupere les triplets d'une base de donnees situee sur le serveur
  function downloadBdd(name){
    var store = getObjectStore("Triplet", "readonly");
    var getdatas = store.getAll();
    var conf = "true";
    getdatas.onsuccess = function(){
      if (getdatas.result != 0){
        conf = confirmationSuppression("Voulez-vous supprimer la base de données locale?");
      }
      if (conf && getdatas.result != 0){
        deleteData();
      }
      if (conf){
        // data = {"login":"log","bd":"passwords"};
        keycloak.updateToken(30).success(function(){console.log("Token rafraichit");}).error(function(){console.log("Token NON rafraichit");});
        if (keycloak.authenticated){
          $.ajax({
            type:"GET",
            headers:{"Authorization": "Bearer " + keycloak.token},
            url:urlc + "/database" + "?name=" + name,
            contentType:"application/json",
            success:function(json,status){
              dbName = name;
              // variable de stockage ( liste de données post traitement)
              // variable stockage d'un triplet
              var myobj = json;
              if (myobj.triplets.length > 0){
                for (var i=0; i<myobj.triplets.length; i++){
                  // addTriplet(myobj.triplets[i].site, base64DecToArr(myobj.triplets[i].crypto));
                  liste = liste.concat({"Website":myobj.triplets[i].site, "crypto":base64DecToArr(myobj.triplets[i].crypto)});
                };
                store = getObjectStore("Triplet", "readwrite");
                cpt = 0;
                put_record(liste, store, cpt);
              };
              readTriplet();
              document.getElementById("button-onload").className = "dot";
            },
            error:function(data,status){console.log("error GET" + data + " status :  " + status);}
          });
        }
      }
    }
  };

  // Initialisation des champs d'entrees de "changer le mot de passe Maître" (champ mot de passe)
  $("#PasswordChange").click(function(){
    $("#psw-buttons").show();
    document.getElementById("chng_psw").disabled = true;
  });

  // Initialisation du bouton "Valider" sous les champs d'entrees de "changer le mot de passe Maître"
  $("#chng_psw").click(function(){
    var oldmstrpsw = document.getElementById("OldMstrPsw").value;
    var newmstrpsw = document.getElementById("NewMstrPsw").value;
    var store = getObjectStore("Triplet", "readwrite");
    var getdatas = store.getAll();
    getdatas.onsuccess = function(){
      var myobj = getdatas.result;
      if (myobj.length > 0){
        var transaction = db.transaction(["Triplet"], "readwrite");
        transaction.oncomplete = function(event){
          decryptAES128(myobj[0].Website, oldmstrpsw, modMstrPsw, newmstrpsw, myobj);
        };
      }
    };
  });

  // Initialisation des champs d'entrees de "saisir le mot de passe Maître" (champ mot de passe)
  $('#saisie-mdp-maitre').click(function(){
    $('#add-MstrPsw').show();
  });

// Initialisation du bouton "Ajouter" sous les champs d'entrees de "saisir le mot de passe Maître"
  $('#saisie_Mtrspsw').click(function(){
    var pwd = document.getElementById("MtsrPwd").value;
    currentPassword = pwd;
    $('#add-MstrPsw').hide();
    document.getElementById("MtsrPwd").value = '';
  });

  // Initialisation du bouton "Annuler" sous les champs d'entrees de "saisir le mot de passe Maître"
  $("#abort_Mtrspsw").click(function(){
    $('#add-MstrPsw').hide();
    document.getElementById("MtsrPwd").value = '';
  });

  // Initialisation du bouton "Ajouter" sous les champs d'entrees d' "ajouter un triplet"
  $("#add_tuple").click(function(){
    var website = document.getElementById("Website").value;
    var login = document.getElementById("Login").value;
    var password = document.getElementById("Password").value;

    var store = getObjectStore("Triplet", "readonly");
    var countRequest = store.count();
    countRequest.onsuccess = function() {
      if ( countRequest.result == 0){
        var tmpname = window.prompt("Entrez un nom de base de données : ");
        dbName = tmpname;
        let checkpwd = new Uint8Array([ 0xff,0, 0xff, 0, 0xff, 0, 0xff, 0, 0xff, 0, 0xff, 0, 0xff, 0, 0xff, 0]);
        encryptAES128(convertByteArrayToString(checkpwd.buffer), "", "0________", undefined, undefined, addTriplet,true);
      }
      encryptAES128(login, password, website, undefined, undefined, addTriplet,false);
    }
    $("#add-buttons").hide();
  });

  // Initialisation du bouton "Annuler" sous les champs d'entrees d' "ajouter un triplet"
  $("#abort_add").click(function(){
    $("#add-buttons").hide();
    reset_add();
  });

  // Initialisation du bouton "Annuler" sous les champs d'entrees de "modifier un triplet"
  $("#abort_mod").click(function(){
    $("#mod-buttons").hide();
    reset_mod();
  });

  // Initialisation du bouton "Annuler" sous les champs d'entrees de "changer le mot de passe Maître"
  $("#abort_psw").click(function(){
    $("#psw-buttons").hide();
    reset_psw();
  });

  // Initialisation du bouton "Annuler" sous le champ "Envoyer une base de données"
  $("#abort_send").click(function(){
    $("#send-buttons").hide();
    reset_send();
  });

  // Initialisation des champs d'entrees d' "ajouter un triplet" (champ site, login et mot de passe)
  $("#ADD").click(function(){
    $("#add-buttons").show();
    document.getElementById("add_tuple").disabled = true;
  });

  // Modification des identifiants d'un site
  $("#mod_tuple").click(function(){
    var website = document.getElementById("mod-Website").value;
    var login = document.getElementById("mod-Login").value;
    var password = document.getElementById("mod-Password").value;

    encryptAES128(login, password, website, undefined, undefined, modTriplet);
    $("#mod-buttons").hide();
    testlogin = testpassword = "";
  });

  $('#send').click(function(){
    $("#send-buttons").show();
  });

  $('#passButton').click(function(){
    let newpassw = document.getElementById("pass").value;
    currentPassword = newpassw;
    document.getElementById("pass").value = "";
  });


  $('#send_db').click(function(){
    keycloak.updateToken(30).success(function(){console.log("Token rafraichit");}).error(function(){console.log("Token NON rafraichit");});
    if (keycloak.authenticated){
      var fd = new FormData();
      fd.append('userfile', $('#select_db')[0].files[0]);
      $.ajax({
        type: 'POST',
        headers:{"Authorization": "Bearer " + keycloak.token},
        url: 'https://192.168.99.100/upload',
        data: fd,
        processData: false,
        contentType: false,
        success: function(data){
          console.log('upload success!')
          $('#send-buttons').empty();
          $('#send-buttons').append(data);
        }
      });
    };
  });

  // Initialisation d'interactions avec les champs site
  $("body").on("click", "#website", function(){
    var website = $(this).text().slice(2);
    decryptAES128(website, currentPassword, afficheClair);
  });

  // appel la requête ajax download sur dbname au click utilisateur
  $("body").on("click", "#base", function(){
    document.getElementById("add_tuple").disabled = true;
    var dbName = $(this).attr("name");
    downloadBdd(dbName)
  });

  // Initialisation d'interactions avec les images "Modifier"
  $("body").on("click", "#edit", function(){
    $("#mod-buttons").show();
    document.getElementById("add_tuple").disabled = true;
    var website = $(this).attr("name");
    document.getElementById("mod-Website").value = website;
    decryptAES128(website, currentPassword, placement);
    reset_mod();
  });

  // Initialisation d'interactions avec les images "Effacer"
  $("body").on("click", "#deleteTrip", function(){
    var conf = confirmationSuppression("Voulez-vous supprimer ce tuple de la base de donnée locale?");
    if (conf){
      var website = $(this).attr("name");
      var store =  getObjectStore("Triplet", "readonly");
      var objectStoreRequest = store.get(website);
      objectStoreRequest.onsuccess = function(){
        var transaction = db.transaction(["Triplet"], "readwrite");
        var objectStore = transaction.objectStore("Triplet");
        var supprStoreRequest = objectStore.delete(website);
        supprStoreRequest.onsuccess = function(){
          document.getElementById("button-onload").className = "dot red";
          readTriplet();
        }
      }
    }
  });
});
