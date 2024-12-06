#pragma once
#include <vector>
#include <cmath>
#include "MovingAverage.hpp"

class BollingerBands {
public:
    struct BBands {
        std::vector<double> upper;
        std::vector<double> middle;
        std::vector<double> lower;
    };

    static BBands calculate(const std::vector<double>& prices, 
                          int period = 20, 
                          double multiplier = 2.0) {
        std::vector<double> upper(prices.size());
        std::vector<double> middle(prices.size());
        std::vector<double> lower(prices.size());
        
        // Calculate SMA for middle band
        for (size_t i = period - 1; i < prices.size(); ++i) {
            double sum = 0.0;
            for (size_t j = 0; j < period; ++j) {
                sum += prices[i - j];
            }
            middle[i] = sum / period;
            
            // Calculate standard deviation
            double variance = 0.0;
            for (size_t j = 0; j < period; ++j) {
                variance += std::pow(prices[i - j] - middle[i], 2);
            }
            variance /= period;
            double stdDev = std::sqrt(variance);
            
            // Calculate upper and lower bands
            upper[i] = middle[i] + (multiplier * stdDev);
            lower[i] = middle[i] - (multiplier * stdDev);
        }
        
        return {upper, middle, lower};
    }
};