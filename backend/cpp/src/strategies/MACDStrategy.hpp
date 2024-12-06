#pragma once
#include "Strategy.hpp"
#include "../indicators/MACD.hpp"
#include <memory>

class MACDStrategy : public Strategy {
private:
    int fastPeriod = 12;
    int slowPeriod = 26;
    int signalPeriod = 9;
    double signalThreshold = 0.0;

public:
    std::string getName() const override {
        return "MACD Strategy";
    }

    std::vector<Trade> analyze(const std::vector<Candle>& candles) override {
        std::vector<Trade> trades;
        std::vector<double> prices;
        
        // Extract closing prices
        for (const auto& candle : candles) {
            prices.push_back(candle.close);
        }
        
        // Calculate MACD
        auto macdData = MACD::calculate(prices, fastPeriod, slowPeriod, signalPeriod);
        
        // Generate trading signals
        for (size_t i = signalPeriod + 1; i < candles.size(); ++i) {
            // MACD line crosses above signal line
            if (macdData.histogram[i-1] <= signalThreshold && 
                macdData.histogram[i] > signalThreshold) {
                trades.push_back({
                    "BUY",
                    candles[i].timestamp,
                    candles[i].close,
                    1.0,  // Standard position size
                    "MACD Bullish Crossover"
                });
            }
            // MACD line crosses below signal line
            else if (macdData.histogram[i-1] >= -signalThreshold && 
                     macdData.histogram[i] < -signalThreshold) {
                trades.push_back({
                    "SELL",
                    candles[i].timestamp,
                    candles[i].close,
                    1.0,  // Standard position size
                    "MACD Bearish Crossover"
                });
            }
        }
        
        return trades;
    }

    void updateParameters(const std::vector<double>& params) override {
        if (params.size() >= 4) {
            fastPeriod = static_cast<int>(params[0]);
            slowPeriod = static_cast<int>(params[1]);
            signalPeriod = static_cast<int>(params[2]);
            signalThreshold = params[3];
        }
    }
};