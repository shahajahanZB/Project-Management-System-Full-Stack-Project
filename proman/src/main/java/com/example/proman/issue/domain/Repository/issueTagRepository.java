package com.example.proman.issue.domain.Repository;

import com.example.proman.issue.domain.Entity.IssueTagEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IssueTagRepository extends JpaRepository<IssueTagEntity, Long> {

    Optional<IssueTagEntity> findByNameIgnoreCase(String name);
}
