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

// ---------- Groq (cloud / primary) ----------
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function analyzeWithGroq(url: string): Promise<AnalysisResult> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  console.log('[Trustify] Groq Key Status:', apiKey ? `Found (${apiKey.substring(0, 8)}...)` : 'MISSING');

  if (!apiKey) {
    throw new Error('Groq API key is not configured.');
  }

  const prompt = `You are an advanced cybersecurity threat intelligence system. Analyze the following URL for potential security threats, phishing, malware, deceptive content, or scams.

URL to analyze: ${url}

Analyze the URL structure, domain reputation, and any known threat patterns. Consider:
- Does the domain look like a typosquat or impersonation of a legitimate site?
- Is the TLD suspicious?
- Does the URL have suspicious path patterns, excessive subdomains, or encoded characters?
- Is this a well-known legitimate domain?

Respond with ONLY a valid JSON object (no markdown, no code fences) with these fields:
{
  "status": "Safe" or "Suspicious" or "Malicious",
  "riskScore": number from 0 to 100,
  "threatType": "None" or the specific threat type,
  "analysis": "Your detailed analysis here",
  "userImpact": "What could happen to the user",
  "recommendation": "What the user should do",
  "intelligenceSources": ["Source 1", "Source 2"]
}`;

  console.log('[Trustify] Calling Groq API for URL:', url);

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Trustify] Groq API Error:', response.status, errorText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  console.log('[Trustify] Groq raw response:', text?.substring(0, 200));

  if (!text) throw new Error('Empty response from Groq.');

  const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanJson) as AnalysisResult;
}

// ---------- Main export ----------
export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  // Helper to validate & normalize a result
  function validate(result: AnalysisResult): AnalysisResult {
    result.riskScore = Math.max(0, Math.min(100, Math.round(result.riskScore || 0)));
    if (!['Safe', 'Suspicious', 'Malicious'].includes(result.status)) {
      result.status = result.riskScore < 30 ? 'Safe' : result.riskScore < 70 ? 'Suspicious' : 'Malicious';
    }
    if (!Array.isArray(result.intelligenceSources)) {
      result.intelligenceSources = ['AI-Powered Analysis', 'URL Pattern Matching'];
    }
    return result;
  }

  // 1. Try Ollama (local dev)
  try {
    return validate(await analyzeWithOllama(url));
  } catch (ollamaError) {
    console.log('[Trustify] Ollama not available, trying cloud providers...');
  }

  // 2. Try Groq (fast, reliable, free)
  try {
    return validate(await analyzeWithGroq(url));
  } catch (groqError) {
    console.log('[Trustify] Groq failed, trying Gemini...', groqError);
  }

  // 3. Try Gemini (fallback)
  try {
    return validate(await analyzeWithGemini(url));
  } catch (geminiError) {
    console.error('[Trustify] All backends failed.');
    throw new Error('Analysis failed. Please try again later.');
  }
}
