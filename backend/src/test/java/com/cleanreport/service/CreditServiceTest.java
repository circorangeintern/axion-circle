package com.cleanreport.service;

import com.cleanreport.dto.response.CreditBalanceResponse;
import com.cleanreport.dto.response.CreditTransactionResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.CreditTransaction;
import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.User;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
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

    @InjectMocks private CreditService creditService;

    private User testUser;
    private Report testReport;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(creditService, "creditReportSubmit", 10);
        ReflectionTestUtils.setField(creditService, "creditReportAcknowledged", 5);
        ReflectionTestUtils.setField(creditService, "creditReportResolved", 5);

        testUser = User.builder().id(TEST_USER_ID).email(TEST_EMAIL)
                .displayName("Test User").role(UserRole.REPORTER).creditBalance(50).build();
        testReport = Report.builder().id(TEST_REPORT_ID).referenceNumber(TEST_REFERENCE)
                .reporter(testUser).build();
    }

    @Test
    @DisplayName("awardReportSubmitCredits - increases balance and saves transaction")
    void awardReportSubmitCredits_success() {
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        creditService.awardReportSubmitCredits(testUser, testReport);

        ArgumentCaptor<CreditTransaction> txCaptor = ArgumentCaptor.forClass(CreditTransaction.class);
        verify(creditTransactionRepository).save(txCaptor.capture());
        assertThat(txCaptor.getValue().getReason()).contains(TEST_REFERENCE);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        // Balance should increase (50 + 10 = 60)
        assertThat(userCaptor.getValue().getCreditBalance()).isEqualTo(60);
    }

    @Test
    @DisplayName("awardAcknowledgedCredits - awards to reporter")
    void awardAcknowledgedCredits_success() {
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        creditService.awardAcknowledgedCredits(testReport);

        verify(creditTransactionRepository).save(any(CreditTransaction.class));
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("awardResolvedCredits - awards to reporter")
    void awardResolvedCredits_success() {
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        creditService.awardResolvedCredits(testReport);

        verify(creditTransactionRepository).save(any(CreditTransaction.class));
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("getBalance - returns user balance")
    void getBalance_success() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        CreditBalanceResponse response = creditService.getBalance(TEST_EMAIL);

        assertThat(response.getBalance()).isEqualTo(50);
        assertThat(response.getUserId()).isEqualTo(TEST_USER_ID);
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
                .amount(10).reason("Report submitted: " + TEST_REFERENCE)
                .createdAt(Instant.now()).build();
        Page<CreditTransaction> page = new PageImpl<>(List.of(tx));

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(creditTransactionRepository.findByUserIdOrderByCreatedAtDesc(TEST_USER_ID, PageRequest.of(0, 20)))
                .thenReturn(page);

        Page<CreditTransactionResponse> result = creditService.getHistory(TEST_EMAIL, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getAmount()).isEqualTo(10);
        assertThat(result.getContent().get(0).getReason()).contains(TEST_REFERENCE);
    }
}
