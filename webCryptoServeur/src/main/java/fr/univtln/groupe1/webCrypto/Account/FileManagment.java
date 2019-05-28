package fr.univtln.groupe1.webCrypto.Account;

import fr.univtln.groupe1.webCrypto.Connexion.FileDAO;
import lombok.*;
import org.json.JSONArray;

import java.io.*;
import java.util.ArrayList;
import java.util.List;


@ToString
public class FileManagment{
    @Getter
    @Setter
    private String path = "/usr/local/monCoffre/account/";


    public boolean createFile(String login, String fileName) {
        FileDAO fileDAO = new FileDAO();
        try {
            File file = new File(path + login + "/" + fileName + ".db.sc");
            file.createNewFile();
            if (fileDAO.initSchemaEmptyFile(path, login, fileName))
                return true;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;
    }


    public String pullBd(String login, String fileName) {
        File repository = new File(path + login + "/");
        File file = new File(path + login + "/" + fileName + ".db.sc");
        FileDAO fileDAO = new FileDAO();
        String content = "";
        if (repository.exists() && repository.isDirectory()) {
            if (file.exists()) {
                content = fileDAO.openFile(path, login, fileName);
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


    public Boolean pushBd(String login, String fileName, JSONArray triplets) {
        File repository = new File(path + login + "/");
        File file = new File(path + login + "/" + fileName + ".db.sc");
        FileDAO fileDAO = new FileDAO();
        if (!repository.exists() || !repository.isDirectory()) {
            if (this.createAccount(repository)) {
                if (this.createFile(login, fileName)) {
                    fileDAO.fillFile(path, login, fileName, triplets);
                }
            }
        }
        else {
            if (file.exists()) {
                if (this.deleteFile(file)) {
                    if (this.createFile(login, fileName)) {
                        fileDAO.fillFile(path, login, fileName, triplets);
                    }
                }

            }
            else {
                if (this.createFile(login, fileName)) {
                    fileDAO.fillFile(path, login, fileName, triplets);
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
