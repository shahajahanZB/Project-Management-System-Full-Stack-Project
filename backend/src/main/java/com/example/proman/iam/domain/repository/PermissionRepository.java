package com.example.proman.iam.domain.repository;

import com.example.proman.iam.domain.entity.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<PermissionEntity, Long> {
    Optional<PermissionEntity> findByAccess(String name);
}
