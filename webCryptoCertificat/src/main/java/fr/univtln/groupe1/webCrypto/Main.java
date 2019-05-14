package fr.univtln.groupe1.webCrypto;


import org.glassfish.grizzly.ssl.SSLContextConfigurator;

import java.io.IOException;

public class Main
{
    // Base URI the Grizzly HTTP server will listen on
//    public static final String BASE_URI = "https://0.0.0.0:8080/monCoffre/";

    // chemin dans le container pour trouver le certificat du serveur
    private static final String KEYSTORE_LOC = "/usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/keystore_server";
    private static final String KEYSTORE_PASS= "passee";

    // chemin dans le container pour trouver le trustore du serveur
    private static final String TRUSTSTORE_LOC = "/usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/truststore_server";
    private static final String TRUSTSTORE_PASS = "passee";

    /**
     * Main method.
     * @param args
     * @throws IOException
     */
    public static void main(String[] args) throws IOException {
        GenerationCertificat gen = new GenerationCertificat();
        gen.executCommands();

    }
}
