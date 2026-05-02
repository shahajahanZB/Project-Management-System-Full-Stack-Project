package com.example.proman.issue.domain.Enums;

public enum IssueSeverity {

    OPTIONAL("Optional"),
    MINOR("Minor"),
    NORMAL("Normal"),
    IMPORTANT("Important"),
    CRITICAL("Critical");

    private final String displayName;

    IssueSeverity(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

}
