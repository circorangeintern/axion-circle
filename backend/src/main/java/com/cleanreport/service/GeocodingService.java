package com.cleanreport.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * Reverse geocoding service using OpenStreetMap's Nominatim API.
 * Converts GPS coordinates to a human-readable address.
 * Free, no API key required. Rate limited to 1 request/second.
 */
@Service
@Slf4j
public class GeocodingService {

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
    private final RestTemplate restTemplate;

    public GeocodingService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Reverse geocode coordinates to an address string.
     * Returns null if geocoding fails (non-blocking).
     */
    public String reverseGeocode(double latitude, double longitude) {
        try {
            String url = UriComponentsBuilder.fromUriString(NOMINATIM_URL)
                    .queryParam("format", "json")
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("zoom", 18)
                    .queryParam("addressdetails", 1)
                    .build()
                    .toUriString();

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("display_name")) {
                String fullAddress = (String) response.get("display_name");
                // Trim to max 300 chars
                return fullAddress.length() > 300 ? fullAddress.substring(0, 297) + "..." : fullAddress;
            }
        } catch (Exception e) {
            log.warn("Reverse geocoding failed for ({}, {}): {}", latitude, longitude, e.getMessage());
        }
        return null;
    }
}
