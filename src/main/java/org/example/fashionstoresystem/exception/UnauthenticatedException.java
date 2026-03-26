package org.example.fashionstoresystem.exception;

/**
 * Exception khi người dùng chưa xác thực (principal == null).
 */
public class UnauthenticatedException extends RuntimeException {
    public UnauthenticatedException(String message) {
        super(message);
    }
}
