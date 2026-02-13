import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userRole, selectedTemplate, completedSteps = [], userActivities = [] } = await req.json();

    // Analyze user context
    const context = {
      role: userRole,
      template: selectedTemplate,
      completedSteps,
      activities: userActivities
    };

    // Generate personalized guide using AI
    const prompt = `Create a personalized onboarding guide for a ${context.role} user of an enterprise AI app development platform.

User Context:
- Role: ${context.role}
- Selected Template: ${context.template || 'None yet'}
- Completed Steps: ${context.completedSteps.join(', ') || 'None'}
- Recent Activities: ${context.activities.length} actions

Generate a JSON response with:
1. A welcome message tailored to their role and experience level
2. Top 3 recommended next steps based on their context
3. 3 pro tips specific to their selected template (if any)
4. Estimated time to complete onboarding (in minutes)

Format:
{
  "welcome_message": "string",
  "recommended_steps": [
    {"title": "string", "description": "string", "priority": "high|medium|low"}
  ],
  "pro_tips": ["string"],
  "estimated_completion_time": number
}`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          welcome_message: { type: "string" },
          recommended_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          pro_tips: {
            type: "array",
            items: { type: "string" }
          },
          estimated_completion_time: { type: "number" }
        }
      }
    });

    return Response.json({
      success: true,
      guide: aiResponse
    });

  } catch (error) {
    console.error('Onboarding generation error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});