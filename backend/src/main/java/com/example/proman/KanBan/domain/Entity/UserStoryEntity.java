package com.example.proman.KanBan.domain.Entity;

import com.example.proman.iam.domain.entity.UserEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_stories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserStoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "epic_id")
    private EpicEntity epic;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "status_id", nullable = false)
    private UserStoryStatusEntity status;

    @Column(nullable = false, columnDefinition = "text")
    private String title;

    @Column(columnDefinition = "text")
    private String description = "";

    @Column(name = "created_date", nullable = false, updatable = false)
    private Instant createdDate;

    @Column(name = "modified_date", nullable = false)
    private Instant modifiedDate;

    @Column(name = "end_date")
    private Instant endDate;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_story_assigned_users",
            joinColumns = @JoinColumn(name = "user_story_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<UserEntity> assignedUsers = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_story_watchers",
            joinColumns = @JoinColumn(name = "user_story_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<UserEntity> watchers = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_story_tags",
            joinColumns = @JoinColumn(name = "user_story_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<UserStoryTagEntity> tags = new HashSet<>();

    @OneToMany(mappedBy = "userStory", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserStoryAttachmentEntity> attachments = new HashSet<>();

    @OneToMany(mappedBy = "userStory", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserStoryCommentEntity> comments = new HashSet<>();

    @OneToMany(mappedBy = "userStory", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserStoryActivityEntity> activities = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdDate = this.createdDate == null ? now : this.createdDate;
        this.modifiedDate = this.modifiedDate == null ? now : this.modifiedDate;
    }

    @PreUpdate
    protected void onUpdate() {
        this.modifiedDate = Instant.now();
    }
}
