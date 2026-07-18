package com.cleanreport.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DisposableEmailValidatorTest {

    @Test
    @DisplayName("isDisposable - tempmail.com - returns true")
    void tempmail_isDisposable() {
        assertThat(DisposableEmailValidator.isDisposable("user@tempmail.com")).isTrue();
    }

    @Test
    @DisplayName("isDisposable - guerrillamail.com - returns true")
    void guerrillamail_isDisposable() {
        assertThat(DisposableEmailValidator.isDisposable("test@guerrillamail.com")).isTrue();
    }

    @Test
    @DisplayName("isDisposable - yopmail.com - returns true")
    void yopmail_isDisposable() {
        assertThat(DisposableEmailValidator.isDisposable("spam@yopmail.com")).isTrue();
    }

    @Test
    @DisplayName("isDisposable - gmail.com - returns false")
    void gmail_isNotDisposable() {
        assertThat(DisposableEmailValidator.isDisposable("user@gmail.com")).isFalse();
    }

    @Test
    @DisplayName("isDisposable - yahoo.com - returns false")
    void yahoo_isNotDisposable() {
        assertThat(DisposableEmailValidator.isDisposable("user@yahoo.com")).isFalse();
    }

    @Test
    @DisplayName("isDisposable - company domain - returns false")
    void companyDomain_isNotDisposable() {
        assertThat(DisposableEmailValidator.isDisposable("employee@cleanreport.com")).isFalse();
    }

    @Test
    @DisplayName("isDisposable - null email - returns false")
    void nullEmail_returnsFalse() {
        assertThat(DisposableEmailValidator.isDisposable(null)).isFalse();
    }

    @Test
    @DisplayName("isDisposable - case insensitive")
    void caseInsensitive() {
        assertThat(DisposableEmailValidator.isDisposable("user@TEMPMAIL.COM")).isTrue();
    }
}
