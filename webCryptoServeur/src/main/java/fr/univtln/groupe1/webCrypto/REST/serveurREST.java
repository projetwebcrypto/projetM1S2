package fr.univtln.groupe1.webCrypto.REST;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonWriter;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/moncoffre")
@Produces({"application/json"})
public class serveurREST {
    @GET
    public List<Json> getBDDTriplets() {
        return null;
    }
    // reception, envoie de json triplet
    // reception de json avec login, nomdb
}
