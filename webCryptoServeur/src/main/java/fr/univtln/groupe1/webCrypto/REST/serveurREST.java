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

    @Context
    private HttpServletRequest request;

    /**
     * Méthode qui retourne tous les triplets de la BDD db
     * associé au login
     * @return String
     */
    @GET
    @Path("/login")
    //@Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Jws<Claims> getBDDTriplets(@HeaderParam("Authorization") String compactJws) throws Exception {
/*        System.out.println("okokokok\n\n\n\n\n");
        KeycloakSecurityContext securityContext = (KeycloakSecurityContext) httpRequest.getAttribute(KeycloakSecurityContext.class.getName());
        AccessToken accessToken = securityContext.getToken();
        System.out.println(String.format("User '%s' with email '%s' made request to CustomerService REST endpoint", accessToken.getPreferredUsername(), accessToken.getEmail()));*/
//        JSONObject request = new JSONObject(listJson);
//        String login = request.getString("login");
//        String nomdb = request.getString("bd");



        log.info("TOKEN1 :"+compactJws);
        compactJws=compactJws.substring(compactJws.trim().indexOf(' ')+1);
        log.info("TOKEN2 :"+compactJws);


        publicKey = loadPublicKey(getClass().getClassLoader()
                .getResourceAsStream("keycloak.pem"));


        log.info("Hello " + (request.getRemoteUser() != null? request.getRemoteUser() : "world") + "!!!");

        Jws<Claims> x = Jwts.parser()
                .setSigningKey(publicKey)
                .parseClaimsJws(compactJws);

        log.info(x);

        FileManagment fileManagment = new FileManagment();
        String contenu = fileManagment.pullBd("log", "passwords");
        String reponse = "{\"triplets\":[" + contenu + "]}";
        return x;
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
        log.info("Got it !");
        return "Got it!";
    }
}
