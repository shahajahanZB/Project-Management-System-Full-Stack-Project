package com.example.proman.iam.domain.service.impl;

import com.example.proman.iam.domain.dto.*;
import com.example.proman.iam.domain.entity.PasswordResetOtp;
import com.example.proman.iam.domain.entity.RefreshToken;
import com.example.proman.iam.domain.entity.RoleEntity;
import com.example.proman.iam.domain.entity.UserEntity;
import com.example.proman.iam.domain.entity.UserPrincipal;
import com.example.proman.iam.domain.entity.UserProfileEntity;
import com.example.proman.iam.domain.repository.PasswordResetOtpRepository;
import com.example.proman.iam.domain.repository.RoleRepository;
import com.example.proman.iam.domain.repository.UserRepository;
import com.example.proman.iam.domain.repository.UserProfileRepository;
import com.example.proman.iam.domain.service.AuthService;
import com.example.proman.iam.domain.service.JWTService;
import com.example.proman.iam.domain.service.RefreshTokenService;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authManager;
    private final JWTService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RoleRepository roleRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final UserProfileRepository userProfileRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(
            UserRepository userRepository,
            AuthenticationManager authManager,
            JWTService jwtService,
            RefreshTokenService refreshTokenService,
            RoleRepository roleRepository,
            PasswordResetOtpRepository passwordResetOtpRepository,
            UserProfileRepository userProfileRepository
    ) {
        this.userRepository = userRepository;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.roleRepository = roleRepository;
        this.passwordResetOtpRepository = passwordResetOtpRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Override
    @Transactional
    public ResponseEntity<String> register(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        UserEntity user = new UserEntity();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));

        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            Set<RoleEntity> roles = new HashSet<>(roleRepository.findAllById(request.getRoleIds()));
            user.setRoles(roles);
        }

        UserProfileEntity profile = new UserProfileEntity();
        profile.setUser(user);
        user.setProfile(profile);
        userRepository.save(user);
        return ResponseEntity.status(201).body("User created successfully");
    }

    @Override
    public Map<String, String> verify(LoginRequestDTO login) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(login.getEmail(), login.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        UserEntity dbUser = userRepository.findById(principal.getId())
                .orElseThrow();

        String accessToken = jwtService.generateToken(new UserPrincipal(dbUser));
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(dbUser.getId());

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken.getToken()
        );
    }

    @Override
    @Transactional
    public String requestPasswordResetOtp(ForgotPasswordOtpRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<UserEntity> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Email Does not exists");
        }

        UserEntity user = optionalUser.get();
        invalidateActiveOtps(user.getId());

        String otp = generateOtp();
        PasswordResetOtp passwordResetOtp = new PasswordResetOtp();
        passwordResetOtp.setUser(user);
        passwordResetOtp.setOtpHash(encoder.encode(otp));
        passwordResetOtp.setExpiresAt(Instant.now().plusSeconds(600));
        passwordResetOtpRepository.save(passwordResetOtp);

        return "OTP Sent Successfully";
    }

    @Override
    @Transactional
    public String resetPasswordWithOtp(ResetPasswordWithOtpRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp = request.getOtp().trim();
        String newPassword = request.getNewPassword().trim();

        if (newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or OTP"));

        PasswordResetOtp passwordResetOtp = passwordResetOtpRepository
                .findFirstByUser_IdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or OTP"));

        if (passwordResetOtp.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("OTP has expired");
        }
        if (!encoder.matches(otp, passwordResetOtp.getOtpHash())) {
            throw new IllegalArgumentException("Invalid email or OTP");
        }

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        passwordResetOtp.setUsedAt(Instant.now());
        passwordResetOtp.setVerifiedAt(null);
        passwordResetOtp.setResetToken(null);
        passwordResetOtp.setResetTokenExpiresAt(null);
        passwordResetOtpRepository.save(passwordResetOtp);

        return "Password reset successfully";
    }

    @Override
    public CurrentUserDTO getCurrentUser() {
        UserPrincipal principal = getCurrentPrincipal();
        UserEntity user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        CurrentUserDTO dto = new CurrentUserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setCreatedAt(user.getCreatedAt());

        List<RoleDTO> roleDtos = user.getRoles().stream()
                .map(this::mapRole)
                .toList();
        dto.setRoles(roleDtos);

        Set<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> permission.getAccess())
                .collect(Collectors.toCollection(TreeSet::new));
        dto.setPermissions(permissions);

        return dto;
    }

    @Override
    @Transactional
    public List<UserResponse> assignRoles(Set<Long> userIds, Long roleId) {
        if (userIds == null || userIds.isEmpty()) {
            throw new IllegalArgumentException("At least one userId is required");
        }

        RoleEntity role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("No role found"));

        Set<UserEntity> users = new HashSet<>(userRepository.findAllById(userIds));
        if (users.size() != userIds.size()) {
            throw new IllegalArgumentException("One or more users not found");
        }

        return users.stream()
                .map(user -> {
                    user.getRoles().add(role);
                    return mapToResponse(userRepository.save(user));
                })
                .toList();
    }

    @Override
    public List<UserWithRolesDTO> getAllUsersWithRoles() {
        return userRepository.findAll()
                .stream()
                .map(user -> {
                    UserWithRolesDTO userDto = new UserWithRolesDTO();
                    userDto.setId(user.getId());
                    userDto.setUsername(user.getUsername());
                    userDto.setEmail(user.getEmail());

                    List<RoleDTO> roleDtos = user.getRoles().stream().map(role -> {
                        RoleDTO roleDto = new RoleDTO();
                        roleDto.setId(role.getRoleId());
                        roleDto.setName(role.getName());

                        List<PermissionDTO> permDtos = role.getPermissions().stream().map(p -> {
                            PermissionDTO pd = new PermissionDTO();
                            pd.setId(p.getId());
                            pd.setAccess(p.getAccess());
                            return pd;
                        }).toList();

                        roleDto.setPermissions(permDtos);
                        return roleDto;
                    }).toList();

                    userDto.setRoles(roleDtos);
                    return userDto;
                })
                .toList();
    }

    @Override
    public List<UserResponse> getUsersWithNoRoles() {
        return userRepository.findUsersWithNoRoles()
                .stream()
                .map(u -> new UserResponse(
                        u.getId(),
                        u.getUsername(),
                        u.getEmail(),
                        u.getCreatedAt(),
                        u.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toSet())
                ))
                .toList();
    }

    @Override
    public List<UserResponse> deassignRoles(AssignRolesRequest dto) {
        if (dto.getUserIds() == null || dto.getUserIds().isEmpty()) {
            throw new IllegalArgumentException("At least one userId is required");
        }

        RoleEntity role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("No role found"));

        Set<UserEntity> users = new HashSet<>(userRepository.findAllById(dto.getUserIds()));
        if (users.size() != dto.getUserIds().size()) {
            throw new IllegalArgumentException("One or more users not found");
        }

        return users.stream()
                .map(user -> {
                    user.getRoles().remove(role);
                    return mapToResponse(userRepository.save(user));
                })
                .toList();
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            userRepository.delete(user);
            userRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("Cannot delete user. User is referenced by other records.");
        }
    }

    private UserResponse mapToResponse(UserEntity user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toSet())
        );
    }

    private RoleDTO mapRole(RoleEntity role) {
        RoleDTO roleDto = new RoleDTO();
        roleDto.setId(role.getRoleId());
        roleDto.setName(role.getName());
        roleDto.setPermissions(role.getPermissions().stream().map(permission -> {
            PermissionDTO dto = new PermissionDTO();
            dto.setId(permission.getId());
            dto.setAccess(permission.getAccess());
            return dto;
        }).toList());
        return roleDto;
    }

    private UserPrincipal getCurrentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("Authenticated user not found");
        }
        return principal;
    }

    private void invalidateActiveOtps(Long userId) {
        List<PasswordResetOtp> activeOtps = passwordResetOtpRepository.findByUser_IdAndUsedAtIsNull(userId);
        if (activeOtps.isEmpty()) {
            return;
        }

        Instant now = Instant.now();
        activeOtps.forEach(otp -> otp.setUsedAt(now));
        passwordResetOtpRepository.saveAll(activeOtps);
    }

    private String generateOtp() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }
}
