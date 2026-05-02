package com.example.proman.issue.domain.Enums;

public enum IssueType {

    BUG("Bug"),
    QUESTION("Question"),
    ENHANCEMENT("Enhancement");

    private final String displayName;
    IssueType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

}
