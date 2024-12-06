#pragma once
#include "Strategy.hpp"
#include "../indicators/RSI.hpp"
#include <memory>

class RSIStrategy : public Strategy {
private:
    double oversoldThreshold = 30.0;
    double overboughtThreshold = 70.0;
    int period = 14;

public:
    std::string getName() const override {
        return "RSI Strategy";
    }

    std::vector<Trade> analyze(const std::vector<Candle>& candles) override {
        std::vector<Trade> trades;
        std::vector<double> prices;
        
        // Extract closing prices
        for (const auto& candle : candles) {
            prices.push_back(candle.close);
        }
        
        // Calculate RSI
        auto rsi = RSI::calculate(prices, period);
        
        // Generate trading signals
        for (size_t i = period + 1; i < candles.size(); ++i) {
            if (rsi[i-1] > overboughtThreshold && rsi[i] <= overboughtThreshold) {
                trades.push_back({
                    "SELL",
                    candles[i].timestamp,
                    candles[i].close,
                    1.0,  // Standard position size
                    "RSI Overbought"
                });
            }
            else if (rsi[i-1] < oversoldThreshold && rsi[i] >= oversoldThreshold) {
                trades.push_back({
                    "BUY",
                    candles[i].timestamp,
                    candles[i].close,
                    1.0,  // Standard position size
                    "RSI Oversold"
                });
            }
        }
        
        return trades;
    }

    void updateParameters(const std::vector<double>& params) override {
        if (params.size() >= 3) {
            period = static_cast<int>(params[0]);
            oversoldThreshold = params[1];
            overboughtThreshold = params[2];
        }
    }
};