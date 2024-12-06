#pragma once
#include "Strategy.hpp"
#include "../indicators/RSI.hpp"
#include "../indicators/MovingAverage.hpp"
#include <memory>

class EnhancedRSIStrategy : public Strategy {
private:
    double oversoldThreshold = 30.0;
    double overboughtThreshold = 70.0;
    int rsiPeriod = 14;
    int emaPeriod = 20;
    double stopLoss = 0.02;  // 2% stop loss
    double takeProfit = 0.04; // 4% take profit

public:
    std::string getName() const override {
        return "Enhanced RSI Strategy";
    }

    std::vector<Trade> analyze(const std::vector<Candle>& candles) override {
        std::vector<Trade> trades;
        std::vector<double> prices;
        
        // Extract closing prices
        for (const auto& candle : candles) {
            prices.push_back(candle.close);
        }
        
        // Calculate indicators
        auto rsi = RSI::calculate(prices, rsiPeriod);
        auto ema = MovingAverage::calculateEMA(prices, emaPeriod);
        
        double lastEntryPrice = 0.0;
        std::string currentPosition = "NONE";

        // Generate trading signals
        for (size_t i = emaPeriod; i < candles.size(); ++i) {
            // Check for exit conditions first
            if (currentPosition != "NONE") {
                double pnl = (candles[i].close - lastEntryPrice) / lastEntryPrice;
                
                if ((currentPosition == "LONG" && pnl <= -stopLoss) ||
                    (currentPosition == "SHORT" && pnl >= stopLoss)) {
                    trades.push_back({
                        currentPosition == "LONG" ? "SELL" : "BUY",
                        candles[i].timestamp,
                        candles[i].close,
                        1.0,
                        "Stop Loss"
                    });
                    currentPosition = "NONE";
                    continue;
                }

                if ((currentPosition == "LONG" && pnl >= takeProfit) ||
                    (currentPosition == "SHORT" && pnl <= -takeProfit)) {
                    trades.push_back({
                        currentPosition == "LONG" ? "SELL" : "BUY",
                        candles[i].timestamp,
                        candles[i].close,
                        1.0,
                        "Take Profit"
                    });
                    currentPosition = "NONE";
                    continue;
                }
            }

            // Entry conditions
            if (currentPosition == "NONE") {
                bool priceAboveEMA = candles[i].close > ema[i];
                bool rsiOversold = rsi[i] <= oversoldThreshold;
                bool rsiOverbought = rsi[i] >= overboughtThreshold;

                if (priceAboveEMA && rsiOversold) {
                    trades.push_back({
                        "BUY",
                        candles[i].timestamp,
                        candles[i].close,
                        1.0,
                        "RSI Oversold + EMA Support"
                    });
                    currentPosition = "LONG";
                    lastEntryPrice = candles[i].close;
                }
                else if (!priceAboveEMA && rsiOverbought) {
                    trades.push_back({
                        "SELL",
                        candles[i].timestamp,
                        candles[i].close,
                        1.0,
                        "RSI Overbought + EMA Resistance"
                    });
                    currentPosition = "SHORT";
                    lastEntryPrice = candles[i].close;
                }
            }
        }
        
        return trades;
    }

    void updateParameters(const std::vector<double>& params) override {
        if (params.size() >= 6) {
            rsiPeriod = static_cast<int>(params[0]);
            emaPeriod = static_cast<int>(params[1]);
            oversoldThreshold = params[2];
            overboughtThreshold = params[3];
            stopLoss = params[4];
            takeProfit = params[5];
        }
    }
};