package com.example.proman.KanBan.domain.repository;

import com.example.proman.KanBan.domain.Entity.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {

    Optional<ProjectEntity> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<ProjectEntity> findAllByOwner_IdOrderByCreatedDateDesc(Long ownerId);

    @Query("""
            select distinct p
            from ProjectEntity p
            left join ProjectMembershipEntity pm on pm.project = p
            where p.owner.id = :userId
               or pm.user.id = :userId
            order by p.createdDate desc
            """)
    List<ProjectEntity> findVisibleProjectsByUserId(@Param("userId") Long userId);
}
