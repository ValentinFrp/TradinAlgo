#pragma once
#include <vector>
#include <memory>
#include "../strategies/Strategy.hpp"
#include "../models/Trade.hpp"
#include "../models/Candle.hpp"

class Backtester {
private:
    double initialBalance;
    double commission;
    std::shared_ptr<Strategy> strategy;

public:
    Backtester(double balance = 10000.0, double comm = 0.001) 
        : initialBalance(balance), commission(comm) {}

    void setStrategy(std::shared_ptr<Strategy> strat) {
        strategy = strat;
    }

    struct BacktestResult {
        double finalBalance;
        std::vector<Trade> trades;
        double maxDrawdown;
        double sharpeRatio;
        double winRate;
    };

    BacktestResult run(const std::vector<Candle>& candles) {
        if (!strategy) throw std::runtime_error("No strategy set");

        double balance = initialBalance;
        double maxBalance = balance;
        double maxDrawdown = 0.0;
        std::vector<Trade> trades = strategy->analyze(candles);
        int wins = 0;

        for (const auto& trade : trades) {
            double cost = trade.price * trade.amount;
            double commissionCost = cost * commission;
            
            if (trade.type == "BUY") {
                balance -= (cost + commissionCost);
            } else {
                balance += (cost - commissionCost);
                if (balance > maxBalance) maxBalance = balance;
            }

            double drawdown = (maxBalance - balance) / maxBalance;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;

            if (balance > initialBalance) wins++;
        }

        return {
            balance,
            trades,
            maxDrawdown,
            calculateSharpeRatio(trades),
            static_cast<double>(wins) / trades.size()
        };
    }

private:
    double calculateSharpeRatio(const std::vector<Trade>& trades) {
        // Simplified Sharpe ratio calculation
        if (trades.empty()) return 0.0;
        
        std::vector<double> returns;
        double sum = 0.0;
        
        for (const auto& trade : trades) {
            double ret = (trade.type == "SELL" ? 1.0 : -1.0) * 
                        (trade.price * trade.amount * (1.0 - commission));
            returns.push_back(ret);
            sum += ret;
        }
        
        double mean = sum / returns.size();
        double variance = 0.0;
        
        for (double ret : returns) {
            variance += (ret - mean) * (ret - mean);
        }
        
        variance /= returns.size();
        return mean / std::sqrt(variance);
    }
};