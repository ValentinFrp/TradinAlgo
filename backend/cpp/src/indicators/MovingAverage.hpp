#pragma once
#include <vector>
#include <numeric>

class MovingAverage {
public:
    static double calculateSMA(const std::vector<double>& prices, int period) {
        if (prices.size() < period) return 0.0;
        
        auto start = prices.end() - period;
        auto end = prices.end();
        return std::accumulate(start, end, 0.0) / period;
    }

    static std::vector<double> calculateEMA(const std::vector<double>& prices, int period) {
        std::vector<double> ema(prices.size());
        double multiplier = 2.0 / (period + 1.0);
        
        // Initialize EMA with SMA for first period
        ema[period-1] = calculateSMA(std::vector<double>(prices.begin(), 
                                                        prices.begin() + period), 
                                   period);
        
        // Calculate EMA for remaining prices
        for (size_t i = period; i < prices.size(); ++i) {
            ema[i] = (prices[i] - ema[i-1]) * multiplier + ema[i-1];
        }
        
        return ema;
    }
};