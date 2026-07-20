package com.cleanreport.model.enums;

/**
 * User level based on LIFETIME credits earned (spending doesn't reduce level).
 */
public enum UserLevel {
    OBSERVER,    // 0-49 lifetime credits
    REPORTER,    // 50-199
    GUARDIAN,    // 200-499
    CHAMPION,    // 500-999
    LEGEND;      // 1000+

    public static UserLevel fromLifetimeCredits(int lifetime) {
        if (lifetime >= 1000) return LEGEND;
        if (lifetime >= 500) return CHAMPION;
        if (lifetime >= 200) return GUARDIAN;
        if (lifetime >= 50) return REPORTER;
        return OBSERVER;
    }

    /**
     * Earning multiplier for this level.
     */
    public double getMultiplier() {
        return switch (this) {
            case OBSERVER -> 1.0;
            case REPORTER -> 1.0;
            case GUARDIAN -> 1.2;
            case CHAMPION -> 1.5;
            case LEGEND -> 2.0;
        };
    }
}
