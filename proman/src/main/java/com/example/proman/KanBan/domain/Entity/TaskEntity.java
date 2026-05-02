//package com.example.proman.KanBan.domain.Entity;
//
//import com.example.proman.iam.domain.entity.UserEntity;
//import jakarta.persistence.CollectionTable;
//import jakarta.persistence.Column;
//import jakarta.persistence.ElementCollection;
//import jakarta.persistence.Entity;
//import jakarta.persistence.FetchType;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//import jakarta.persistence.Id;
//import jakarta.persistence.JoinColumn;
//import jakarta.persistence.JoinTable;
//import jakarta.persistence.ManyToMany;
//import jakarta.persistence.ManyToOne;
//import jakarta.persistence.PrePersist;
//import jakarta.persistence.PreUpdate;
//import jakarta.persistence.Table;
//import jakarta.persistence.Version;
//import lombok.AllArgsConstructor;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//import lombok.Setter;
//
//import java.time.Instant;
//import java.util.HashSet;
//import java.util.Set;
//
//@Entity
//@Table(name = "tasks")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//public class TaskEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Version
//    private Integer version;
//
//    @Column(name = "is_blocked", nullable = false)
//    private boolean blocked = false;
//
//    @Column(name = "blocked_note", columnDefinition = "text", nullable = false)
//    private String blockedNote = "";
//
//    @Column(name = "ref")
//    private Long ref;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "project_id", nullable = false)
//    private ProjectEntity project;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_story_id")
//    private UserStoryEntity userStory;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "owner_id")
//    private UserEntity owner;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "assigned_to_id")
//    private UserEntity assignedTo;
//
//    @Column(name = "created_date", nullable = false)
//    private Instant createdDate;
//
//    @Column(name = "modified_date", nullable = false)
//    private Instant modifiedDate;
//
//    @Column(name = "finished_date")
//    private Instant finishedDate;
//
//    @Column(nullable = false, columnDefinition = "text")
//    private String subject;
//
//    @Column(columnDefinition = "text")
//    private String description = "";
//
//    @Column(name = "us_order", nullable = false)
//    private Long usOrder;
//
//    @Column(name = "taskboard_order", nullable = false)
//    private Long taskboardOrder;
//
//    @Column(name = "is_iocaine", nullable = false)
//    private boolean iocaine = false;
//
//    @ElementCollection(fetch = FetchType.LAZY)
//    @CollectionTable(name = "task_tags", joinColumns = @JoinColumn(name = "task_id"))
//    @Column(name = "tag", nullable = false)
//    private Set<String> tags = new HashSet<>();
//
//    @ElementCollection(fetch = FetchType.LAZY)
//    @CollectionTable(name = "task_external_references", joinColumns = @JoinColumn(name = "task_id"))
//    @Column(name = "external_reference", nullable = false)
//    private Set<String> externalReferences = new HashSet<>();
//
//    @ManyToMany(fetch = FetchType.LAZY)
//    @JoinTable(
//            name = "task_watchers",
//            joinColumns = @JoinColumn(name = "task_id"),
//            inverseJoinColumns = @JoinColumn(name = "user_id")
//    )
//    private Set<UserEntity> watchers = new HashSet<>();
//
//    @PrePersist
//    protected void onCreate() {
//        Instant now = Instant.now();
//        this.createdDate = this.createdDate == null ? now : this.createdDate;
//        this.modifiedDate = this.modifiedDate == null ? now : this.modifiedDate;
//        this.usOrder = this.usOrder == null ? now.toEpochMilli() : this.usOrder;
//        this.taskboardOrder = this.taskboardOrder == null ? now.toEpochMilli() : this.taskboardOrder;
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        this.modifiedDate = Instant.now();
//    }
//}
