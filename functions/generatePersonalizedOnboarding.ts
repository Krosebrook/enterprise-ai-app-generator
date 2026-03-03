import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { userRole, selectedTemplate, userGoal, learningStyle = 'mixed', completedSteps = [] } = await req.json();

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

    const learningLabels = {
      visual: 'visual learner (prefers screenshots, diagrams)',
      'hands-on': 'hands-on learner (prefers doing over reading)',
      reading: 'reading learner (prefers detailed explanations)',
      mixed: 'mixed learner (prefers balanced approach)'
    };

    const templateLabel = templateLabels[selectedTemplate] || selectedTemplate || 'Not specified';
    const goalLabel = goalLabels[userGoal] || userGoal || 'Not specified';
    const learningLabel = learningLabels[learningStyle] || 'mixed learner';

    const prompt = `You are an expert onboarding coach for VibeCode — an enterprise AI app generation platform.

Create a highly personalized onboarding guide for this user:
- Role: ${userRole === 'admin' ? 'Admin (manages team, oversees platform)' : 'Developer (builds and ships apps)'}
- App type to build: ${templateLabel}
- Primary goal: ${goalLabel}
- Learning style: ${learningLabel}
- Already completed: ${completedSteps.join(', ') || 'Nothing yet'}

Instructions:
- Generate exactly 4 steps, ordered by logical progression for their template+goal combo
- Each step must reference the specific template category (e.g. for SaaS, mention subscription flows; for AI products, mention LLM config)
- For hands-on learners: steps should be action-first with minimal reading
- For reading learners: add more context/explanation in descriptions
- Pro tips must be insider knowledge specific to the template+goal combo, NOT generic advice
- page_hint should be the exact page name in the app (Dashboard, Generator, Templates, Deploy, Pipelines, Editor, Intelligence, Collaboration, Scripts, CodeAI, AIAdmin)
- estimated_minutes is realistic (not fake-fast)
- welcome_message should mention both the template type AND goal, feel warm and specific`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          welcome_message: { type: "string" },
          estimated_completion_minutes: { type: "number" },
          recommended_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                page_hint: { type: "string" },
                action_label: { type: "string" },
                contextual_tip: { type: "string" }
              }
            }
          },
          pro_tips: { type: "array", items: { type: "string" } },
          focus_areas: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({ success: true, guide: aiResponse });

  } catch (error) {
    console.error('Onboarding generation error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});