package org.example.fashionstoresystem.service.auth;

import org.example.fashionstoresystem.dto.request.RegisterRequestDTO;
import org.example.fashionstoresystem.dto.request.ResendVerificationEmailRequestDTO;
import org.example.fashionstoresystem.dto.request.VerifyEmailRequestDTO;
import org.example.fashionstoresystem.dto.response.RegisterResponseDTO;

public interface AuthService {
    RegisterResponseDTO registerNewAccount (RegisterRequestDTO dto);
    Boolean verifyEmail (VerifyEmailRequestDTO dto);
    Boolean resendVerificationEmail (ResendVerificationEmailRequestDTO dto);
}
