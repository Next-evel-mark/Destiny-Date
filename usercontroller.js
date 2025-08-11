package com.destinydate.controller;

import com.destinydate.model.User;
import com.destinydate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Register endpoint
    @PostMapping("/register")
    public String register(@RequestParam(required = false) String email,
                           @RequestParam(required = false) String phone,
                           @RequestParam String password) {

        if ((email == null && phone == null) || password == null || password.trim().isEmpty()){
            return "Email or phone and password required";
        }

        if(email != null){
            if(userRepository.findByEmail(email).isPresent()){
                return "Email already registered";
            }
        } else {
            if(userRepository.findByPhoneNumber(phone).isPresent()){
                return "Phone number already registered";
            }
        }

        User user = new User();
        if(email != null){
            user.setEmail(email);
        } else {
            user.setPhoneNumber(phone);
        }

        // For demo: store plain text password (Not recommended in production!)
        user.setPasswordHash(password);

        // Generate a 6-digit verification code
        String code = String.valueOf((int)(Math.random() * 900000) + 100000);
        user.setVerificationCode(code);
        user.setVerified(false);

        userRepository.save(user);

        // Simulate sending email or SMS
        if(email != null){
            System.out.println("[Email sent to " + email + "] Verification code: " + code);
        } else {
            System.out.println("[SMS sent to " + phone + "] Verification code: " + code);
        }

        return "Verification code sent";
    }

    // Verify endpoint
    @PostMapping("/verify")
    public String verify(@RequestParam String emailOrPhone, @RequestParam String code) {
        Optional<User> userOpt = userRepository.findByEmail(emailOrPhone);
        if(userOpt.isEmpty()){
            userOpt = userRepository.findByPhoneNumber(emailOrPhone);
        }
        if(userOpt.isEmpty()){
            return "User not found";
        }
        User user = userOpt.get();
        if(user.isVerified()){
            return "Already verified";
        }
        if(user.getVerificationCode().equals(code)){
            user.setVerified(true);
            userRepository.save(user);
            return "Verified successfully";
        } else {
            return "Invalid verification code";
        }
    }

    // Set profile endpoint (username and optional profile picture filename)
    @PostMapping("/profile")
    public String setProfile(@RequestParam String emailOrPhone,
                             @RequestParam String username,
                             @RequestParam(required = false) String profilePictureFilename){

        Optional<User> userOpt = userRepository.findByEmail(emailOrPhone);
        if(userOpt.isEmpty()){
            userOpt = userRepository.findByPhoneNumber(emailOrPhone);
        }
        if(userOpt.isEmpty()){
            return "User not found";
        }
        User user = userOpt.get();

        if(!user.isVerified()){
            return "User not verified";
        }

        Optional<User> existingUser = userRepository.findByUsername(username);
        if(existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())){
            return "Username already taken";
        }

        user.setUsername(username);
        if(profilePictureFilename != null && !profilePictureFilename.trim().isEmpty()){
            user.setProfilePictureFilename(profilePictureFilename);
        }

        userRepository.save(user);

        return "Profile updated";
    }

    // Search users by username containing a substring
    @GetMapping("/search")
    public List<UserDTO> search(@RequestParam String username) {
        List<User> users = userRepository.findAll();
        // Filter users by username containing search string (case-insensitive)
        return users.stream()
                .filter(u -> u.getUsername() != null && u.getUsername().toLowerCase().contains(username.toLowerCase()))
                .map(UserDTO::fromUser)
                .collect(Collectors.toList());
    }

    // Helper DTO to prevent leaking sensitive data
    public static class UserDTO {
        public String username;
        public String email;
        public String phoneNumber;
        public String profilePictureFilename;

        public static UserDTO fromUser(User user){
            UserDTO dto = new UserDTO();
            dto.username = user.getUsername();
            dto.email = user.getEmail();
            dto.phoneNumber = user.getPhoneNumber();
            dto.profilePictureFilename = user.getProfilePictureFilename();
            return dto;
        }
    }
}
