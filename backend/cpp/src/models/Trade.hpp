#pragma once
#include <string>
#include <ctime>

struct Trade {
    std::string type;        // "BUY" or "SELL"
    std::time_t timestamp;
    double price;
    double amount;
    std::string reason;
};