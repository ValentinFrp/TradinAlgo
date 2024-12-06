#pragma once
#include <string>
#include <vector>
#include "../models/Trade.hpp"
#include "../models/Candle.hpp"

class Strategy {
public:
    virtual ~Strategy() = default;
    virtual std::string getName() const = 0;
    virtual std::vector<Trade> analyze(const std::vector<Candle>& candles) = 0;
    virtual void updateParameters(const std::vector<double>& params) = 0;
};