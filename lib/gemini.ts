import { GoogleGenAI } from '@google/genai';

export interface AnalysisResult {
  status: 'Safe' | 'Suspicious' | 'Malicious';
  riskScore: number;
  threatType: string;
  analysis: string;
  userImpact: string;
  recommendation: string;
  intelligenceSources: string[];
}

// ---------- Ollama (local) ----------
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3.1';

async function analyzeWithOllama(url: string): Promise<AnalysisResult> {
  const prompt = `You are an advanced cybersecurity threat intelligence system. Analyze the following URL for potential security threats, phishing, malware, deceptive content, or scams.

URL to analyze: ${url}

Analyze the URL structure, domain reputation, and any known threat patterns. Consider:
- Does the domain look like a typosquat or impersonation of a legitimate site?
- Is the TLD suspicious?
- Does the URL have suspicious path patterns, excessive subdomains, or encoded characters?
- Is this a well-known legitimate domain?

You MUST respond with ONLY a valid JSON object (no markdown, no code fences) with exactly these fields:
{
  "status": "Safe" or "Suspicious" or "Malicious",
  "riskScore": number from 0 to 100,
  "threatType": "None" or the specific threat type,
  "analysis": "Your detailed analysis here",
  "userImpact": "What could happen to the user",
  "recommendation": "What the user should do",
  "intelligenceSources": ["Source 1", "Source 2"]
}

Respond with ONLY the JSON object.`;

  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false, format: 'json' }),
  });

  if (!response.ok) {
    throw new Error('Failed to connect to Ollama. Make sure Ollama is running.');
  }

  const data = await response.json();
  return JSON.parse(data.response) as AnalysisResult;
}

// ---------- Gemini (cloud / production) ----------
let geminiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    console.log('[Trustify] API Key Status:', apiKey ? `Found (${apiKey.substring(0, 8)}...)` : 'MISSING');
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('Gemini API key is not configured.');
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

async function analyzeWithGemini(url: string): Promise<AnalysisResult> {
  const client = getGemini();

  const prompt = `You are an advanced cybersecurity threat intelligence system. Analyze the following URL for potential security threats, phishing, malware, deceptive content, or scams.

URL to analyze: ${url}

Analyze the URL structure, domain reputation, and any known threat patterns. Consider:
- Does the domain look like a typosquat or impersonation of a legitimate site?
- Is the TLD suspicious?
- Does the URL have suspicious path patterns, excessive subdomains, or encoded characters?
- Is this a well-known legitimate domain?

Respond with a JSON object with these fields:
{
  "status": "Safe" or "Suspicious" or "Malicious",
  "riskScore": number from 0 to 100,
  "threatType": "None" or the specific threat type,
  "analysis": "Your detailed analysis here",
  "userImpact": "What could happen to the user",
  "recommendation": "What the user should do",
  "intelligenceSources": ["Source 1", "Source 2"]
}`;

  console.log('[Trustify] Calling Gemini API for URL:', url);

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    console.log('[Trustify] Gemini raw response:', text?.substring(0, 200));
    
    if (!text) throw new Error('Empty response from Gemini.');
    
    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson) as AnalysisResult;
  } catch (error: any) {
    console.error('[Trustify] Gemini Error:', error?.message || error);
    throw new Error(`Gemini analysis failed: ${error?.message || 'Unknown error'}`);
  }
}

// ---------- Main export ----------
export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  try {
    // Try Ollama first (works locally)
    const result = await analyzeWithOllama(url);
    // Validate
    result.riskScore = Math.max(0, Math.min(100, Math.round(result.riskScore || 0)));
    if (!['Safe', 'Suspicious', 'Malicious'].includes(result.status)) {
      result.status = result.riskScore < 30 ? 'Safe' : result.riskScore < 70 ? 'Suspicious' : 'Malicious';
    }
    if (!Array.isArray(result.intelligenceSources)) {
      result.intelligenceSources = ['Local AI Analysis', 'URL Pattern Matching'];
    }
    return result;
  } catch (ollamaError) {
    console.log('Ollama not available, falling back to Gemini...');
    try {
      return await analyzeWithGemini(url);
    } catch (geminiError) {
      console.error('Both backends failed:', { ollamaError, geminiError });
      throw new Error('Analysis failed. Make sure Ollama is running locally, or set a valid Gemini API key.');
    }
  }
}
