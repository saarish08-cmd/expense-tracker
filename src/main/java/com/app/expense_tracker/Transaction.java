package com.app.expense_tracker;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity //Marks a Java class to automatically map its fields to a database table
public class Transaction {
    private LocalDate date;
    private String description;
    private double amount;
    private String category;
    private String sessionId;;

    @Id //Marks a class field as the primary key for the database
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Tells database to automatically create unique values for the primary key
    private Long id; //Primary key

    public Transaction(){} //Helps spring create a blank transaction object to then fill in the fields afterward

    //Setters and Getters
    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}