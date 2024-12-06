#ifndef TRADING_BRIDGE_H
#define TRADING_BRIDGE_H

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double price;
    double amount;
    const char* type;
    long long timestamp;
} TradeSignal;

void* create_rsi_strategy(int period, double oversold, double overbought);
void* create_macd_strategy(int fastPeriod, int slowPeriod, int signalPeriod, double threshold);
void* create_bbands_strategy(int period, double multiplier, double percentageB);
void destroy_strategy(void* strategy);
TradeSignal* analyze_market_data(void* strategy, double* prices, int size);
void free_trade_signal(TradeSignal* signal);

#ifdef __cplusplus
}
#endif

#endif // TRADING_BRIDGE_H