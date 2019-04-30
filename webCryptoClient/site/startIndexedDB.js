$(function(){
    var urlc = "http://192.168.99.100:8080/myapp/monCoffre";

    //$("table").append(chaine);
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    if (!window.indexedDB) {
        window.alert("Votre navigateur ne supporte pas une version stable d'IndexedDB. Quelques fonctionnalités ne seront pas disponibles.")
    }
    var db;
    function openDb() {
      console.log("openDb ...");
      var request = window.indexedDB.open("MyTestDatabase", 3);
      request.onsuccess = function (event) {
          db = this.result;
          console.log("Creation : " + db);
          alert("Creation reussie");
      };
      request.onerror = function(event) {
          alert("Erreur onerror :" + event.target.errorCode);
      };
      // alert("En dehors");

      console.log(db);
      request.onupgradeneeded = function(event) {
          console.log("Dans l'upgrade");
          var store = event.currentTarget.result.createObjectStore("Personnes", { keyPath: "nom" });
          store.createIndex("nom", "nom", { unique: true });
      };
    }

    function getObjectStore(store_name, mode) {
        console.log("Avant la transaction : " + store_name + " " + mode);
        console.log(db);
        var tx = db.transaction(store_name, mode);
        console.log("Après la transaction");
        return tx.objectStore(store_name);
    }

    function addObjectTest(nom) {
        console.log("Nom :" + nom);
        var pers = {"nom":nom};
        var store = getObjectStore('Personnes', 'readwrite');
        var req;
        try {
            req = store.add(pers);
        } catch (e) {
            console.log("????");
            throw e;
        }
        req.onsuccess = function (evt) {
            console.log("Insertion in DB successful");
            // displayActionSuccess();
            // displayPubList(store);
        };
        req.onerror = function() {
            console.error("addPublication error", this.error);
            // displayActionFailure(this.error);
        };
    }


    $("#refresh").click(function () {
        $.ajax({
            headers:{
                "Accept":"application/json"
            },   url:urlc,
            success:function(response){// eventuellement parcourir liste
                var r = JSON.parse(response);
                $("thead").append("<tr align='center><td>" + r.nom + "</td></tr>");
            }
        });
    });

    $("#ajout").click(function () {
        addObjectTest("Denis");
    })
  openDb();

});
