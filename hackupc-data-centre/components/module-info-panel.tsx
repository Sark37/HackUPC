"use client"
import type { ModuleData } from "@/types/module-types"

interface ModuleInfoPanelProps {
  moduleData: ModuleData | null
  onClose: () => void
  position: { x: number; y: number } | null
}

export function ModuleInfoPanel({ moduleData, onClose, position }: ModuleInfoPanelProps) {
  if (!moduleData || !position) return null

  // Add debug logging at the beginning of the component
  // Right after the if (!moduleData || !position) return null line:
  console.log("Rendering ModuleInfoPanel with data:", moduleData)
  console.log("Available metrics:", {
    storage: moduleData.storage_capacity,
    processing: moduleData.processing_power,
    efficiency: moduleData.efficiency,
    uptime: moduleData.uptime,
    flow: moduleData.flow_rate,
    capacity: moduleData.max_capacity,
  })

  // Calculate position to ensure the panel stays within viewport
  const panelWidth = 280
  const panelHeight = 400 // Increased height for additional metrics

  // Check if we're too close to the right edge of the screen
  const isNearRightEdge = position.x + panelWidth + 20 > window.innerWidth

  // Position the panel to the left or right of the module
  const panelLeft = isNearRightEdge
    ? Math.max(10, position.x - panelWidth - 10) // Position to the left with 10px gap
    : position.x + 20 // Position to the right with 20px gap

  // Ensure the panel doesn't go off the bottom of the screen
  const panelTop = Math.min(position.y, window.innerHeight - panelHeight - 20)

  // Helper function to get icon for metric type
  const getMetricIcon = (metricType: string): string => {
    switch (metricType) {
      case "power":
        return "⚡"
      case "water":
        return "💧"
      case "heat":
        return "🔥"
      case "cooling":
        return "❄️"
      case "storage":
        return "💾"
      case "processing":
        return "🖥️"
      case "efficiency":
        return "⚙️"
      case "uptime":
        return "⏱️"
      case "flow":
        return "🌊"
      case "capacity":
        return "📦"
      default:
        return "📊"
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: `${panelTop}px`,
        left: `${panelLeft}px`,
        width: `${panelWidth}px`,
        backgroundColor: "rgba(31, 41, 55, 0.95)", // Match taskbar color
        backdropFilter: "blur(5px)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        overflow: "hidden",
        zIndex: 1000,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "white",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 500 }}>{moduleData.name}</h3>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "none",
            color: "white",
            cursor: "pointer",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "12px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
        <div style={{ marginBottom: "12px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "3px 8px",
              fontSize: "11px",
              fontWeight: 500,
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: "8px",
              textTransform: "capitalize",
            }}
          >
            {moduleData.type.replace(/-/g, " ")}
          </span>
          <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.8)", margin: "8px 0 0 0", lineHeight: "1.4" }}>
            {moduleData.description}
          </p>
        </div>

        {/* Primary Metrics Section */}
        <div style={{ marginBottom: "16px" }}>
          <h4 style={{ fontSize: "14px", margin: "0 0 8px 0", color: "rgba(255, 255, 255, 0.9)", fontWeight: 500 }}>
            Primary Metrics
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
            {moduleData.power_consumption > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("power")}</span>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Power Use: {moduleData.power_consumption}W</span>
              </div>
            )}

            {moduleData.power_generation > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("power")}</span>
                <span style={{ color: "#4ade80" }}>Power Gen: {moduleData.power_generation}W</span>
              </div>
            )}

            {moduleData.water_consumption > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("water")}</span>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Water Use: {moduleData.water_consumption}L</span>
              </div>
            )}

            {moduleData.water_generation > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("water")}</span>
                <span style={{ color: "#60a5fa" }}>Water Gen: {moduleData.water_generation}L</span>
              </div>
            )}

            {moduleData.heat_generation > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("heat")}</span>
                <span style={{ color: "#f87171" }}>Heat: {moduleData.heat_generation}°</span>
              </div>
            )}

            {moduleData.cooling_capacity > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("cooling")}</span>
                <span style={{ color: "#67e8f9" }}>Cooling: {moduleData.cooling_capacity}°</span>
              </div>
            )}
          </div>
        </div>

        {/* Cooling Metrics Section - Show if this is a cooling system or if it's being cooled */}
        {(moduleData.type === "cooling-system" || moduleData.isCooled || moduleData.coolingReceived) && (
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ fontSize: "14px", margin: "0 0 8px 0", color: "rgba(255, 255, 255, 0.9)", fontWeight: 500 }}>
              Cooling Metrics
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
              {moduleData.cooling_capacity > 0 && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("cooling")}</span>
                  <span style={{ color: "#67e8f9" }}>Base Cooling: {moduleData.cooling_capacity}°</span>
                </div>
              )}

              {moduleData.enhancedCoolingCapacity && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>✨</span>
                  <span style={{ color: "#8b5cf6" }}>Enhanced: {moduleData.enhancedCoolingCapacity}°</span>
                </div>
              )}

              {moduleData.coolingReceived > 0 && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>❄️</span>
                  <span style={{ color: "#67e8f9" }}>Cooling Received: {moduleData.coolingReceived}°</span>
                </div>
              )}

              {moduleData.heat_generation > 0 && moduleData.reducedHeatGeneration !== undefined && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>🔥</span>
                  <span style={{ color: "#f87171" }}>
                    Heat Reduced: {moduleData.heat_generation - moduleData.reducedHeatGeneration}°
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Circuit Breaker Metrics Section */}
        {moduleData.type === "power-distributor" && moduleData.id.includes("circuit-breaker") && (
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ fontSize: "14px", margin: "0 0 8px 0", color: "rgba(255, 255, 255, 0.9)", fontWeight: 500 }}>
              Circuit Breaker Metrics
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>⚡</span>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Max Capacity: {moduleData.max_capacity}W</span>
              </div>

              {moduleData.currentLoad !== undefined && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>📊</span>
                  <span
                    style={{
                      color: moduleData.isOverloaded ? "#ef4444" : "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    Current Load: {moduleData.currentLoad}W
                  </span>
                </div>
              )}
            </div>

            {moduleData.isOverloaded && (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "8px",
                }}
              >
                <span style={{ marginRight: "6px" }}>⚠️</span>
                Warning: Circuit Breaker Overloaded
              </div>
            )}
          </div>
        )}

        {/* Transformer Metrics Section */}
        {moduleData.type === "power-distributor" && moduleData.id.includes("hackupc-transformer") && (
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ fontSize: "14px", margin: "0 0 8px 0", color: "rgba(255, 255, 255, 0.9)", fontWeight: 500 }}>
              Transformer Metrics
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>⚡</span>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Max Capacity: {moduleData.max_capacity}W</span>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>✨</span>
                <span style={{ color: "#8b5cf6" }}>Efficiency Bonus: 15%</span>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Metrics Section - Always show if any metrics exist */}
        <div style={{ marginBottom: "16px" }}>
          <h4 style={{ fontSize: "14px", margin: "0 0 8px 0", color: "rgba(255, 255, 255, 0.9)", fontWeight: 500 }}>
            Additional Metrics
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
            {moduleData.storage_capacity > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("storage")}</span>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Storage: {moduleData.storage_capacity}TB</span>
              </div>
            )}

            {moduleData.processing_power > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("processing")}</span>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Processing: {moduleData.processing_power}TF</span>
              </div>
            )}

            {moduleData.efficiency > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("efficiency")}</span>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Efficiency: {moduleData.efficiency}%</span>
              </div>
            )}

            {moduleData.uptime > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("uptime")}</span>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Uptime: {moduleData.uptime}%</span>
              </div>
            )}

            {moduleData.flow_rate > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("flow")}</span>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Flow Rate: {moduleData.flow_rate}L/s</span>
              </div>
            )}

            {moduleData.max_capacity > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "16px", height: "16px", marginRight: "4px" }}>{getMetricIcon("capacity")}</span>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Max Capacity: {moduleData.max_capacity}U</span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        {(moduleData.isPowered !== undefined ||
          moduleData.isWatered !== undefined ||
          moduleData.isOverheating !== undefined) && (
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {moduleData.isOverheating && (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ marginRight: "6px" }}>⚠️</span>
                Status: Overheating - Insufficient Cooling
              </div>
            )}

            {moduleData.isPowered !== undefined && !moduleData.isOverheating && (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  backgroundColor: moduleData.isPowered ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)",
                  color: moduleData.isPowered ? "#4ade80" : "#f87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ marginRight: "6px" }}>{moduleData.isPowered ? "✅" : "⚠️"}</span>
                Power Status: {moduleData.isPowered ? "Powered" : "Unpowered"}
              </div>
            )}

            {moduleData.isWatered !== undefined && !moduleData.isOverheating && (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  backgroundColor: moduleData.isWatered ? "rgba(96, 165, 250, 0.2)" : "rgba(248, 113, 113, 0.2)",
                  color: moduleData.isWatered ? "#60a5fa" : "#f87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ marginRight: "6px" }}>{moduleData.isWatered ? "✅" : "⚠️"}</span>
                {moduleData.type === "power-consumer" ? "Cooling Status: " : "Water Status: "}
                {moduleData.isWatered ? (moduleData.type === "power-consumer" ? "Cooled" : "Connected") : "No Water"}
              </div>
            )}

            {moduleData.isProcessing !== undefined && !moduleData.isOverheating && (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  backgroundColor: moduleData.isProcessing ? "rgba(139, 92, 246, 0.2)" : "rgba(248, 113, 113, 0.2)",
                  color: moduleData.isProcessing ? "#8b5cf6" : "#f87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ marginRight: "6px" }}>{moduleData.isProcessing ? "✅" : "⚠️"}</span>
                Processing Status: {moduleData.isProcessing ? "Active" : "Inactive"}
              </div>
            )}

            {moduleData.isOptimized !== undefined && !moduleData.isOverheating && (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  backgroundColor: "rgba(139, 92, 246, 0.2)",
                  color: "#8b5cf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ marginRight: "6px" }}>✨</span>
                Water Efficiency: Optimized
                {moduleData.optimizedWaterConsumption !== undefined && moduleData.water_consumption > 0 && (
                  <span style={{ marginLeft: "4px" }}>
                    ({moduleData.optimizedWaterConsumption}/{moduleData.water_consumption}L)
                  </span>
                )}
              </div>
            )}

            {moduleData.isActive && (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  backgroundColor: moduleData.isOptimized ? "rgba(139, 92, 246, 0.2)" : "rgba(6, 182, 212, 0.2)",
                  color: moduleData.isOptimized ? "#8b5cf6" : "#06b6d4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ marginRight: "6px" }}>❄️</span>
                Cooling Status: {moduleData.isOptimized ? "Enhanced Active Cooling" : "Active Cooling"}
              </div>
            )}

            {moduleData.isCooled && (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  backgroundColor: "rgba(6, 182, 212, 0.2)",
                  color: "#06b6d4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ marginRight: "6px" }}>❄️</span>
                Receiving Cooling: {moduleData.coolingReceived}° units
              </div>
            )}

            {moduleData.isProtected && (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  backgroundColor: "rgba(74, 222, 128, 0.2)",
                  color: "#4ade80",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ marginRight: "6px" }}>🛡️</span>
                Protected by Circuit Breaker
              </div>
            )}

            {moduleData.isEfficiencyBoosted && (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  backgroundColor: "rgba(139, 92, 246, 0.2)",
                  color: "#8b5cf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ marginRight: "6px" }}>✨</span>
                Power Efficiency Boosted by Transformer
                {moduleData.powerEfficiencyBonus && (
                  <span style={{ marginLeft: "4px" }}>({moduleData.powerEfficiencyBonus}%)</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
