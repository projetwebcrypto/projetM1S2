package fr.univtln.groupe1.webCrypto.Account;


import fr.univtln.groupe1.webCrypto.Connexion.Connect;
import lombok.*;
import org.json.JSONArray;

import javax.xml.bind.DatatypeConverter;
import java.io.*;
import java.sql.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ToString
public class FileManagment{
    @Getter
    @Setter
    private String path = "/usr/local/monCoffre/account/";
    private Connect conn = null;
    private Statement stmt = null;

    public boolean createFile(String login, String fileName) {
        try {
            File file = new File(path + login + "/" + fileName + ".db.sc");
            file.createNewFile();
            this.initSchemaEmptyFile(login, fileName);
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

    }


    // Creer le schema de la bd dans le fichier vide
    public boolean initSchemaEmptyFile(String login, String fileName) {
        conn = new Connect();
        conn.connexion(path, login + "/", fileName + ".db.sc");
        PreparedStatement pstmt;
        try {
            String req = "CREATE TABLE PASSWORDS" + "(SITE_NAME TEXT PRIMARY KEY," + "CRYPTO TEXT not null);";
            pstmt = conn.getConn().prepareStatement(req);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return true;
    }


    public String pullBd(String login, String fileName) {
        File repository = new File(path + login + "/");
        File file = new File(path + login + "/" + fileName + ".db.sc");
        String contenu = "";
        if (repository.exists() && repository.isDirectory()) {
            if (file.exists()) {
                contenu = openFile(login, fileName);
            }
            else {
                contenu = "Fichier " + fileName + " inexistant";
            }
        }
        else {
            contenu = "Utilisateur " + login + " inexistant";
        }
        return contenu;
    }




    
    public String openFile(String login, String fileName) {
        conn = new Connect();
        conn.connexion(path, login + "/", fileName + ".db.sc");
        String contenu = "";
        try {
            byte[] bytes;
            this.stmt = conn.getConn().createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM PASSWORDS");
            // on construit la chaine de caractere dont le serveur a besoin
            while (rs.next()) {
                contenu += "{\"site\":\"" + rs.getString("SITE_NAME") + "\",";
                bytes = rs.getBytes("CRYPTO");
                contenu += "\"crypto\":\"" + DatatypeConverter.printBase64Binary(bytes) + "\"},";
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


    // Remplit la bd
    public void fillFile(String login, String fileName, JSONArray triplets) {
        conn = new Connect();
        conn.connexion(path, login + "/", fileName + ".db.sc");
        PreparedStatement pstmt;
        try {
            String req = "INSERT INTO PASSWORDS (SITE_NAME, CRYPTO) VALUES (?, ?);";
            pstmt = conn.getConn().prepareStatement(req);

            for (int i = 0; i < triplets.length(); i++) {
                pstmt.setObject(1, triplets.getJSONObject(i).get("Website"));
                pstmt.setObject(2, DatatypeConverter.parseBase64Binary(String.valueOf(triplets.getJSONObject(i).get("crypto"))));
                pstmt.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }


    public Boolean pushBd(String login, String fileName, JSONArray triplets) {
        File repository = new File(path + login + "/");
        File file = new File(path + login + "/" + fileName + ".db.sc");
        if (!repository.exists() || !repository.isDirectory()) {
            if (this.createAccount(repository)) {
                if (this.createFile(login, fileName)) {
                    this.fillFile(login, fileName, triplets);
                }
            }
        }
        else {
            if (file.exists()) {
                if (this.deleteFile(file)) {
                    if (this.createFile(login, fileName)) {
                        this.fillFile(login, fileName, triplets);
                    }
                }

            }
            else {
                if (this.createFile(login, fileName)) {
                    this.fillFile(login, fileName, triplets);
                }
            }
        }
        return true;
    }

    // Cree le repertoire de l'utilisateur
    public Boolean createAccount(File repository) {
        try {
            repository.mkdir();
            return true;
        } catch (Exception e) {
            System.out.println(e);
            return false;
        }
    }


    // Supprime un fichier existant
    public Boolean deleteFile(File file) {
        if (file.exists()) {
            try {
                file.delete();
                System.out.println("deleted");
            } catch (Exception e) {
                System.out.println(e);
                return false;
            }
        }
        return true;
    }

    // Liste les bases de donnees d'un utilisateur
    public String listeBd(String login) {
        String contenu ="";
        File repository = new File(path + login + "/");
        try {
            File[] listFile;
            listFile = repository.listFiles();
            for (int i = 0; i < listFile.length; i++) {
                System.out.println();
                System.out.println(listFile[i].toString());
                System.out.println(listFile[i].toString().substring(listFile[i].toString().lastIndexOf("/")));
                // on enleve le / avant le nom du fichier
                // les 6 derniers carateres etant .db.sc ne nous interessent pas
                if (contenu != null && contenu.length() > 0) {
                    contenu = contenu.substring(1, contenu.length() - 6);
                    System.out.println(contenu);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }


        return contenu;
    }
}
