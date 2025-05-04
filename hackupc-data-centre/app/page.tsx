"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ModuleInfoPanel } from "@/components/module-info-panel"
import { StatsBar } from "@/components/stats-bar"
import { loadModuleData } from "@/utils/csv-parser"
import type { EquipmentItem, ModuleData, DragOverCell } from "@/types/module-types"

// Define connection between modules
interface Connection {
  fromId: string
  toId: string
  type: string // "power", "data", "water", etc.
}

// Update the dataCenterEquipment array to include categories and module types
const dataCenterEquipment: EquipmentItem[] = [
  // TRAVEL CATEGORY - Pipes and wires (1x1 rotatable components)
  {
    id: "water-pipe-bend",
    alt: "Water Pipe Bend",
    width: 1,
    height: 1,
    color: "#3b82f6", // Blue (fallback)
    imageSrc: "/images/water-pipe-bend-no-water.png", // Default to empty pipe
    liveImageSrc: "/images/water-pipe-bend-water.png", // Image when watered
    deadImageSrc: "/images/water-pipe-bend-no-water.png", // Image when not watered
    rotation: 0, // Default rotation
    category: "travel",
    moduleType: "water-pipe",
  },
  {
    id: "water-pipe-straight",
    alt: "Water Pipe Straight",
    width: 1,
    height: 1,
    color: "#3b82f6", // Blue (fallback)
    imageSrc: "/images/water-pipe-straight-no-water.png", // Default to empty pipe
    liveImageSrc: "/images/water-pipe-straight-water.png", // Image when watered
    deadImageSrc: "/images/water-pipe-straight-no-water.png", // Image when not watered
    rotation: 0, // Default rotation
    category: "travel",
    moduleType: "water-pipe",
  },
  {
    id: "live-wire-corner",
    alt: "Power Wire Corner",
    width: 1, // 1x1 like pipes
    height: 1,
    color: "#84cc16", // Green (fallback)
    imageSrc: "/images/dead-wire-corner.png", // Default to dead wire image
    liveImageSrc: "/images/live-wire-corner.png", // Image when powered
    deadImageSrc: "/images/dead-wire-corner.png", // Image when not powered
    rotation: 0, // Default rotation
    category: "travel",
    moduleType: "power-wire",
  },
  {
    id: "live-wire",
    alt: "Power Wire",
    width: 1,
    height: 1,
    color: "#84cc16", // Green (fallback)
    imageSrc: "/images/dead-wire.png", // Default to dead wire image
    liveImageSrc: "/images/live-wire.png", // Image when powered
    deadImageSrc: "/images/dead-wire.png", // Image when not powered
    rotation: 0, // Default rotation
    category: "travel",
    moduleType: "power-wire",
  },

  // POWER CATEGORY - Power generators
  {
    id: "windmill",
    alt: "Windmill",
    width: 3,
    height: 3,
    color: "#ef4444", // Red (fallback)
    imageSrc: "/images/windmill.png",
    category: "power",
    moduleType: "power-generator",
  },
  {
    id: "nuclear-plant",
    alt: "Nuclear Plant",
    width: 3,
    height: 3,
    color: "#6b7280", // Gray (fallback)
    imageSrc: "/images/nuclear-plant.png",
    category: "power",
    moduleType: "power-generator",
  },
  {
    id: "solar-panel",
    alt: "Solar Panel",
    width: 3,
    height: 3,
    color: "#3b82f6", // Blue (fallback)
    imageSrc: "/images/solar-panel.png",
    category: "power",
    moduleType: "power-generator",
  },
  {
    id: "coal-plant",
    alt: "Coal Plant",
    width: 3,
    height: 3,
    color: "#6b7280", // Gray (fallback)
    imageSrc: "/images/coal-plant.png",
    category: "power",
    moduleType: "power-generator",
  },

  // WATER CATEGORY - Water-related components
  {
    id: "water-tile",
    alt: "Water Tile",
    width: 1,
    height: 1,
    color: "#3b82f6", // Blue (fallback)
    imageSrc: "/images/water-tile.png",
    category: "water",
    moduleType: "water-source",
  },
  {
    id: "water-tile-with-pipe",
    alt: "Water Tile with Pipe",
    width: 1,
    height: 1,
    color: "#3b82f6", // Blue (fallback)
    imageSrc: "/images/water-tile-with-pipe.png",
    category: "water",
    moduleType: "water-source-power",
    warningType: "electricity", // Requires power to function
  },
  {
    id: "water-treatment",
    alt: "Water Treatment",
    width: 2,
    height: 2,
    color: "#3b82f6", // Blue (fallback)
    imageSrc: "/images/water-treatment.png",
    category: "water",
    moduleType: "water-processor", // Changed from water-consumer to water-processor
    warningType: "electricity-and-water", // Now requires both electricity and water
  },
  {
    id: "water-cooler",
    alt: "Water Cooler",
    width: 2,
    height: 2,
    color: "#3b82f6", // Blue (fallback)
    imageSrc: "/images/water-cooler.png",
    category: "water",
    moduleType: "cooling-system", // Changed from water-consumer to cooling-system
    warningType: "electricity-and-water", // Requires both electricity and water
  },

  // SYSTEM CATEGORY - Appliances and other components
  {
    id: "network-rack",
    alt: "Data Rack",
    width: 2,
    height: 2,
    color: "#6b7280", // Gray (fallback)
    imageSrc: "/images/network-rack.png",
    category: "system",
    moduleType: "power-consumer",
    warningType: "electricity-and-water", // Now requires both electricity and water
  },
  {
    id: "circuit-breaker-building",
    alt: "Circuit Breaker Building",
    width: 2,
    height: 2,
    color: "#6b7280", // Gray (fallback)
    imageSrc: "/images/circuit-breaker-building.png",
    category: "system",
    moduleType: "power-distributor",
  },
  {
    id: "hackupc-transformer",
    alt: "HackUPC Transformer",
    width: 2,
    height: 2,
    color: "#6b7280", // Gray (fallback)
    imageSrc: "/images/hackupc-transformer.png",
    category: "system",
    moduleType: "power-distributor",
  },
]

// Grid dimensions - will be calculated based on screen size
const CELL_SIZE = 60 // Size in pixels

// Define cooling radius for water coolers (in grid cells)
const COOLING_RADIUS = 3

export default function DataCenterDesigner() {
  // State for grid dimensions
  const [gridDimensions, setGridDimensions] = useState({ rows: 20, cols: 30 })

  // State for placed equipment
  const [placedItems, setPlacedItems] = useState<EquipmentItem[]>([])
  const [draggedItem, setDraggedItem] = useState<EquipmentItem | null>(null)
  const [draggedItemSource, setDraggedItemSource] = useState<string | null>(null)
  const [dragOverCell, setDragOverCell] = useState<DragOverCell | null>(null)

  // State for selected item (for deletion)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  // State for panel
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)

  // Add a state for the active category
  const [activeCategory, setActiveCategory] = useState<string>("travel")

  // State for module data from CSV
  const [moduleDataMap, setModuleDataMap] = useState<Record<string, ModuleData>>({})

  // State for the selected module data to display in the info panel
  const [selectedModuleData, setSelectedModuleData] = useState<ModuleData | null>(null)

  // State for the info panel position
  const [infoPanelPosition, setInfoPanelPosition] = useState<{ x: number; y: number } | null>(null)

  // Define the categories array
  const categories = ["travel", "power", "water", "system"]

  // Load module data from CSV
  useEffect(() => {
    const fetchModuleData = async () => {
      const data = await loadModuleData()
      setModuleDataMap(data)

      // Update equipment items with module data
      const updatedEquipment = dataCenterEquipment.map((item) => {
        const baseId = item.id.split("-")[0] // Get base ID without timestamp
        const moduleData = data[baseId] || data[item.id]

        if (moduleData) {
          return {
            ...item,
            moduleData: { ...moduleData },
          }
        }
        return item
      })

      // Update any placed items with module data
      if (placedItems.length > 0) {
        setPlacedItems((current) =>
          current.map((item) => {
            const baseId = item.id.split("-")[0] // Get base ID without timestamp
            const moduleData = data[baseId] || data[item.id]

            if (moduleData) {
              return {
                ...item,
                moduleData: {
                  ...moduleData,
                  isPowered: item.isPowered,
                },
              }
            }
            return item
          }),
        )
      }
    }

    fetchModuleData()
  }, [])

  // Calculate grid dimensions based on window size
  useEffect(() => {
    const calculateGridDimensions = () => {
      // Make grid larger than viewport to ensure it fills the screen and allows scrolling
      const cols = Math.max(30, Math.ceil(window.innerWidth / CELL_SIZE) + 5)
      const rows = Math.max(20, Math.ceil(window.innerHeight / CELL_SIZE) + 5)

      setGridDimensions({ rows, cols })
    }

    calculateGridDimensions()
    window.addEventListener("resize", calculateGridDimensions)

    return () => {
      window.removeEventListener("resize", calculateGridDimensions)
    }
  }, [])

  // Add keyboard event listener for backspace to delete selected item
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected item with Backspace or Delete
      if ((e.key === "Backspace" || e.key === "Delete") && selectedItemId) {
        setPlacedItems((current) => current.filter((item) => item.id !== selectedItemId))
        setSelectedItemId(null)
        setSelectedModuleData(null)
        setInfoPanelPosition(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      const calculateGridDimensions = () => {
        // Make grid larger than viewport to ensure it fills the screen and allows scrolling
        const cols = Math.max(30, Math.ceil(window.innerWidth / CELL_SIZE) + 5)
        const rows = Math.max(20, Math.ceil(window.innerHeight / CELL_SIZE) + 5)

        setGridDimensions({ rows, cols })
      }
      window.removeEventListener("resize", calculateGridDimensions)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedItemId])

  // Effect to calculate power connections when items are placed or moved
  useEffect(() => {
    // Skip the first render
    const calculatePowerConnections = () => {
      // Create a copy of placed items to work with
      const updatedItems = [...placedItems]

      // Reset all power status
      updatedItems.forEach((item) => {
        item.isPowered = item.moduleType === "power-generator" // Power generators are always powered

        // Update the moduleData isPowered status too
        if (item.moduleData) {
          item.moduleData.isPowered = item.isPowered
        }
      })

      // Find power generators
      const powerGenerators = updatedItems.filter((item) => item.moduleType === "power-generator")

      // For each power generator, trace power through connected wires
      powerGenerators.forEach((generator) => {
        tracePowerFromSource(generator, updatedItems)
      })

      // Only update state if power status has changed
      let hasChanges = false
      for (let i = 0; i < updatedItems.length; i++) {
        if (updatedItems[i].isPowered !== placedItems[i].isPowered) {
          hasChanges = true
          break
        }
      }

      if (hasChanges) {
        setPlacedItems(updatedItems)

        // Update selected module data if it exists
        if (selectedItemId) {
          const selectedItem = updatedItems.find((item) => item.id === selectedItemId)
          if (selectedItem && selectedItem.moduleData) {
            setSelectedModuleData({
              ...selectedItem.moduleData,
              isPowered: selectedItem.isPowered,
            })
          }
        }
      }
    }

    calculatePowerConnections()
  }, [placedItems]) // Recalculate when items are added, removed, or their IDs change

  // Effect to calculate water connections when items are placed or moved
  useEffect(() => {
    const calculateWaterConnections = () => {
      // Create a copy of placed items to work with
      const updatedItems = [...placedItems]

      // Reset all water status for water pipes
      updatedItems.forEach((item) => {
        if (item.moduleType === "water-pipe") {
          item.isWatered = false

          // Update the moduleData isWatered status too
          if (item.moduleData) {
            item.moduleData.isWatered = false
          }
        }
      })

      // Find water sources
      const waterSources = updatedItems.filter(
        (item) => item.moduleType === "water-source" || item.moduleType === "water-source-power",
      )

      // For each water source, trace water through connected pipes
      waterSources.forEach((source) => {
        traceWaterFromSource(source, updatedItems)
      })

      // Only update state if water status has changed
      let hasChanges = false
      for (let i = 0; i < updatedItems.length; i++) {
        if (updatedItems[i].isWatered !== placedItems[i].isWatered) {
          hasChanges = true
          break
        }
      }

      if (hasChanges) {
        setPlacedItems(updatedItems)

        // Update selected module data if it exists
        if (selectedItemId) {
          const selectedItem = updatedItems.find((item) => item.id === selectedItemId)
          if (selectedItem && selectedItem.moduleData) {
            setSelectedModuleData({
              ...selectedItem.moduleData,
              isWatered: selectedItem.isWatered,
            })
          }
        }
      }

      // Check for overheating modules after water connections are calculated
      checkForOverheatingModules(updatedItems)
      processWaterFromTreatmentPlants(updatedItems)
      applyCoolingFromWaterCoolers(updatedItems)
      applyCircuitBreakerAndTransformerEffects(updatedItems)
    }

    calculateWaterConnections()
  }, [placedItems]) // Recalculate when items are added, removed, or their IDs change

  // Function to trace power from a source through the network
  const tracePowerFromSource = (source: EquipmentItem, items: EquipmentItem[], visited: Set<string> = new Set()) => {
    if (!source.position || visited.has(source.id)) return

    // Mark this item as visited to prevent infinite loops
    visited.add(source.id)

    // Find adjacent items (including wires next to wires)
    const adjacentItems = findAdjacentItems(source, items)

    // Power up adjacent items that aren't already powered
    adjacentItems.forEach((item) => {
      if (
        !item.isPowered &&
        (item.moduleType === "power-wire" ||
          item.moduleType === "power-consumer" ||
          item.moduleType === "power-distributor" ||
          item.moduleType === "water-source-power" ||
          item.moduleType === "cooling-system" ||
          item.moduleType === "water-processor")
      ) {
        // Mark item as powered
        item.isPowered = true

        // Update the moduleData isPowered status too
        if (item.moduleData) {
          item.moduleData.isPowered = true
        }

        // If it's a wire or distributor, continue tracing
        if (item.moduleType === "power-wire" || item.moduleType === "power-distributor") {
          tracePowerFromSource(item, items, visited)
        }
      }
    })
  }

  // Function to trace water from a source through the network
  const traceWaterFromSource = (source: EquipmentItem, items: EquipmentItem[], visited: Set<string> = new Set()) => {
    if (!source.position || visited.has(source.id)) return

    // Check if this is a powered water source that requires electricity
    if (source.moduleType === "water-source-power" && !source.isPowered) {
      return // Skip water distribution if the powered water source isn't powered
    }

    // Mark this item as visited to prevent infinite loops
    visited.add(source.id)

    // Find adjacent items
    const adjacentItems = findAdjacentItems(source, items)

    // Water up adjacent items that aren't already watered
    adjacentItems.forEach((item) => {
      if (
        !item.isWatered &&
        (item.moduleType === "water-pipe" ||
          item.moduleType === "water-consumer" ||
          item.moduleType === "water-processor" ||
          item.moduleType === "cooling-system")
      ) {
        // Mark item as watered
        item.isWatered = true

        // Update the moduleData isWatered status too
        if (item.moduleData) {
          item.moduleData.isWatered = true
        }

        // If it's a pipe, continue tracing
        if (item.moduleType === "water-pipe") {
          traceWaterFromSource(item, items, visited)
        }
      }
    })
  }

  // Add a new function after the traceWaterFromSource function to handle water processing
  const processWaterFromTreatmentPlants = (items: EquipmentItem[]) => {
    // Create a copy of placed items to work with
    const updatedItems = [...items]
    let hasChanges = false

    // Find all water treatment plants
    const waterTreatmentPlants = updatedItems.filter(
      (item) => item.moduleType === "water-processor" && item.isPowered && item.isWatered,
    )

    // For each treatment plant, process water and improve connected systems
    waterTreatmentPlants.forEach((plant) => {
      // Mark the plant as processing
      if (!plant.isProcessing) {
        plant.isProcessing = true

        // Update the moduleData isProcessing status too
        if (plant.moduleData) {
          plant.moduleData.isProcessing = true
        }

        hasChanges = true
      }

      // Find connected water consumers through pipes
      const connectedConsumers = findConnectedWaterConsumers(plant, updatedItems)

      // Improve efficiency of connected consumers
      connectedConsumers.forEach((consumer) => {
        if (!consumer.isOptimized) {
          consumer.isOptimized = true

          // Update the moduleData isOptimized status too
          if (consumer.moduleData) {
            consumer.moduleData.isOptimized = true
            // Reduce water consumption by 15% when optimized
            consumer.moduleData.optimizedWaterConsumption = Math.floor(consumer.moduleData.water_consumption * 0.85)
          }

          hasChanges = true
        }
      })
    })

    // Reset processing status for plants that lost power or water
    updatedItems.forEach((item) => {
      if (item.moduleType === "water-processor" && item.isProcessing && (!item.isPowered || !item.isWatered)) {
        item.isProcessing = false

        if (item.moduleData) {
          item.moduleData.isProcessing = false
        }

        hasChanges = true
      }
    })

    // Reset optimization for consumers not connected to active treatment plants
    const optimizedConsumerIds = new Set()
    waterTreatmentPlants.forEach((plant) => {
      findConnectedWaterConsumers(plant, updatedItems).forEach((consumer) => {
        optimizedConsumerIds.add(consumer.id)
      })
    })

    updatedItems.forEach((item) => {
      if (item.isOptimized && !optimizedConsumerIds.has(item.id)) {
        item.isOptimized = false

        if (item.moduleData) {
          item.moduleData.isOptimized = false
          item.moduleData.optimizedWaterConsumption = undefined
        }

        hasChanges = true
      }
    })

    if (hasChanges) {
      setPlacedItems(updatedItems)

      // Update selected module data if it exists
      if (selectedItemId) {
        const selectedItem = updatedItems.find((item) => item.id === selectedItemId)
        if (selectedItem && selectedItem.moduleData) {
          setSelectedModuleData({
            ...selectedItem.moduleData,
            isPowered: selectedItem.isPowered,
            isWatered: selectedItem.isWatered,
            isProcessing: selectedItem.isProcessing,
            isOptimized: selectedItem.isOptimized,
            optimizedWaterConsumption: selectedItem.moduleData.optimizedWaterConsumption,
          })
        }
      }
    }
  }

  // Add a new function to handle cooling from water coolers
  const applyCoolingFromWaterCoolers = (items: EquipmentItem[]) => {
    // Create a copy of placed items to work with
    const updatedItems = [...items]
    let hasChanges = false

    // Reset all cooling status
    updatedItems.forEach((item) => {
      if (item.isCooled !== undefined) {
        item.isCooled = false
        if (item.moduleData) {
          item.moduleData.isCooled = false
        }
        hasChanges = true
      }
    })

    // Find all active water coolers
    const activeCoolers = updatedItems.filter(
      (item) => item.moduleType === "cooling-system" && item.isPowered && item.isWatered,
    )

    // For each cooler, mark it as active and apply cooling to nearby items
    activeCoolers.forEach((cooler) => {
      // Mark the cooler as active
      if (!cooler.isActive) {
        cooler.isActive = true
        if (cooler.moduleData) {
          cooler.moduleData.isActive = true
        }
        hasChanges = true
      }

      // Calculate cooling efficiency based on water quality
      let coolingEfficiency = 1.0 // Base efficiency
      if (cooler.isOptimized) {
        coolingEfficiency = 1.25 // 25% bonus with treated water
        if (!cooler.moduleData?.enhancedCoolingCapacity) {
          cooler.moduleData = {
            ...cooler.moduleData,
            enhancedCoolingCapacity: Math.floor(cooler.moduleData?.cooling_capacity * coolingEfficiency),
          }
        }
      } else if (cooler.moduleData?.enhancedCoolingCapacity) {
        // Reset enhanced cooling if no longer optimized
        cooler.moduleData.enhancedCoolingCapacity = undefined
        hasChanges = true
      }

      // Find items within cooling radius
      const nearbyItems = findItemsInRadius(cooler, updatedItems, COOLING_RADIUS)

      // Apply cooling to nearby heat-generating items
      nearbyItems.forEach((item) => {
        // Only apply cooling to items that generate heat
        if (item.moduleData?.heat_generation > 0) {
          item.isCooled = true

          // Calculate cooling effect based on distance
          if (item.moduleData) {
            item.moduleData.isCooled = true

            // Calculate distance from cooler
            const distance = calculateDistance(cooler, item)

            // Calculate cooling factor based on distance (closer = more cooling)
            const distanceFactor = Math.max(0, (COOLING_RADIUS - distance) / COOLING_RADIUS)

            // Apply cooling effect
            const coolingCapacity =
              cooler.moduleData?.enhancedCoolingCapacity || cooler.moduleData?.cooling_capacity || 0
            item.moduleData.coolingReceived = Math.floor(coolingCapacity * distanceFactor)

            // Calculate reduced heat generation
            const reducedHeat = Math.max(0, item.moduleData.heat_generation - item.moduleData.coolingReceived)
            item.moduleData.reducedHeatGeneration = reducedHeat
          }

          hasChanges = true
        }
      })
    })

    // Reset active status for coolers that lost power or water
    updatedItems.forEach((item) => {
      if (item.moduleType === "cooling-system" && item.isActive && (!item.isPowered || !item.isWatered)) {
        item.isActive = false
        if (item.moduleData) {
          item.moduleData.isActive = false
        }
        hasChanges = true
      }
    })

    if (hasChanges) {
      setPlacedItems(updatedItems)

      // Update selected module data if it exists
      if (selectedItemId) {
        const selectedItem = updatedItems.find((item) => item.id === selectedItemId)
        if (selectedItem && selectedItem.moduleData) {
          setSelectedModuleData({
            ...selectedItem.moduleData,
            isPowered: selectedItem.isPowered,
            isWatered: selectedItem.isWatered,
            isActive: selectedItem.isActive,
            isCooled: selectedItem.isCooled,
            coolingReceived: selectedItem.moduleData.coolingReceived,
            reducedHeatGeneration: selectedItem.moduleData.reducedHeatGeneration,
            enhancedCoolingCapacity: selectedItem.moduleData.enhancedCoolingCapacity,
          })
        }
      }
    }
  }

  // Add this function after the applyCoolingFromWaterCoolers function
  const applyCircuitBreakerAndTransformerEffects = (items: EquipmentItem[]) => {
    // Create a copy of placed items to work with
    const updatedItems = [...items]
    let hasChanges = false

    // Reset all protection and efficiency boost statuses
    updatedItems.forEach((item) => {
      if (item.isProtected !== undefined || item.isEfficiencyBoosted !== undefined) {
        item.isProtected = false
        item.isEfficiencyBoosted = false
        if (item.moduleData) {
          item.moduleData.isProtected = false
          item.moduleData.isEfficiencyBoosted = false
          item.moduleData.powerEfficiencyBonus = undefined
        }
        hasChanges = true
      }
    })

    // Reset overloaded status for circuit breakers
    updatedItems.forEach((item) => {
      if (item.moduleType === "power-distributor" && item.isOverloaded !== undefined) {
        item.isOverloaded = false
        if (item.moduleData) {
          item.moduleData.isOverloaded = false
          item.moduleData.currentLoad = 0
        }
        hasChanges = true
      }
    })

    // Find all powered circuit breakers
    const circuitBreakers = updatedItems.filter((item) => item.id.includes("circuit-breaker") && item.isPowered)

    // Find all powered transformers
    const transformers = updatedItems.filter((item) => item.id.includes("hackupc-transformer") && item.isPowered)

    // For each circuit breaker, protect connected components and check for overloading
    circuitBreakers.forEach((breaker) => {
      // Find connected power consumers
      const connectedConsumers = findConnectedPowerConsumers(breaker, updatedItems)

      // Calculate total power consumption of connected consumers
      let totalConsumption = 0
      connectedConsumers.forEach((consumer) => {
        if (consumer.isPowered && consumer.moduleData) {
          totalConsumption += consumer.moduleData.power_consumption
        }
      })

      // Check if the circuit breaker is overloaded
      const maxCapacity = breaker.moduleData?.max_capacity || 400
      const isOverloaded = totalConsumption > maxCapacity

      // Update the circuit breaker status
      if (breaker.isOverloaded !== isOverloaded) {
        breaker.isOverloaded = isOverloaded
        if (breaker.moduleData) {
          breaker.moduleData.isOverloaded = isOverloaded
          breaker.moduleData.currentLoad = totalConsumption
        }
        hasChanges = true
      }

      // If not overloaded, protect all connected consumers
      if (!isOverloaded) {
        connectedConsumers.forEach((consumer) => {
          consumer.isProtected = true
          if (consumer.moduleData) {
            consumer.moduleData.isProtected = true
          }
          hasChanges = true
        })
      }
    })

    // For each transformer, boost efficiency of connected power consumers
    transformers.forEach((transformer) => {
      // Find connected power consumers
      const connectedConsumers = findConnectedPowerConsumers(transformer, updatedItems)

      // Apply efficiency boost to each consumer
      connectedConsumers.forEach((consumer) => {
        if (consumer.isPowered && consumer.moduleData && consumer.moduleData.power_consumption > 0) {
          consumer.isEfficiencyBoosted = true

          // Apply 15% efficiency boost
          if (consumer.moduleData) {
            consumer.moduleData.isEfficiencyBoosted = true
            consumer.moduleData.powerEfficiencyBonus = 15
          }

          hasChanges = true
        }
      })
    })

    if (hasChanges) {
      setPlacedItems(updatedItems)

      // Update selected module data if it exists
      if (selectedItemId) {
        const selectedItem = updatedItems.find((item) => item.id === selectedItemId)
        if (selectedItem && selectedItem.moduleData) {
          setSelectedModuleData({
            ...selectedItem.moduleData,
            isPowered: selectedItem.isPowered,
            isProtected: selectedItem.isProtected,
            isEfficiencyBoosted: selectedItem.isEfficiencyBoosted,
            powerEfficiencyBonus: selectedItem.moduleData.powerEfficiencyBonus,
            isOverloaded: selectedItem.isOverloaded,
            currentLoad: selectedItem.moduleData.currentLoad,
          })
        }
      }
    }
  }

  // Add this helper function to find connected power consumers
  const findConnectedPowerConsumers = (
    source: EquipmentItem,
    items: EquipmentItem[],
    visited: Set<string> = new Set(),
  ): EquipmentItem[] => {
    if (!source.position || visited.has(source.id)) return []

    // Mark this item as visited to prevent infinite loops
    visited.add(source.id)

    // Find adjacent items
    const adjacentItems = findAdjacentItems(source, items)

    // Initialize array for connected consumers
    let connectedConsumers: EquipmentItem[] = []

    // Check each adjacent item
    adjacentItems.forEach((item) => {
      // If it's a power consumer, add it to our results
      if (
        item.moduleType === "power-consumer" ||
        item.moduleType === "cooling-system" ||
        item.moduleType === "water-processor" ||
        item.moduleType === "water-source-power"
      ) {
        connectedConsumers.push(item)
      }

      // If it's a power wire that's powered, trace through it
      if (item.moduleType === "power-wire" && item.isPowered) {
        // Recursively find consumers connected to this wire
        const consumersFromWire = findConnectedPowerConsumers(item, items, visited)
        connectedConsumers = [...connectedConsumers, ...consumersFromWire]
      }
    })

    return connectedConsumers
  }

  // Helper function to calculate distance between two items
  const calculateDistance = (item1: EquipmentItem, item2: EquipmentItem): number => {
    if (!item1.position || !item2.position) return Number.POSITIVE_INFINITY

    // Calculate center points of each item
    const center1 = {
      row: item1.position.row + item1.height / 2,
      col: item1.position.col + item1.width / 2,
    }

    const center2 = {
      row: item2.position.row + item2.height / 2,
      col: item2.position.col + item2.width / 2,
    }

    // Calculate Euclidean distance
    const rowDiff = center1.row - center2.row
    const colDiff = center1.col - center2.col

    return Math.sqrt(rowDiff * rowDiff + colDiff * colDiff)
  }

  // Helper function to find items within a radius
  const findItemsInRadius = (source: EquipmentItem, items: EquipmentItem[], radius: number): EquipmentItem[] => {
    if (!source.position) return []

    return items.filter((item) => {
      // Skip the source item itself
      if (item.id === source.id) return false

      // Skip items without position
      if (!item.position) return false

      // Calculate distance
      const distance = calculateDistance(source, item)

      // Return true if within radius
      return distance <= radius
    })
  }

  // Add a helper function to find water consumers connected to a treatment plant
  const findConnectedWaterConsumers = (
    source: EquipmentItem,
    items: EquipmentItem[],
    visited: Set<string> = new Set(),
  ): EquipmentItem[] => {
    if (!source.position || visited.has(source.id)) return []

    // Mark this item as visited to prevent infinite loops
    visited.add(source.id)

    // Find adjacent items
    const adjacentItems = findAdjacentItems(source, items)

    // Initialize array for connected consumers
    let connectedConsumers: EquipmentItem[] = []

    // Check each adjacent item
    adjacentItems.forEach((item) => {
      // If it's a water consumer, add it to our results
      if (
        item.moduleType === "water-consumer" ||
        item.moduleType === "cooling-system" ||
        (item.moduleType === "power-consumer" && item.moduleData?.water_consumption > 0)
      ) {
        connectedConsumers.push(item)
      }

      // If it's a water pipe that's watered, trace through it
      if (item.moduleType === "water-pipe" && item.isWatered) {
        // Recursively find consumers connected to this pipe
        const consumersFromPipe = findConnectedWaterConsumers(item, items, visited)
        connectedConsumers = [...connectedConsumers, ...consumersFromPipe]
      }
    })

    return connectedConsumers
  }

  // Function to check for overheating modules
  const checkForOverheatingModules = (items: EquipmentItem[]) => {
    // Create a copy of placed items to work with
    const updatedItems = [...items]
    let hasChanges = false

    updatedItems.forEach((item) => {
      // Skip items without module data
      if (!item.moduleData) return

      // Get the required water level from module data
      const requiredWaterLevel = item.moduleData.requiredWaterLevel || 0

      // Check if this module needs water cooling
      if (requiredWaterLevel > 0) {
        // Check if the module is powered but not sufficiently watered
        let isOverheating =
          item.isPowered && (!item.isWatered || item.moduleData.water_consumption < requiredWaterLevel)

        // If the item is cooled by a water cooler, it might not overheat
        if (isOverheating && item.isCooled && item.moduleData.coolingReceived) {
          // If cooling received is sufficient, prevent overheating
          if (item.moduleData.coolingReceived >= requiredWaterLevel) {
            isOverheating = false
          }
        }

        // Update overheating status if changed
        if (item.isOverheating !== isOverheating) {
          item.isOverheating = isOverheating

          // Update the moduleData isOverheating status too
          if (item.moduleData) {
            item.moduleData.isOverheating = isOverheating
          }

          hasChanges = true
        }
      }
    })

    if (hasChanges) {
      setPlacedItems(updatedItems)

      // Update selected module data if it exists
      if (selectedItemId) {
        const selectedItem = updatedItems.find((item) => item.id === selectedItemId)
        if (selectedItem && selectedItem.moduleData) {
          setSelectedModuleData({
            ...selectedItem.moduleData,
            isPowered: selectedItem.isPowered,
            isWatered: selectedItem.isWatered,
            isOverheating: selectedItem.isOverheating,
            isCooled: selectedItem.isCooled,
            coolingReceived: selectedItem.moduleData.coolingReceived,
          })
        }
      }
    }
  }

  // Function to find all adjacent items
  const findAdjacentItems = (source: EquipmentItem, items: EquipmentItem[]): EquipmentItem[] => {
    if (!source.position) return []

    const { row, col } = source.position
    const { width, height } = source

    // Define cells that are adjacent to the source module
    const adjacentCells: { row: number; col: number }[] = []

    // Add cells to the right
    for (let r = row; r < row + height; r++) {
      adjacentCells.push({ row: r, col: col + width })
    }

    // Add cells to the left
    for (let r = row; r < row + height; r++) {
      adjacentCells.push({ row: r, col: col - 1 })
    }

    // Add cells below
    for (let c = col; c < col + width; c++) {
      adjacentCells.push({ row: row + height, col: c })
    }

    // Add cells above
    for (let c = col; c < col + width; c++) {
      adjacentCells.push({ row: row - 1, col: c })
    }

    // Find items at these adjacent cells
    return items.filter((item) => {
      if (!item.position) return false

      // Check if any of the adjacent cells overlap with this item
      return adjacentCells.some((cell) => {
        return (
          cell.row >= item.position!.row &&
          cell.row < item.position!.row + item.height &&
          cell.col >= item.position!.col &&
          cell.col < item.position!.col + item.width
        )
      })
    })
  }

  // Update the getCurrentImageSrc function to handle both power wires and water pipes
  const getCurrentImageSrc = (item: EquipmentItem): string => {
    if (item.moduleType === "power-wire") {
      return item.isPowered ? item.liveImageSrc || item.imageSrc : item.deadImageSrc || item.imageSrc
    }
    if (item.moduleType === "water-pipe") {
      return item.isWatered ? item.liveImageSrc || item.imageSrc : item.deadImageSrc || item.imageSrc
    }

    return item.imageSrc
  }

  // Update the handlePanelDragStart function to handle properly include module data
  // Around line 330, replace the existing function with this:

  // Handle starting to drag from panel
  const handlePanelDragStart = (e: React.DragEvent, item: EquipmentItem) => {
    console.log("Dragging from panel:", item)

    // Get the base ID without any timestamp
    const baseId = item.id.split("-")[0]

    // Look up the module data from our map
    const itemModuleData = moduleDataMap[baseId] || moduleDataMap[item.id]

    console.log("Module data for dragged item:", itemModuleData)

    // Create a new item with a unique ID and include module data
    const newItem = {
      ...item,
      id: `${item.id}-${Date.now()}`,
      moduleData: itemModuleData ? { ...itemModuleData } : undefined,
    }

    console.log("Created new draggable item:", newItem)

    setDraggedItem(newItem)
    setDraggedItemSource("panel")
  }

  // Handle starting to drag from grid
  const handleGridItemDragStart = (e: React.DragEvent, item: EquipmentItem) => {
    e.stopPropagation()
    console.log("Dragging from grid:", item)

    // Mark the item as being dragged instead of removing it
    setPlacedItems((current) => current.map((i) => (i.id === item.id ? { ...i, isDragging: true } : i)))

    setDraggedItem(item)
    setDraggedItemSource("grid")

    // Deselect the item when starting to drag
    if (selectedItemId === item.id) {
      setSelectedItemId(null)
      setSelectedModuleData(null)
      setInfoPanelPosition(null)
    }
  }

  // Handle drag over a grid cell
  const handleDragOver = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault()
    setDragOverCell({ row, col })
  }

  // Handle dropping on the grid
  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault()
    console.log("Dropping at:", row, col)
    setDragOverCell(null)

    if (!draggedItem) return

    // Check if placement is valid
    if (!isValidPlacement(row, col, draggedItem.width, draggedItem.height)) {
      console.log("Invalid placement")

      // If moving an existing item, just remove the isDragging flag
      if (draggedItemSource === "grid") {
        setPlacedItems((current) => current.map((i) => (i.id === draggedItem.id ? { ...i, isDragging: false } : i)))
      }

      setDraggedItem(null)
      setDraggedItemSource(null)
      return
    }

    // If we're moving an existing item, remove it from its old position
    if (draggedItemSource === "grid") {
      setPlacedItems((current) => current.filter((i) => i.id !== draggedItem.id))
    }

    // Place the item at the new position
    const newItem = {
      ...draggedItem,
      position: { row, col },
      isDragging: false,
    }

    console.log("Placing item:", newItem)
    setPlacedItems((current) => [...current, newItem])
    setDraggedItem(null)
    setDraggedItemSource(null)
  }

  // Handle drag end (in case the drop event doesn't fire)
  const handleDragEnd = (e: React.DragEvent, itemId: string) => {
    // If the drag operation ended without a valid drop, reset the item
    if (draggedItemSource === "grid" && draggedItem && draggedItem.id === itemId) {
      setPlacedItems((current) => current.map((i) => (i.id === itemId ? { ...i, isDragging: false } : i)))
      setDraggedItem(null)
      setDraggedItemSource(null)
    }
  }

  // Handle clicking on an equipment item
  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation() // Prevent event bubbling
    console.log("Item clicked:", itemId) // Add logging

    // Calculate the position for the info panel
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const panelPosition = {
      x: rect.right, // Position to the right of the module
      y: rect.top, // Align with the top of the module
    }

    // Toggle selection
    setSelectedItemId((current) => {
      const newSelectedId = current === itemId ? null : itemId
      console.log("New selected ID:", newSelectedId) // Add logging

      // Update the selected module data
      if (newSelectedId) {
        const selectedItem = placedItems.find((item) => item.id === newSelectedId)
        console.log("Selected item:", selectedItem) // Add logging
        // Add this debug log to see what module data is being loaded

        // Get the base ID for the selected item
        const baseId = newSelectedId.split("-")[0]

        // Add this debug log to see what module data is being loaded
        console.log("Selected item module data:", selectedItem?.moduleData)
        console.log("Base module data from map:", moduleDataMap[baseId])

        // Modify the code that sets the selected module data to ensure we're getting all fields
        // Replace the existing setSelectedModuleData call with this:
        if (selectedItem && selectedItem.moduleData) {
          console.log("Using item's module data with fields:", Object.keys(selectedItem.moduleData))
          setSelectedModuleData({
            ...selectedItem.moduleData,
            isPowered: selectedItem.isPowered,
            isWatered: selectedItem.isWatered,
            isProcessing: selectedItem.isProcessing,
            isOptimized: selectedItem.isOptimized,
            isActive: selectedItem.isActive,
            isCooled: selectedItem.isCooled,
            coolingReceived: selectedItem.moduleData.coolingReceived,
            reducedHeatGeneration: selectedItem.moduleData.reducedHeatGeneration,
            enhancedCoolingCapacity: selectedItem.moduleData.enhancedCoolingCapacity,
            optimizedWaterConsumption: selectedItem.moduleData.optimizedWaterConsumption,
          })
          setInfoPanelPosition(panelPosition)
        } else {
          // If no module data exists, try to get it from the base ID
          console.log("Looking up base ID:", baseId)

          if (moduleDataMap[baseId]) {
            console.log("Using module data from map with fields:", Object.keys(moduleDataMap[baseId]))
            setSelectedModuleData({
              ...moduleDataMap[baseId],
              isPowered: selectedItem?.isPowered,
              isWatered: selectedItem?.isWatered,
            })
            setInfoPanelPosition(panelPosition)
          } else {
            console.log("No module data found")
            setSelectedModuleData(null)
            setInfoPanelPosition(null)
          }
        }
      } else {
        setSelectedModuleData(null)
        setInfoPanelPosition(null)
      }

      return newSelectedId
    })
  }

  // Handle right-clicking on an equipment item (for rotation)
  const handleItemRightClick = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault() // Prevent the default context menu
    e.stopPropagation() // Prevent event bubbling

    // Find the item
    const item = placedItems.find((i) => i.id === itemId)

    // Only rotate pipes and wires (1x1 items)
    if (item && item.width === 1 && item.height === 1) {
      // Rotate the item 90 degrees clockwise
      setPlacedItems((current) =>
        current.map((i) => {
          if (i.id === itemId) {
            const newRotation = ((i.rotation || 0) + 90) % 360
            return { ...i, rotation: newRotation }
          }
          return i
        }),
      )
    }
  }

  // Handle clicking on the background to deselect
  const handleBackgroundClick = () => {
    setSelectedItemId(null)
    setSelectedModuleData(null)
    setInfoPanelPosition(null)
  }

  // Close the module info panel
  const handleCloseInfoPanel = () => {
    setSelectedModuleData(null)
    setSelectedItemId(null)
    setInfoPanelPosition(null)
  }

  // Check if placement is valid (not out of bounds or overlapping)
  const isValidPlacement = (row: number, col: number, width: number, height: number) => {
    // Check bounds
    if (row < 0 || col < 0 || row + height > gridDimensions.rows || col + width > gridDimensions.cols) {
      return false
    }

    // Check for overlaps with other items
    for (const item of placedItems) {
      // Skip items that are currently being dragged
      if (item.isDragging) continue

      // Skip if this is the item being moved
      if (draggedItemSource === "grid" && draggedItem && item.id === draggedItem.id) continue

      const { position, width: itemWidth, height: itemHeight } = item

      // Skip if position is undefined (shouldn't happen, but TypeScript safety)
      if (!position) continue

      // Check for overlap
      if (
        !(
          row + height <= position.row ||
          position.row + itemHeight <= row ||
          col + width <= position.col ||
          position.col + itemWidth <= col
        )
      ) {
        return false
      }
    }

    return true
  }

  // Get warning image for a module based on its requirements
  const getWarningForModule = (item: EquipmentItem): string | null => {
    // If the module doesn't have a warning type, no warning needed
    if (!item.warningType) return null

    // Check for overheating first (highest priority)
    if (item.isOverheating) {
      return "/images/warning-overheat.png"
    }

    // Check for power warnings
    if ((item.warningType === "electricity" || item.warningType === "electricity-and-water") && !item.isPowered) {
      return "/images/warning-electricity.png"
    }

    // Check for water warnings
    if ((item.warningType === "water" || item.warningType === "electricity-and-water") && !item.isWatered) {
      return "/images/warning-water.png"
    }

    // Check for fire warnings
    if (item.warningType === "fire") {
      return "/images/warning-fire.png"
    }

    return null
  }

  // Generate grid cells
  const renderGridCells = () => {
    const cells = []
    for (let row = 0; row < gridDimensions.rows; row++) {
      for (let col = 0; col < gridDimensions.cols; col++) {
        const isHighlighted = dragOverCell && dragOverCell.row === row && dragOverCell.col === col
        cells.push(
          <div
            key={`${row}-${col}`}
            style={{
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
              border: isHighlighted ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid transparent", // Transparent border by default, only show when highlighted
              backgroundColor: isHighlighted ? "rgba(209, 250, 229, 0.6)" : "transparent", // Changed to transparent to show grass image
              position: "absolute",
              top: row * CELL_SIZE,
              left: col * CELL_SIZE,
              overflow: "hidden", // Ensure the image stays within the cell
            }}
            onDragOver={(e) => handleDragOver(e, row, col)}
            onDrop={(e) => handleDrop(e, row, col)}
          >
            {/* Grass tile image as background */}
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image
                src="/images/grass-tile.png"
                alt="Grass"
                fill
                style={{ objectFit: "cover" }}
                priority={row < 10 && col < 10} // Prioritize loading visible tiles
              />
            </div>

            {/* Cell coordinates - only show every 5th cell for cleaner look */}
            {row % 5 === 0 && col % 5 === 0 && (
              <span
                style={{
                  fontSize: "8px",
                  color: "#fff",
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  textShadow: "0px 0px 2px #000", // Add text shadow for better visibility
                  zIndex: 5,
                }}
              >
                {row},{col}
              </span>
            )}
          </div>,
        )
      }
    }
    return cells
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "travel":
        return "#3b82f6" // Blue
      case "power":
        return "#ef4444" // Red
      case "water":
        return "#06b6d4" // Cyan
      case "system":
        return "#84cc16" // Green
      default:
        return "#6b7280" // Gray
    }
  }

  // Update the panel height calculation to account for the category tabs
  const panelHeight = isPanelCollapsed ? 40 : 200 // Increased from 160px to 200px to accommodate tabs

  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#e5f7ed", // Changed to match the grid cell color
        margin: 0,
        padding: 0,
      }}
      onClick={handleBackgroundClick}
    >
      {/* Selection instructions */}
      {selectedItemId && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            zIndex: 200,
            fontSize: "14px",
          }}
        >
          Press Backspace or Delete to remove the selected item
          {placedItems.find((item) => item.id === selectedItemId && item.width === 1 && item.height === 1) && (
            <span> • Right-click to rotate</span>
          )}
        </div>
      )}

      {/* Module Info Panel */}
      {selectedModuleData && (
        <ModuleInfoPanel moduleData={selectedModuleData} onClose={handleCloseInfoPanel} position={infoPanelPosition} />
      )}

      {/* Stats Bar */}
      <StatsBar placedItems={placedItems} />

      {/* Full-page grid container that fills the entire viewport */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "auto",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${gridDimensions.cols * CELL_SIZE}px`,
            height: `${gridDimensions.rows * CELL_SIZE}px`,
            margin: 0,
            padding: 0,
          }}
        >
          {/* Grid cells */}
          {renderGridCells()}

          {/* Cooling radius indicators for active water coolers */}
          {placedItems
            .filter((item) => item.moduleType === "cooling-system" && item.isActive)
            .map((cooler) => {
              if (!cooler.position) return null

              const { row, col } = cooler.position
              const centerX = (col + cooler.width / 2) * CELL_SIZE
              const centerY = (row + cooler.height / 2) * CELL_SIZE
              const radiusInPixels = COOLING_RADIUS * CELL_SIZE

              return (
                <div
                  key={`cooling-radius-${cooler.id}`}
                  style={{
                    position: "absolute",
                    top: centerY - radiusInPixels,
                    left: centerX - radiusInPixels,
                    width: radiusInPixels * 2,
                    height: radiusInPixels * 2,
                    borderRadius: "50%",
                    border: "2px dashed rgba(6, 182, 212, 0.5)",
                    backgroundColor: "rgba(6, 182, 212, 0.1)",
                    zIndex: 5,
                    pointerEvents: "none", // Allow clicks to pass through
                  }}
                />
              )
            })}

          {/* Placed equipment layer */}
          {placedItems.map((item) => {
            const { id, alt, width, height, position, isDragging, rotation = 0 } = item

            // Skip if position is undefined
            if (!position) return null

            const { row, col } = position
            const isSelected = id === selectedItemId
            const warningImage = getWarningForModule(item)
            const currentImageSrc = getCurrentImageSrc(item)

            return (
              <div
                key={id}
                style={{
                  position: "absolute",
                  top: row * CELL_SIZE,
                  left: col * CELL_SIZE,
                  width: width * CELL_SIZE,
                  height: height * CELL_SIZE,
                  backgroundColor: "transparent",
                  border: isSelected ? "3px solid #3b82f6" : "2px solid #9ca3af",
                  borderRadius: "6px",
                  overflow: "hidden",
                  boxShadow: isSelected
                    ? "0 0 0 2px rgba(59, 130, 246, 0.5), 0 4px 6px rgba(0, 0, 0, 0.1)"
                    : "0 4px 6px rgba(0, 0, 0, 0.1)",
                  cursor: "move",
                  zIndex: isSelected ? 20 : 10,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  opacity: isDragging ? 0.5 : 1, // Make the item semi-transparent when dragging
                }}
                draggable
                onDragStart={(e) => handleGridItemDragStart(e, item)}
                onDragEnd={(e) => handleDragEnd(e, id)}
                onClick={(e) => handleItemClick(e, id)}
                onContextMenu={(e) => handleItemRightClick(e, id)} // Handle right-click for rotation
              >
                {/* Display the image using Next.js Image component with rotation */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    padding: "4px",
                    transform: width === 1 && height === 1 ? `rotate(${rotation}deg)` : undefined,
                    transition: "transform 0.3s ease",
                  }}
                >
                  <Image
                    src={currentImageSrc || "/placeholder.svg"}
                    alt={alt}
                    fill
                    style={{ objectFit: "contain" }}
                    priority
                  />

                  {/* Status indicators for water coolers */}
                  {item.moduleType === "cooling-system" && item.isActive && (
                    <div
                      style={{
                        position: "absolute",
                        top: "5px",
                        left: "5px",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: item.isOptimized ? "rgba(139, 92, 246, 0.8)" : "rgba(6, 182, 212, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "bold",
                        zIndex: 15,
                        boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      ❄️
                    </div>
                  )}

                  {/* Status indicators for circuit breakers */}
                  {item.moduleType === "power-distributor" && item.id.includes("circuit-breaker") && item.isPowered && (
                    <div
                      style={{
                        position: "absolute",
                        top: "5px",
                        left: "5px",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: item.isOverloaded ? "rgba(239, 68, 68, 0.8)" : "rgba(74, 222, 128, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "bold",
                        zIndex: 15,
                        boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {item.isOverloaded ? "⚠️" : "🛡️"}
                    </div>
                  )}

                  {/* Status indicators for transformers */}
                  {item.moduleType === "power-distributor" &&
                    item.id.includes("hackupc-transformer") &&
                    item.isPowered && (
                      <div
                        style={{
                          position: "absolute",
                          top: "5px",
                          left: "5px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(139, 92, 246, 0.8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "bold",
                          zIndex: 15,
                          boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        ✨
                      </div>
                    )}

                  {/* Warning overlay if requirements not met */}
                  {warningImage && (
                    <div
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        width: "24px",
                        height: "24px",
                        zIndex: 15,
                      }}
                    >
                      <Image
                        src={warningImage || "/placeholder.svg"}
                        alt="Warning"
                        width={24}
                        height={24}
                        style={{
                          filter: "drop-shadow(0px 0px 2px rgba(0,0,0,0.5))",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Only show the text label when the item is selected */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      fontSize: "12px",
                      padding: "4px",
                      textAlign: "center",
                    }}
                  >
                    {alt} ({width}x{height}){width === 1 && height === 1 && rotation > 0 && <span> • {rotation}°</span>}
                    {item.isPowered === false &&
                      (item.warningType === "electricity" || item.warningType === "electricity-and-water") && (
                        <span> • No Power</span>
                      )}
                    {item.isWatered === false &&
                      (item.warningType === "water" || item.warningType === "electricity-and-water") && (
                        <span> • No Water</span>
                      )}
                    {item.moduleType === "power-wire" && <span> • {item.isPowered ? "Powered" : "Unpowered"}</span>}
                    {item.moduleType === "water-pipe" && <span> • {item.isWatered ? "Flowing" : "Empty"}</span>}
                    {item.moduleType === "water-processor" && item.isProcessing && <span> • Processing</span>}
                    {item.moduleType === "cooling-system" && item.isActive && (
                      <span> • {item.isOptimized ? "Enhanced Cooling" : "Cooling"}</span>
                    )}
                    {item.isOptimized && item.moduleType !== "cooling-system" && <span> • Optimized</span>}
                    {item.isCooled && <span> • Cooled</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating horizontal equipment panel overlaid on top of the grid */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0, // Ensure this is 0
          right: 0,
          width: "100%", // Ensure full width
          height: panelHeight, // Using the calculated height
          backgroundColor: "rgba(31, 41, 55, 0.95)", // Restore the original dark blue/gray color
          backdropFilter: "blur(5px)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          transition: "height 0.3s ease",
        }}
      >
        {/* Toggle button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
            borderBottom: isPanelCollapsed ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", color: "white", fontWeight: 500 }}>Equipment</h3>
          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
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
            {isPanelCollapsed ? "+" : "-"}
          </button>
        </div>

        {/* Category tabs and equipment items - only show if not collapsed */}
        {!isPanelCollapsed && (
          <>
            {/* Category tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "0 8px",
              }}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  style={{
                    backgroundColor: activeCategory === category ? "rgba(255, 255, 255, 0.1)" : "transparent",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: activeCategory === category ? 500 : 400,
                    borderBottom:
                      activeCategory === category ? `2px solid ${getCategoryColor(category)}` : "2px solid transparent",
                    textTransform: "capitalize",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Equipment items */}
            <div
              style={{
                display: "flex",
                overflowX: "auto",
                padding: "12px",
                gap: "12px",
                flexGrow: 1,
              }}
            >
              {dataCenterEquipment
                .filter((item) => item.category === activeCategory)
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      position: "relative",
                      width: "80px",
                      height: "80px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "6px",
                      overflow: "hidden",
                      cursor: "grab",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      flexShrink: 0,
                    }}
                    draggable
                    onDragStart={(e) => handlePanelDragStart(e, item)}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%", padding: "4px" }}>
                      <Image
                        src={
                          // Show live versions of wires and pipes in the panel
                          (item.moduleType === "power-wire" && item.liveImageSrc) ||
                          (item.moduleType === "water-pipe" && item.liveImageSrc) ||
                          item.imageSrc ||
                          "/placeholder.svg"
                        }
                        alt={item.alt}
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        fontSize: "10px",
                        padding: "2px 4px",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.alt} ({item.width}x{item.height})
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
