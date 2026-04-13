import Anthropic from '@anthropic-ai/sdk';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RiskAnalysis {
  riskScore: number;
  riskLevel: string;
  narrative: string;
  topRisks: string[];
  recommendations: string[];
  trend: string;
  arabicSummary: string;
  scoreBreakdown: {
    safetyCompliance: number;
    serviceQuality: number;
    documentation: number;
    repeatBehavior: number;
  };
}

export interface ViolationClassification {
  category: string;
  severity: string;
  regulatoryArticle: string;
  penaltyRecommendation: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface ChecklistItem {
  section: string;
  items: string[];
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const client = new Anthropic();

const MODEL = 'claude-sonnet-4-20250514';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract a JSON value from a Claude response that may wrap the object in
 * markdown code fences (```json ... ```).
 */
function extractJson<T>(text: string): T {
  // Try to pull JSON from a fenced code block first
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text.trim();
  return JSON.parse(raw) as T;
}

// ---------------------------------------------------------------------------
// analyzeRisk
// ---------------------------------------------------------------------------

export async function analyzeRisk(facilityData: object): Promise<RiskAnalysis> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system:
        'You are an AI compliance analyst for the Saudi Ministry of Tourism (MT). ' +
        'Analyze facility inspection data and generate risk assessments in both English and Arabic. ' +
        'Always structure your response as JSON with fields: ' +
        'riskScore (number 0-100), riskLevel (string: Low/Medium/High/Critical), ' +
        'narrative (string), topRisks (array of strings), recommendations (array of strings), ' +
        'trend (string: improving/declining/stable), arabicSummary (string), ' +
        'scoreBreakdown (object with safetyCompliance, serviceQuality, documentation, repeatBehavior as numbers 0-100).',
      messages: [
        {
          role: 'user',
          content: `Analyze the following facility data and provide a risk assessment:\n\n${JSON.stringify(facilityData, null, 2)}`,
        },
      ],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';
    return extractJson<RiskAnalysis>(text);
  } catch (error) {
    console.error('[AI] analyzeRisk error:', error);
    throw new Error('Failed to generate risk analysis');
  }
}

// ---------------------------------------------------------------------------
// classifyViolation
// ---------------------------------------------------------------------------

export async function classifyViolation(
  description: string,
): Promise<ViolationClassification> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system:
        'You are an AI compliance classifier for the Saudi Ministry of Tourism. ' +
        'Classify the given violation description. Return JSON with: ' +
        'category (string), severity (Critical/High/Medium/Low), ' +
        'regulatoryArticle (string like "Article 15.3"), ' +
        'penaltyRecommendation (string with SAR amount), ' +
        'descriptionEn (string), descriptionAr (string in Arabic).',
      messages: [
        {
          role: 'user',
          content: `Classify the following violation:\n\n${description}`,
        },
      ],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';
    return extractJson<ViolationClassification>(text);
  } catch (error) {
    console.error('[AI] classifyViolation error:', error);
    throw new Error('Failed to classify violation');
  }
}

// ---------------------------------------------------------------------------
// generateChecklist
// ---------------------------------------------------------------------------

export async function generateChecklist(
  facilityType: string,
  classification: string,
): Promise<ChecklistItem[]> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system:
        'You are an AI inspection planner for the Saudi Ministry of Tourism. ' +
        'Generate a comprehensive inspection checklist for the given facility type and classification. ' +
        'Return JSON array of objects with: section (string), items (array of strings). ' +
        'Include sections relevant to the facility type. Skip irrelevant sections.',
      messages: [
        {
          role: 'user',
          content: `Generate an inspection checklist for:\nFacility type: ${facilityType}\nClassification: ${classification}`,
        },
      ],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';
    return extractJson<ChecklistItem[]>(text);
  } catch (error) {
    console.error('[AI] generateChecklist error:', error);
    throw new Error('Failed to generate checklist');
  }
}
