# Features Guide

This document provides detailed documentation of all SehatScan features, their capabilities, and how to use them effectively.

---

## Table of Contents

1. [Medical Report Scanning](#medical-report-scanning)
2. [Facial Health Analysis](#facial-health-analysis)
3. [Risk Assessment Generator](#risk-assessment-generator)
4. [AI Health Assistant (Chatbot)](#ai-health-assistant)
5. [Analysis History](#analysis-history)
6. [Dashboard Overview](#dashboard-overview)
7. [User Profile & Settings](#user-profile--settings)

---

## Medical Report Scanning

### Overview

The Medical Report Scanning feature uses AI-powered OCR and analysis to extract and interpret health metrics from medical documents such as lab reports, blood tests, and diagnostic results.

### Capabilities

- **Document Types Supported**:
  - PDF documents (single page)
  - JPEG images
  - PNG images

- **File Requirements**:
  - Maximum size: 10MB
  - Clear, readable text
  - Standard medical report formats

### How It Works

1. **Upload**: User uploads a medical document via drag-and-drop or file browser
2. **Processing**: Document is sent to Google Gemini Vision API
3. **OCR Extraction**: AI extracts all text from the document
4. **Intelligent Analysis**: AI identifies and structures:
   - Health metrics (values, units, reference ranges)
   - Status classification (normal, low, high, critical)
   - Potential health problems
   - Treatment recommendations
5. **Storage**: Results are saved to user's analysis history
6. **Display**: Structured results shown with visual indicators

### Output Structure

```json
{
  "raw_text": "Extracted OCR text from document",
  "structured_data": {
    "metrics": [
      {
        "name": "Hemoglobin",
        "value": "14.5",
        "unit": "g/dL",
        "status": "normal",
        "reference_range": "13-17 g/dL"
      },
      {
        "name": "Blood Glucose (Fasting)",
        "value": "126",
        "unit": "mg/dL",
        "status": "high",
        "reference_range": "70-100 mg/dL"
      }
    ],
    "problems_detected": [
      {
        "name": "Elevated Blood Glucose",
        "severity": "moderate",
        "description": "Fasting glucose above normal range"
      }
    ],
    "treatments": [
      {
        "recommendation": "Consult endocrinologist",
        "priority": "high"
      },
      {
        "recommendation": "Monitor diet and carbohydrate intake",
        "priority": "medium"
      }
    ],
    "summary": "Overall health assessment summary"
  }
}
```

### Status Classifications

| Status | Meaning | Visual Indicator |
|--------|---------|------------------|
| `normal` | Within healthy reference range | Green |
| `low` | Below normal range | Yellow |
| `high` | Above normal range | Orange |
| `critical` | Significantly abnormal | Red |

### User Interface

The scan report page includes:

- **File Upload Zone**: Drag-and-drop area with visual feedback
- **File Preview**: Image preview before submission
- **Progress Indicator**: Real-time upload and analysis progress
- **Results Display**:
  - Metrics table with status badges
  - Problems detected section with severity
  - Treatment recommendations prioritized
  - Collapsible raw OCR text
- **Medical Disclaimer**: Important notice about professional consultation

### Best Practices

1. **Image Quality**: Upload clear, high-resolution images
2. **Orientation**: Ensure document is properly oriented
3. **Complete Documents**: Include all pages of multi-page reports
4. **Standard Formats**: Common lab report formats work best

---

## Facial Health Analysis

### Overview

The Facial Health Analysis feature examines uploaded face photos to identify potential health indicators based on visual characteristics such as skin tone, coloration, and visible conditions.

### Capabilities

- **Supported Formats**:
  - JPEG images
  - PNG images

- **File Requirements**:
  - Maximum size: 10MB
  - Clear face visibility
  - Good lighting conditions
  - Front-facing preferred

### Analysis Metrics

| Metric | Description | Indicator |
|--------|-------------|-----------|
| **Redness Level** | Percentage of red discoloration | Inflammation, irritation |
| **Yellowness Level** | Percentage of yellow discoloration | Jaundice, liver conditions |
| **Skin Tone** | Overall skin tone classification | Baseline assessment |

### Problem Detection Thresholds

**Redness Detection:**
| Percentage | Severity | Possible Causes |
|------------|----------|-----------------|
| < 30% | None | Normal variation |
| 30-50% | Mild | Minor inflammation |
| 50-70% | Moderate | Significant inflammation |
| > 70% | Severe | Requires attention |

**Yellowness Detection:**
| Percentage | Severity | Possible Causes |
|------------|----------|-----------------|
| < 25% | None | Normal variation |
| 25-40% | Mild | Possible liver issue |
| 40-60% | Moderate | Significant jaundice sign |
| > 60% | Severe | Urgent medical attention |

### Output Structure

```json
{
  "face_detected": true,
  "face_count": 1,
  "visual_metrics": {
    "redness_percentage": 25,
    "yellowness_percentage": 15,
    "skin_tone": "medium"
  },
  "problems_detected": [
    {
      "type": "mild_inflammation",
      "severity": "low",
      "description": "Minor redness detected in facial area",
      "confidence": 0.75
    }
  ],
  "treatments": [
    {
      "recommendation": "Apply gentle moisturizer",
      "priority": "low"
    },
    {
      "recommendation": "Avoid harsh skincare products",
      "priority": "medium"
    }
  ]
}
```

### User Interface

- **Photo Upload**: Simple drag-and-drop or file selection
- **Analysis Preview**: View uploaded image before analysis
- **Results Display**:
  - Visual metrics with percentage bars
  - Detected concerns with severity badges
  - Recommended actions
  - Face detection visualization
- **Disclaimer**: Note about limitations and professional consultation

### Limitations

- **Not Diagnostic**: Results are indicators, not medical diagnoses
- **Lighting Dependent**: Poor lighting affects accuracy
- **Single Face**: Optimized for single face in frame
- **Skin Conditions**: Limited to visual surface analysis

---

## Risk Assessment Generator

### Overview

The Risk Assessment Generator combines data from multiple sources to create a comprehensive health risk profile. It integrates medical report data, facial analysis, and user-provided health information.

### Data Sources

1. **Medical Report Analysis** (optional)
   - Lab values and metrics
   - Detected health problems
   - Historical trends

2. **Facial Health Analysis** (optional)
   - Visual health indicators
   - Skin condition data

3. **User-Provided Information** (required)
   - Age and gender
   - Current symptoms
   - Medical history
   - Current medications
   - Lifestyle factors

### Input Form Fields

| Field | Type | Description |
|-------|------|-------------|
| Age | Number | User's current age |
| Gender | Select | Male/Female/Other |
| Symptoms | Textarea | Current symptoms description |
| Medical History | Textarea | Past conditions, surgeries |
| Medications | Textarea | Current medications and supplements |
| Select Report | Dropdown | Choose from previous report analyses |
| Select Face Analysis | Dropdown | Choose from previous face analyses |

### Assessment Generation

The AI generates a comprehensive assessment including:

1. **Risk Factors Identified**
   - Based on combined data analysis
   - Prioritized by severity

2. **Health Metrics Summary**
   - Key values from reports
   - Trend analysis if multiple reports

3. **Recommendations**
   - Lifestyle modifications
   - Medical consultations needed
   - Follow-up tests suggested

4. **Disclaimer**
   - AI limitations acknowledgment
   - Professional consultation advice

### Output Format

The assessment is generated in **Markdown format** for clear presentation:

```markdown
# Health Risk Assessment

## Patient Profile
- Age: 45 years
- Gender: Male

## Risk Factors Identified

### High Priority
1. **Elevated Blood Glucose**: Value of 126 mg/dL indicates pre-diabetes risk

### Moderate Priority
2. **Mild Facial Inflammation**: Detected redness may indicate stress or skin condition

## Recommendations

1. Schedule appointment with endocrinologist
2. Implement dietary modifications
3. Regular monitoring of blood glucose levels

## Disclaimer
This assessment is AI-generated and should not replace professional medical advice.
```

### PDF Export

Users can export the assessment as a PDF:

1. Click "Download PDF" button
2. Assessment rendered to canvas (html2canvas)
3. Converted to PDF document (jsPDF)
4. Downloaded to user's device

### Storage

Generated assessments are saved to the user's analysis history with type `risk` for future reference and trend tracking.

---

## AI Health Assistant

### Overview

The AI Health Assistant is a conversational chatbot powered by Google Gemini AI. It provides personalized health guidance based on the user's analysis history and profile.

### Capabilities

- **Answer Health Questions**: General health information and guidance
- **Explain Medical Terms**: Clarify terminology from reports
- **Interpret Results**: Help understand analysis results
- **Track Trends**: Identify patterns across multiple analyses
- **Provide Recommendations**: Actionable health advice

### Context Awareness

The chatbot has access to:

1. **User Profile**
   - Name and email
   - Account creation date
   - Preferences

2. **Analysis History**
   - Last 20 analyses
   - All types (face, report, risk)
   - Full structured data

3. **Conversation History**
   - Last 10 messages
   - Maintains context within session

4. **Platform Knowledge**
   - SehatScan features and capabilities
   - How to use different tools
   - Limitations and disclaimers

### Sample Interactions

**User**: "What did my last blood test show?"

**Assistant**: "Based on your most recent blood test from [date], here's a summary:

- Hemoglobin: 14.5 g/dL (normal)
- Blood Glucose: 126 mg/dL (slightly elevated)
- Cholesterol: 195 mg/dL (borderline)

The elevated glucose level is worth monitoring. Would you like me to explain what this might mean?"

---

**User**: "What is HbA1c and why is it important?"

**Assistant**: "HbA1c (Hemoglobin A1c) measures your average blood sugar levels over the past 2-3 months. It's important because:

1. **Diabetes Indicator**: Values above 6.5% suggest diabetes
2. **Long-term View**: Unlike fasting glucose, it shows patterns over time
3. **Treatment Monitoring**: Helps track how well diabetes management is working

Based on your history, I don't see an HbA1c test. You might consider asking your doctor about it given your glucose levels."

### User Interface

- **Chat Window**: Full-height conversation display
- **Message Input**: Text input with send button
- **Suggested Questions**: Starter prompts for new users
- **Message Formatting**: Markdown rendering with syntax highlighting
- **User Avatar**: Profile picture display
- **Loading State**: Typing indicator during response generation

### Safety Features

1. **No Diagnosis**: Always recommends professional consultation
2. **Medical Disclaimers**: Clear about AI limitations
3. **Fallback Responses**: Graceful handling of API errors
4. **Scope Limitations**: Stays within health guidance boundaries

---

## Analysis History

### Overview

The History page provides a comprehensive view of all past analyses, enabling users to track their health data over time.

### Features

- **Chronological View**: All analyses sorted by date (newest first)
- **Type Filtering**: Filter by face, report, or risk analyses
- **Search Capability**: Find specific analyses
- **Pagination**: Handle large history efficiently
- **Detail View**: Click to see full analysis details

### Analysis Types

| Type | Icon | Description |
|------|------|-------------|
| `face` | 👤 | Facial health analysis |
| `report` | 📄 | Medical report scan |
| `risk` | ⚠️ | Risk assessment |

### History Card Display

Each history item shows:

- **Type Badge**: Visual indicator of analysis type
- **Date**: When the analysis was performed
- **Summary**: Brief overview of findings
- **Key Metrics**: Important values or indicators
- **Action Button**: View full details

### Data Retention

- Analyses are stored indefinitely
- Users can request data export
- Deletion available through settings

---

## Dashboard Overview

### Overview

The main dashboard provides a high-level view of the user's health data and quick access to all features.

### Dashboard Components

1. **Statistics Cards**
   - Total Analyses Count
   - Medical Reports Scanned
   - Face Analyses Performed
   - Risk Assessments Generated

2. **Recent Analyses**
   - Last 5 analyses
   - Quick access to details
   - Type indicators

3. **Quick Actions**
   - Scan New Report
   - Analyze Face
   - Generate Risk Assessment
   - Open Chatbot

4. **Health Summary**
   - Key metrics overview
   - Trend indicators
   - Alerts if any

### Navigation

The dashboard sidebar includes:

- Dashboard Home
- Scan Report
- Scan Face
- Risk Assessment
- Chatbot
- History
- Profile
- Settings
- Notifications
- Help

---

## User Profile & Settings

### Profile Management

Users can manage their profile information:

- **Display Name**: Update visible name
- **Email**: View registered email (from Clerk)
- **Avatar**: Profile picture (managed by Clerk)
- **Member Since**: Account creation date

### Application Settings

- **Theme**: Light/Dark mode toggle
- **Language**: Multi-language support (English, Urdu)
- **Notifications**: Enable/disable notifications
- **Data Export**: Download all analysis data

### Security Settings

- **Password**: Change password (if using email auth)
- **Two-Factor Authentication**: Enable 2FA
- **Session Management**: View active sessions
- **Account Deletion**: Request account removal

### Notification Preferences

- **Analysis Complete**: Notify when analysis finishes
- **Health Alerts**: Important health indicators
- **Weekly Summary**: Periodic health overview
- **Email Notifications**: Email delivery preferences

---

## Feature Comparison Matrix

| Feature | Input | AI Used | Storage | Export |
|---------|-------|---------|---------|--------|
| Report Scan | PDF/Image | Gemini Vision | Yes | No |
| Face Analysis | Image | Server Analysis | Yes | No |
| Risk Assessment | Form + History | Gemini Text | Yes | PDF |
| Chatbot | Text | Gemini + RAG | Session | No |
| History | N/A | N/A | Fetch | Future |

---

## Limitations & Disclaimers

### General Limitations

1. **Not Medical Devices**: SehatScan tools are not medical devices
2. **No Diagnosis**: Results are informational, not diagnostic
3. **Professional Consultation**: Always consult healthcare providers
4. **AI Accuracy**: AI can make errors; verify important findings

### Specific Limitations

- **OCR Accuracy**: Dependent on image quality
- **Face Analysis**: Surface-level indicators only
- **Risk Assessment**: Based on available data only
- **Chatbot Knowledge**: May not have latest medical research

### Important Notice

> SehatScan is designed to help users understand their health data better. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
