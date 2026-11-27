package com.civictrack.repository;

import com.civictrack.model.CivicAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CivicAnnouncementRepository extends JpaRepository<CivicAnnouncement, Long> {
    List<CivicAnnouncement> findAllByOrderByCreatedAtDesc();
    List<CivicAnnouncement> findByDistrictOrderByCreatedAtDesc(String district);
}
