package fr.univtln.groupe1.webCrypto.Account;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Builder
@ToString
public class CoupleCrypte {
    @Getter
    private String site;

    @Getter
    private String pass;


}
