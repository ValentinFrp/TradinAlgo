package models

import "time"

type Strategy struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Parameters  map[string]interface{} `json:"parameters"`
	IsActive    bool                   `json:"isActive"`
	LastRun     time.Time             `json:"lastRun"`
}

type BacktestRequest struct {
	StrategyID string    `json:"strategyId"`
	StartDate  time.Time `json:"startDate"`
	EndDate    time.Time `json:"endDate"`
	Symbol     string    `json:"symbol"`
}

type BacktestResult struct {
	FinalBalance float64   `json:"finalBalance"`
	Trades       int       `json:"trades"`
	WinRate      float64   `json:"winRate"`
	SharpeRatio  float64   `json:"sharpeRatio"`
	MaxDrawdown  float64   `json:"maxDrawdown"`
	Positions    []Trade   `json:"positions"`
	History      []Trade   `json:"history"`
	Performance  []float64 `json:"performance"`
}