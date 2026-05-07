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

    private static final String CAN_VIEW_USERS =
            "hasAnyRole('ADMIN','SUPERADMIN') or hasAuthority('USER_VIEW_ALL')";

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
    public ResponseEntity<CurrentUserDTO> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

//    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/assign-roles")
    public ResponseEntity<List<UserResponse>> assignRolesToUser(@RequestBody AssignRolesRequest req) {
        return ResponseEntity.ok(authService.assignRoles(req.getUserIds(), req.getRoleId()));
    }

    @PreAuthorize(CAN_VIEW_USERS)
    @GetMapping("/users")
    public ResponseEntity<List<UserWithRolesDTO>> getAllUsersWithRoles() {
        return ResponseEntity.ok(authService.getAllUsersWithRoles());
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    @GetMapping("/admin")
    public String adminOnly(){
        return "Hello Admin";
    }

    @GetMapping("/users/no-roles")
    public ResponseEntity<List<UserResponse>> getUsersWithNoRoles() {
        return ResponseEntity.ok(authService.getUsersWithNoRoles());
    }

    @GetMapping
    public ResponseEntity<List<UserRoleResponseDTO>> getUsersByRole(
            @RequestParam String role
    ) {
        return ResponseEntity.ok(
                rolePermissionService.getUsersByRole(role)
        );
    }

    @PostMapping("/deassign")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<List<UserResponse>> deassignRoles(
            @RequestBody AssignRolesRequest dto
    ) {
        return ResponseEntity.ok(authService.deassignRoles(dto));
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        authService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }
}
