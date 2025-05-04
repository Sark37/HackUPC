import type { ModuleData } from "@/types/module-types"

export async function loadModuleData(): Promise<Record<string, ModuleData>> {
  try {
    console.log("Loading module data from CSV")
    const response = await fetch("/data/modules.csv")

    if (!response.ok) {
      console.error("Failed to fetch CSV:", response.status, response.statusText)
      return {}
    }

    const csvText = await response.text()
    console.log("CSV text loaded, length:", csvText.length)

    const moduleData: Record<string, ModuleData> = {}

    // Parse CSV
    const lines = csvText.split("\n")
    console.log("CSV lines:", lines.length)

    if (lines.length <= 1) {
      console.error("CSV file is empty or has only headers")
      return {}
    }

    const headers = lines[0].split(",")
    console.log("CSV headers:", headers)

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = lines[i].split(",")
      const entry: Record<string, any> = {}

      headers.forEach((header, index) => {
        const value = values[index]?.trim()

        // Convert numeric values
        if (
          [
            "power_consumption",
            "power_generation",
            "water_consumption",
            "water_generation",
            "heat_generation",
            "cooling_capacity",
            "storage_capacity",
            "processing_power",
            "efficiency",
            "uptime",
            "flow_rate",
            "max_capacity",
          ].includes(header)
        ) {
          entry[header] = value ? Number.parseInt(value, 10) : 0
        } else {
          entry[header] = value
        }
      })

      if (entry.id) {
        moduleData[entry.id] = entry as ModuleData
        console.log(`Loaded module data for: ${entry.id}`, {
          id: entry.id,
          storage: entry.storage_capacity,
          processing: entry.processing_power,
        })
      }
    }

    console.log("Total modules loaded:", Object.keys(moduleData).length)

    // Log the network-rack data specifically to verify it has storage_capacity
    if (moduleData["network-rack"]) {
      console.log("Network rack data:", moduleData["network-rack"])
    } else {
      console.warn("Network rack data not found!")
    }

    return moduleData
  } catch (error) {
    console.error("Error loading module data:", error)
    return {}
  }
}
