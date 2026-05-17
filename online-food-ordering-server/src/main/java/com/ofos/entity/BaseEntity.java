
package com.ofos.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@MappedSuperclass
@Data
@NoArgsConstructor  // ✅ ADD THIS
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
 
	 @Id
	 @GeneratedValue(strategy = GenerationType.IDENTITY)
	 private Long id;
	 
	 @Version
	 private Integer version;
	 
	 @CreatedDate
	 @Column(updatable = false)
	 private LocalDateTime createdAt;
	 
	 @LastModifiedDate
	 private LocalDateTime updatedAt;
	 
	 private Boolean isActive = true;
}