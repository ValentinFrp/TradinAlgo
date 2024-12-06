package services

import (
    "sync"
    "time"
    "trading-platform/models"
    "trading-platform/trading"
)

type StrategyManager struct {
    strategies map[string]*trading.Strategy
    activeStrategies map[string]bool
    mutex sync.RWMutex
    marketData *MarketDataService
}

func NewStrategyManager(marketData *MarketDataService) *StrategyManager {
    return &StrategyManager{
        strategies: make(map[string]*trading.Strategy),
        activeStrategies: make(map[string]bool),
        marketData: marketData,
    }
}

func (sm *StrategyManager) RegisterStrategy(id string, strategyType string, params map[string]interface{}) error {
    sm.mutex.Lock()
    defer sm.mutex.Unlock()

    var strategy *trading.Strategy
    switch strategyType {
    case "RSI":
        period := params["period"].(float64)
        oversold := params["oversold"].(float64)
        overbought := params["overbought"].(float64)
        strategy = trading.NewRSIStrategy(int(period), oversold, overbought)
    case "MACD":
        fastPeriod := params["fastPeriod"].(float64)
        slowPeriod := params["slowPeriod"].(float64)
        signalPeriod := params["signalPeriod"].(float64)
        strategy = trading.NewMACDStrategy(
            int(fastPeriod),
            int(slowPeriod),
            int(signalPeriod),
            params["threshold"].(float64),
        )
    }

    if strategy != nil {
        sm.strategies[id] = strategy
    }

    return nil
}

func (sm *StrategyManager) ActivateStrategy(id string) error {
    sm.mutex.Lock()
    defer sm.mutex.Unlock()

    if _, exists := sm.strategies[id]; !exists {
        return fmt.Errorf("strategy not found: %s", id)
    }

    sm.activeStrategies[id] = true
    go sm.runStrategy(id)
    return nil
}

func (sm *StrategyManager) DeactivateStrategy(id string) error {
    sm.mutex.Lock()
    defer sm.mutex.Unlock()

    delete(sm.activeStrategies, id)
    return nil
}

func (sm *StrategyManager) runStrategy(id string) {
    strategy := sm.strategies[id]
    ticker := time.NewTicker(time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            sm.mutex.RLock()
            isActive := sm.activeStrategies[id]
            sm.mutex.RUnlock()

            if !isActive {
                return
            }

            // Get latest market data
            data := sm.marketData.GetLatestPrice("BTC/USD")
            prices := []float64{data.Price}

            // Analyze market data
            if signal := strategy.AnalyzeMarketData(prices); signal != nil {
                // Execute trade based on signal
                // This is where you would integrate with your trading execution service
                log.Printf("Strategy %s generated signal: %+v", id, signal)
            }
        }
    }
}