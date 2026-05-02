package com.example.proman.KanBan.domain.repository;

import com.example.proman.KanBan.domain.Entity.EpicEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EpicRepository extends JpaRepository<EpicEntity, Long> {

    List<EpicEntity> findAllByProject_IdOrderByIdDesc(Long projectId);

    Optional<EpicEntity> findByIdAndProject_Id(Long id, Long projectId);
}
