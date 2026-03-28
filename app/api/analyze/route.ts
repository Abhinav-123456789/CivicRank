export const dynamic = "force-static";

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { title, description } = await req.json()

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Extract structured civic issue data. Analyze the issue report and classify it accurately. Return valid JSON only."
          },
          {
            role: "user",
            content: `Analyze this civic issue report and extract structured data.

Title: ${title}
Description: ${description}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "category": "one of: pothole, streetlight, water, waste, traffic, other",
  "location": "inferred city/area name or 'Auto-detected'",
  "priority": "one of: low, medium, high, emergency"
}

Examples:
- If "broken streetlight" → high priority
- If "small pothole" → low priority
- If "major flooding" → emergency priority`
          }
        ],
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No response from OpenAI")
    }

    let parsed
    try {
      // Try to parse the JSON directly
      parsed = JSON.parse(content)
    } catch {
      // If parsing fails, try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Could not parse JSON from response")
      }
    }

    // Validate and sanitize the parsed data
    const validCategories = ["pothole", "streetlight", "water", "waste", "traffic", "other"]
    const validPriorities = ["low", "medium", "high", "emergency"]

    const result = {
      category: validCategories.includes(parsed.category?.toLowerCase())
        ? parsed.category.toLowerCase()
        : "other",
      location: typeof parsed.location === "string" && parsed.location.trim().length > 0
        ? parsed.location.trim()
        : "Auto-detected",
      priority: validPriorities.includes(parsed.priority?.toLowerCase())
        ? parsed.priority.toLowerCase()
        : "low"
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error analyzing issue:", error)

    // Return safe defaults on error
    return NextResponse.json({
      category: "other",
      location: "Auto-detected",
      priority: "low"
    })
  }
}
