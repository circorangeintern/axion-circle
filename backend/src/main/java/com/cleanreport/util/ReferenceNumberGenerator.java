package com.cleanreport.util;

import java.security.SecureRandom;

public final class ReferenceNumberGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PREFIX = "CR-";
    private static final int NUMBER_LENGTH = 5;

    private ReferenceNumberGenerator() {
    }

    public static String generate() {
        int number = RANDOM.nextInt(99999) + 1;
        return PREFIX + String.format("%0" + NUMBER_LENGTH + "d", number);
    }
}
