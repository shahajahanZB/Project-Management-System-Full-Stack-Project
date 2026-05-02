package com.example.proman.KanBan.domain.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.example.proman.KanBan.domain.Entity.enums.EpicStatus;
import com.example.proman.KanBan.domain.Entity.ProjectEntity;
import com.example.proman.iam.domain.entity.UserEntity;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "epics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EpicEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "text")
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private EpicStatus status = EpicStatus.NEW;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "epic_assigned_users",
            joinColumns = @JoinColumn(name = "epic_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<UserEntity> assignedUsers = new HashSet<>();

    @Transient
    private Integer progress = 0;
}
