"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"

interface Equipment {
  id: string
  src: string
  alt: string
  type: string
  width: number
  height: number
  position?: {
    row: number
    col: number
  }
}

interface Tile {
  id: string
  row: number
  col: number
  image: {
    id: string
    src: string
    alt: string
    type: string
  } | null
  equipmentId: string | null
  isPrimary: boolean
}

interface TileGridProps {
  tiles: Tile[]
  placedEquipment: Equipment[]
  gridCols: number
  onDrop: (tileId: string, equipmentData: Equipment) => void
  onMoveEquipment: (equipmentId: string, newRow: number, newCol: number) => void
}

export function TileGrid({ tiles, placedEquipment, gridCols, onDrop, onMoveEquipment }: TileGridProps) {
  const [dragOverTileId, setDragOverTileId] = useState<string | null>(null)
  const [movingEquipmentId, setMovingEquipmentId] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent, tileId: string) => {
    e.preventDefault()
    setDragOverTileId(tileId)
  }

  const handleDragLeave = () => {
    setDragOverTileId(null)
  }

  const handleDrop = (e: React.DragEvent, tileId: string) => {
    e.preventDefault()
    setDragOverTileId(null)

    // If we're moving existing equipment
    if (movingEquipmentId) {
      const targetTile = tiles.find((tile) => tile.id === tileId)
      if (targetTile) {
        onMoveEquipment(movingEquipmentId, targetTile.row, targetTile.col)
      }
      setMovingEquipmentId(null)
      return
    }

    // Otherwise, handle new equipment drop
    try {
      const dataString = e.dataTransfer.getData("application/json")
      if (dataString) {
        const equipmentData = JSON.parse(dataString)
        if (equipmentData && equipmentData.id && equipmentData.src) {
          onDrop(tileId, equipmentData)
        }
      }
    } catch (error) {
      console.error("Error parsing dropped data:", error)
    }
  }

  // Handle starting to drag existing equipment
  const handleEquipmentDragStart = (e: React.DragEvent, equipmentId: string) => {
    e.stopPropagation()
    setMovingEquipmentId(equipmentId)

    // Set a ghost image for the drag operation
    const ghostElement = document.createElement("div")
    ghostElement.style.width = "10px"
    ghostElement.style.height = "10px"
    ghostElement.style.opacity = "0"
    document.body.appendChild(ghostElement)

    e.dataTransfer.setDragImage(ghostElement, 0, 0)
    e.dataTransfer.effectAllowed = "move"

    // Clean up the ghost element after a short delay
    setTimeout(() => {
      document.body.removeChild(ghostElement)
    }, 100)
  }

  // Render equipment that spans multiple tiles
  const renderEquipment = () => {
    return placedEquipment.map((equipment) => {
      const { id, src, alt, width, height, position } = equipment
      if (!position) return null

      // Skip rendering if this equipment is being moved
      if (movingEquipmentId === id) return null

      // Calculate position and size
      const { row, col } = position

      // Calculate position in pixels
      const tileSize = 100 // Approximate size of a tile in pixels
      const topPosition = row * tileSize
      const leftPosition = col * tileSize
      const equipmentWidth = width * tileSize
      const equipmentHeight = height * tileSize

      return (
        <div
          key={id}
          className="absolute border-2 border-gray-400 rounded-md overflow-hidden bg-white shadow-lg cursor-move hover:shadow-xl transition-shadow"
          style={{
            top: `${topPosition}px`,
            left: `${leftPosition}px`,
            width: `${equipmentWidth}px`,
            height: `${equipmentHeight}px`,
            zIndex: 20,
          }}
          draggable
          onDragStart={(e) => handleEquipmentDragStart(e, id)}
        >
          <div className="relative w-full h-full">
            <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-contain p-2" draggable={false} />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center">
              {alt} ({width}x{height})
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className="relative">
      {/* Moving equipment indicator */}
      {movingEquipmentId && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-2 text-center z-50">
          Moving equipment - Drop on a new location
        </div>
      )}

      {/* Grass tiles grid */}
      <div className="grid grid-cols-6 gap-0 border border-gray-200">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={`relative aspect-square ${
              dragOverTileId === tile.id ? "outline outline-2 outline-green-500 z-20" : ""
            } transition-colors`}
            onDragOver={(e) => handleDragOver(e, tile.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, tile.id)}
            data-row={tile.row}
            data-col={tile.col}
          >
            {/* Background grass image */}
            {tile.image && (
              <Image
                src={tile.image.src || "/placeholder.svg"}
                alt={tile.image.alt}
                fill
                className="object-cover"
                draggable={false}
              />
            )}
          </div>
        ))}
      </div>

      {/* Equipment layer */}
      <div className="absolute top-0 left-0 w-full h-full">{renderEquipment()}</div>
    </div>
  )
}
