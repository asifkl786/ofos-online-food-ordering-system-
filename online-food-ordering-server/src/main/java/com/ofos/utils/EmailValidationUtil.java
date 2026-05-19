package com.ofos.utils;

import com.ofos.exception.BusinessException;

import java.util.Map;

public final class EmailValidationUtil {

    private static final Map<String, String> KNOWN_DOMAIN_TYPOS = Map.ofEntries(
            Map.entry("gmil.com", "gmail.com"),
            Map.entry("gmai.com", "gmail.com"),
            Map.entry("gmial.com", "gmail.com"),
            Map.entry("gmal.com", "gmail.com"),
            Map.entry("gmail.co", "gmail.com"),
            Map.entry("gmail.con", "gmail.com"),
            Map.entry("yaho.com", "yahoo.com"),
            Map.entry("yahoo.co", "yahoo.com"),
            Map.entry("hotmial.com", "hotmail.com"),
            Map.entry("hotmai.com", "hotmail.com"),
            Map.entry("outlok.com", "outlook.com"),
            Map.entry("outlook.co", "outlook.com")
    );

    private EmailValidationUtil() {
    }

    public static void rejectKnownDomainTypos(String email) {
        if (email == null || !email.contains("@")) {
            return;
        }

        String domain = email.substring(email.lastIndexOf('@') + 1).trim().toLowerCase();
        String suggestion = KNOWN_DOMAIN_TYPOS.get(domain);
        if (suggestion != null) {
            throw new BusinessException("Email domain typo: use " + suggestion + " instead of " + domain);
        }
    }
}
