package com.example.proman.issue.domain.Repository;

import com.example.proman.issue.domain.Entity.IssueEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<IssueEntity, Long> {

    List<IssueEntity> findAllByProject_IdOrderByCreatedAtDesc(Long projectId);
}
