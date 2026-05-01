package com.example.proman.iam.domain.repository;

import com.example.proman.iam.domain.entity.UserEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByEmail(String email);

    @Query("SELECT u.id FROM UserEntity u WHERE u.email = :email")
    Optional<Long> findIdByEmail(@Param("email") String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = "roles")
    Optional<UserEntity> findById(Long id);

    @EntityGraph(attributePaths = "roles")
    List<UserEntity> findAllById(Iterable<Long> ids);

    @Query("""
        select u from UserEntity u
        where u.roles is empty
    """)
    List<UserEntity> findUsersWithNoRoles();

    @Query("""
        select distinct u
        from UserEntity u
        join u.roles r
        where upper(r.name) = upper(:roleName)
    """)
    List<UserEntity> findUsersByRoleName(@Param("roleName") String roleName);
}
