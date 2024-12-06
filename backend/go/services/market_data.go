package services

import (
	"math/rand"
	"time"
)

type MarketData struct {
	Symbol    string
	Price     float64
	Volume    float64
	Timestamp time.Time
}

type MarketDataService struct {
	lastPrice float64
}

func NewMarketDataService() *MarketDataService {
	return &MarketDataService{
		lastPrice: 45000.0, // Initial BTC price
	}
}

func (s *MarketDataService) GetLatestPrice(symbol string) MarketData {
	// Simulate price movement
	priceChange := (rand.Float64() - 0.5) * 100
	s.lastPrice += priceChange

	return MarketData{
		Symbol:    symbol,
		Price:     s.lastPrice,
		Volume:    rand.Float64() * 10000,
		Timestamp: time.Now(),
	}
}