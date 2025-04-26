package com.learnloop.backend.service;

import com.learnloop.backend.model.ProgressUpdate;
import com.learnloop.backend.repository.ProgressUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.MessagingException;


import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProgressUpdateService {

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @Autowired
    private JavaMailSender mailSender;

    public ProgressUpdate createUpdate(ProgressUpdate progressUpdate) {
        if (progressUpdate.getDate() == null) {
            progressUpdate.setDate(LocalDateTime.now());
        }
        return progressUpdateRepository.save(progressUpdate);
    }

    public List<ProgressUpdate> getUpdatesByUser(String userId) {
        return progressUpdateRepository.findByUserId(userId);
    }

    public void deleteUpdate(String id) {
        progressUpdateRepository.deleteById(id);
    }

    // 🛠 ADD THIS - Proper getById()
    public ProgressUpdate getById(String id) {
        return progressUpdateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProgressUpdate not found with id: " + id));
    }


    public void sendSkillInsightEmail(String id, String to, String subject, String messageHtml) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("testmailkanzur@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(messageHtml, true); // <== Enable HTML
    
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
