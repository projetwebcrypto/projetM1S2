package fr.univtln.groupe1.webCrypto.Connexion;

import java.io.*;
import java.util.concurrent.TimeUnit;

public class GenerationCertificats {


    public void executCommands() {
        File script = createTempFile();
        System.out.println("il est passe ...");
        ProcessBuilder pb = new ProcessBuilder("sh", script.toString());
        pb.inheritIO();

        try {
            Process process = pb.start();

            process.waitFor(10000, TimeUnit.MILLISECONDS);
            System.out.println("vide");
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            script.delete();
        }

    }

    public File createTempFile() {
        try {
            System.out.println("fgreg");
            File script = File.createTempFile("script", null);

            Writer streamWriter = new OutputStreamWriter(new FileOutputStream(script));
            PrintWriter printWriter = new PrintWriter(streamWriter);

            printWriter.println("#!/bin/sh");
            printWriter.println("ls /usr/local/monCoffre");
            System.out.println("1");
            printWriter.println("keytool -genkey -keyalg RSA -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/keystore_client -alias clientKey < /usr/local/monCoffre/certificats/scenario1.txt");
            System.out.println("2");
            printWriter.println("keytool -export -alias clientKey -rfc -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/keystore_client > /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/client.cert < /usr/local/monCoffre/certificats/scenario2.txt");
            System.out.println("3");
            printWriter.println("keytool -import -alias clientCert -file /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/client.cert -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/truststore_server < /usr/local/monCoffre/certificats/scenario3.txt");
            System.out.println("4");
            printWriter.println("keytool -genkey -keyalg RSA -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/keystore_server -alias serverKey < /usr/local/monCoffre/certificats/scenario1.txt");
            System.out.println("5");
            printWriter.println("keytool -export -alias serverKey -rfc -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/keystore_server > /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/server.cert < /usr/local/monCoffre/certificats/scenario2.txt");
            System.out.println("6");
            printWriter.println("keytool -import -alias serverCert -file /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/server.cert -keystore /usr/lib/jvm/java-1.8.0-openjdk-amd64/lib/security/cacerts/truststore_client < /usr/local/monCoffre/certificats/scenario3.txt");

            System.out.println("fin");
            printWriter.println("ls /usr/local/monCoffre");
            printWriter.close();
            return script;

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
