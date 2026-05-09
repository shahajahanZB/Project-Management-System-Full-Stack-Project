package com.example.proman.issue.domain.Entity;
import com.example.proman.KanBan.domain.Entity.ProjectEntity;
import com.example.proman.iam.domain.entity.UserEntity;
import com.example.proman.issue.domain.Enums.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Entity
@Table(name="issues")
@Getter
@Setter
@NoArgsConstructor
public class IssueEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private UserEntity assignee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private UserEntity createdBy;


    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false)
    private Boolean isBlocked;

    // Enums
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private IssueStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private IssueType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private IssueSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private IssuePriority priority;


    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IssueCommentEntity> comments = new ArrayList<>();

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IssueAttachmentEntity> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IssueActivityEntity> activities = new ArrayList<>();

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<IssueWatcherEntity> watchers = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "issue_tags",
            joinColumns = @JoinColumn(name = "issue_id", nullable = false),
            inverseJoinColumns = @JoinColumn(name = "tag_id", nullable = false)
    )
    private Set<IssueTagEntity> tags = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = this.createdAt == null ? now : this.createdAt;
        this.updatedAt = this.updatedAt == null ? now : this.updatedAt;
        this.isBlocked = this.isBlocked == null ? Boolean.FALSE : this.isBlocked;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
