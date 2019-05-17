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
        String contenu = fileManagment.existencyAccount(login, nomdb);
        String reponse = "{\"triplets\":[" + contenu + "]}";
        return reponse;
    }

    /**
     * Méthode qui insert les triplets reçus dans la BDD nomdb
     * associé au login
     */
    @POST
    @Path("/test")
//    @Consumes(MediaType.APPLICATION_JSON)
    public String postBDDTriplets(String listJson) {
        /*
        format: {"login": "X", "nomdb": "Y", "triplets": [...]}
         */

        JSONObject obj = new JSONObject(listJson);
        String login = obj.getString("login");
        String bd = obj.getString("bd");
        JSONArray triplet = obj.getJSONArray("triplets");

        FileManagment fileManagment = new FileManagment();
        fileManagment.createFile(login,bd);
        fileManagment.initSchemaEmptyFile(login,bd);

        for (int i = 0; i < triplet.length(); i++) {
            JSONObject tuple = triplet.getJSONObject(i);
            fileManagment.fillFile(login, bd, tuple.get("Website"), tuple.get("crypto"));
        }
//        for (Iterator iterator = obj.keys(); iterator.hasNext();) {
//            Object cle = iterator.next();
//            Object val = obj.get(String.valueOf(cle));
//            System.out.println("cle=" + cle + ", valeur=" + val);
//        }
        return("recue");
    }

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String testServeur(){
        return "Got it!";
    }
}
