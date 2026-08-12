import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Structured Outputs — AI Controller
 *
 * Demonstrates:
 *  - A strict JSON schema contract enforced on every Gemini response
 *  - Manual schema validation with descriptive error messages (without adding
 *    a new dependency — uses a lightweight inline validator)
 *  - Retry logic: up to MAX_RETRIES attempts before falling back gracefully
 *  - Clear separation between the AI response schema, the prompt builder,
 *    and the HTTP handler
 */

// ─── Structured output schema ─────────────────────────────────────────────────
// This is the contract the LLM MUST follow. We declare it both as a JSON Schema
// (sent to Gemini's responseMimeType/responseSchema config) and as a runtime
// validator so we can catch malformed responses early.

const AI_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    response: {
      type: 'string',
      description: 'The main answer in markdown format',
    },
    insights: {
      type: 'array',
      description: 'Up to 3 short, actionable bullet-point insights',
      items: { type: 'string' },
    },
    suggestedCategory: {
      type: 'string',
      description:
        'If the user is asking about a specific expense, the best category for it',
      nullable: true,
    },
    confidenceScore: {
      type: 'number',
      description: 'How confident the AI is in its answer, from 0.0 to 1.0',
    },
  },
  required: ['response', 'insights', 'confidenceScore'],
};

/**
 * Lightweight inline schema validator.
 * Validates that the parsed JSON from Gemini matches our expected contract.
 * Returns { valid: true } or { valid: false, errors: string[] }.
 *
 * This replaces adding Zod/Yup as a dependency while still demonstrating
 * the structured-output validation pattern.
 */
function validateAiResponse(obj) {
  const errors = [];

  if (typeof obj !== 'object' || obj === null) {
    return { valid: false, errors: ['Response is not an object'] };
  }

  if (typeof obj.response !== 'string' || obj.response.trim() === '') {
    errors.push('"response" must be a non-empty string');
  }

  if (!Array.isArray(obj.insights)) {
    errors.push('"insights" must be an array');
  } else if (obj.insights.some((i) => typeof i !== 'string')) {
    errors.push('"insights" must be an array of strings');
  }

  if (typeof obj.confidenceScore !== 'number') {
    errors.push('"confidenceScore" must be a number');
  } else if (obj.confidenceScore < 0 || obj.confidenceScore > 1) {
    errors.push('"confidenceScore" must be between 0.0 and 1.0');
  }

  if (
    'suggestedCategory' in obj &&
    obj.suggestedCategory !== null &&
    typeof obj.suggestedCategory !== 'string'
  ) {
    errors.push('"suggestedCategory" must be a string or null');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

// ─── Prompt builder ──────────────────────────────────────────────────────────
/**
 * Builds the system + user prompt, injecting the user's recent expenses as
 * context so the LLM can give personalised financial advice.
 *
 * async/await pattern: fetches from Prisma and returns a formatted string.
 */
async function buildPrompt(userId, userPrompt) {
  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 20,
  });

  const expensesContext =
    expenses.length > 0
      ? expenses
          .map(
            (exp) =>
              `- ${exp.date.toISOString().split('T')[0]}: ${exp.title} (₹${exp.amount}) [${exp.category}]`
          )
          .join('\n')
      : 'No recent expenses recorded.';

  const systemPrompt = `You are an AI financial assistant embedded in an Expense Tracker app.

The user's recent expenses (last 20):
${expensesContext}

INSTRUCTIONS:
- Answer the user's question based on their expense data where relevant.
- Be concise and practical.
- You MUST respond with a valid JSON object that strictly conforms to this schema:
${JSON.stringify(AI_RESPONSE_SCHEMA, null, 2)}

- "response": Your main answer in markdown format.
- "insights": 1-3 short actionable bullet points (empty array if not applicable).
- "suggestedCategory": Only include if the user is asking about categorising something; otherwise null.
- "confidenceScore": A number from 0.0 to 1.0 reflecting your certainty.

User question: ${userPrompt}`;

  return { systemPrompt, expenseCount: expenses.length };
}

// ─── Gemini call with retry ───────────────────────────────────────────────────
const MAX_RETRIES = 2;

/**
 * Calls the Gemini API and validates the structured output.
 * Retries up to MAX_RETRIES times if the response fails schema validation.
 *
 * Demonstrates: async/await, try/catch, for-loop retry, structured output schema.
 */
async function callGeminiWithRetry(ai, systemPrompt) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        config: {
          // Tell Gemini to return valid JSON — Structured Outputs feature
          responseMimeType: 'application/json',
          responseSchema: AI_RESPONSE_SCHEMA,
        },
      });

      const rawText = response.text;

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        throw new Error(`Gemini returned non-JSON text on attempt ${attempt}`);
      }

      // Validate the parsed response against our schema contract
      const validation = validateAiResponse(parsed);
      if (!validation.valid) {
        throw new Error(
          `Schema validation failed on attempt ${attempt}: ${validation.errors.join('; ')}`
        );
      }

      // Normalise: cap insights to 3 items
      parsed.insights = (parsed.insights || []).slice(0, 3);
      // Ensure suggestedCategory defaults to null
      parsed.suggestedCategory = parsed.suggestedCategory ?? null;

      return parsed;
    } catch (err) {
      lastError = err;
      console.warn(`[aiController] Gemini attempt ${attempt} failed: ${err.message}`);
    }
  }

  throw lastError;
}

// ─── Controller ────────────────────────────────────────────────────────────────
const ai = new GoogleGenAI({});

/**
 * @desc    Generate structured AI response based on prompt and expense data
 * @route   POST /api/ai/chat
 * @access  Private
 *
 * Response shape (always):
 * {
 *   response: string,           // markdown answer
 *   insights: string[],         // actionable bullet points
 *   suggestedCategory: string | null,
 *   confidenceScore: number,    // 0.0 – 1.0
 * }
 */
export const generateResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ message: 'Please provide a non-empty prompt' });
    }

    const { systemPrompt, expenseCount } = await buildPrompt(req.user.id, prompt.trim());

    let aiResponse;
    try {
      aiResponse = await callGeminiWithRetry(ai, systemPrompt);
    } catch (apiError) {
      console.error('[aiController] Gemini API failed after retries:', apiError.message);

      // Graceful fallback that still conforms to the structured output schema
      aiResponse = {
        response:
          `I'm running in offline mode (API key issue). You have **${expenseCount}** recent expenses recorded. ` +
          'Please check your `GEMINI_API_KEY` in `.env`.',
        insights: [
          'Ensure your GEMINI_API_KEY is set in the server .env file.',
          `You have ${expenseCount} expenses in the system.`,
        ],
        suggestedCategory: null,
        confidenceScore: 0,
      };
    }

    res.status(200).json(aiResponse);
  } catch (error) {
    console.error('[aiController] Unexpected error:', error);
    res.status(500).json({ message: 'Error generating AI response' });
  }
};
