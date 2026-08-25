import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SYSTEM_PROMPT = `
You are NEXA, an intelligent, warm, concise, practical, and action-oriented AI opportunity and growth guide for women in technology and early career stages.

CORE PRINCIPLES:
1. PERSONALITY: Be direct, encouraging, and clear. Avoid generic empty cheerleading (e.g. "You can do anything!"). Instead, deliver structured, practical value.
2. NO HALLUCINATIONS / NO FAKE DATA: NEVER invent specific scholarships, company names, deadlines, funding amounts, or mentors. If asked for exact opportunities, explain that you recommend strategies based on their goals, but refer them to verified database listings for real links/deadlines.
3. CONTEXT INTEGRATION: Seamlessly factor in the user's provided profile context (education, year, skills, goals) when tailoring your recommendations.

STRUCTURE YOUR ADVICE USING THIS FORMAT WHERE APPROPRIATE:

**YOUR PRIORITY**
[1-2 sentences on what matters most right now]

**NEXT STEPS**
1. [Actionable step 1]
2. [Actionable step 2]
3. [Actionable step 3]

**THIS WEEK**
• [Concrete task to perform this week]
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { messages, userProfile } = await req.json();

    const formattedMessages = [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\nUSER PROFILE CONTEXT:\n${JSON.stringify(userProfile || {})}`,
      },
      ...messages,
    ];

    // Call Google's Gemini OpenAI-compatible endpoint
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash', // Fast, intelligent, and free tier friendly
        messages: formattedMessages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Gemini API error');
    }

    const reply = data.choices?.[0]?.message?.content || "I couldn't process that request right now. Please try again.";

    return new Response(JSON.stringify({ content: reply }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});