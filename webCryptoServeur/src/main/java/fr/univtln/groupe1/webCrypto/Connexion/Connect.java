package fr.univtln.groupe1.webCrypto.Connexion;

import lombok.Getter;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Connect {
    @Getter
    private Connection conn = null;

    // on se connecte a la bd
    public void connexion(String path, String login, String fileName) {
        try{
            Class.forName("org.sqlite.JDBC");
            conn = DriverManager.getConnection("jdbc:sqlite:" + path + login + fileName);
            System.out.println("connecté");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void closeConnexion() {
        try {
            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
