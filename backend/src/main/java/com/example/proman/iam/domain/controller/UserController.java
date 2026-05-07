package com.example.proman.iam.domain.controller;

import com.example.proman.iam.domain.dto.*;
import com.example.proman.iam.domain.service.AuthService;
import com.example.proman.iam.domain.service.RolePermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/iam")
public class UserController {

    private final AuthService authService;
    private final RolePermissionService rolePermissionService;

    public UserController(AuthService authService, RolePermissionService rolePermissionService) {
        this.authService = authService;
        this.rolePermissionService = rolePermissionService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody CreateUserRequest user){
        return authService.register(user);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(@RequestBody LoginRequestDTO user){
        Map<String, String> res = authService.verify(user);
        return ResponseEntity.status(200).body(res);
    }

    @PostMapping("/forgot-password/request-otp")
    public ResponseEntity<String> requestForgotPasswordOtp(@Valid @RequestBody ForgotPasswordOtpRequestDTO request) {
        return ResponseEntity.ok(authService.requestPasswordResetOtp(request));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<String> resetPasswordWithOtp(@Valid @RequestBody ResetPasswordWithOtpRequestDTO request) {
        return ResponseEntity.ok(authService.resetPasswordWithOtp(request));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CurrentUserDTO> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @PostMapping("/assign-roles")
    @PreAuthorize("hasAuthority('MANAGE_ROLES')")
    public ResponseEntity<List<UserResponse>> assignRolesToUser(@RequestBody AssignRolesRequest req) {
        return ResponseEntity.ok(authService.assignRoles(req.getUserIds(), req.getRoleId()));
    }

    @PreAuthorize("hasAuthority('USER_VIEW_ALL')")
    @GetMapping("/users")
    public ResponseEntity<List<UserWithRolesDTO>> getAllUsersWithRoles() {
        return ResponseEntity.ok(authService.getAllUsersWithRoles());
    }

    @PreAuthorize("hasAuthority('MANAGE_ROLES')")
    @GetMapping("/admin")
    public String adminOnly(){
        return "Hello Admin";
    }

    @PreAuthorize("hasAuthority('USER_VIEW_ALL')")
    @GetMapping("/users/no-roles")
    public ResponseEntity<List<UserResponse>> getUsersWithNoRoles() {
        return ResponseEntity.ok(authService.getUsersWithNoRoles());
    }

    @PreAuthorize("hasAuthority('USER_VIEW_ALL')")
    @GetMapping
    public ResponseEntity<List<UserRoleResponseDTO>> getUsersByRole(
            @RequestParam String role
    ) {
        return ResponseEntity.ok(
                rolePermissionService.getUsersByRole(role)
        );
    }

    @PostMapping("/deassign")
    @PreAuthorize("hasAuthority('MANAGE_ROLES')")
    public ResponseEntity<List<UserResponse>> deassignRoles(
            @RequestBody AssignRolesRequest dto
    ) {
        return ResponseEntity.ok(authService.deassignRoles(dto));
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        authService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }
}
