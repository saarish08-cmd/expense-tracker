package com.app.expense_tracker;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.*;
import java.util.*;

@RestController //Tells spring that this class handles web requests and sends data back directly
@RequestMapping("/transactions")
public class TransactionController {
    // Store the repository reference so controller methods can use it
    private final TransactionRepository transactionRepository;
    private final TransactionCategorizer categorizer = new TransactionCategorizer();

    // Constructor Injection: Spring automatically provides a working instance of TransactionRepository
    public TransactionController(TransactionRepository transactionRepository){
        this.transactionRepository = transactionRepository;
    }

    //Method For Saving
    @PostMapping() //Maps website request to this method
    public Transaction addTransaction(@RequestBody Transaction transaction){
        return transactionRepository.save(transaction);
    }

    //Method For Reading Everything Back Onto The Website
    @GetMapping() //Runs the following method when someone visits the URL with this request
    public List<Transaction> getAllTransactions(){
        return transactionRepository.findAll();
    }

    //Upload CSV Export
    @PostMapping("/upload")
    public String uploadPhoto(@RequestParam("file")MultipartFile file) throws IOException{ //MultipartFile is Spring's representation of an uploaded file
        int counter = 0;
        try(BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))){
           String line;
           boolean isFirstLine = true;
           while ((line=reader.readLine()) != null){
               if(isFirstLine) {
                   isFirstLine = false;
                   continue;
               }
               System.out.println(line);
               String[] parts = line.split(",");
               Transaction transaction = new Transaction();
               transaction.setDate(LocalDate.parse(parts[0]));
               transaction.setDescription(parts[1]);
               transaction.setAmount(Double.parseDouble(parts[2]));
               transaction.setCategory(categorizer.categorize((parts[1])));
               transactionRepository.save(transaction);
               counter++;
           }
       }
        return "Saved " + counter + " transactions";
    }

    @GetMapping("/summary")
    public Map <String, Double>  summarize(){
        List<Transaction> transactions = transactionRepository.findAll();
        Map<String, Double> categoryTotals = new HashMap<>();
        for (Transaction transaction : transactions){
            categoryTotals.put(transaction.getCategory(), categoryTotals.getOrDefault(transaction.getCategory(), 0.0) + transaction.getAmount());
        }
        return categoryTotals;
    }

    @GetMapping("/monthly-summary")
    public Map<String, Double>  monthlySummary() {
        List<Transaction> transactions = transactionRepository.findAll();
        Map<String, Double> monthlyTotals = new HashMap<>();
        for(Transaction transaction : transactions){
            String key = transaction.getDate().getYear() + "-" + transaction.getDate().getMonthValue();
            monthlyTotals.put(key, monthlyTotals.getOrDefault(key,0.0)+ transaction.getAmount());
        }
        return monthlyTotals;
    }

}
