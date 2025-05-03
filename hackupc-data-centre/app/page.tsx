"use client"

import type React from "react"

import { useState, useEffect } from "react"

// Define types for our equipment and grid
interface EquipmentItem {
  id: string
  alt: string
  width: number
  height: number
  color: string
  position?: {
    row: number
    col: number
  }
  isDragging?: boolean
}

interface DragOverCell {
  row: number
  col: number
}

// Data center equipment for the panel
const dataCenterEquipment: EquipmentItem[] = [
  {
    id: "server-rack",
    alt: "Server Rack",
    width: 1, // Width in tiles
    height: 2, // Height in tiles
    color: "#f87171", // Red
  },
  {
    id: "cooling-unit",
    alt: "Cooling Unit",
    width: 2,
    height: 2,
    color: "#60a5fa", // Blue
  },
  {
    id: "power-supply",
    alt: "Power Supply",
    width: 1,
    height: 1,
    color: "#fbbf24", // Yellow
  },
  {
    id: "network-switch",
    alt: "Network Switch",
    width: 2,
    height: 1,
    color: "#34d399", // Green
  },
  {
    id: "storage-array",
    alt: "Storage Array",
    width: 3,
    height: 2,
    color: "#a78bfa", // Purple
  },
]

// Grid dimensions - will be calculated based on screen size
const CELL_SIZE = 60 // Size in pixels

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
      if ((e.key === "Backspace" || e.key === "Delete") && selectedItemId) {
        // Delete the selected item
        setPlacedItems((current) => current.filter((item) => item.id !== selectedItemId))
        setSelectedItemId(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedItemId])

  // Handle starting to drag from panel
  const handlePanelDragStart = (e: React.DragEvent, item: EquipmentItem) => {
    console.log("Dragging from panel:", item)
    setDraggedItem({ ...item, id: `${item.id}-${Date.now()}` })
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

    // Toggle selection
    setSelectedItemId((current) => (current === itemId ? null : itemId))
  }

  // Handle clicking on the background to deselect
  const handleBackgroundClick = () => {
    setSelectedItemId(null)
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
              border: "1px solid #ccc",
              backgroundColor: isHighlighted ? "#d1fae5" : "#e5f7ed",
              position: "absolute",
              top: row * CELL_SIZE,
              left: col * CELL_SIZE,
            }}
            onDragOver={(e) => handleDragOver(e, row, col)}
            onDrop={(e) => handleDrop(e, row, col)}
          >
            {/* Grass pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(circle, transparent 20%, #10B981 20%, #10B981 30%, transparent 30%)",
                backgroundSize: "8px 8px",
                opacity: 0.3,
              }}
            ></div>
            {/* Cell coordinates - only show every 5th cell for cleaner look */}
            {row % 5 === 0 && col % 5 === 0 && (
              <span style={{ fontSize: "8px", color: "#666", position: "absolute", bottom: 2, right: 2 }}>
                {row},{col}
              </span>
            )}
          </div>,
        )
      }
    }
    return cells
  }

  // Calculate the panel height based on collapsed state
  const panelHeight = isPanelCollapsed ? 40 : 160 // Increased from 140px to 160px

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
        </div>
      )}

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

          {/* Placed equipment layer */}
          {placedItems.map((item) => {
            const { id, alt, width, height, position, color, isDragging } = item

            // Skip if position is undefined
            if (!position) return null

            const { row, col } = position
            const isSelected = id === selectedItemId

            return (
              <div
                key={id}
                style={{
                  position: "absolute",
                  top: row * CELL_SIZE,
                  left: col * CELL_SIZE,
                  width: width * CELL_SIZE,
                  height: height * CELL_SIZE,
                  backgroundColor: "white",
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
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "4px",
                    borderRadius: "4px",
                    backgroundColor: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: "white", fontWeight: 500, textAlign: "center" }}>{alt}</span>
                </div>
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
                  {alt} ({width}x{height})
                </div>
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
          backgroundColor: "rgba(31, 41, 55, 0.9)", // Dark background with transparency
          backdropFilter: "blur(5px)", // Blur effect for modern browsers
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          zIndex: 100,
          transition: "height 0.3s ease",
          paddingBottom: "20px", // Added padding at the bottom
          overflow: "hidden", // Added to ensure content doesn't spill out
          margin: 0,
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks on panel from deselecting
      >
        {/* Panel header with title and collapse button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
            height: "40px",
            color: "white",
          }}
        >
          <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>Data Center Layout Designer</h1>
          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontSize: "16px",
              padding: "4px",
            }}
          >
            {isPanelCollapsed ? "▼" : "▲"}
          </button>
        </div>

        {/* Equipment items in horizontal row */}
        {!isPanelCollapsed && (
          <div
            style={{
              padding: "12px 0 12px 0", // Removed left padding (was 16px)
              marginLeft: "16px", // Added margin instead of padding
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              height: "100px", // Kept the same
              position: "relative", // Added to create a positioning context
            }}
          >
            {dataCenterEquipment.map((item) => (
              <div
                key={item.id}
                style={{
                  position: "relative",
                  width: "80px",
                  height: "90px", // Kept the same
                  flexShrink: 0,
                  backgroundColor: "white",
                  borderRadius: "6px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #e5e7eb",
                  cursor: "move",
                  zIndex: 101, // Ensure it's above the panel
                }}
                draggable
                onDragStart={(e) => handlePanelDragStart(e, item)}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "8px 8px 24px 8px", // Kept the same
                    borderRadius: "4px",
                    backgroundColor: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: "white", fontWeight: 500, fontSize: "12px", textAlign: "center" }}>
                    {item.alt}
                  </span>
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
                    padding: "4px",
                    borderBottomLeftRadius: "6px",
                    borderBottomRightRadius: "6px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    {item.width}x{item.height}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
