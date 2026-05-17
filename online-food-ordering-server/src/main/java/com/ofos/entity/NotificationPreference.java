package com.ofos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference extends BaseEntity {
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    @Column(nullable = false)
    private Boolean emailEnabled = true;
    
    @Column(nullable = false)
    private Boolean smsEnabled = true;

    // Nullable keeps automatic Hibernate schema updates safe for existing databases; null is handled as disabled in service logic.
    private Boolean whatsappEnabled = false;
    
    @Column(nullable = false)
    private Boolean pushEnabled = true;
    
    @Column(nullable = false)
    private Boolean orderUpdatesEnabled = true;
    
    @Column(nullable = false)
    private Boolean promotionalEnabled = true;
    
    @Column(nullable = false)
    private Boolean paymentAlertsEnabled = true;
    
    private String emailAddress;
    
    private String phoneNumber;

    private String whatsappNumber;
    
    private String deviceToken; // For push notifications
}
