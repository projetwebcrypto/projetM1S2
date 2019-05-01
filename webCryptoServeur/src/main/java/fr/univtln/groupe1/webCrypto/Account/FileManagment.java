package fr.univtln.groupe1.webCrypto.Account;


import lombok.*;
import org.codehaus.jackson.map.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@ToString
public class FileManagment{
    @Getter
    @Setter
    private String path = "/usr/local/monCoffre/account/";
    private Connection c = null;
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
                File completFileName = new File(path + login + fileName + ".db");
                completFileName.createNewFile();
                System.out.println("Done");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return true;
    }

    public void connexion(String login, String fileName) {
        try{
            Class.forName("org.sqlite.JDBC");
            c = DriverManager.getConnection("jdbc:sqlite:" + path + login + fileName);
            System.out.println("connecté");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void closeConnexion() {
        try {
            c.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }


    public ArrayList<String> openFile(String login, String fileName) {
        ArrayList<String> liste = new ArrayList<>();
        CoupleCrypte.CoupleCrypteBuilder builder = CoupleCrypte.builder();

        ObjectMapper mapper = new ObjectMapper();

        try {
            this.stmt = c.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM PASSWORDS");
            while (rs.next()) {
                System.out.println(rs.getString("SITE_NAME"));
                System.out.println(rs.getString("CRYPTO"));


//                try {
//
//                }




                liste.add(rs.getString("SITE_NAME"));
                liste.add(rs.getString("CRYPTO"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        for(String e : liste) {
           System.out.println("liste: " + e);
        }

        return liste;
    }

}
