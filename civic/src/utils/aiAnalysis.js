// ============================================
// AI Image Analysis via Gemini Vision API
// Analyzes captured photos to classify civic issues
// Falls back to null if no API key configured
// ============================================

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const VALID_ISSUE_TYPES = ['Pothole', 'Garbage', 'Water Leakage', 'Streetlight', 'Road Damage'];
const VALID_SEVERITIES = ['Low', 'Medium', 'High'];

/**
 * Analyze a captured image using Gemini Vision API.
 * @param {string} imageDataUrl - Base64 data URL of the captured image
 * @param {string} description - Optional text description from the user
 * @returns {Promise<{issueType: string, severity: string, confidence: string}|null>}
 */
export async function analyzeImage(imageDataUrl, description = '') {
  if (!GEMINI_API_KEY) {
    console.info('ℹ️ No VITE_GEMINI_API_KEY set – skipping AI image analysis');
    return null;
  }

  try {
    // Extract base64 payload from the data URL
    const base64Data = imageDataUrl.split(',')[1];
    const mimeType = (imageDataUrl.split(';')[0].split(':')[1]) || 'image/jpeg';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              {
                text: `You are an AI assistant for a civic issue reporting platform called CivicPulse. Analyze this image of a potential civic/urban issue.

${description ? `The reporter described it as: "${description}"` : 'No text description was provided — rely on the image only.'}

Classify the issue into exactly ONE of these categories:
- Pothole
- Garbage
- Water Leakage
- Streetlight
- Road Damage

Determine the severity as exactly ONE of: Low, Medium, High

Severity guidelines:
- High: Immediate danger to public safety, large scale damage, blocks traffic/pedestrian access, risk of injury or flooding
- Medium: Noticeable problem, moderate inconvenience, needs attention within days
- Low: Minor cosmetic issue, small area affected, low public impact

Respond ONLY with valid JSON — no markdown fences, no explanation:
{"issueType": "...", "severity": "...", "confidence": 85.0}`
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100,
          }
        })
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🤖 Gemini raw response:', rawText);

    // Extract the JSON object from the response text
    const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error('No JSON object found in Gemini response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate & sanitize fields
    const issueType = VALID_ISSUE_TYPES.includes(parsed.issueType)
      ? parsed.issueType
      : closestMatch(parsed.issueType, VALID_ISSUE_TYPES);

    const severity = VALID_SEVERITIES.includes(parsed.severity)
      ? parsed.severity
      : 'Medium';

    const confidence = Math.min(99, Math.max(60, parseFloat(parsed.confidence) || 85)).toFixed(1);

    console.log('🤖 AI Analysis result:', { issueType, severity, confidence });
    return { issueType, severity, confidence };
  } catch (err) {
    console.error('🤖 AI image analysis failed:', err);
    return null;
  }
}

/**
 * Find the closest matching option via simple substring matching.
 */
function closestMatch(input, options) {
  if (!input) return options[0];
  const lower = input.toLowerCase();
  for (const opt of options) {
    if (lower.includes(opt.toLowerCase()) || opt.toLowerCase().includes(lower)) {
      return opt;
    }
  }
  return options[0];
}
