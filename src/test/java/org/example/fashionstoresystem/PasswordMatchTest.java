package org.example.fashionstoresystem;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class PasswordMatchTest {

    @Test
    public void testPasswordMatch() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String myHash = "$2a$10$tZ92o4kF1y/K7WjBuMJ7JKCcdtxPvIZ8gO9N93Pxk0B9p0K1w7dO6";
        String rawPassword = "12345678";
        
        System.out.println("Matches: " + encoder.matches(rawPassword, myHash));
        System.out.println("New Hash: " + encoder.encode(rawPassword));
        
        assertTrue(encoder.matches(rawPassword, myHash));
    }
}
