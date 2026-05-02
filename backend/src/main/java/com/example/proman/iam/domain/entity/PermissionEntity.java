package com.example.proman.iam.domain.entity;

import com.example.proman.iam.domain.entity.enums.PermissionCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "permission")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PermissionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    @Column(nullable = false, unique = true)
    private String access;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccess() {
        return access;
    }

    public void setAccess(String access) {
        this.access = access;
    }

    public PermissionCategory getCategory() {
        return category;
    }

    public void setCategory(PermissionCategory category) {
        this.category = category;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PermissionCategory category;

    public PermissionEntity(String access, PermissionCategory category) {
        this.access = access;
        this.category = category;
    }

    public PermissionEntity(String access) {
        this.access = access;
    }
}
