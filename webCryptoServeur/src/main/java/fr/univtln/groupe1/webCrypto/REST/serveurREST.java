package fr.univtln.groupe1.webCrypto.REST;

import javax.servlet.http.HttpServletRequest;
import fr.univtln.groupe1.webCrypto.Account.FileManagment;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;

import org.json.JSONArray;
import org.json.JSONObject;

import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.jboss.logging.Logger;

import java.io.FileInputStream;
import java.io.InputStream;
import java.security.PublicKey;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;



@Path("/myresource")
@Produces({"application/json"})
public class serveurREST {

    private static Logger log = Logger.getLogger(serveurREST.class);

    private PublicKey publicKey;

    public static PublicKey loadPublicKey(InputStream inputStream)
            throws Exception
    {
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        Certificate cert = cf.generateCertificate(inputStream);
        PublicKey retVal = cert.getPublicKey();
        return retVal;
    }

    private String processToken(String compactJws, String field) throws Exception {
        // Recupere le token apres le bearer de l en-tete
        compactJws=compactJws.substring(compactJws.trim().indexOf(' ')+1);
        // Recupere la cle public
        publicKey = loadPublicKey(getClass().getClassLoader()
                .getResourceAsStream("keycloak.pem"));
        // Dechiffre le token (verifie la signature)
        Jws<Claims> parsedJws = Jwts.parser()
                .setSigningKey(publicKey)
                .parseClaimsJws(compactJws);
        // Recupere le champs du corps du token
        String result = parsedJws.getBody().get(field, String.class);
        return result;
    }

    @Context
    private HttpServletRequest request;

    /**
     * Méthode qui retourne tous les triplets de la BDD db
     * associé au login
     * @return String
     */
    @GET
    // Mettre /database
    @Path("/login")
    @Produces(MediaType.APPLICATION_JSON)
    public String getBDDTriplets(@HeaderParam("Authorization") String compactJws, @QueryParam("name") String name) {
/*        System.out.println("okokokok\n\n\n\n\n");
        KeycloakSecurityContext securityContext = (KeycloakSecurityContext) httpRequest.getAttribute(KeycloakSecurityContext.class.getName());
        AccessToken accessToken = securityContext.getToken();
        System.out.println(String.format("User '%s' with email '%s' made request to CustomerService REST endpoint", accessToken.getPreferredUsername(), accessToken.getEmail()));*/
//        JSONObject request = new JSONObject(listJson);
//        String login = request.getString("login");
//        String nomdb = request.getString("bd");



//        log.info("TOKEN1 :"+compactJws);
//        compactJws=compactJws.substring(compactJws.trim().indexOf(' ')+1);
//        log.info("TOKEN2 :"+compactJws);


//        publicKey = loadPublicKey(getClass().getClassLoader()
//                .getResourceAsStream("keycloak.pem"));
//
//
//        log.info("Hello " + (request.getRemoteUser() != null? request.getRemoteUser() : "world") + "!!!");

//        Jws<Claims> x = Jwts.parser()
//                .setSigningKey(publicKey)
//                .parseClaimsJws(compactJws);

//        log.info(x);

//        String login = x.getBody().get("user_name", String.class);

//        log.info(login);

        String login= null;
        try {
            login = processToken(compactJws, "user_name");
        } catch (Exception e) {
            // Probleme de token
            e.printStackTrace();
            return "erreur"; // A determiner !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        }

        FileManagment fileManagment = new FileManagment();
        String contenu = fileManagment.pullBd(login, name);
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
    public String postBDDTriplets(@HeaderParam("Authorization") String compactJws, @QueryParam("name") String name, String listJson) {
        String login= null;
        try {
            login = processToken(compactJws, "user_name");
        } catch (Exception e) {
            // Probleme de token
            e.printStackTrace();
            return "erreur"; // A determiner !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        }
        JSONObject obj = new JSONObject(listJson);
        JSONArray triplets = obj.getJSONArray("triplets");

        FileManagment fileManagment = new FileManagment();

        fileManagment.pushBd(login, name, triplets);
        return("recue");
    }

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String testServeur(){
        log.info("Got it !");
        return "Got it!";
    }
}
