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
//import jakarta.persistence.OneToMany;
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
//@Table(name = "user_stories")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//public class UserStoryEntity {
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
//    @JoinColumn(name = "owner_id")
//    private UserEntity owner;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "assigned_to_id")
//    private UserEntity assignedTo;
//
//    @Column(name = "is_closed", nullable = false)
//    private boolean closed = false;
//
//    @Column(name = "backlog_order", nullable = false)
//    private Long backlogOrder;
//
//    @Column(name = "sprint_order", nullable = false)
//    private Long sprintOrder;
//
//    @Column(name = "kanban_order", nullable = false)
//    private Long kanbanOrder;
//
//    @Column(name = "created_date", nullable = false)
//    private Instant createdDate;
//
//    @Column(name = "modified_date", nullable = false)
//    private Instant modifiedDate;
//
//    @Column(name = "finish_date")
//    private Instant finishDate;
//
//    @Column(nullable = false, columnDefinition = "text")
//    private String subject;
//
//    @Column(columnDefinition = "text")
//    private String description = "";
//
//    @Column(name = "client_requirement", nullable = false)
//    private boolean clientRequirement = false;
//
//    @Column(name = "team_requirement", nullable = false)
//    private boolean teamRequirement = false;
//
//    @ManyToMany(fetch = FetchType.LAZY)
//    @JoinTable(
//            name = "user_story_assigned_users",
//            joinColumns = @JoinColumn(name = "user_story_id"),
//            inverseJoinColumns = @JoinColumn(name = "user_id")
//    )
//    private Set<UserEntity> assignedUsers = new HashSet<>();
//
////    @OneToMany(mappedBy = "userStory", fetch = FetchType.LAZY)
////    private Set<TaskEntity> tasks = new HashSet<>();
//
//    @ManyToMany(mappedBy = "userStories", fetch = FetchType.LAZY)
//    private Set<EpicEntity> epics = new HashSet<>();
//
////    @ManyToOne(fetch = FetchType.LAZY)
////    @JoinColumn(name = "generated_from_task_id")
////    private TaskEntity generatedFromTask;
//
//    @Column(name = "from_task_ref")
//    private String fromTaskRef;
//
//    @ElementCollection(fetch = FetchType.LAZY)
//    @CollectionTable(name = "user_story_tags", joinColumns = @JoinColumn(name = "user_story_id"))
//    @Column(name = "tag", nullable = false)
//    private Set<String> tags = new HashSet<>();
//
//    @ElementCollection(fetch = FetchType.LAZY)
//    @CollectionTable(name = "user_story_external_references", joinColumns = @JoinColumn(name = "user_story_id"))
//    @Column(name = "external_reference", nullable = false)
//    private Set<String> externalReferences = new HashSet<>();
//
//    @ManyToMany(fetch = FetchType.LAZY)
//    @JoinTable(
//            name = "user_story_watchers",
//            joinColumns = @JoinColumn(name = "user_story_id"),
//            inverseJoinColumns = @JoinColumn(name = "user_id")
//    )
//    private Set<UserEntity> watchers = new HashSet<>();
//
//    @PrePersist
//    protected void onCreate() {
//        Instant now = Instant.now();
//        this.createdDate = this.createdDate == null ? now : this.createdDate;
//        this.modifiedDate = this.modifiedDate == null ? now : this.modifiedDate;
//        this.backlogOrder = this.backlogOrder == null ? now.toEpochMilli() : this.backlogOrder;
//        this.sprintOrder = this.sprintOrder == null ? now.toEpochMilli() : this.sprintOrder;
//        this.kanbanOrder = this.kanbanOrder == null ? now.toEpochMilli() : this.kanbanOrder;
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        this.modifiedDate = Instant.now();
//    }
//}
