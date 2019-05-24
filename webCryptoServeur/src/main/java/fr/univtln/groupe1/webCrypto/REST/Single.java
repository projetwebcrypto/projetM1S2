package fr.univtln.groupe1.webCrypto.REST;

import org.jboss.logging.Logger;

import javax.annotation.PostConstruct;
import javax.ejb.Singleton;
import javax.ejb.Startup;

/*@Singleton
@Startup*/
public class Single {

    private static Logger log = Logger.getLogger(Single.class);

    @PostConstruct
    public void Hello() {
        log.info(">>>>>> Hello !");
    }
}
