import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

function getMimeTypeFromDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.*?);base64,/) 
  return match?.[1] || 'image/jpeg'
}

function getBase64FromDataUrl(dataUrl: string) {
  const index = dataUrl.indexOf(',')
  if (index === -1) return dataUrl
  return dataUrl.slice(index + 1)
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return 'Unknown caption generation error'
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch (error) {
      console.log(error)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const payload = (body && typeof body === 'object') ? (body as Record<string, unknown>) : {}
    const imageDataUrl = typeof payload.imageDataUrl === 'string' ? payload.imageDataUrl : ''
    const title = typeof payload.title === 'string' ? payload.title : ''

    if (!imageDataUrl) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    const mimeType = getMimeTypeFromDataUrl(imageDataUrl)
    const imageBase64 = getBase64FromDataUrl(imageDataUrl).replace(/\s/g, '')
    if (!imageBase64) {
      return NextResponse.json({ error: 'Invalid image payload' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const prompt = `Generate a warm, memory-style caption (2-3 sentences) for this image. Keep it emotional, vivid, and suitable for a private memory archive. Optional title context: ${title || 'N/A'}.`

    const preferredModels = ['gemini-2.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash']
    let caption = ''
    let lastModelError: unknown = null

    for (const modelName of preferredModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
        ])

        caption = result.response.text()?.trim() || ''
        if (caption) break
      } catch (error) {
        lastModelError = error
        console.log(`Caption generation failed on model ${modelName}:`, error)
      }
    }

    if (!caption) {
      return NextResponse.json(
        { error: `Caption generation failed: ${getErrorMessage(lastModelError)}` },
        { status: 502 }
      )
    }

    return NextResponse.json({ caption })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: `Failed to generate caption: ${getErrorMessage(error)}` },
      { status: 500 }
    )
  }
}
