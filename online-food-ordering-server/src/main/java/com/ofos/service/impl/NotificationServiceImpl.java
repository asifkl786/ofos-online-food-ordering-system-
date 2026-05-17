package com.ofos.service.impl;

import com.ofos.dto.request.BulkNotificationRequest;
import com.ofos.dto.request.SendNotificationRequest;
import com.ofos.dto.request.UpdatePreferenceRequest;
import com.ofos.dto.response.NotificationPreferenceResponse;
import com.ofos.dto.response.NotificationResponse;
import com.ofos.entity.*;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.*;
import com.ofos.service.InvoiceService;
import com.ofos.service.NotificationService;
import com.ofos.service.NotificationStreamService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ModelMapper modelMapper;
    private final NotificationStreamService notificationStreamService;
    private final InvoiceService invoiceService;
    
    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate;
    
    @Value("${sms.api.key:}")
    private String smsApiKey;
    
    @Value("${sms.sender.id:}")
    private String smsSenderId;

    @Value("${notification.sms.enabled:false}")
    private Boolean smsDeliveryEnabled;

    @Value("${notification.sms.api-url:}")
    private String smsApiUrl;

    @Value("${notification.whatsapp.enabled:false}")
    private Boolean whatsappDeliveryEnabled;

    @Value("${notification.whatsapp.api-url:}")
    private String whatsappApiUrl;

    @Value("${notification.whatsapp.auth-token:}")
    private String whatsappAuthToken;

    @Value("${notification.whatsapp.from:}")
    private String whatsappFromNumber;

    @Value("${notification.email.enabled:false}")
    private Boolean emailDeliveryEnabled;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.from:noreply@ofos.com}")
    private String mailFrom;
    
    // ==================== Send Notifications ====================
    
    @Override
    @Transactional
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        log.info("Sending notification to: {}", request.getRecipient());
        
        // Create notification record
        Notification notification = new Notification();
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType());
        notification.setChannel(request.getChannel() != null ? request.getChannel() : NotificationChannel.IN_APP);
        notification.setRecipient(request.getRecipient());
        notification.setRecipientName(request.getRecipientName());
        notification.setTemplateName(request.getTemplateName());
        notification.setAdditionalData(request.getAdditionalData());
        
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId()).orElse(null);
            notification.setUser(user);
        }
        
        if (request.getOrderId() != null) {
            Order order = orderRepository.findById(request.getOrderId()).orElse(null);
            notification.setOrder(order);
        }
        
        Notification savedNotification = notificationRepository.save(notification);
        NotificationResponse response = convertToResponse(savedNotification);
        if (savedNotification.getUser() != null && savedNotification.getChannel() == NotificationChannel.IN_APP) {
            notificationStreamService.publish(savedNotification.getUser().getId(), response);
        }
        
        // Send actual notification asynchronously
        sendActualNotification(savedNotification);
        
        return response;
    }

    @Override
    @Transactional
    public NotificationResponse createInAppNotification(Long userId, String title, String message, NotificationType type, Long orderId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Order order = orderId != null ? orderRepository.findById(orderId).orElse(null) : null;

        // Store first, then Phase 2 publishes the same payload to any active real-time stream.
        Notification notification = saveInAppNotification(user, title, message, type, order);
        sendEmailForNotification(user, title, message, type, order);
        sendSmsForNotification(user, title, message, type);
        sendWhatsAppForNotification(user, title, message, type);
        return convertToResponse(notification);
    }
    
    @Override
    @Async
    @Transactional
    public void sendOrderConfirmation(Long orderId) {
        log.info("Sending order confirmation for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        User user = order.getUser();
        
        // Check user preferences
        NotificationPreference preference = getPreferenceByUser(user);
        
        String message = String.format(
            "Order #%s confirmed! Your order will be delivered by %s. Total: ₹%s",
            order.getOrderNumber(),
            order.getEstimatedDeliveryTime(),
            order.getTotalAmount()
        );
        
        // Send Email
        if (preference.getEmailEnabled()) {
            sendEmail(user.getEmail(), "Order Confirmed - " + order.getOrderNumber(), message);
        }
        
        // Send SMS
        if (preference.getSmsEnabled() && user.getPhoneNumber() != null) {
            sendSms(user.getPhoneNumber(), message);
        }
        
        // Save in-app notification
        saveInAppNotification(user, "Order Confirmed", message, NotificationType.ORDER_CONFIRMATION, order);
    }
    
    @Override
    @Async
    @Transactional
    public void sendOrderStatusUpdate(Long orderId, String oldStatus, String newStatus) {
        log.info("Sending order status update for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        User user = order.getUser();
        NotificationPreference preference = getPreferenceByUser(user);
        
        String message = String.format(
            "Order #%s status updated: %s → %s",
            order.getOrderNumber(),
            oldStatus,
            newStatus
        );
        
        if (preference.getOrderUpdatesEnabled()) {
            if (preference.getEmailEnabled()) {
                sendEmail(user.getEmail(), "Order Update - " + order.getOrderNumber(), message);
            }
            
            if (preference.getSmsEnabled() && user.getPhoneNumber() != null) {
                sendSms(user.getPhoneNumber(), message);
            }
            
            saveInAppNotification(user, "Order Update", message, NotificationType.ORDER_STATUS_UPDATE, order);
        }
    }
    
    @Override
    @Async
    @Transactional
    public void sendOrderDelivered(Long orderId) {
        log.info("Sending order delivered notification for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        User user = order.getUser();
        
        String message = String.format(
            "Order #%s has been delivered! Thank you for ordering with us. Rate your experience!",
            order.getOrderNumber()
        );
        
        sendEmail(user.getEmail(), "Order Delivered - " + order.getOrderNumber(), message);
        
        if (user.getPhoneNumber() != null) {
            sendSms(user.getPhoneNumber(), message);
        }
        
        saveInAppNotification(user, "Order Delivered", message, NotificationType.ORDER_DELIVERED, order);
    }
    
    @Override
    @Async
    @Transactional
    public void sendOrderCancelled(Long orderId, String reason) {
        log.info("Sending order cancellation notification for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        User user = order.getUser();
        
        String message = String.format(
            "Order #%s has been cancelled. Reason: %s. Amount will be refunded within 5-7 business days.",
            order.getOrderNumber(),
            reason
        );
        
        sendEmail(user.getEmail(), "Order Cancelled - " + order.getOrderNumber(), message);
        
        if (user.getPhoneNumber() != null) {
            sendSms(user.getPhoneNumber(), message);
        }
        
        saveInAppNotification(user, "Order Cancelled", message, NotificationType.ORDER_CANCELLED, order);
    }
    
    @Override
    @Async
    @Transactional
    public void sendPaymentSuccess(Long orderId) {
        log.info("Sending payment success notification for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        User user = order.getUser();
        
        String message = String.format(
            "Payment of ₹%s for order #%s was successful!",
            order.getTotalAmount(),
            order.getOrderNumber()
        );
        
        sendEmail(user.getEmail(), "Payment Successful - " + order.getOrderNumber(), message);
        
        saveInAppNotification(user, "Payment Successful", message, NotificationType.PAYMENT_SUCCESS, order);
    }
    
    @Override
    @Async
    @Transactional
    public void sendPaymentFailed(Long orderId, String reason) {
        log.info("Sending payment failed notification for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        User user = order.getUser();
        
        String message = String.format(
            "Payment for order #%s failed. Reason: %s. Please try again.",
            order.getOrderNumber(),
            reason
        );
        
        sendEmail(user.getEmail(), "Payment Failed - " + order.getOrderNumber(), message);
        
        if (user.getPhoneNumber() != null) {
            sendSms(user.getPhoneNumber(), message);
        }
        
        saveInAppNotification(user, "Payment Failed", message, NotificationType.PAYMENT_FAILED, order);
    }
    
    @Override
    @Async
    @Transactional
    public void sendWelcomeEmail(String userEmail, String userName) {
        log.info("Sending welcome email to: {}", userEmail);
        
        String subject = "Welcome to Online Food Ordering System!";
        String message = String.format(
            "Dear %s,\n\nWelcome to OFOS! We're excited to have you onboard.\n\n" +
            "Start exploring delicious food from your favorite restaurants.\n\n" +
            "Happy Ordering!\nTeam OFOS",
            userName
        );
        
        sendEmail(userEmail, subject, message);
        
        // Save in-app notification
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user != null) {
            saveInAppNotification(user, "Welcome!", message, NotificationType.WELCOME, null);
        }
    }
    
    @Override
    @Async
    @Transactional
    public void sendOtpEmail(String email, String otp) {
        log.info("Sending OTP email to: {}", email);
        
        String subject = "Your OTP for Login";
        String message = String.format(
            "Your OTP for login is: %s\n\nThis OTP is valid for 10 minutes.",
            otp
        );
        
        sendEmail(email, subject, message);
    }
    
    @Override
    @Async
    @Transactional
    public void sendOtpSms(String phoneNumber, String otp) {
        log.info("Sending OTP SMS to: {}", phoneNumber);
        
        String message = String.format("Your OTP for login is: %s", otp);
        sendSms(phoneNumber, message);
    }
    
    // ==================== Bulk Notifications ====================
    
    @Override
    @Transactional
    public void sendBulkNotification(BulkNotificationRequest request) {
        log.info("Sending bulk notification to role: {}", request.getUserRole());
        
        List<User> users;
        
        if ("ALL".equalsIgnoreCase(request.getUserRole())) {
            users = userRepository.findAll();
        } else {
            UserRole role = UserRole.valueOf(request.getUserRole().toUpperCase());
            users = userRepository.findByRoleAndIsActive(role, true);
        }
        
        for (User user : users) {
            SendNotificationRequest notificationRequest = new SendNotificationRequest();
            notificationRequest.setTitle(request.getTitle());
            notificationRequest.setMessage(request.getMessage());
            notificationRequest.setType(request.getType());
            notificationRequest.setChannel(request.getChannel());
            notificationRequest.setRecipient(user.getEmail());
            notificationRequest.setRecipientName(user.getFirstName() + " " + user.getLastName());
            notificationRequest.setUserId(user.getId());
            
            sendNotification(notificationRequest);
        }
        
        log.info("Bulk notification sent to {} users", users.size());
    }
    
    // ==================== User Notifications ====================
    
    @Override
    public Page<NotificationResponse> getUserNotifications(String userEmail, Pageable pageable) {
        log.debug("Fetching notifications for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    public NotificationResponse getNotificationById(Long notificationId) {
        log.debug("Fetching notification by id: {}", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        return convertToResponse(notification);
    }
    
    @Override
    @Transactional
    public void markAsRead(Long notificationId, String userEmail) {
        log.info("Marking notification as read: {}", notificationId);
        
        User user = getUserByEmail(userEmail);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new BusinessException("You are not authorized to mark this notification as read");
        }
        
        notificationRepository.markAsRead(notificationId);
    }
    
    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        log.info("Marking all notifications as read for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        notificationRepository.markAllAsRead(user.getId());
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, String userEmail) {
        log.info("Deleting notification: {}", notificationId);

        User user = getUserByEmail(userEmail);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new BusinessException("You are not authorized to delete this notification");
        }

        notificationRepository.delete(notification);
    }
    
    @Override
    public Long getUnreadCount(String userEmail) {
        log.debug("Getting unread count for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }
    
    // ==================== Preferences ====================
    
    @Override
    public NotificationPreferenceResponse getPreferences(String userEmail) {
        log.debug("Fetching notification preferences for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        NotificationPreference preference = getPreferenceByUser(user);
        
        return convertToPreferenceResponse(preference, user);
    }
    
    @Override
    @Transactional
    public NotificationPreferenceResponse updatePreferences(UpdatePreferenceRequest request, String userEmail) {
        log.info("Updating notification preferences for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        NotificationPreference preference = getPreferenceByUser(user);
        
        if (request.getEmailEnabled() != null) preference.setEmailEnabled(request.getEmailEnabled());
        if (request.getSmsEnabled() != null) preference.setSmsEnabled(request.getSmsEnabled());
        if (request.getWhatsappEnabled() != null) preference.setWhatsappEnabled(request.getWhatsappEnabled());
        if (request.getPushEnabled() != null) preference.setPushEnabled(request.getPushEnabled());
        if (request.getOrderUpdatesEnabled() != null) preference.setOrderUpdatesEnabled(request.getOrderUpdatesEnabled());
        if (request.getPromotionalEnabled() != null) preference.setPromotionalEnabled(request.getPromotionalEnabled());
        if (request.getPaymentAlertsEnabled() != null) preference.setPaymentAlertsEnabled(request.getPaymentAlertsEnabled());
        if (request.getEmailAddress() != null) preference.setEmailAddress(request.getEmailAddress());
        if (request.getPhoneNumber() != null) preference.setPhoneNumber(request.getPhoneNumber());
        if (request.getWhatsappNumber() != null) preference.setWhatsappNumber(request.getWhatsappNumber());
        if (request.getDeviceToken() != null) preference.setDeviceToken(request.getDeviceToken());
        
        preferenceRepository.save(preference);
        
        return convertToPreferenceResponse(preference, user);
    }
    
    // ==================== System ====================
    
    @Override
    @Transactional
    public void processPendingNotifications() {
        log.info("Processing pending notifications");
        
        List<Notification> pendingNotifications = notificationRepository
                .findByIsSentFalseAndCreatedAtBefore(LocalDateTime.now().minusMinutes(5));
        
        for (Notification notification : pendingNotifications) {
            try {
                sendActualNotification(notification);
            } catch (Exception e) {
                log.error("Failed to send notification: {}", e.getMessage());
                notificationRepository.incrementRetryCount(notification.getId(), e.getMessage());
            }
        }
        
        log.info("Processed {} pending notifications", pendingNotifications.size());
    }
    
    @Override
    @Transactional
    public void deleteOldNotifications(Integer daysOld) {
        log.info("Deleting notifications older than {} days", daysOld);
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        List<Notification> oldNotifications = notificationRepository
                .findByIsSentFalseAndCreatedAtBefore(cutoffDate);
        
        notificationRepository.deleteAll(oldNotifications);
        
        log.info("Deleted {} old notifications", oldNotifications.size());
    }
    
    // ==================== Private Helper Methods ====================
    
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    private NotificationPreference getPreferenceByUser(User user) {
        return preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    NotificationPreference newPref = new NotificationPreference();
                    newPref.setUser(user);
                    newPref.setEmailAddress(user.getEmail());
                    newPref.setPhoneNumber(user.getPhoneNumber());
                    newPref.setWhatsappNumber(user.getPhoneNumber());
                    return preferenceRepository.save(newPref);
                });
    }
    
    @Async
    public void sendActualNotification(Notification notification) {
        try {
            if (notification.getChannel() == NotificationChannel.EMAIL) {
                sendEmail(notification.getRecipient(), notification.getTitle(), notification.getMessage());
            } else if (notification.getChannel() == NotificationChannel.SMS) {
                sendSms(notification.getRecipient(), notification.getMessage());
            } else if (notification.getChannel() == NotificationChannel.WHATSAPP) {
                sendWhatsApp(notification.getRecipient(), notification.getMessage());
            }
            
            notificationRepository.markAsSent(notification.getId());
            log.info("Notification sent successfully: {}", notification.getId());
            
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage());
            notificationRepository.incrementRetryCount(notification.getId(), e.getMessage());
        }
    }
    
    private void sendEmail(String to, String subject, String text) {
        try {
            if (!isEmailProviderConfigured()) {
                log.warn("Email skipped because SMTP is not enabled or credentials are still placeholders");
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom(mailFrom);
            
            mailSender.send(message);
            log.debug("Email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
            // Phase 3 email delivery is non-blocking for business flow: order/payment must still succeed if SMTP fails.
        }
    }

    private void sendEmailForNotification(User user, String title, String message, NotificationType type, Order order) {
        NotificationPreference preference = getPreferenceByUser(user);
        if (!Boolean.TRUE.equals(preference.getEmailEnabled()) || !shouldEmailNotification(type, preference)) {
            return;
        }

        String recipientEmail = resolveRecipientEmail(user, preference);
        String emailBody = buildNotificationEmailBody(user, title, message);

        // Keep email delivery behind preferences and SMTP readiness so customer-facing actions never fail because of mail.
        if (shouldAttachInvoice(type, order)) {
            sendEmailWithInvoiceAttachment(recipientEmail, "OFOS - " + title, emailBody, order);
        } else {
            sendEmail(recipientEmail, "OFOS - " + title, emailBody);
        }
    }

    private boolean shouldAttachInvoice(NotificationType type, Order order) {
        return order != null && (type == NotificationType.ORDER_CONFIRMATION || type == NotificationType.PAYMENT_SUCCESS);
    }

    private void sendEmailWithInvoiceAttachment(String to, String subject, String text, Order order) {
        try {
            if (!isEmailProviderConfigured()) {
                log.warn("Email with invoice skipped because SMTP is not enabled or credentials are still placeholders");
                return;
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text);
            helper.setFrom(mailFrom);

            // The invoice service owns PDF formatting so notification code stays focused on delivery.
            byte[] invoicePdf = invoiceService.generateOrderInvoicePdf(order.getId());
            helper.addAttachment("invoice-" + order.getOrderNumber() + ".pdf", new ByteArrayResource(invoicePdf));
            mailSender.send(mimeMessage);
            log.debug("Email with invoice sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email with invoice: {}", e.getMessage());
            // Invoice email delivery is non-blocking; order/payment flow must not fail due to SMTP/PDF attachment issues.
        }
    }

    private boolean shouldEmailNotification(NotificationType type, NotificationPreference preference) {
        if (type == NotificationType.PROMOTION) {
            return Boolean.TRUE.equals(preference.getPromotionalEnabled());
        }

        if (type == NotificationType.PAYMENT_SUCCESS
                || type == NotificationType.PAYMENT_FAILED
                || type == NotificationType.REFUND_PROCESSED) {
            return Boolean.TRUE.equals(preference.getPaymentAlertsEnabled());
        }

        return Boolean.TRUE.equals(preference.getOrderUpdatesEnabled());
    }

    private String resolveRecipientEmail(User user, NotificationPreference preference) {
        String accountEmail = user.getEmail();
        String preferredEmail = preference.getEmailAddress();

        if (preferredEmail == null || preferredEmail.isBlank()) {
            return accountEmail;
        }

        if (!preferredEmail.equalsIgnoreCase(accountEmail)) {
            // Transactional order/payment emails should normally go to the account owner.
            // This log makes stale notification-preference emails easy to diagnose without blocking delivery.
            log.warn("Notification email preference differs from account email for user {}. accountEmail={}, preferenceEmail={}",
                    user.getId(), accountEmail, preferredEmail);
        }

        return accountEmail;
    }

    private boolean isEmailProviderConfigured() {
        return Boolean.TRUE.equals(emailDeliveryEnabled)
                && mailUsername != null
                && !mailUsername.isBlank()
                && !mailUsername.startsWith("your-")
                && mailPassword != null
                && !mailPassword.isBlank()
                && !mailPassword.startsWith("your-");
    }

    private String buildNotificationEmailBody(User user, String title, String message) {
        String userName = (user.getFirstName() + " " + user.getLastName()).trim();
        return "Hello " + userName + ",\n\n"
                + message + "\n\n"
                + "You can also view this update inside your OFOS notification center.\n\n"
                + "Regards,\n"
                + "Online Food Team";
    }
    
    private void sendSms(String phoneNumber, String message) {
        try {
            if (!isSmsProviderConfigured()) {
                log.warn("SMS skipped because provider is not enabled or credentials are still placeholders");
                return;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authkey", smsApiKey);

            Map<String, Object> payload = new HashMap<>();
            payload.put("sender", smsSenderId);
            payload.put("mobile", normalizeIndianPhone(phoneNumber));
            payload.put("message", message);

            // Provider-ready generic JSON request. Adjust keys/api-url if your SMS vendor requires a specific schema.
            restTemplate.postForEntity(smsApiUrl, new HttpEntity<>(payload, headers), String.class);
            
            log.debug("SMS sent to: {}", phoneNumber);
            
        } catch (Exception e) {
            log.error("Failed to send SMS: {}", e.getMessage());
            // SMS delivery is external-provider dependent; failed gateway calls must not block the core workflow.
        }
    }

    private void sendWhatsApp(String phoneNumber, String message) {
        try {
            if (!isWhatsAppProviderConfigured()) {
                log.warn("WhatsApp skipped because provider is not enabled or credentials are still placeholders");
                return;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(whatsappAuthToken);

            Map<String, Object> payload = new HashMap<>();
            payload.put("from", whatsappFromNumber);
            payload.put("to", normalizeIndianPhone(phoneNumber));
            payload.put("message", message);

            // Provider-ready generic JSON request. Keep this isolated so Meta/Twilio/MSG91 schemas can be adapted safely.
            restTemplate.postForEntity(whatsappApiUrl, new HttpEntity<>(payload, headers), String.class);

            log.debug("WhatsApp sent to: {}", phoneNumber);
        } catch (Exception e) {
            log.error("Failed to send WhatsApp: {}", e.getMessage());
            // WhatsApp delivery must never block order/payment/delivery workflows.
        }
    }

    private void sendSmsForNotification(User user, String title, String message, NotificationType type) {
        NotificationPreference preference = getPreferenceByUser(user);
        if (!Boolean.TRUE.equals(preference.getSmsEnabled()) || !shouldSmsNotification(type, preference)) {
            return;
        }

        String phoneNumber = resolvePhoneNumber(user, preference.getPhoneNumber());
        if (phoneNumber == null) {
            log.warn("SMS skipped because user {} does not have a phone number", user.getId());
            return;
        }

        sendSms(phoneNumber, title + ": " + message);
    }

    private void sendWhatsAppForNotification(User user, String title, String message, NotificationType type) {
        NotificationPreference preference = getPreferenceByUser(user);
        if (!Boolean.TRUE.equals(preference.getWhatsappEnabled()) || !shouldSmsNotification(type, preference)) {
            return;
        }

        String phoneNumber = resolvePhoneNumber(user, preference.getWhatsappNumber());
        if (phoneNumber == null) {
            log.warn("WhatsApp skipped because user {} does not have a WhatsApp number", user.getId());
            return;
        }

        sendWhatsApp(phoneNumber, "*" + title + "*\n" + message);
    }

    private boolean shouldSmsNotification(NotificationType type, NotificationPreference preference) {
        return shouldEmailNotification(type, preference);
    }

    private boolean isSmsProviderConfigured() {
        return Boolean.TRUE.equals(smsDeliveryEnabled)
                && smsApiUrl != null
                && !smsApiUrl.isBlank()
                && smsApiKey != null
                && !smsApiKey.isBlank()
                && !smsApiKey.startsWith("your-")
                && smsSenderId != null
                && !smsSenderId.isBlank();
    }

    private boolean isWhatsAppProviderConfigured() {
        return Boolean.TRUE.equals(whatsappDeliveryEnabled)
                && whatsappApiUrl != null
                && !whatsappApiUrl.isBlank()
                && whatsappAuthToken != null
                && !whatsappAuthToken.isBlank()
                && !whatsappAuthToken.startsWith("your-")
                && whatsappFromNumber != null
                && !whatsappFromNumber.isBlank();
    }

    private String resolvePhoneNumber(User user, String preferredPhone) {
        String phone = preferredPhone != null && !preferredPhone.isBlank() ? preferredPhone : user.getPhoneNumber();
        return phone != null && !phone.isBlank() ? phone : null;
    }

    private String normalizeIndianPhone(String phoneNumber) {
        String digits = phoneNumber.replaceAll("[^0-9]", "");
        if (digits.length() == 10) {
            return "91" + digits;
        }
        return digits;
    }
    
    private Notification saveInAppNotification(User user, String title, String message, NotificationType type, Order order) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setChannel(NotificationChannel.IN_APP);
        notification.setRecipient(user.getEmail());
        notification.setRecipientName(user.getFirstName() + " " + user.getLastName());
        notification.setUser(user);
        notification.setOrder(order);
        notification.setIsSent(true);
        notification.setSentAt(LocalDateTime.now());
        
        Notification savedNotification = notificationRepository.save(notification);
        notificationStreamService.publish(user.getId(), convertToResponse(savedNotification));
        return savedNotification;
    }
    
    private NotificationResponse convertToResponse(Notification notification) {
        NotificationResponse response = modelMapper.map(notification, NotificationResponse.class);
        response.setType(notification.getType().toString());
        response.setChannel(notification.getChannel().toString());
        
        if (notification.getOrder() != null) {
            response.setOrderId(notification.getOrder().getId());
            response.setOrderNumber(notification.getOrder().getOrderNumber());
        }
        
        return response;
    }
    
    private NotificationPreferenceResponse convertToPreferenceResponse(NotificationPreference preference, User user) {
        NotificationPreferenceResponse response = modelMapper.map(preference, NotificationPreferenceResponse.class);
        response.setUserId(user.getId());
        response.setUserEmail(user.getEmail());
        response.setUserName(user.getFirstName() + " " + user.getLastName());
        return response;
    }
}
