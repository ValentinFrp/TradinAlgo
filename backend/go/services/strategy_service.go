package services

import (
    "sync"
    "time"
    "trading-platform/trading"
)

type StrategyService struct {
    strategies map[string]*trading.Strategy
    mutex      sync.RWMutex
}

func NewStrategyService() *StrategyService {
    return &StrategyService{
        strategies: make(map[string]*trading.Strategy),
    }
}

func (s *StrategyService) CreateRSIStrategy(id string, period int, oversold, overbought float64) {
    s.mutex.Lock()
    defer s.mutex.Unlock()

    if strategy, exists := s.strategies[id]; exists {
        strategy.Close()
    }

    s.strategies[id] = trading.NewRSIStrategy(period, oversold, overbought)
}

func (s *StrategyService) CreateMACDStrategy(id string, fastPeriod, slowPeriod, signalPeriod int, threshold float64) {
    s.mutex.Lock()
    defer s.mutex.Unlock()

    if strategy, exists := s.strategies[id]; exists {
        strategy.Close()
    }

    s.strategies[id] = trading.NewMACDStrategy(fastPeriod, slowPeriod, signalPeriod, threshold)
}

func (s *StrategyService) CreateBollingerBandsStrategy(id string, period int, multiplier, percentageB float64) {
    s.mutex.Lock()
    defer s.mutex.Unlock()

    if strategy, exists := s.strategies[id]; exists {
        strategy.Close()
    }

    s.strategies[id] = trading.NewBollingerBandsStrategy(period, multiplier, percentageB)
}

func (s *StrategyService) RemoveStrategy(id string) {
    s.mutex.Lock()
    defer s.mutex.Unlock()

    if strategy, exists := s.strategies[id]; exists {
        strategy.Close()
        delete(s.strategies, id)
    }
}

func (s *StrategyService) AnalyzeMarket(id string, prices []float64) *trading.TradeSignal {
    s.mutex.RLock()
    strategy, exists := s.strategies[id]
    s.mutex.RUnlock()

    if !exists {
        return nil
    }

    return strategy.AnalyzeMarketData(prices)
}

func (s *StrategyService) Close() {
    s.mutex.Lock()
    defer s.mutex.Unlock()

    for _, strategy := range s.strategies {
        strategy.Close()
    }
    s.strategies = make(map[string]*trading.Strategy)
}