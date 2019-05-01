package fr.univtln.groupe1.webCrypto;

import fr.univtln.groupe1.webCrypto.Account.FileManagment;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;

/**
 * Hello world!
 *
 */


public class Main {
    // Base URI the Grizzly HTTP server will listen on
    public static final String BASE_URI = "http://0.0.0.0:8080/monCoffre/";

    /**
     * Starts Grizzly HTTP server exposing JAX-RS resources defined in this application.
     * @return Grizzly HTTP server.
     */
    public static HttpServer startServer() {
        // create a resource config that scans for JAX-RS resources and providers
        // in fr.univtln.mnocito114 package
        final ResourceConfig rc = new ResourceConfig().packages("fr.univtln.groupe1.webCrypto");

        // create and start a new instance of grizzly http server
        // exposing the Jersey application at BASE_URI
        return GrizzlyHttpServerFactory.createHttpServer(URI.create(BASE_URI), rc);
    }

    /**
     * Main method.
     * @param args
     * @throws IOException
     */
    public static void main(String[] args) throws IOException {

        ArrayList<String> liste;

        FileManagment file = new FileManagment();
        file.connexion("log/", "passwords.db.sc");

        file.createFile("log/", "unFichier3");
        liste = file.openFile("log/", "passwords.db.sc");

        for(String e : liste) {
            System.out.println("liste main: " + e);
        }



        file.closeConnexion();

//        final HttpServer server = startServer();
//        System.out.println(String.format("Jersey app started with WADL available at "
//                + "%sapplication.wadl\nHit enter to stop it...", BASE_URI));
//        System.in.read();
//        server.start();
//
//
//
//
//
//
//        try {
//            Thread.currentThread().join();
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }
//        server.stop();
    }
}
