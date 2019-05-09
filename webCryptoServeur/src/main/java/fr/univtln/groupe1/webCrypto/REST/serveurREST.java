package fr.univtln.groupe1.webCrypto.REST;

import fr.univtln.groupe1.webCrypto.Account.FileManagment;
import org.json.JSONObject;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


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
        String contenu = fileManagment.openFile(login, nomdb);
        String reponse = "{\"triplets\":[" + contenu + "]}";
        return reponse;
    }

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

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String testServeur(){
        return "Got it!";
    }
}
