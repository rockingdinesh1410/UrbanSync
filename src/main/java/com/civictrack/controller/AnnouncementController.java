package com.civictrack.controller;

import com.civictrack.model.CivicAnnouncement;
import com.civictrack.repository.CivicAnnouncementRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final CivicAnnouncementRepository repo;

    public AnnouncementController(CivicAnnouncementRepository repo) {
        this.repo = repo;
    }

    @PostConstruct
    public void seedDefaults() {
        if (repo.count() == 0) {
            CivicAnnouncement a1 = new CivicAnnouncement();
            a1.setTitle("Monsoon Drainage Desilting & Pre-Cyclone Readiness Drive");
            a1.setContent("Greater Chennai Corporation (GCC) & Metrowater have mobilized field crews across 15 zones to inspect storm water drains and clear arterial channels.");
            a1.setDistrict("Chennai");
            a1.setDepartment("GCC & CMWSSB");
            a1.setUrgency("INFO");
            repo.save(a1);

            CivicAnnouncement a2 = new CivicAnnouncement();
            a2.setTitle("TANGEDCO Feeder Line Upgrade & Night Maintenance");
            a2.setContent("Scheduled transformer safety maintenance in central business districts. Streetlights in sector 4 will operate on auxiliary power tonight.");
            a2.setDistrict("Madurai");
            a2.setDepartment("TANGEDCO");
            a2.setUrgency("WARNING");
            repo.save(a2);

            CivicAnnouncement a3 = new CivicAnnouncement();
            a3.setTitle("Statewide Rapid Pothole Rectification Initiative");
            a3.setContent("Tamil Nadu Highways Department has initiated rapid cold-mix patching for all citizen-flagged major bus route roads.");
            a3.setDistrict("All Tamil Nadu");
            a3.setDepartment("Highways Department");
            a3.setUrgency("INFO");
            repo.save(a3);
        }
    }

    @GetMapping
    public List<CivicAnnouncement> all(@RequestParam(required = false) String district) {
        if (district != null && !district.isBlank() && !"ALL".equalsIgnoreCase(district)) {
            return repo.findByDistrictOrderByCreatedAtDesc(district);
        }
        return repo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public CivicAnnouncement create(@RequestBody CivicAnnouncement body) {
        if (body.getTitle() == null || body.getTitle().isBlank()) {
            throw new IllegalArgumentException("Announcement title is required");
        }
        if (body.getContent() == null || body.getContent().isBlank()) {
            throw new IllegalArgumentException("Announcement content is required");
        }
        CivicAnnouncement a = new CivicAnnouncement();
        a.setTitle(body.getTitle().trim());
        a.setContent(body.getContent().trim());
        a.setDistrict(body.getDistrict() != null ? body.getDistrict() : "All Tamil Nadu");
        a.setDepartment(body.getDepartment() != null ? body.getDepartment() : "Tamil Nadu Municipal Administration");
        a.setUrgency(body.getUrgency() != null ? body.getUrgency() : "INFO");
        return repo.save(a);
    }
}
