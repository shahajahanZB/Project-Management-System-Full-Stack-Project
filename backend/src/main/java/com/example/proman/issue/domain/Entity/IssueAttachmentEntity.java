package com.example.proman.issue.domain.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@NoArgsConstructor
public class IssueAttachmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_path", nullable = false, length = 2048)
    private String filePath;

    @Column(name = "file_url", nullable = false, length = 2048)
    private String fileUrl;

    @Column(name = "cloudinary_public_id", length = 255)
    private String cloudinaryPublicId;

    @Column(name = "original_file_name", length = 255)
    private String fileName;

    @Column(name = "content_type", length = 128)
    private String contentType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne
    @JoinColumn(name = "issue_id", nullable = false)
    private IssueEntity issue;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    public String getFilePath() {
        return filePath != null ? filePath : fileUrl;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
        this.fileUrl = filePath;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = this.createdAt == null ? Instant.now() : this.createdAt;
    }
}
