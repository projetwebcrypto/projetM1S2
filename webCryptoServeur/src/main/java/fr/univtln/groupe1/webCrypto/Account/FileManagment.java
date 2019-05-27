package fr.univtln.groupe1.webCrypto.Account;


import fr.univtln.groupe1.webCrypto.Connexion.Connect;
import lombok.*;
import org.json.JSONArray;

import javax.xml.bind.DatatypeConverter;
import java.io.*;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;


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
        String content = "";
        if (repository.exists() && repository.isDirectory()) {
            if (file.exists()) {
                content = openFile(login, fileName);
            }
            else {
                content = "Fichier " + fileName + " inexistant";
            }
        }
        else {
            content = "Utilisateur " + login + " inexistant";
        }
        return content;
    }




    
    public String openFile(String login, String fileName) {
        conn = new Connect();
        conn.connexion(path, login + "/", fileName + ".db.sc");
        String content = "";
        try {
            byte[] bytes;
            this.stmt = conn.getConn().createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM PASSWORDS");
            // on construit la chaine de caractere dont le serveur a besoin
            while (rs.next()) {
                content += "{\"site\":\"" + rs.getString("SITE_NAME") + "\",";
                bytes = rs.getBytes("CRYPTO");
                content += "\"crypto\":\"" + DatatypeConverter.printBase64Binary(bytes) + "\"},";
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        // on enleve la virgule de la fin
        if (content != null && content.length() > 0) {
            content = content.substring(0, content.length() - 1);
        }

        conn.closeConnexion();

        return content;
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
        String content = "{\"Base\":";
        String fileName = "";
        List<String> listeBd = new ArrayList<>();
        File repository = new File(path + login + "/");
        try {
            File[] listFile;
            // recupere la reference de chaque fichier sous repository
            listFile = repository.listFiles();
            for (int i = 0; i < listFile.length; i++) {
                fileName = listFile[i].toString().substring(listFile[i].toString().lastIndexOf("/"));
                // on enleve le / avant le nom du fichier
                // les 6 derniers carateres etant .db.sc ne nous interessent pas
                // le nom du fichier doit avoir plus de 7 caracteres (.db.sc) => fichier sans nom
                if (fileName != null && fileName.length() > 7 && (fileName.substring(fileName.length() - 6, fileName.length())).equals(".db.sc")) {
                    fileName = fileName.substring(1, fileName.length() - 6);
                    listeBd.add("\"" + fileName + "\"");
                }
            }
            content = content + listeBd.toString() + "}";
        } catch (Exception e) {
            e.printStackTrace();
        }
        return content;
    }
}
