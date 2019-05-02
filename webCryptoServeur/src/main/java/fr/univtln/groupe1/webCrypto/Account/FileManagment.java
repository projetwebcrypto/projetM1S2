package fr.univtln.groupe1.webCrypto.Account;


import fr.univtln.groupe1.webCrypto.Connexion.Connect;
import lombok.*;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
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
            File completFileName = new File(path + login + "/" + fileName + ".db.sc");
            completFileName.createNewFile();
            this.initSchemaEmptyFile(login, fileName);
            System.out.println("fichier vide cree");
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
        PreparedStatement pstmt; //= connection.prepareStatement(sql);
        try {
            String req = "CREATE TABLE PASSWORDS" + "(SITE_NAME TEXT not null," + "CRYPTO TEXT) not null"
                    + "PRIMARY KEY (SITE_NAME)"+ ")";
            pstmt = conn.getConn().prepareStatement(req);
//            pstmt.setString(1,"PASSWORDS");
            ResultSet rs = stmt.executeQuery(req);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return true;
    }


    public String openFile(String login, String fileName) {
        conn = new Connect();
        conn.connexion(path, login + "/", fileName + ".db.sc");
        String contenu = "";

        try {
            this.stmt = conn.getConn().createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM PASSWORDS");
            // on construit la chaine de caractere dont le serveur a besoin
            while (rs.next()) {
                contenu += "{\"site\":\"" + rs.getString("SITE_NAME") + "\",";
                contenu += "\"crypto\":\"" + URLEncoder.encode(rs.getString("CRYPTO"), "UTF-8") + "\"},";

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

    // verifie si un utilisateur existe et le cree si non
    // verifie si un fichier existe et le cree si non
    public String existencyAccount(String login, String fileName) {
        File repository = new File(path + login + "/");
        File file = new File(path + login + "/" + fileName + ".db.sc");
        // le "fichier" existe et est un dossier
        if (repository.exists() && repository.isDirectory()) {
            if (file.exists()) {
                System.out.println("Le fichier et le repertoire existe");
                return openFile(login, fileName);
            }
            else {
                createFile(login, fileName);
                return "Fichier non trouvé\nCreation du fichier";
            }
        }
        else {
            createFile(login, fileName);
            return "Creation d'un nouvel utilisateur";
        }

    }

}
