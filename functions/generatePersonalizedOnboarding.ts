import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userRole, selectedTemplate, userGoal, completedSteps = [], userActivities = [] } = await req.json();

    const templateLabels = {
      saas: 'SaaS Application',
      ai: 'AI-Powered Product',
      'e-commerce': 'E-Commerce Store',
      dashboard: 'Analytics Dashboard',
      mobile: 'Mobile App'
    };

    const goalLabels = {
      build_fast: 'Ship Something Fast',
      learn_platform: 'Learn the Platform',
      explore_ai: 'Explore AI Features',
      deploy_prod: 'Deploy to Production'
    };

    const templateLabel = templateLabels[selectedTemplate] || selectedTemplate || 'Not specified';
    const goalLabel = goalLabels[userGoal] || userGoal || 'Not specified';

    const prompt = `Create a highly personalized onboarding guide for a user of VibeCode, an enterprise AI app generation platform.

User Profile:
- Role: ${userRole}
- App type they want to build: ${templateLabel}
- Primary goal: ${goalLabel}
- Already completed: ${completedSteps.join(', ') || 'Nothing yet (brand new user)'}

Your task: Generate 3-4 concise, ordered steps that directly map to their stated goal and template choice.
Each step must be actionable and specific to the template category they chose.
Pro tips should be insider knowledge relevant to their specific template + goal combination.
Welcome message should feel personal and acknowledge their specific goal.

Do not be generic. Reference their chosen template type and goal explicitly.`;

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