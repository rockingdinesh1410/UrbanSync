package com.civictrack.service;

import com.civictrack.model.*;
import com.civictrack.repository.IssueCommentRepository;
import com.civictrack.repository.IssueReportRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IssueReportService {
    private final IssueReportRepository repo;
    private final IssueCommentRepository commentRepo;
    private final Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();

    public IssueReportService(IssueReportRepository repo, IssueCommentRepository commentRepo) {
        this.repo = repo;
        this.commentRepo = commentRepo;
    }

    @PostConstruct
    public void seedDefaults() {
        if (repo.count() == 0) {
            IssueReport r1 = new IssueReport();
            r1.setTitle("Severe pothole crater on Anna Salai near Thousand Lights");
            r1.setDescription("Deep pothole causing sudden braking and traffic bottlenecks near Thousand Lights junction. Water accumulated after recent morning shower.");
            r1.setCategory(IssueCategory.POTHOLE);
            r1.setStatus(IssueStatus.IN_PROGRESS);
            r1.setPriority(IssuePriority.HIGH);
            r1.setDistrict("Chennai");
            r1.setDepartment("GCC_CORPORATION");
            r1.setLatitude(13.0569);
            r1.setLongitude(80.2525);
            r1.setUpvotes(14);
            r1.setCitizenName("Ramanan K.");
            r1.setEstimatedDays(2);
            r1.setAdminNote("Road maintenance wing assigned. Cold mix patching scheduled for tonight 11:00 PM.");
            repo.save(r1);

            IssueComment c1 = new IssueComment();
            c1.setReportId(r1.getId());
            c1.setAuthorName("Kavitha S. (Resident)");
            c1.setContent("Two-wheelers were skidding here yesterday evening. Glad to see it's marked high priority.");
            commentRepo.save(c1);

            IssueComment c2 = new IssueComment();
            c2.setReportId(r1.getId());
            c2.setAuthorName("GCC Road Wing Inspector");
            c2.setContent("Barricades and reflective cones placed around the crater pending night resurfacing.");
            c2.setOfficial(true);
            commentRepo.save(c2);

            IssueReport r2 = new IssueReport();
            r2.setTitle("Main pipeline water leak on Avinashi Road");
            r2.setDescription("Clean potable water gushing from underground pipeline joint onto the pedestrian walkway near PSG Tech entrance.");
            r2.setCategory(IssueCategory.WATER_LEAK);
            r2.setStatus(IssueStatus.ACKNOWLEDGED);
            r2.setPriority(IssuePriority.CRITICAL);
            r2.setDistrict("Coimbatore");
            r2.setDepartment("CMWSSB_WATER");
            r2.setLatitude(11.0267);
            r2.setLongitude(77.0028);
            r2.setUpvotes(28);
            r2.setCitizenName("Senthamarai M.");
            r2.setEstimatedDays(1);
            r2.setAdminNote("Valve control crew alerted to prevent water loss. Isolation work in progress.");
            repo.save(r2);

            IssueReport r3 = new IssueReport();
            r3.setTitle("Non-functional high-mast streetlights near Meenakshi Amman Chithirai Street");
            r3.setDescription("Four pole fixtures are flickering and two are completely dark along North Chithirai street, posing difficulty for pilgrims and evening vendors.");
            r3.setCategory(IssueCategory.STREETLIGHT);
            r3.setStatus(IssueStatus.SUBMITTED);
            r3.setPriority(IssuePriority.MEDIUM);
            r3.setDistrict("Madurai");
            r3.setDepartment("TANGEDCO_POWER");
            r3.setLatitude(9.9202);
            r3.setLongitude(78.1198);
            r3.setUpvotes(9);
            r3.setCitizenName("Muthuvel P.");
            r3.setEstimatedDays(3);
            repo.save(r3);

            IssueReport r4 = new IssueReport();
            r4.setTitle("Overflowing municipal garbage bin near Chatiram Bus Stand");
            r4.setDescription("Solid waste bin spilling over onto sidewalk. Requires urgent compactor clearance and sanitization spray.");
            r4.setCategory(IssueCategory.GARBAGE);
            r4.setStatus(IssueStatus.RESOLVED);
            r4.setPriority(IssuePriority.MEDIUM);
            r4.setDistrict("Tiruchirappalli");
            r4.setDepartment("SOLID_WASTE");
            r4.setLatitude(10.8286);
            r4.setLongitude(78.6896);
            r4.setUpvotes(7);
            r4.setCitizenName("Deepak Raj");
            r4.setEstimatedDays(0);
            r4.setAdminNote("Compactor truck cleared bin at 7:30 AM. Bleaching powder sanitized surrounding area.");
            repo.save(r4);
        }
    }

    public List<IssueReport> all(String status, String category, String district) {
        List<IssueReport> list = repo.findAllByOrderByCreatedAtDesc();
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            final IssueStatus s = IssueStatus.valueOf(status.toUpperCase());
            list = list.stream().filter(r -> r.getStatus() == s).collect(Collectors.toList());
        }
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            final IssueCategory c = IssueCategory.valueOf(category.toUpperCase());
            list = list.stream().filter(r -> r.getCategory() == c).collect(Collectors.toList());
        }
        if (district != null && !district.isBlank() && !"ALL".equalsIgnoreCase(district)) {
            list = list.stream().filter(r -> district.equalsIgnoreCase(r.getDistrict())).collect(Collectors.toList());
        }
        return list;
    }

    public IssueReport get(Long id) {
        return repo.findById(id).orElseThrow(() -> new NoSuchElementException("Report not found with ID: " + id));
    }

    public IssueReport create(String title, String description, String category, double lat, double lng,
                              String district, String citizenName, String citizenPhone, String priority,
                              MultipartFile photo) throws IOException {
        if (title == null || title.isBlank() || description == null || description.isBlank()) {
            throw new IllegalArgumentException("Title and description are required");
        }
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new IllegalArgumentException("Invalid map coordinates");
        }

        IssueReport r = new IssueReport();
        r.setTitle(title.trim());
        r.setDescription(description.trim());
        r.setCategory(IssueCategory.valueOf(category.toUpperCase()));
        r.setLatitude(lat);
        r.setLongitude(lng);
        r.setDistrict(district != null && !district.isBlank() ? district.trim() : "Chennai");
        r.setCitizenName(citizenName != null && !citizenName.isBlank() ? citizenName.trim() : "Concerned Citizen");
        r.setCitizenPhone(citizenPhone != null ? citizenPhone.trim() : null);

        if (priority != null && !priority.isBlank()) {
            try {
                r.setPriority(IssuePriority.valueOf(priority.toUpperCase()));
            } catch (Exception ignored) {
                r.setPriority(IssuePriority.MEDIUM);
            }
        }

        // Automatic smart department assignment based on category
        switch (r.getCategory()) {
            case POTHOLE, ROAD_DAMAGE -> r.setDepartment("GCC_CORPORATION");
            case WATER_LEAK, DRAINAGE -> r.setDepartment("CMWSSB_WATER");
            case STREETLIGHT -> r.setDepartment("TANGEDCO_POWER");
            case GARBAGE -> r.setDepartment("SOLID_WASTE");
            default -> r.setDepartment("GENERAL_ADMIN");
        }

        if (photo != null && !photo.isEmpty()) {
            String type = photo.getContentType();
            if (type == null || !List.of("image/jpeg", "image/png", "image/webp").contains(type)) {
                throw new IllegalArgumentException("Photo must be JPG, PNG or WEBP");
            }
            Files.createDirectories(uploadPath);
            String safe = UUID.randomUUID() + "-" + Paths.get(Objects.requireNonNull(photo.getOriginalFilename())).getFileName();
            Files.copy(photo.getInputStream(), uploadPath.resolve(safe), StandardCopyOption.REPLACE_EXISTING);
            r.setPhotoUrl("/uploads/" + safe);
        }

        return repo.save(r);
    }

    public IssueReport updateStatus(Long id, String status, String note, String department, String priority, Integer estimatedDays) {
        IssueReport r = get(id);
        if (status != null && !status.isBlank()) {
            r.setStatus(IssueStatus.valueOf(status.toUpperCase()));
        }
        if (note != null) {
            r.setAdminNote(note.trim());
        }
        if (department != null && !department.isBlank()) {
            r.setDepartment(department.trim());
        }
        if (priority != null && !priority.isBlank()) {
            try {
                r.setPriority(IssuePriority.valueOf(priority.toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (estimatedDays != null) {
            r.setEstimatedDays(estimatedDays);
        }
        return repo.save(r);
    }

    public IssueReport upvote(Long id) {
        IssueReport r = get(id);
        r.setUpvotes(r.getUpvotes() + 1);
        return repo.save(r);
    }

    public List<IssueComment> getComments(Long reportId) {
        return commentRepo.findByReportIdOrderByCreatedAtAsc(reportId);
    }

    public IssueComment addComment(Long reportId, String authorName, String content, boolean isOfficial) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }
        get(reportId); // Verify report exists
        IssueComment c = new IssueComment();
        c.setReportId(reportId);
        c.setAuthorName(authorName != null && !authorName.isBlank() ? authorName.trim() : "Tamil Nadu Citizen");
        c.setContent(content.trim());
        c.setOfficial(isOfficial);
        return commentRepo.save(c);
    }

    public void delete(Long id) {
        IssueReport r = get(id);
        List<IssueComment> comments = commentRepo.findByReportIdOrderByCreatedAtAsc(id);
        commentRepo.deleteAll(comments);
        repo.delete(r);
    }

    public Map<String, Object> getAnalytics() {
        List<IssueReport> all = repo.findAll();
        long total = all.size();
        long resolved = all.stream().filter(r -> r.getStatus() == IssueStatus.RESOLVED).count();
        long inProgress = all.stream().filter(r -> r.getStatus() == IssueStatus.IN_PROGRESS).count();
        long acknowledged = all.stream().filter(r -> r.getStatus() == IssueStatus.ACKNOWLEDGED).count();
        long submitted = all.stream().filter(r -> r.getStatus() == IssueStatus.SUBMITTED).count();
        long rejected = all.stream().filter(r -> r.getStatus() == IssueStatus.REJECTED).count();
        long active = total - resolved - rejected;
        int totalUpvotes = all.stream().mapToInt(IssueReport::getUpvotes).sum();
        long highOrCritical = all.stream().filter(r -> r.getPriority() == IssuePriority.HIGH || r.getPriority() == IssuePriority.CRITICAL).count();

        Map<String, Long> categoryCount = new HashMap<>();
        for (IssueCategory cat : IssueCategory.values()) {
            long count = all.stream().filter(r -> r.getCategory() == cat).count();
            if (count > 0) categoryCount.put(cat.name(), count);
        }

        Map<String, Long> districtCount = new HashMap<>();
        for (IssueReport r : all) {
            String dist = r.getDistrict();
            districtCount.put(dist, districtCount.getOrDefault(dist, 0L) + 1);
        }

        Map<String, Long> departmentCount = new HashMap<>();
        for (IssueReport r : all) {
            String dept = r.getDepartment();
            departmentCount.put(dept, departmentCount.getOrDefault(dept, 0L) + 1);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("active", active);
        stats.put("resolved", resolved);
        stats.put("inProgress", inProgress);
        stats.put("acknowledged", acknowledged);
        stats.put("submitted", submitted);
        stats.put("rejected", rejected);
        stats.put("totalUpvotes", totalUpvotes);
        stats.put("highOrCritical", highOrCritical);
        stats.put("categories", categoryCount);
        stats.put("districts", districtCount);
        stats.put("departments", departmentCount);
        return stats;
    }
}
