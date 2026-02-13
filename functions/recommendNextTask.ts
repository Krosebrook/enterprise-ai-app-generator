import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPage, completedSteps, userRole, recentProjects } = await req.json();

    const prompt = `As an AI onboarding assistant for an enterprise app development platform, recommend the next best task for a user.

Context:
- Current Page: ${currentPage}
- User Role: ${userRole}
- Completed Steps: ${completedSteps?.join(', ') || 'None'}
- Recent Projects: ${recentProjects || 0}

Provide a single, actionable next step that will help them learn the platform effectively.

Return JSON with:
{
  "task_title": "Clear, action-oriented title",
  "task_description": "Brief description (1 sentence)",
  "page_to_visit": "PageName or null if they should stay",
  "why_important": "Brief explanation why this matters",
  "estimated_minutes": number
}`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          task_title: { type: "string" },
          task_description: { type: "string" },
          page_to_visit: { type: "string" },
          why_important: { type: "string" },
          estimated_minutes: { type: "number" }
        }
      }
    });

    return Response.json({
      success: true,
      recommendation: aiResponse
    });

  } catch (error) {
    console.error('Task recommendation error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});