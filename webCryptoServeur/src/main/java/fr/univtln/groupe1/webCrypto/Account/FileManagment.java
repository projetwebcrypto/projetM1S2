package fr.univtln.groupe1.webCrypto.Account;


import fr.univtln.groupe1.webCrypto.Connexion.Connect;
import lombok.*;

import java.io.File;
import java.io.IOException;
import java.sql.*;

@ToString
public class FileManagment{
    @Getter
    @Setter
    private String path = "/usr/local/monCoffre/account/";
    private Connect conn = null;
    private Statement stmt = null;

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
            File completFileName = new File(path + login + fileName + ".db.sc");
            completFileName.createNewFile();
            System.out.println("fichier vide cree");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return true;
    }


    public String openFile(String login, String fileName) {
        conn = new Connect();
        conn.connexion(path, login + "/", fileName);
        String contenu = "";

        try {
            this.stmt = conn.getConn().createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM PASSWORDS");
            // on construit la chaine de caractere dont le serveur a besoin
            while (rs.next()) {
                contenu += "{\"site\":\"" + rs.getString("SITE_NAME") + "\",";
                contenu += "\"crypto\":\"" + rs.getString("CRYPTO") + "\"},";
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // on enleve la virgule de la fin
        if (contenu != null && contenu.length() > 0) {
            contenu = contenu.substring(0, contenu.length() - 1);
        }

        conn.closeConnexion();

        return contenu;
    }

}
