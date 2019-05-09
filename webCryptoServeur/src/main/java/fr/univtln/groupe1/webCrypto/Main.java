//package fr.univtln.groupe1.webCrypto;
//
//import fr.univtln.groupe1.webCrypto.Connexion.GenerationCertificats;
//import fr.univtln.groupe1.webCrypto.REST.CORSFilter;
//import org.glassfish.grizzly.http.server.HttpServer;
//import org.glassfish.grizzly.ssl.SSLContextConfigurator;
//import org.glassfish.grizzly.ssl.SSLEngineConfigurator;
//import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
//import org.glassfish.jersey.server.ResourceConfig;
//
//import java.io.IOException;
//import java.net.URI;
//
///**
// * Hello world!
// *
// */
//
//
//public class Main {
//    // Base URI the Grizzly HTTP server will listen on
//    public static final String BASE_URI = "https://0.0.0.0:8080/monCoffre/";
//
//    // chemin dans le container pour trouver le certificat du serveur
//    private static final String KEYSTORE_LOC = "/usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/keystore_server";
//    private static final String KEYSTORE_PASS= "passee";
//
//    // chemin dans le container pour trouver le trustore du serveur
//    private static final String TRUSTSTORE_LOC = "/usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/truststore_server";
//    private static final String TRUSTSTORE_PASS = "passee";
//
//    /**
//     * Starts Grizzly HTTPS server exposing JAX-RS resources defined in this application.
//     * @return Grizzly HTTPS server.
//     */
//    public static HttpServer startServer() {
//        GenerationCertificats gen = new GenerationCertificats();
//        gen.executCommands();
//
//        SSLContextConfigurator sslCon = new SSLContextConfigurator();
//
//        sslCon.setKeyStoreFile(KEYSTORE_LOC);
//        sslCon.setKeyStorePass(KEYSTORE_PASS);
//
//        sslCon.setTrustStoreFile(TRUSTSTORE_LOC);
//        sslCon.setTrustStorePass(TRUSTSTORE_PASS);
//
//
//        // create a resource config that scans for JAX-RS resources and providers
//        final ResourceConfig rc = new ResourceConfig().packages("fr.univtln.groupe1.webCrypto").register(new CORSFilter());
//
//        // on rajoute apres le rc pour la connection https (true => secure)
//        return GrizzlyHttpServerFactory.createHttpServer(URI.create(BASE_URI), rc, true,new SSLEngineConfigurator(sslCon).setClientMode(false).setNeedClientAuth(false));
//    }
//
//    /**
//     * Main method.
//     * @param args
//     * @throws IOException
//     */
//    public static void main(String[] args) throws IOException {
//
//
//        final HttpServer server = startServer();
//        System.out.println(String.format("Jersey app started with WADL available at "
//                + "%sapplication.wadl\nHit CTRL+C to stop it...", BASE_URI));
//        System.in.read();
//        server.start();
//
//
//        try {
//            Thread.currentThread().join();
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }
//        server.stop();
//    }
//}
