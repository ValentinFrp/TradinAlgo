#pragma once
#include <vector>
#include <cmath>

class RSI {
public:
    static std::vector<double> calculate(const std::vector<double>& prices, int period = 14) {
        std::vector<double> rsi(prices.size());
        std::vector<double> gains;
        std::vector<double> losses;
        
        // Calculate price changes
        for (size_t i = 1; i < prices.size(); ++i) {
            double change = prices[i] - prices[i-1];
            gains.push_back(std::max(change, 0.0));
            losses.push_back(std::max(-change, 0.0));
        }
        
        // Calculate initial averages
        double avgGain = std::accumulate(gains.begin(), gains.begin() + period, 0.0) / period;
        double avgLoss = std::accumulate(losses.begin(), losses.begin() + period, 0.0) / period;
        
        // Calculate RSI
        for (size_t i = period; i < prices.size(); ++i) {
            avgGain = (avgGain * (period - 1) + gains[i-1]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i-1]) / period;
            
            double rs = avgGain / (avgLoss > 0 ? avgLoss : 1e-10);
            rsi[i] = 100.0 - (100.0 / (1.0 + rs));
        }
        
        return rsi;
    }
};