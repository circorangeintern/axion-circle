package com.cleanreport.util;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Blocks registration from known disposable/temporary email providers.
 */
public final class DisposableEmailValidator {

    private DisposableEmailValidator() {}

    private static final Set<String> BLOCKED_DOMAINS = new HashSet<>(Arrays.asList(
            "tempmail.com", "temp-mail.org", "guerrillamail.com", "guerrillamail.net",
            "yopmail.com", "yopmail.fr", "mailinator.com", "maildrop.cc",
            "throwaway.email", "trashmail.com", "trashmail.net", "trashmail.me",
            "10minutemail.com", "10minute.email", "minutemail.com",
            "tempail.com", "tempr.email", "discard.email",
            "fakeinbox.com", "sharklasers.com", "guerrillamailblock.com",
            "grr.la", "guerrillamail.info", "gishpuppy.com",
            "harakirimail.com", "mailexpire.com", "mailforspam.com",
            "safetymail.info", "spam4.me", "spamfree24.org",
            "bccto.me", "chacuo.net", "dispostable.com",
            "emailondeck.com", "getairmail.com", "mailnesia.com",
            "mohmal.com", "nada.email", "spamgourmet.com",
            "tempmailaddress.com", "tmpmail.net", "tmpmail.org",
            "wegwerfmail.de", "wegwerfmail.net", "wh4f.org",
            "mailcatch.com", "mytemp.email", "throam.com",
            "tmail.ws", "tmpbox.net", "trashmail.org",
            "mailnull.com", "spamcero.com", "spamhole.com",
            "uglymail.com", "33mail.com",
            "inboxkitten.com", "burnermail.io", "temp-mail.io", "emailnator.com"
    ));

    /**
     * Returns true if the email domain is a known disposable email provider.
     */
    public static boolean isDisposable(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }
        String domain = email.substring(email.lastIndexOf("@") + 1).toLowerCase().trim();
        return BLOCKED_DOMAINS.contains(domain);
    }
}
