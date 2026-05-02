package com.example.proman.issue.domain.Enums;

public enum IssueStatus {
    NEW("New"),
    IN_PROGRESS("In Progress"),
    READY_FOR_TEST("Ready for Test"),
    CLOSED("Closed"),
    NEEDS_INFO("Needs Info"),
    REJECTED("Rejected"),
    POSTPONED("Postponed");

    private final String displayName;
    IssueStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

}
