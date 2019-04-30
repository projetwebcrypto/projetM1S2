package fr.univtln.groupe1.webCrypto;

import fr.univtln.groupe1.webCrypto.Account.FileManagment;

import java.io.IOException;

public class Test {

    public static void main(String[] args) throws IOException {
        FileManagment file = new FileManagment();

        file.createFile("Hylda/", "unFichier3");
    }
}
