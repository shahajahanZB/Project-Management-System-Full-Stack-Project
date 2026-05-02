package com.example.proman.issue.domain.Repository;

import com.example.proman.issue.domain.Entity.IssueEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueRepository extends JpaRepository<IssueEntity, Long> {
}