package fr.univtln.groupe1.webCrypto.REST;

import fr.univtln.groupe1.webCrypto.Account.FileManagment;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.Iterator;


@Path("/myresource")
@Produces({"application/json"})
public class serveurREST {

    /**
     * Méthode qui retourne tous les triplets de la BDD db
     * associé au login
     * @return String
     */
    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    public String getBDDTriplets(String listJson) {
        JSONObject request = new JSONObject(listJson);
        String login = request.getString("login");
        String nomdb = request.getString("bd");
        FileManagment fileManagment = new FileManagment();
        String contenu = fileManagment.pullBd(login, nomdb);
        String reponse = "{\"triplets\":[" + contenu + "]}";
        return reponse;
    }

    /**
     * Méthode qui insert les triplets reçus dans la BDD nomdb
     * associe au login
     * format: {"login": "X", "nomdb": "Y", "triplets": [...]}
     */
    @POST
    @Path("/test")
//    @Consumes(MediaType.APPLICATION_JSON)
    public String postBDDTriplets(String listJson) {
        JSONObject obj = new JSONObject(listJson);
        String login = obj.getString("login");
        String nomBd = obj.getString("bd");
        JSONArray triplets = obj.getJSONArray("triplets");

        FileManagment fileManagment = new FileManagment();

        fileManagment.pushBd(login, nomBd, triplets);
        return("recue");
    }

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String testServeur(){
        return "Got it!";
    }
}
