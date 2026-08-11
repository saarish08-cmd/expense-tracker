package com.app.expense_tracker;

public class TransactionCategorizer {
    public String categorize (String description){
        if(description.toUpperCase().contains("TIM HORTONS") || description.toUpperCase().contains("STARBUCKS")||description.toUpperCase().contains("MCDONALD")||description.toUpperCase().contains("UBER EATS"))
            return "Food & Dining";
        else if(description.toUpperCase().contains("SHELL")||description.toUpperCase().contains("PETRO"))
            return "Transport";
        else if(description.toUpperCase().contains("NETFLIX")||description.toUpperCase().contains("SPOTIFY"))
            return "Subscriptions";
        else
            return "Uncategorized";

    }
}
