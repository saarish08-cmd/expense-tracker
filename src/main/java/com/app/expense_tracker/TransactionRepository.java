package com.app.expense_tracker;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findBySessionId(String sessionId); //Get sessionId
}
