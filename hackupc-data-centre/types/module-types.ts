export interface ModuleData {
  id: string
  name: string
  type: string
  power_consumption: number
  power_generation: number
  water_consumption: number
  water_generation: number
  heat_generation: number
  cooling_capacity: number
  storage_capacity: number
  processing_power: number
  efficiency: number
  uptime: number
  flow_rate: number
  max_capacity: number
  description: string
  isPowered?: boolean
  isWatered?: boolean
  isOverheating?: boolean
  isProcessing?: boolean
  isOptimized?: boolean
  optimizedWaterConsumption?: number
  requiredWaterLevel?: number
  isActive?: boolean
  isCooled?: boolean
  coolingReceived?: number
  reducedHeatGeneration?: number
  enhancedCoolingCapacity?: number
  isProtected?: boolean
  isEfficiencyBoosted?: boolean
  powerEfficiencyBonus?: number
  isOverloaded?: boolean
  currentLoad?: number
}

export interface EquipmentItem {
  id: string
  alt: string
  width: number
  height: number
  color: string
  imageSrc: string
  liveImageSrc?: string
  deadImageSrc?: string
  rotation?: number
  position?: {
    row: number
    col: number
  }
  isDragging?: boolean
  category: string
  moduleType?: string
  warningType?: string
  connections?: Connection[]
  isPowered?: boolean
  isWatered?: boolean
  isOverheating?: boolean
  isProcessing?: boolean
  isOptimized?: boolean
  isActive?: boolean
  isCooled?: boolean
  isProtected?: boolean
  isEfficiencyBoosted?: boolean
  isOverloaded?: boolean
  moduleData?: ModuleData
}

export interface Connection {
  fromId: string
  toId: string
  type: string
}

export interface DragOverCell {
  row: number
  col: number
}
