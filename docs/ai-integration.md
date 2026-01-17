# AI & ML Integration

This document provides comprehensive documentation of SehatScan's AI and machine learning integrations, including Google Gemini API, face analysis, and the fallback mock system.

---

## Table of Contents

1. [Overview](#overview)
2. [Google Gemini Integration](#google-gemini-integration)
3. [Medical Report Analysis](#medical-report-analysis)
4. [Risk Assessment Generation](#risk-assessment-generation)
5. [AI Health Assistant](#ai-health-assistant)
6. [Face Analysis System](#face-analysis-system)
7. [Mock Fallback System](#mock-fallback-system)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### AI Architecture

<!-- DIAGRAM:AI_ARCHITECTURE -->

### AI Capabilities

| Feature | AI Model | Purpose |
|---------|----------|---------|
| Report OCR | Gemini Vision | Extract text from medical documents |
| Report Analysis | Gemini Text | Structure and interpret health data |
| Risk Assessment | Gemini Text | Generate comprehensive health profiles |
| Health Chatbot | Gemini Text | Conversational health assistant |
| Face Analysis | Server-side | Visual health indicator detection |

---

## Google Gemini Integration

### Configuration

```env
# Environment variables
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_MODEL=gemini-2.5-flash  # Optional, defaults to gemini-2.5-flash
```

### Gemini Analyzer Class

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

class GeminiAnalyzer {
  private client: GoogleGenerativeAI
  private model: GenerativeModel

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    this.client = new GoogleGenerativeAI(apiKey)
    this.model = this.client.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    })
  }

  /**
   * Analyze a medical report image
   */
  async structureOcrData(imageBase64: string): Promise<AnalysisResult> {
    const result = await this.model.generateContent([
      REPORT_ANALYSIS_PROMPT,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      }
    ])

    return this.parseJsonResponse(result.response.text())
  }

  /**
   * Generate a comprehensive risk assessment
   */
  async generateRiskAssessment(context: RiskContext): Promise<string> {
    const result = await this.model.generateContent([
      RISK_ASSESSMENT_PROMPT,
      JSON.stringify(context)
    ])

    return result.response.text()
  }

  /**
   * Generate health insights for chatbot
   */
  async generateHealthInsights(
    message: string,
    context: ChatContext
  ): Promise<string> {
    const result = await this.model.generateContent([
      CHATBOT_SYSTEM_PROMPT,
      `Context: ${JSON.stringify(context)}`,
      `User: ${message}`
    ])

    return result.response.text()
  }
}

export const geminiAnalyzer = new GeminiAnalyzer()
```

### Model Configuration

```typescript
// Generation configuration
const generationConfig = {
  temperature: 0.1,        // Low for consistent, factual outputs
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,   // Adjust based on use case
}

// Safety settings
const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  }
]
```

---

## Medical Report Analysis

### Overview

The medical report analysis feature uses Gemini Vision to:
1. Extract text (OCR) from medical documents
2. Identify health metrics and values
3. Classify status (normal, low, high, critical)
4. Detect potential health problems
5. Generate treatment recommendations

### System Prompt

```typescript
const REPORT_ANALYSIS_PROMPT = `
You are a medical report analyzer. Analyze the provided medical report image and extract structured health information.

Your task:
1. Extract all visible text from the report (OCR)
2. Identify health metrics with their values, units, and reference ranges
3. Classify each metric's status: normal, low, high, or critical
4. Detect any health problems or concerns
5. Provide appropriate treatment recommendations

Return your analysis as a JSON object with this exact structure:
{
  "raw_text": "All extracted text from the document",
  "structured_data": {
    "metrics": [
      {
        "name": "Metric name (e.g., Hemoglobin)",
        "value": "Numeric value",
        "unit": "Unit of measurement",
        "status": "normal|low|high|critical",
        "reference_range": "Normal range if visible"
      }
    ],
    "problems_detected": [
      {
        "name": "Problem name",
        "severity": "low|moderate|high|critical",
        "description": "Brief description"
      }
    ],
    "treatments": [
      {
        "recommendation": "Treatment recommendation",
        "priority": "low|medium|high"
      }
    ],
    "summary": "Overall summary of the report findings"
  }
}

Important guidelines:
- Only include information visible in the report
- Be conservative with severity classifications
- Always recommend consulting a healthcare provider
- Do not diagnose conditions, only identify concerning patterns
- Return valid JSON only, no additional text
`
```

### Processing Flow

```typescript
async function analyzeReport(file: File): Promise<AnalysisResult> {
  // 1. Convert file to base64
  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')

  // 2. Call Gemini Vision API
  const result = await geminiAnalyzer.structureOcrData(base64)

  // 3. Validate response structure
  if (!result.raw_text || !result.structured_data) {
    throw new Error('Invalid analysis response')
  }

  // 4. Post-process and normalize data
  const normalized = normalizeAnalysisResult(result)

  return normalized
}
```

### Response Structure

```typescript
interface ReportAnalysisResult {
  raw_text: string
  structured_data: {
    metrics: Array<{
      name: string
      value: string
      unit: string
      status: 'normal' | 'low' | 'high' | 'critical'
      reference_range?: string
    }>
    problems_detected: Array<{
      name: string
      severity: 'low' | 'moderate' | 'high' | 'critical'
      description: string
    }>
    treatments: Array<{
      recommendation: string
      priority: 'low' | 'medium' | 'high'
    }>
    summary: string
  }
}
```

---

## Risk Assessment Generation

### Overview

Risk assessments combine multiple data sources to create comprehensive health profiles:

- Medical report analysis data
- Facial health analysis data
- User-provided health information

### System Prompt

```typescript
const RISK_ASSESSMENT_PROMPT = `
You are a health risk assessment specialist. Generate a comprehensive health risk assessment based on the provided data.

Available data sources:
1. Medical Report Data: Lab values, metrics, detected problems
2. Facial Analysis Data: Visual health indicators
3. User Information: Age, gender, symptoms, medical history, medications

Your assessment should include:

## Patient Overview
Brief summary of the patient profile

## Data Analysis
### Laboratory Findings
Summary of lab values and their significance

### Visual Health Indicators
Summary of facial analysis findings (if available)

## Risk Factors Identified
### High Priority
Critical or urgent concerns

### Moderate Priority
Important but non-urgent concerns

### Low Priority
Minor concerns or areas for monitoring

## Recommendations
### Immediate Actions
What should be done right away

### Short-term Actions
Actions for the next few weeks

### Long-term Monitoring
Ongoing health management

## Disclaimer
Always include:
- This is an AI-generated assessment
- Not a medical diagnosis
- Consult healthcare providers for medical advice
- For informational purposes only

Format the response in clear Markdown with headers and bullet points.
`
```

### Context Building

```typescript
interface RiskContext {
  // User information
  age: number
  gender: string
  symptoms?: string
  medicalHistory?: string
  medications?: string

  // Analysis data (if available)
  labData?: {
    metrics: MetricData[]
    problems: ProblemData[]
  }

  visualMetrics?: {
    redness_percentage: number
    yellowness_percentage: number
    problems: ProblemData[]
  }
}

async function buildRiskContext(
  userInput: UserInput,
  reportId?: string,
  faceId?: string
): Promise<RiskContext> {
  const context: RiskContext = {
    age: userInput.age,
    gender: userInput.gender,
    symptoms: userInput.symptoms,
    medicalHistory: userInput.medicalHistory,
    medications: userInput.medications
  }

  // Fetch report analysis if provided
  if (reportId) {
    const report = await db.analysis.findUnique({
      where: { id: reportId }
    })
    if (report?.structuredData) {
      context.labData = report.structuredData as LabData
    }
  }

  // Fetch face analysis if provided
  if (faceId) {
    const face = await db.analysis.findUnique({
      where: { id: faceId }
    })
    if (face?.visualMetrics) {
      context.visualMetrics = face.visualMetrics as VisualMetrics
    }
  }

  return context
}
```

---

## AI Health Assistant

### Overview

The chatbot provides personalized health guidance using:
- User's analysis history
- User profile information
- Conversation context
- Platform knowledge base

### System Prompt

```typescript
const CHATBOT_SYSTEM_PROMPT = `
You are SehatScan AI, a helpful health assistant. Your role is to:

1. Help users understand their health data from SehatScan analyses
2. Explain medical terminology in simple terms
3. Identify trends and patterns in their health data
4. Provide general health guidance and recommendations
5. Answer questions about using the SehatScan platform

Important guidelines:
- Never diagnose medical conditions
- Always recommend consulting healthcare providers for medical advice
- Be empathetic and supportive
- Use clear, simple language
- Reference the user's actual data when relevant
- Stay within your knowledge scope
- If unsure, say so and suggest professional consultation

Available context:
- User profile (name, account history)
- Analysis history (up to 20 recent analyses)
- Previous conversation messages
- Platform features and capabilities

Response format:
- Use markdown for formatting
- Keep responses concise but helpful
- Use bullet points for lists
- Include relevant data references when applicable
`
```

### Context Building for RAG

```typescript
interface ChatContext {
  user: {
    name: string
    email: string
    memberSince: Date
  }
  analyses: Array<{
    id: string
    type: 'face' | 'report' | 'risk'
    date: Date
    summary: string
    keyMetrics?: any
  }>
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  platformKnowledge: string
}

async function buildChatContext(userId: string): Promise<ChatContext> {
  // Fetch user data
  const user = await db.user.findUnique({
    where: { id: userId }
  })

  // Fetch recent analyses
  const analyses = await db.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  // Build context object
  return {
    user: {
      name: user?.name || 'User',
      email: user?.email || '',
      memberSince: user?.createdAt || new Date()
    },
    analyses: analyses.map(a => ({
      id: a.id,
      type: a.type as 'face' | 'report' | 'risk',
      date: a.createdAt,
      summary: extractSummary(a),
      keyMetrics: extractKeyMetrics(a)
    })),
    conversationHistory: [],  // Populated from frontend
    platformKnowledge: PLATFORM_KNOWLEDGE
  }
}
```

### Platform Knowledge Base

```typescript
const PLATFORM_KNOWLEDGE = `
SehatScan AI is a health analytics platform with the following features:

1. Medical Report Scanning
   - Upload PDF or images of lab reports
   - AI extracts and analyzes health metrics
   - Identifies normal/abnormal values
   - Provides treatment recommendations

2. Facial Health Analysis
   - Upload face photos
   - Analyzes skin health indicators
   - Detects redness, yellowness patterns
   - Suggests skincare recommendations

3. Risk Assessment Generator
   - Combines report and face analysis data
   - Includes user health information
   - Generates comprehensive risk profiles
   - Exportable as PDF

4. Analysis History
   - View all past analyses
   - Track health trends over time
   - Filter by analysis type

5. This AI Chatbot
   - Ask questions about your health data
   - Get explanations of medical terms
   - Understand your analysis results
   - General health guidance

Limitations:
- Not a diagnostic tool
- Does not replace medical professionals
- AI-generated insights are informational only
`
```

---

## Face Analysis System

### Overview

The face analysis system detects visual health indicators from uploaded face photos. Currently implemented as a server-side simulation with deterministic analysis.

### Server-Side Analysis

```typescript
// lib/face-analysis-server.ts

interface FaceAnalysisResult {
  face_detected: boolean
  face_count: number
  visual_metrics: {
    redness_percentage: number
    yellowness_percentage: number
    skin_tone: string
  }
  problems_detected: Problem[]
  treatments: Treatment[]
}

export async function analyzeFaceServer(
  fileBuffer: Buffer,
  mimeType: string
): Promise<FaceAnalysisResult> {
  // Parse image dimensions
  const dimensions = parseImageDimensions(fileBuffer, mimeType)

  // Generate deterministic metrics based on file properties
  const metrics = generateVisualMetrics(fileBuffer)

  // Detect problems based on thresholds
  const problems = detectProblems(metrics)

  // Generate treatment recommendations
  const treatments = generateTreatments(problems)

  return {
    face_detected: true,
    face_count: 1,
    visual_metrics: metrics,
    problems_detected: problems,
    treatments: treatments
  }
}
```

### Problem Detection Algorithm

```typescript
function detectProblems(metrics: VisualMetrics): Problem[] {
  const problems: Problem[] = []

  // Redness detection
  if (metrics.redness_percentage > 30) {
    const severity =
      metrics.redness_percentage > 70 ? 'high' :
      metrics.redness_percentage > 50 ? 'moderate' : 'low'

    problems.push({
      type: 'inflammation',
      name: 'Facial Redness Detected',
      severity,
      description: `${metrics.redness_percentage}% redness level may indicate inflammation or irritation`,
      confidence: 0.7
    })
  }

  // Yellowness detection
  if (metrics.yellowness_percentage > 25) {
    const severity =
      metrics.yellowness_percentage > 60 ? 'high' :
      metrics.yellowness_percentage > 40 ? 'moderate' : 'low'

    problems.push({
      type: 'discoloration',
      name: 'Yellowish Discoloration',
      severity,
      description: `${metrics.yellowness_percentage}% yellowness may warrant medical attention`,
      confidence: 0.65
    })
  }

  return problems
}
```

### Treatment Recommendations

```typescript
function generateTreatments(problems: Problem[]): Treatment[] {
  const treatments: Treatment[] = []

  for (const problem of problems) {
    switch (problem.type) {
      case 'inflammation':
        treatments.push({
          recommendation: 'Apply gentle, fragrance-free moisturizer',
          priority: problem.severity === 'high' ? 'high' : 'medium'
        })
        if (problem.severity === 'high') {
          treatments.push({
            recommendation: 'Consult a dermatologist for persistent redness',
            priority: 'high'
          })
        }
        break

      case 'discoloration':
        treatments.push({
          recommendation: 'Schedule appointment with healthcare provider',
          priority: 'high'
        })
        treatments.push({
          recommendation: 'Monitor for other symptoms (fatigue, dark urine)',
          priority: 'medium'
        })
        break
    }
  }

  // Default recommendations
  if (treatments.length === 0) {
    treatments.push({
      recommendation: 'Maintain regular skincare routine',
      priority: 'low'
    })
  }

  return treatments
}
```

---

## Mock Fallback System

### Overview

The mock fallback system ensures application functionality when the Gemini API is unavailable (rate limits, quota exceeded, service outages).

### When Fallback Activates

```typescript
async function analyzeWithFallback(data: string): Promise<AnalysisResult> {
  try {
    // Try Gemini API first
    return await geminiAnalyzer.structureOcrData(data)
  } catch (error) {
    // Check if it's a rate limit or quota error
    if (
      error.status === 429 ||  // Too Many Requests
      error.status === 503 ||  // Service Unavailable
      error.message?.includes('quota')
    ) {
      console.warn('Gemini API unavailable, using mock fallback')
      return mockAnalyzer.analyze(data)
    }

    // Re-throw other errors
    throw error
  }
}
```

### Mock Analyzer Implementation

```typescript
// lib/gemini-mock.ts

class MockAnalyzer {
  /**
   * Generate mock analysis results
   * Provides realistic, deterministic data for testing and fallback
   */
  analyze(imageData: string): AnalysisResult {
    // Generate hash from image data for deterministic results
    const hash = this.hashString(imageData)

    return {
      raw_text: this.generateMockOcrText(hash),
      structured_data: {
        metrics: this.generateMockMetrics(hash),
        problems_detected: this.generateMockProblems(hash),
        treatments: this.generateMockTreatments(hash),
        summary: 'This is a mock analysis result. Please retry when the AI service is available.'
      }
    }
  }

  private generateMockMetrics(seed: number): Metric[] {
    return [
      {
        name: 'Hemoglobin',
        value: (12 + (seed % 4)).toString(),
        unit: 'g/dL',
        status: 'normal',
        reference_range: '12-16 g/dL'
      },
      {
        name: 'Blood Glucose',
        value: (90 + (seed % 50)).toString(),
        unit: 'mg/dL',
        status: seed % 3 === 0 ? 'high' : 'normal',
        reference_range: '70-100 mg/dL'
      },
      // ... more mock metrics
    ]
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }
}

export const mockAnalyzer = new MockAnalyzer()
```

### Mock Indicator in UI

When mock data is returned, inform users:

```typescript
function AnalysisResults({ data, isMock }: Props) {
  return (
    <div>
      {isMock && (
        <Alert type="warning">
          Note: This analysis uses fallback data due to temporary service
          limitations. For accurate results, please try again later.
        </Alert>
      )}
      {/* Rest of results display */}
    </div>
  )
}
```

---

## Best Practices

### 1. Handle API Errors Gracefully

```typescript
async function callGeminiWithRetry(
  fn: () => Promise<any>,
  retries = 3
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error

      // Exponential backoff
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
    }
  }
}
```

### 2. Validate AI Responses

```typescript
function validateAnalysisResponse(response: any): response is AnalysisResult {
  return (
    typeof response === 'object' &&
    typeof response.raw_text === 'string' &&
    typeof response.structured_data === 'object' &&
    Array.isArray(response.structured_data.metrics)
  )
}
```

### 3. Log API Usage

```typescript
async function analyzeWithLogging(data: string): Promise<AnalysisResult> {
  const startTime = Date.now()

  try {
    const result = await geminiAnalyzer.structureOcrData(data)

    console.log({
      event: 'gemini_api_call',
      duration: Date.now() - startTime,
      success: true,
      inputSize: data.length
    })

    return result
  } catch (error) {
    console.error({
      event: 'gemini_api_error',
      duration: Date.now() - startTime,
      error: error.message
    })
    throw error
  }
}
```

### 4. Use Appropriate Temperatures

| Use Case | Temperature | Rationale |
|----------|-------------|-----------|
| OCR/Analysis | 0.1 | Consistent, factual output |
| Risk Assessment | 0.3 | Slightly creative but accurate |
| Chatbot | 0.4 | Natural conversation |

### 5. Include Medical Disclaimers

Always include appropriate disclaimers in AI-generated health content:

```typescript
const MEDICAL_DISCLAIMER = `
**Important Notice**: This analysis is generated by an AI system and is
intended for informational purposes only. It should not be considered
medical advice, diagnosis, or treatment. Always consult with qualified
healthcare professionals for medical decisions.
`
```

---

## Troubleshooting

### Common Issues

**1. "GEMINI_API_KEY is not configured"**

Solution: Add API key to `.env`:
```env
GEMINI_API_KEY=AIzaSyxxxxxxxxxx
```

**2. "Resource has been exhausted (429)"**

Cause: API rate limit exceeded

Solution:
- Wait and retry with exponential backoff
- Mock fallback activates automatically
- Consider upgrading API tier

**3. "Invalid JSON response from Gemini"**

Cause: AI didn't follow JSON format

Solution:
```typescript
function parseJsonResponse(text: string): any {
  // Try to extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }
  throw new Error('No valid JSON found in response')
}
```

**4. "Content blocked by safety settings"**

Cause: Gemini's safety filters triggered

Solution: Review input content, adjust safety settings if appropriate:
```typescript
const safetySettings = [
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_ONLY_HIGH'  // Less restrictive for medical content
  }
]
```

**5. Face analysis returns unexpected results**

Cause: Image quality or format issues

Solution:
- Ensure clear, well-lit face photos
- Check supported formats (JPEG, PNG)
- Validate file size (< 10MB)
