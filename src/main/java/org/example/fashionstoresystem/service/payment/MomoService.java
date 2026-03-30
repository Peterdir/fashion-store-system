package org.example.fashionstoresystem.service.payment;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.config.MomoConfig;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Formatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MomoService {

    private final MomoConfig momoConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Tạo URL thanh toán MoMo
     */
    public String createPaymentUrl(Long orderId, Double amount) {
        String requestId = String.valueOf(System.currentTimeMillis());
        String orderInfo = "Thanh toán đơn hàng #" + orderId;
        String extraData = ""; // Có thể dùng để lưu trữ thêm thông tin (Base64)
        
        // Chuỗi dữ liệu để tạo chữ ký (theo đúng thứ tự MoMo yêu cầu)
        String rawSignature = "accessKey=" + momoConfig.getAccessKey() +
                "&amount=" + amount.longValue() +
                "&extraData=" + extraData +
                "&ipnUrl=" + momoConfig.getNotifyUrl() +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + momoConfig.getPartnerCode() +
                "&requestId=" + requestId +
                "&returnUrl=" + momoConfig.getReturnUrl() +
                "&requestType=captureWallet";

        String signature = hmacSha256(rawSignature, momoConfig.getSecretKey());

        // Body request
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("partnerCode", momoConfig.getPartnerCode());
        requestBody.put("accessKey", momoConfig.getAccessKey());
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount.longValue());
        requestBody.put("orderId", String.valueOf(orderId));
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("returnUrl", momoConfig.getReturnUrl());
        requestBody.put("ipnUrl", momoConfig.getNotifyUrl());
        requestBody.put("extraData", extraData);
        requestBody.put("requestType", "captureWallet");
        requestBody.put("signature", signature);
        requestBody.put("lang", "vi");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(momoConfig.getApiUrl(), entity, Map.class);
            if (response != null && response.containsKey("payUrl")) {
                return (String) response.get("payUrl");
            } else {
                String message = response != null ? (String) response.get("message") : "Không có phản hồi từ MoMo";
                throw new RuntimeException("Lỗi tạo thanh toán MoMo: " + message);
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi kết nối API MoMo: " + e.getMessage());
        }
    }

    /**
     * Xác thực chữ ký MoMo gửi về (IPN hoặc Return URL)
     */
    public boolean verifySignature(Map<String, String> allParams) {
        String signature = allParams.get("signature");
        if (signature == null) return false;

        // Các tham số để tạo chữ ký verify (theo thứ tự alphabet của Key)
        // accessKey, amount, extraData, message, orderId, orderInfo, orderType, partnerCode, requestId, responseTime, resultCode, transId
        String rawSignature = "accessKey=" + allParams.get("accessKey") +
                "&amount=" + allParams.get("amount") +
                "&extraData=" + allParams.get("extraData") +
                "&message=" + allParams.get("message") +
                "&orderId=" + allParams.get("orderId") +
                "&orderInfo=" + allParams.get("orderInfo") +
                "&orderType=" + allParams.get("orderType") +
                "&partnerCode=" + allParams.get("partnerCode") +
                "&requestId=" + allParams.get("requestId") +
                "&responseTime=" + allParams.get("responseTime") +
                "&resultCode=" + allParams.get("resultCode") +
                "&transId=" + allParams.get("transId");

        String recalculatedSignature = hmacSha256(rawSignature, momoConfig.getSecretKey());
        return recalculatedSignature.equalsIgnoreCase(signature);
    }

    /**
     * Tạo chữ ký HMAC-SHA256
     */
    private String hmacSha256(String data, String key) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return toHexString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo signature: " + e.getMessage());
        }
    }

    private String toHexString(byte[] bytes) {
        try (Formatter formatter = new Formatter()) {
            for (byte b : bytes) {
                formatter.format("%02x", b);
            }
            return formatter.toString();
        }
    }
}
