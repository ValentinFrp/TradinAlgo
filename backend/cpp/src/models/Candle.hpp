#pragma once
#include <ctime>

struct Candle {
    std::time_t timestamp;
    double open;
    double high;
    double low;
    double close;
    double volume;
};