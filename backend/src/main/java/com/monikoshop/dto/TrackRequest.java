package com.monikoshop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TrackRequest(
        @NotBlank
        @Pattern(regexp = "^[0-9a-fA-F-]{36}$", message = "invalid visitor id")
        String visitorId
) {}
