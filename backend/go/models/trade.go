package models

import "time"

type Trade struct {
	ID        string    `json:"id"`
	Symbol    string    `json:"symbol"`
	Type      string    `json:"type"`
	Price     float64   `json:"price"`
	Amount    float64   `json:"amount"`
	Timestamp time.Time `json:"timestamp"`
	Strategy  string    `json:"strategy"`
}