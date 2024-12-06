package trading

// #cgo CXXFLAGS: -std=c++17
// #cgo LDFLAGS: -L${SRCDIR} -lstrategy
// #include "bridge.h"
import "C"
import (
    "time"
    "unsafe"
)

type Strategy struct {
    handle unsafe.Pointer
}

func NewRSIStrategy(period int, oversold, overbought float64) *Strategy {
    handle := C.create_rsi_strategy(C.int(period), C.double(oversold), C.double(overbought))
    return &Strategy{handle: handle}
}

func NewMACDStrategy(fastPeriod, slowPeriod, signalPeriod int, threshold float64) *Strategy {
    handle := C.create_macd_strategy(
        C.int(fastPeriod),
        C.int(slowPeriod),
        C.int(signalPeriod),
        C.double(threshold),
    )
    return &Strategy{handle: handle}
}

func NewBollingerBandsStrategy(period int, multiplier, percentageB float64) *Strategy {
    handle := C.create_bbands_strategy(
        C.int(period),
        C.double(multiplier),
        C.double(percentageB),
    )
    return &Strategy{handle: handle}
}

func (s *Strategy) Close() {
    C.destroy_strategy(s.handle)
}

func (s *Strategy) AnalyzeMarketData(prices []float64) *TradeSignal {
    if len(prices) == 0 {
        return nil
    }

    cPrices := make([]C.double, len(prices))
    for i, price := range prices {
        cPrices[i] = C.double(price)
    }

    signal := C.analyze_market_data(s.handle, &cPrices[0], C.int(len(prices)))
    if signal == nil {
        return nil
    }
    defer C.free_trade_signal(signal)

    return &TradeSignal{
        Price:     float64(signal.price),
        Amount:    float64(signal.amount),
        Type:      C.GoString(signal.type),
        Timestamp: time.Unix(int64(signal.timestamp), 0),
    }
}

type TradeSignal struct {
    Price     float64
    Amount    float64
    Type      string
    Timestamp time.Time
}