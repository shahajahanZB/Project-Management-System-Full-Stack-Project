package com.example.proman.iam.domain.repository;

import com.example.proman.iam.domain.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    List<PasswordResetOtp> findByUser_IdAndUsedAtIsNull(Long userId);

    Optional<PasswordResetOtp> findFirstByUser_IdAndUsedAtIsNullOrderByCreatedAtDesc(Long userId);

    Optional<PasswordResetOtp> findFirstByResetTokenAndUsedAtIsNullOrderByCreatedAtDesc(String resetToken);
}
