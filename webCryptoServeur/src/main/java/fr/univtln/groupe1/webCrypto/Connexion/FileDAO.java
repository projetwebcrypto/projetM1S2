package fr.univtln.groupe1.webCrypto.Connexion;

import org.json.JSONArray;

import javax.xml.bind.DatatypeConverter;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class FileDAO {
    private Connect conn = null;
    private Statement stmt = null;

    // Creer le schema de la bd dans le fichier vide
    public boolean initSchemaEmptyFile(String path, String login, String fileName) {
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


    public String openFile(String path, String login, String fileName) {
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
    public void fillFile(String path, String login, String fileName, JSONArray triplets) {
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
}
