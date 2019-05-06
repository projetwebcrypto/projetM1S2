package fr.univtln.groupe1.webCrypto;

import fr.univtln.groupe1.webCrypto.Account.FileManagment;
import fr.univtln.groupe1.webCrypto.Connexion.GenerationCertificats;
import fr.univtln.groupe1.webCrypto.REST.CORSFilter;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.grizzly.ssl.SSLContextConfigurator;
import org.glassfish.grizzly.ssl.SSLEngineConfigurator;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;

import java.io.IOException;
import java.net.URI;

/**
 * Hello world!
 *
 */


public class Main {
    // Base URI the Grizzly HTTP server will listen on
    public static final String BASE_URI = "https://0.0.0.0:8080/monCoffre/";
    private static final String KEYSTORE_LOC = "/usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/keystore_server";
    private static final String KEYSTORE_PASS= "passee";

    private static final String TRUSTSTORE_LOC = "//usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/truststore_server";
    private static final String TRUSTSTORE_PASS = "passee";

    /**
     * Starts Grizzly HTTPS server exposing JAX-RS resources defined in this application.
     * @return Grizzly HTTPS server.
     */
    public static HttpServer startServer() {
        GenerationCertificats gen = new GenerationCertificats();
        gen.executCommands();

        SSLContextConfigurator sslCon = new SSLContextConfigurator();

        sslCon.setKeyStoreFile(KEYSTORE_LOC);
        System.out.println("sgdg");
        sslCon.setKeyStorePass(KEYSTORE_PASS);
        System.out.println("ggggggg");

        sslCon.setTrustStoreFile(TRUSTSTORE_LOC);
        System.out.println("fffff");
        sslCon.setTrustStorePass(TRUSTSTORE_PASS);
        System.out.println("dddddd");


        // create a resource config that scans for JAX-RS resources and providers
        final ResourceConfig rc = new ResourceConfig().packages("fr.univtln.groupe1.webCrypto").register(new CORSFilter());

        return GrizzlyHttpServerFactory.createHttpServer(URI.create(BASE_URI), rc, true,new SSLEngineConfigurator(sslCon).setClientMode(false).setNeedClientAuth(false));
//        return GrizzlyHttpServerFactory.createHttpServer(URI.create(BASE_URI), rc);
    }

    /**
     * Main method.
     * @param args
     * @throws IOException
     */
    public static void main(String[] args) throws IOException {
//
//        String contenu;
////
//        FileManagment file = new FileManagment();
////
//////        file.createFile("log/", "unFichier3");
//////        contenu = file.openFile("log/", "passwords.db.sc");
////
//        contenu = file.existencyAccount("log", "passwords");
//        System.out.println("contenu= " + contenu);
//
//        contenu = file.existencyAccount("log2", "passc2");
//        System.out.println("contenu= " + contenu);
//
//        contenu = file.existencyAccount("log2", "passc3");
//        System.out.println("contenu= " + contenu);








        final HttpServer server = startServer();
        System.out.println(String.format("Jersey app started with WADL available at "
                + "%sapplication.wadl\nHit CTRL+C to stop it...", BASE_URI));
        System.in.read();
        server.start();


        try {
            Thread.currentThread().join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        server.stop();
    }
}
