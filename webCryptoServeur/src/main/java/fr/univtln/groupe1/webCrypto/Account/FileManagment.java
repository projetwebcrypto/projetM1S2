package fr.univtln.groupe1.webCrypto.Account;


import lombok.*;

import java.io.File;
import java.io.IOException;

@ToString
public class FileManagment {
    @Getter
    @Setter
    private String path = "/usr/local/monCoffre/account/";

    public boolean createFile(String login, String fileName) {
        File dir = new File(path);
        // Cree le .../account/
        try {
            dir.mkdir();
        } catch (Exception e) {
            System.out.println(e);
        }

        // Cree le .../account/login/
        try {
            dir = new File(path + login);
            dir.mkdir();
        } catch (Exception e) {
            System.out.println(e);
        }

        // Cree le fichier
        try {
                File completFileName = new File(path + login + fileName + ".db");
                completFileName.createNewFile();
                System.out.println("Done");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return true;
    }
}
