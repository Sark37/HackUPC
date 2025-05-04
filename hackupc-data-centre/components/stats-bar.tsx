"use client"

import type { EquipmentItem } from "@/types/module-types"

interface StatsBarProps {
  placedItems: EquipmentItem[]
}

export function StatsBar({ placedItems }: StatsBarProps) {
  // Calculate total metrics
  const totalStats = placedItems.reduce(
    (acc, item) => {
      if (!item.moduleData) return acc

      // Only count powered items for power consumers and generators
      const isPowered = item.isPowered !== false // Default to true if undefined

      // Check if the item is overheating
      const isOverheating = item.isOverheating === true

      // Add power generation (only from powered generators that aren't overheating)
      if (item.moduleType === "power-generator" && isPowered && !isOverheating) {
        acc.powerGeneration += item.moduleData.power_generation || 0
      }

      // Add power consumption (from all powered items)
      if (isPowered) {
        // Apply efficiency boost if the item has one
        if (item.isEfficiencyBoosted && item.moduleData.powerEfficiencyBonus) {
          // Calculate reduced power consumption with efficiency boost
          const reduction = Math.floor((item.moduleData.power_consumption * item.moduleData.powerEfficiencyBonus) / 100)
          acc.powerConsumption += item.moduleData.power_consumption - reduction
          acc.powerSavings += reduction
        } else {
          acc.powerConsumption += item.moduleData.power_consumption || 0
        }
      }

      // Add storage capacity (only from powered storage devices that aren't overheating)
      if (isPowered && !isOverheating && item.moduleData.storage_capacity > 0) {
        acc.storageCapacity += item.moduleData.storage_capacity || 0
      }

      // Add processing power (only from powered devices that aren't overheating)
      if (isPowered && !isOverheating && item.moduleData.processing_power > 0) {
        acc.processingPower += item.moduleData.processing_power || 0
      }

      // Add water generation (from water sources that aren't overheating)
      if ((item.moduleType === "water-source" || item.moduleType === "water-source-power") && !isOverheating) {
        // For water-source-power, only count if powered
        if (item.moduleType === "water-source" || (item.moduleType === "water-source-power" && isPowered)) {
          acc.waterGeneration += item.moduleData.water_generation || 0
        }
      }

      // Add water consumption (from watered consumers and cooled data racks)
      const isWatered = item.isWatered !== false // Default to true if undefined
      if (
        isPowered &&
        isWatered &&
        !isOverheating &&
        (item.moduleType === "water-consumer" ||
          (item.moduleType === "power-consumer" && item.moduleData.water_consumption > 0))
      ) {
        // Use optimized water consumption if available
        if (item.isOptimized && item.moduleData.optimizedWaterConsumption !== undefined) {
          acc.waterConsumption += item.moduleData.optimizedWaterConsumption
          // Track water savings
          acc.waterSavings += item.moduleData.water_consumption - item.moduleData.optimizedWaterConsumption || 0
        } else {
          acc.waterConsumption += item.moduleData.water_consumption || 0
        }
      }

      // Add cooling metrics
      if (isPowered && !isOverheating) {
        // For water coolers, use enhanced cooling capacity if available
        if (item.moduleType === "cooling-system" && item.isActive) {
          acc.coolingCapacity += item.moduleData.enhancedCoolingCapacity || item.moduleData.cooling_capacity || 0
        } else {
          acc.coolingCapacity += item.moduleData.cooling_capacity || 0
        }

        // For heat generation, use reduced heat if available
        if (item.isCooled && item.moduleData.reducedHeatGeneration !== undefined) {
          acc.heatGeneration += item.moduleData.reducedHeatGeneration
          acc.heatReduction += item.moduleData.heat_generation - item.moduleData.reducedHeatGeneration || 0
        } else {
          acc.heatGeneration += item.moduleData.heat_generation || 0
        }
      }

      // Count protected components
      if (item.isProtected) {
        acc.protectedComponents += 1
      }

      return acc
    },
    {
      powerGeneration: 0,
      powerConsumption: 0,
      powerSavings: 0,
      storageCapacity: 0,
      processingPower: 0,
      waterGeneration: 0,
      waterConsumption: 0,
      waterSavings: 0,
      coolingCapacity: 0,
      heatGeneration: 0,
      heatReduction: 0,
      protectedComponents: 0,
    },
  )

  // Calculate net power and water
  const netPower = totalStats.powerGeneration - totalStats.powerConsumption
  const netWater = totalStats.waterGeneration - totalStats.waterConsumption
  const netCooling = totalStats.coolingCapacity - totalStats.heatGeneration

  // Helper function to get color based on value
  const getValueColor = (value: number): string => {
    if (value > 0) return "#4ade80" // Green for positive
    if (value < 0) return "#f87171" // Red for negative
    return "white" // White for zero
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        backgroundColor: "rgba(31, 41, 55, 0.9)", // Match top bar color
        backdropFilter: "blur(5px)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        padding: "12px 16px",
        color: "white",
        zIndex: 90,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        minWidth: "280px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          paddingBottom: "8px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 500 }}>Data Center Stats</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
        {/* Power stats */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>⚡</span>
          <span>Power: </span>
          <span style={{ marginLeft: "4px", color: getValueColor(netPower) }}>
            {netPower >= 0 ? "+" : ""}
            {netPower}W
          </span>
        </div>

        {/* Storage stats */}
        {totalStats.storageCapacity > 0 && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>💾</span>
            <span>Storage: </span>
            <span style={{ marginLeft: "4px", color: "#60a5fa" }}>{totalStats.storageCapacity}TB</span>
          </div>
        )}

        {/* Processing stats */}
        {totalStats.processingPower > 0 && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>🖥️</span>
            <span>Processing: </span>
            <span style={{ marginLeft: "4px", color: "#60a5fa" }}>{totalStats.processingPower}TF</span>
          </div>
        )}

        {/* Water stats */}
        {(totalStats.waterGeneration > 0 || totalStats.waterConsumption > 0) && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>💧</span>
            <span>Water: </span>
            <span style={{ marginLeft: "4px", color: getValueColor(netWater) }}>
              {netWater >= 0 ? "+" : ""}
              {netWater}L
            </span>
          </div>
        )}

        {totalStats.waterSavings > 0 && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>✨</span>
            <span>Water Saved: </span>
            <span style={{ marginLeft: "4px", color: "#8b5cf6" }}>{totalStats.waterSavings}L</span>
          </div>
        )}

        {/* Cooling vs Heat stats */}
        {(totalStats.coolingCapacity > 0 || totalStats.heatGeneration > 0) && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{netCooling >= 0 ? "❄️" : "🔥"}</span>
            <span>Thermal: </span>
            <span style={{ marginLeft: "4px", color: getValueColor(netCooling) }}>
              {netCooling >= 0 ? "+" : ""}
              {netCooling}°
            </span>
          </div>
        )}

        {totalStats.heatReduction > 0 && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>❄️</span>
            <span>Heat Reduced: </span>
            <span style={{ marginLeft: "4px", color: "#06b6d4" }}>{totalStats.heatReduction}°</span>
          </div>
        )}

        {totalStats.powerSavings > 0 && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>✨</span>
            <span>Power Saved: </span>
            <span style={{ marginLeft: "4px", color: "#8b5cf6" }}>{totalStats.powerSavings}W</span>
          </div>
        )}

        {totalStats.protectedComponents > 0 && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>🛡️</span>
            <span>Protected: </span>
            <span style={{ marginLeft: "4px", color: "#4ade80" }}>{totalStats.protectedComponents}</span>
          </div>
        )}
      </div>
    </div>
  )
}
