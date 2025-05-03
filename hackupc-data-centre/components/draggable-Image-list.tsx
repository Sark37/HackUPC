"use client"

import type React from "react"

import Image from "next/image"

interface DraggableImage {
  id: string
  src: string
  alt: string
  type: string
  width: number
  height: number
}

interface DraggableImageListProps {
  images: DraggableImage[]
}

export function DraggableImageList({ images }: DraggableImageListProps) {
  const handleDragStart = (e: React.DragEvent, image: DraggableImage) => {
    // Store the image data in the drag event
    e.dataTransfer.setData("application/json", JSON.stringify(image))
    e.dataTransfer.effectAllowed = "copy"

    // Set a custom property to indicate this is a new equipment drag
    e.dataTransfer.setData("text/plain", "new-equipment")
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-video bg-white rounded-md shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
            draggable
            onDragStart={(e) => handleDragStart(e, image)}
          >
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              fill
              className="object-contain p-2"
              draggable={false}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1">
              <div className="font-medium">{image.alt}</div>
              <div className="text-gray-300">
                Size: {image.width}x{image.height} tiles
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
