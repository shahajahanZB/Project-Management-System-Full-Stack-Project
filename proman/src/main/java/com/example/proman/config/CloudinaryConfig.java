package com.example.proman.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Value("${app.upload.max-file-size:10MB}")
    private String maxFileSize;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, Object> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        return new Cloudinary(config);
    }

    public void validateFileSize(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Attachment file cannot be empty");
        }

        long allowedBytes = DataSize.parse(maxFileSize).toBytes();
        if (file.getSize() > allowedBytes) {
            throw new IllegalArgumentException("File size must not exceed " + maxFileSize);
        }
    }

    public String normalizeFolder(String folder) {
        if (!StringUtils.hasText(folder)) {
            return "proman";
        }
        return folder.trim().replaceAll("/+", "/");
    }
}
