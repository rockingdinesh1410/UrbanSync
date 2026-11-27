package com.civictrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "civic_announcements")
public class CivicAnnouncement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String content;

    private String district = "All Tamil Nadu";
    private String department = "Tamil Nadu Municipal Administration";
    private String urgency = "INFO"; // INFO, WARNING, EMERGENCY

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getDistrict() { return district != null ? district : "All Tamil Nadu"; }
    public void setDistrict(String district) { this.district = district; }
    public String getDepartment() { return department != null ? department : "Tamil Nadu Municipal Administration"; }
    public void setDepartment(String department) { this.department = department; }
    public String getUrgency() { return urgency != null ? urgency : "INFO"; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
