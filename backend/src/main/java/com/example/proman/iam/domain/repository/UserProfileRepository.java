package com.example.proman.iam.domain.repository;

import com.example.proman.iam.domain.entity.UserProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfileEntity, Long> {

    Optional<UserProfileEntity> findByUser_Id(Long userId);

    boolean existsByUser_Id(Long userId);
}
