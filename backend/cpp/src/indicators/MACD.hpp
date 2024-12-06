#pragma once
#include "MovingAverage.hpp"
#include <vector>
#include <tuple>

class MACD {
public:
    struct MACDData {
        std::vector<double> macd;
        std::vector<double> signal;
        std::vector<double> histogram;
    };

    static MACDData calculate(const std::vector<double>& prices, 
                            int fastPeriod = 12, 
                            int slowPeriod = 26, 
                            int signalPeriod = 9) {
        auto fastEMA = MovingAverage::calculateEMA(prices, fastPeriod);
        auto slowEMA = MovingAverage::calculateEMA(prices, slowPeriod);
        
        std::vector<double> macdLine(prices.size());
        for (size_t i = 0; i < prices.size(); ++i) {
            macdLine[i] = fastEMA[i] - slowEMA[i];
        }
        
        auto signalLine = MovingAverage::calculateEMA(macdLine, signalPeriod);
        
        std::vector<double> histogram(prices.size());
        for (size_t i = 0; i < prices.size(); ++i) {
            histogram[i] = macdLine[i] - signalLine[i];
        }
        
        return {macdLine, signalLine, histogram};
    }
};