package fr.univtln.groupe1.webCrypto.REST;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.security.PublicKey;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import org.apache.commons.io.FileUtils;
import org.jboss.logging.Logger;

import static java.lang.System.exit;

@WebServlet("/upload")
@MultipartConfig
public class UploadServlet extends HttpServlet {

    private static Logger log = Logger.getLogger(UploadServlet.class);

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
        return parsedJws.getBody().get(field, String.class);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        log.info("test");
        String auth = request.getHeader("Authorization");
        String login = null;
        try {
            login = processToken(auth, "user_name");
        } catch (Exception e) {
            e.printStackTrace();
            exit(0);
        }
        Part filePart = request.getPart("userfile"); // Retrieves <input type="file" name="userfile">
        String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
        InputStream fileContent = filePart.getInputStream();
        File database = new File("/usr/local/monCoffre/account/" + login + "/"+ fileName);
        FileUtils.copyInputStreamToFile(fileContent, database);
    }
}