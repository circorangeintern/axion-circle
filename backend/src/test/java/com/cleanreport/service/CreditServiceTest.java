package com.cleanreport.service;

import com.cleanreport.dto.response.CreditBalanceResponse;
import com.cleanreport.dto.response.CreditTransactionResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.CreditTransaction;
import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.UserLevel;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.repository.CreditTransactionRepository;
import com.cleanreport.repository.ReportRepository;
import com.cleanreport.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreditServiceTest {

    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final UUID TEST_REPORT_ID = UUID.randomUUID();
    private static final String TEST_EMAIL = "user@test.com";
    private static final String TEST_REFERENCE = "CR-12345";

    @Mock private CreditTransactionRepository creditTransactionRepository;
    @Mock private UserRepository userRepository;
    @Mock private ReportRepository reportRepository;
    @Mock private StreakService streakService;

    @InjectMocks private CreditService creditService;

    private User testUser;
    private Report testReport;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(TEST_USER_ID).email(TEST_EMAIL)
                .displayName("Test User").role(UserRole.REPORTER)
                .creditBalance(50).lifetimeCredits(50)
                .level(UserLevel.REPORTER).streakCount(3).build();
        testReport = Report.builder().id(TEST_REPORT_ID).referenceNumber(TEST_REFERENCE)
                .reporter(testUser).build();
    }

    @Test
    @DisplayName("awardReportSubmitCredits - awards +2 base (REPORTER level = 1.0x)")
    void awardSubmit_baseLevelReporter() {
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(reportRepository.findByReporterId(TEST_USER_ID)).thenReturn(List.of(testReport, testReport));
        when(streakService.updateStreak(any(User.class))).thenReturn(0);

        creditService.awardReportSubmitCredits(testUser, testReport);

        verify(creditTransactionRepository, atLeastOnce()).save(any(CreditTransaction.class));
        verify(streakService).updateStreak(testUser);
        verify(streakService).updateLevel(testUser);
    }

    @Test
    @DisplayName("awardReportSubmitCredits - first report gets +5 bonus")
    void awardSubmit_firstReportBonus() {
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(reportRepository.findByReporterId(TEST_USER_ID)).thenReturn(List.of(testReport)); // Only 1 report
        when(streakService.updateStreak(any(User.class))).thenReturn(0);

        creditService.awardReportSubmitCredits(testUser, testReport);

        // Should save at least 2 transactions (first report bonus + submit)
        verify(creditTransactionRepository, atLeast(2)).save(any(CreditTransaction.class));
    }

    @Test
    @DisplayName("awardAcknowledgedCredits - awards +5 base (REPORTER level)")
    void awardAcknowledged_success() {
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        creditService.awardAcknowledgedCredits(testReport);

        ArgumentCaptor<CreditTransaction> captor = ArgumentCaptor.forClass(CreditTransaction.class);
        verify(creditTransactionRepository).save(captor.capture());
        assertThat(captor.getValue().getAmount()).isEqualTo(5); // 5 * 1.0 multiplier
        assertThat(captor.getValue().getReason()).contains("verified");
    }

    @Test
    @DisplayName("awardResolvedCredits - awards +10 base (REPORTER level)")
    void awardResolved_success() {
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        creditService.awardResolvedCredits(testReport);

        ArgumentCaptor<CreditTransaction> captor = ArgumentCaptor.forClass(CreditTransaction.class);
        verify(creditTransactionRepository).save(captor.capture());
        assertThat(captor.getValue().getAmount()).isEqualTo(10); // 10 * 1.0 multiplier
        assertThat(captor.getValue().getReason()).contains("resolved");
    }

    @Test
    @DisplayName("awardResolvedCredits - GUARDIAN level gets 1.2x multiplier")
    void awardResolved_guardianMultiplier() {
        testUser.setLevel(UserLevel.GUARDIAN); // 1.2x
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        creditService.awardResolvedCredits(testReport);

        ArgumentCaptor<CreditTransaction> captor = ArgumentCaptor.forClass(CreditTransaction.class);
        verify(creditTransactionRepository).save(captor.capture());
        assertThat(captor.getValue().getAmount()).isEqualTo(12); // 10 * 1.2 = 12
    }

    @Test
    @DisplayName("getBalance - returns balance with level and streak info")
    void getBalance_success() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        CreditBalanceResponse response = creditService.getBalance(TEST_EMAIL);

        assertThat(response.getBalance()).isEqualTo(50);
        assertThat(response.getLifetimeCredits()).isEqualTo(50);
        assertThat(response.getLevel()).isEqualTo("REPORTER");
        assertThat(response.getStreakCount()).isEqualTo(3);
        assertThat(response.getMultiplier()).isEqualTo(1.0);
        assertThat(response.getNextLevelAt()).isEqualTo(200);
    }

    @Test
    @DisplayName("getBalance - user not found - throws")
    void getBalance_userNotFound_throws() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> creditService.getBalance("unknown@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getHistory - returns paginated transactions")
    void getHistory_success() {
        CreditTransaction tx = CreditTransaction.builder()
                .id(UUID.randomUUID()).user(testUser).report(testReport)
                .amount(2).reason("Report submitted: " + TEST_REFERENCE)
                .createdAt(Instant.now()).build();
        Page<CreditTransaction> page = new PageImpl<>(List.of(tx));

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(creditTransactionRepository.findByUserIdOrderByCreatedAtDesc(TEST_USER_ID, PageRequest.of(0, 20)))
                .thenReturn(page);

        Page<CreditTransactionResponse> result = creditService.getHistory(TEST_EMAIL, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getAmount()).isEqualTo(2);
    }
}
