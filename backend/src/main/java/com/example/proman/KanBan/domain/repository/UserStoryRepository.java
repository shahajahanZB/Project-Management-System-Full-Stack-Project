package com.example.proman.KanBan.domain.repository;

import com.example.proman.KanBan.domain.Entity.UserStoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserStoryRepository extends JpaRepository<UserStoryEntity, Long> {

    List<UserStoryEntity> findAllByProject_IdOrderByCreatedDateDesc(Long projectId);

    @EntityGraph(attributePaths = {"status"})
    List<UserStoryEntity> findAllByEpic_IdOrderByCreatedDateDesc(Long epicId);

    @Query(value = """
            select *
            from user_stories us
            where us.project_id = :projectId
              and (
                    cast(us.id as text) like concat('%', :query, '%')
                 or lower(us.title) like lower(concat('%', :query, '%'))
              )
            order by us.created_date desc
            """, nativeQuery = true)
    List<UserStoryEntity> searchByProjectIdAndQuery(@Param("projectId") Long projectId,
                                                    @Param("query") String query);

    Optional<UserStoryEntity> findByIdAndProject_Id(Long id, Long projectId);

    long countByStatus_Id(Long statusId);

    long countByEpic_Id(Long epicId);

    long countByEpic_IdAndStatus_ClosedTrue(Long epicId);
}
