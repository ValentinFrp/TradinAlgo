package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // For development
	},
}

type MarketData struct {
	Symbol    string    `json:"symbol"`
	Price     float64   `json:"price"`
	Volume    float64   `json:"volume"`
	Timestamp time.Time `json:"timestamp"`
}

func main() {
	r := mux.NewRouter()

	// REST endpoints
	r.HandleFunc("/api/market/price/{symbol}", getPriceHandler).Methods("GET")
	r.HandleFunc("/api/strategies", getStrategiesHandler).Methods("GET")
	r.HandleFunc("/api/strategies/{id}/activate", activateStrategyHandler).Methods("POST")
	r.HandleFunc("/api/strategies/{id}/deactivate", deactivateStrategyHandler).Methods("POST")
	r.HandleFunc("/api/backtest", backtestHandler).Methods("POST")

	// WebSocket endpoint
	r.HandleFunc("/ws/market", marketDataWebSocket)

	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func getPriceHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	symbol := vars["symbol"]

	price := MarketData{
		Symbol:    symbol,
		Price:     45000.0, // Mock data
		Volume:    1000.0,
		Timestamp: time.Now(),
	}

	json.NewEncoder(w).Encode(price)
}

func getStrategiesHandler(w http.ResponseWriter, r *http.Request) {
	// Mock response
	strategies := []map[string]interface{}{
		{
			"id":   "rsi-1",
			"name": "RSI Strategy",
			"parameters": map[string]interface{}{
				"period":            14,
				"oversold":         30,
				"overbought":       70,
			},
		},
	}

	json.NewEncoder(w).Encode(strategies)
}

func activateStrategyHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	strategyID := vars["id"]

	response := map[string]interface{}{
		"status":  "success",
		"message": "Strategy " + strategyID + " activated",
	}

	json.NewEncoder(w).Encode(response)
}

func deactivateStrategyHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	strategyID := vars["id"]

	response := map[string]interface{}{
		"status":  "success",
		"message": "Strategy " + strategyID + " deactivated",
	}

	json.NewEncoder(w).Encode(response)
}

func backtestHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		StrategyID string    `json:"strategyId"`
		StartDate  time.Time `json:"startDate"`
		EndDate    time.Time `json:"endDate"`
		Symbol     string    `json:"symbol"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Mock backtest results
	results := map[string]interface{}{
		"finalBalance": 11250.0,
		"trades":       15,
		"winRate":      0.67,
		"sharpeRatio":  1.5,
		"maxDrawdown":  0.12,
	}

	json.NewEncoder(w).Encode(results)
}

func marketDataWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	// Simulate real-time market data
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			data := MarketData{
				Symbol:    "BTC/USD",
				Price:     45000.0, // Mock price
				Volume:    1000.0,
				Timestamp: time.Now(),
			}

			if err := conn.WriteJSON(data); err != nil {
				log.Printf("WebSocket write failed: %v", err)
				return
			}
		}
	}
}