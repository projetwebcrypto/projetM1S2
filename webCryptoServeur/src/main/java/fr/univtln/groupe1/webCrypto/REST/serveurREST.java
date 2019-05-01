package fr.univtln.groupe1.webCrypto.REST;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonWriter;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/moncoffre")
@Produces({"application/json"})
public class serveurREST {

    /**
     * Méthode qui retourne tous les triplets de la BDD nomdb
     * associé au login
     * @return String ???
     */
    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    public String getBDDTriplets(String listJson) {
        System.out.println(listJson);
        //JSONArray listJS = new JSONArray(listJson);
        //JSONArray listJS = (JSONArray) new JSONTokener(listJson).nextValue();
        //JSONObject request = new JSONObject(listJS.getJSONObject(0));
        JSONObject request = new JSONObject(listJson);
        System.out.println(request);
        // methodes de traitement
        // faire JSONArray

        return request.toString();
    }
//    @PUT
//    @Consumes(MediaType.APPLICATION_JSON)
//    public String test(String test) {
//        System.out.println(test);
//        System.out.println("Apres test");
//        return "coucou";
//    }
    // reception, envoie de json triplet
    // reception de json avec login, nomdb

    /**
     * Méthode qui insert les triplets reçus dans la BDD nomdb
     * associé au login
     */
    @POST
    public void postBDDTriplets(/*Something*/) {
        /*
        format: {"login": "X", "nomdb": "Y", "triplets": [...]}
         */

    }
}
