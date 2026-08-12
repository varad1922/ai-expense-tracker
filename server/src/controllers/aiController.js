import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize the Google Gen AI client. 
// Note: This assumes GEMINI_API_KEY is in your .env file.
const ai = new GoogleGenAI({});

// @desc    Generate AI response based on prompt and expense data
// @route   POST /api/ai/chat
// @access  Private
export const generateResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400);
      throw new Error('Please provide a prompt');
    }

    // Fetch the user's expenses to provide context to the LLM
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      take: 20 // limit to last 20 expenses to save tokens
    });

    // Format expenses for the prompt
    const expensesContext = expenses.map(exp => 
      `- ${exp.date.toISOString().split('T')[0]}: ${exp.title} (₹${exp.amount}) in category ${exp.category}`
    ).join('\n');

    const systemPrompt = `You are an AI financial assistant in an Expense Tracker app. 
Here is the user's recent expense data:
${expensesContext || 'No recent expenses.'}

Please answer the user's question concisely, helpfully, and base your insights on their expense data. 
You MUST respond with a valid JSON object in the following format: { "response": "Your markdown formatted message here" }`;

    // Make the API call to Gemini
    let aiResponseText = "";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Question: " + prompt }] }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });
      const responseJson = JSON.parse(response.text);
      aiResponseText = responseJson.response;
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      // Fallback if API key is not set or invalid
      aiResponseText = "Hello! I am your AI assistant. It looks like my Gemini API key is missing or invalid in the `.env` file, so I'm running in mock mode. Here is what I can tell you: you have " + expenses.length + " recent expenses recorded.";
    }

    res.status(200).json({ response: aiResponseText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating AI response' });
  }
};
