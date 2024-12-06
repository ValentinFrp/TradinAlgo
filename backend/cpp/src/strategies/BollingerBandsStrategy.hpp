#pragma once
#include "Strategy.hpp"
#include "../indicators/BollingerBands.hpp"
#include <memory>

class BollingerBandsStrategy : public Strategy {
private:
    int period = 20;
    double multiplier = 2.0;
    double percentageB = 0.5; // Threshold for %B indicator

public:
    std::string getName() const override {
        return "Bollinger Bands Strategy";
    }

    std::vector<Trade> analyze(const std::vector<Candle>& candles) override {
        std::vector<Trade> trades;
        std::vector<double> prices;
        
        // Extract closing prices
        for (const auto& candle : candles) {
            prices.push_back(candle.close);
        }
        
        // Calculate Bollinger Bands
        auto bands = BollingerBands::calculate(prices, period, multiplier);
        
        // Generate trading signals
        for (size_t i = period; i < candles.size(); ++i) {
            double price = prices[i];
            double upperBand = bands.upper[i];
            double lowerBand = bands.lower[i];
            double middleBand = bands.middle[i];
            
            // Calculate %B indicator
            double percentB = (price - lowerBand) / (upperBand - lowerBand);
            
            // Oversold condition (price near lower band)
            if (percentB < percentageB && price > lowerBand) {
                trades.push_back({
                    "BUY",
                    candles[i].timestamp,
                    candles[i].close,
                    1.0,  // Standard position size
                    "BB Oversold"
                });
            }
            // Overbought condition (price near upper band)
            else if (percentB > (1 - percentageB) && price < upperBand) {
                trades.push_back({
                    "SELL",
                    candles[i].timestamp,
                    candles[i].close,
                    1.0,  // Standard position size
                    "BB Overbought"
                });
            }
        }
        
        return trades;
    }

    void updateParameters(const std::vector<double>& params) override {
        if (params.size() >= 3) {
            period = static_cast<int>(params[0]);
            multiplier = params[1];
            percentageB = params[2];
        }
    }
};