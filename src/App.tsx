import React, { useEffect, useState } from "react";
import { TradingChart } from "./components/TradingChart";
import { PositionsTable } from "./components/PositionsTable";
import { StrategyPanel } from "./components/StrategyPanel";
import { TradeHistory } from "./components/TradeHistory";
import { RiskPanel } from "./components/RiskPanel";
import { AnalysisPanel } from "./components/AnalysisPanel";
import { TradingInterface } from "./components/TradingInterface";
import { useTradingStore } from "./store/tradingStore";
import { useRiskStore } from "./store/riskStore";
import { LineChart, Wallet, History, Bot, BarChart2 } from "lucide-react";

function App() {
  const {
    balance,
    positions,
    trades,
    candleData,
    activeStrategies,
    updateCandleData,
  } = useTradingStore();

  const { updateBalance } = useRiskStore();
  const [selectedTab, setSelectedTab] = useState<"trading" | "analysis">(
    "trading",
  );

  useEffect(() => {
    updateBalance(balance);
  }, [balance, updateBalance]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCandleData();
    }, 5000);

    return () => clearInterval(interval);
  }, [updateCandleData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <LineChart className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                AlgoTrader Pro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-lg flex items-center">
                <Wallet className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-600 font-medium">
                  ${balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedTab("trading")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              selectedTab === "trading"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Bot className="h-5 w-5 mr-2" />
            Trading
          </button>
          <button
            onClick={() => setSelectedTab("analysis")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              selectedTab === "analysis"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <BarChart2 className="h-5 w-5 mr-2" />
            Analysis
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === "trading" ? (
          <div className="grid gap-8">
            {/* Chart Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                BTC/USD Price Chart
              </h2>
              <TradingChart data={candleData} />
            </div>

            {/* Trading Interface */}
            <TradingInterface />

            {/* Risk Management Section */}
            <RiskPanel />

            {/* Trading Strategies Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Bot className="h-5 w-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Trading Strategies
                </h2>
              </div>
              <StrategyPanel
                strategies={activeStrategies}
                onActivate={(id) => console.log("Activate strategy:", id)}
                onDeactivate={(id) => console.log("Deactivate strategy:", id)}
                onEdit={(strategy) => console.log("Edit strategy:", strategy)}
              />
            </div>

            {/* Positions Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Open Positions
              </h2>
              <PositionsTable positions={positions} />
            </div>

            {/* Trade History Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <History className="h-5 w-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Trade History
                </h2>
              </div>
              <TradeHistory trades={trades} />
            </div>
          </div>
        ) : (
          <AnalysisPanel />
        )}
      </main>
    </div>
  );
}

export default App;
