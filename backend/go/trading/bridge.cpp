#include "bridge.h"
#include "../cpp/src/strategies/RSIStrategy.hpp"
#include "../cpp/src/strategies/MACDStrategy.hpp"
#include "../cpp/src/strategies/BollingerBandsStrategy.hpp"
#include <memory>
#include <vector>

extern "C" {

void* create_rsi_strategy(int period, double oversold, double overbought) {
    auto strategy = new RSIStrategy();
    strategy->updateParameters({static_cast<double>(period), oversold, overbought});
    return static_cast<void*>(strategy);
}

void* create_macd_strategy(int fastPeriod, int slowPeriod, int signalPeriod, double threshold) {
    auto strategy = new MACDStrategy();
    strategy->updateParameters({
        static_cast<double>(fastPeriod),
        static_cast<double>(slowPeriod),
        static_cast<double>(signalPeriod),
        threshold
    });
    return static_cast<void*>(strategy);
}

void* create_bbands_strategy(int period, double multiplier, double percentageB) {
    auto strategy = new BollingerBandsStrategy();
    strategy->updateParameters({
        static_cast<double>(period),
        multiplier,
        percentageB
    });
    return static_cast<void*>(strategy);
}

void destroy_strategy(void* strategy) {
    delete static_cast<Strategy*>(strategy);
}

TradeSignal* analyze_market_data(void* strategy, double* prices, int size) {
    auto tradingStrategy = static_cast<Strategy*>(strategy);
    
    std::vector<Candle> candles;
    for (int i = 0; i < size; i++) {
        candles.push_back({
            std::time(nullptr) - (size - i) * 60,  // Mock timestamp
            prices[i], prices[i], prices[i], prices[i],  // Use same price for OHLC
            1000.0  // Mock volume
        });
    }
    
    auto trades = tradingStrategy->analyze(candles);
    if (trades.empty()) {
        return nullptr;
    }
    
    auto lastTrade = trades.back();
    auto signal = new TradeSignal{
        lastTrade.price,
        lastTrade.amount,
        lastTrade.type.c_str(),
        lastTrade.timestamp
    };
    
    return signal;
}

void free_trade_signal(TradeSignal* signal) {
    delete signal;
}

}