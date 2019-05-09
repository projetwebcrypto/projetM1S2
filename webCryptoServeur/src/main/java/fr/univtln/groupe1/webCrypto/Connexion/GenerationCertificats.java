package fr.univtln.groupe1.webCrypto.Connexion;

import java.io.*;
import java.util.concurrent.TimeUnit;

public class GenerationCertificats {


    public void executCommands() {
        File script = createTempFile();
        ProcessBuilder pb = new ProcessBuilder("sh", script.toString());
        pb.inheritIO();

        try {
            Process process = pb.start();

            process.waitFor();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            script.delete();
        }

    }


    // methode pour lancer des commandes dans un shell
    public File createTempFile() {
        try {
            File script = File.createTempFile("script", null);

            Writer streamWriter = new OutputStreamWriter(new FileOutputStream(script));
            PrintWriter printWriter = new PrintWriter(streamWriter);

            printWriter.println("#!/bin/sh");
            printWriter.println("keytool -genkey -keyalg RSA -keysize 2048 -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/keystore_client -alias clientKey < /usr/local/monCoffre/certificats/scenario1.txt");
            printWriter.println("keytool -export -alias clientKey -rfc -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/keystore_client > /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/client.cert < /usr/local/monCoffre/certificats/scenario2.txt");
            printWriter.println("keytool -import -alias clientCert -file /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/client.cert -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/truststore_server < /usr/local/monCoffre/certificats/scenario3.txt");
            printWriter.println("keytool -genkey -keyalg RSA -keysize 2048 -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/keystore_server -alias serverKey < /usr/local/monCoffre/certificats/scenario1.txt");
            printWriter.println("keytool -export -alias serverKey -rfc -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/keystore_server > /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/server.cert < /usr/local/monCoffre/certificats/scenario2.txt");
            printWriter.println("keytool -import -alias serverCert -file /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/server.cert -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/truststore_client < /usr/local/monCoffre/certificats/scenario3.txt");

            printWriter.close();
            return script;

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
