package com.example.proman.iam.domain.service;

import com.example.proman.iam.domain.entity.PermissionEntity;
import com.example.proman.iam.domain.entity.RoleEntity;
import com.example.proman.iam.domain.entity.UserEntity;
import com.example.proman.iam.domain.repository.PermissionRepository;
import com.example.proman.iam.domain.repository.RoleRepository;
import com.example.proman.iam.domain.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class SuperAdminBootstrapService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminBootstrapService.class);
    private static final List<String> MINIMUM_BOOTSTRAP_PERMISSIONS = List.of(
            "USER_CREATE",
            "USER_UPDATE",
            "USER_DELETE",
            "USER_VIEW_ALL",
            "ROLE_MANAGE"
    );

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${bootstrap.super-admin.enabled:false}")
    private boolean enabled;

    @Value("${bootstrap.super-admin.username:superadmin}")
    private String username;

    @Value("${bootstrap.super-admin.email:superadmin@aviators.local}")
    private String email;

    @Value("${bootstrap.super-admin.password:ChangeMe123!}")
    private String password;

    @Value("${bootstrap.super-admin.role:SUPERADMIN}")
    private String roleName;

    @Value("${bootstrap.super-admin.platform-admin-email:}")
    private String platformAdminEmail;

    @Value("${bootstrap.super-admin.platform-admin-username:}")
    private String platformAdminUsername;

    public SuperAdminBootstrapService(UserRepository userRepository,
                                      RoleRepository roleRepository,
                                      PermissionRepository permissionRepository,
                                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        validateConfig();

        String primaryRoleName = normalizedRoleName();
        RoleEntity primaryRole = resolveOrCreateRole(primaryRoleName);

        ensureMinimumPermissions();
        Set<PermissionEntity> allPermissions = new HashSet<>(permissionRepository.findAll());
        grantAllPermissions(primaryRole, allPermissions);

        UserEntity existingUser = findBootstrapUser();
        if (existingUser != null) {
            Set<RoleEntity> mergedRoles = new HashSet<>(existingUser.getRoles());
            mergedRoles.add(primaryRole);
            if (!"ADMIN".equalsIgnoreCase(primaryRoleName)) {
                mergedRoles.removeIf(role -> "ADMIN".equalsIgnoreCase(role.getName()));
            }
            existingUser.setRoles(mergedRoles);
            userRepository.save(existingUser);
            ensurePlatformAdminRole(primaryRole);
            log.info("Bootstrap super admin already exists for email={} / username={}. Ensured role [{}] and permissions.",
                    existingUser.getEmail(), existingUser.getUsername(), primaryRole.getName());
            return;
        }

        ensurePlatformAdminRole(primaryRole);

        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(Set.of(primaryRole));

        userRepository.save(user);
        log.warn("Bootstrap super admin created with email={} and role=[{}]. Change password immediately.",
                email, primaryRole.getName());
    }

    private void ensureMinimumPermissions() {
        for (String access : MINIMUM_BOOTSTRAP_PERMISSIONS) {
            permissionRepository.findByAccess(access)
                    .orElseGet(() -> permissionRepository.save(new PermissionEntity(access)));
        }
    }

    private void validateConfig() {
        if (isBlank(username) || isBlank(email) || isBlank(password) || isBlank(roleName)) {
            throw new IllegalStateException("bootstrap.super-admin.* configuration is incomplete");
        }
    }

    private String normalizedRoleName() {
        String configured = roleName == null ? "" : roleName.trim().toUpperCase(Locale.ROOT);
        if (!"SUPERADMIN".equals(configured)) {
            log.warn("bootstrap.super-admin.role='{}' overridden to 'SUPERADMIN' for platform bootstrap", configured);
        }
        return "SUPERADMIN";
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private RoleEntity resolveOrCreateRole(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    RoleEntity created = new RoleEntity();
                    created.setName(name);
                    return roleRepository.save(created);
                });
    }

    private void grantAllPermissions(RoleEntity role, Set<PermissionEntity> allPermissions) {
        role.getPermissions().addAll(allPermissions);
        roleRepository.save(role);
    }

    private UserEntity findBootstrapUser() {
        UserEntity byEmail = userRepository.findByEmail(email).orElse(null);
        UserEntity byUsername = userRepository.findByUsername(username).orElse(null);

        if (byEmail != null && byUsername != null && !byEmail.getId().equals(byUsername.getId())) {
            throw new IllegalStateException(
                    "bootstrap.super-admin.email and username point to different users. " +
                            "email=" + email + ", username=" + username
            );
        }
        return byEmail != null ? byEmail : byUsername;
    }

    private void ensurePlatformAdminRole(RoleEntity primaryRole) {
        String primaryRoleName = primaryRole.getName();
        if (isBlank(platformAdminEmail) && isBlank(platformAdminUsername)) {
            return;
        }

        UserEntity byEmail = isBlank(platformAdminEmail)
                ? null
                : userRepository.findByEmail(platformAdminEmail).orElse(null);
        UserEntity byUsername = isBlank(platformAdminUsername)
                ? null
                : userRepository.findByUsername(platformAdminUsername).orElse(null);

        if (byEmail != null && byUsername != null && !byEmail.getId().equals(byUsername.getId())) {
            throw new IllegalStateException(
                    "platform-admin email and username point to different users. " +
                            "email=" + platformAdminEmail + ", username=" + platformAdminUsername
            );
        }

        UserEntity platformUser = byEmail != null ? byEmail : byUsername;
        if (platformUser == null) {
            log.warn("No platform admin user found for email={} username={}", platformAdminEmail, platformAdminUsername);
            return;
        }

        Set<RoleEntity> mergedRoles = new HashSet<>(platformUser.getRoles());
        mergedRoles.add(primaryRole);
        if (!"ADMIN".equalsIgnoreCase(primaryRoleName)) {
            mergedRoles.removeIf(role -> "ADMIN".equalsIgnoreCase(role.getName()));
        }
        platformUser.setRoles(mergedRoles);
        userRepository.save(platformUser);
        log.info("Ensured role [{}] for platform admin email={} username={}",
                primaryRole.getName(), platformUser.getEmail(), platformUser.getUsername());
    }
}
