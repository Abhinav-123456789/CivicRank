/**
 * AI Issue Analysis Functions
 * Uses secure backend API to communicate with OpenAI
 * Never exposes API keys to frontend
 */

export interface AIAnalysisResult {
  category: string
  location: string
  priority: string
}

/**
 * Analyze an issue using OpenAI's API through secure backend route
 * @param title - Issue title
 * @param description - Issue description
 * @returns Structured issue analysis
 */
export const analyzeIssue = async (
  title: string,
  description: string
): Promise<AIAnalysisResult> => {
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, description })
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`)
    }

    const data: AIAnalysisResult = await res.json()
    return data
  } catch (error) {
    console.error("Failed to analyze issue:", error)

    // Return safe defaults if AI analysis fails
    return {
      category: "other",
      location: "Auto-detected",
      priority: "low"
    }
  }
}
