import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPage, completedSteps, userRole, recentProjects, templateCategory, userGoal, learningStyle } = await req.json();

    const prompt = `You are an intelligent onboarding assistant for VibeCode, an enterprise AI app generation platform.

Recommend the single most valuable next task for this user right now.

User Context:
- Current Page: ${currentPage}
- Role: ${userRole}
- Completed Steps: ${completedSteps?.join(', ') || 'None yet'}
- Recent Projects Count: ${recentProjects || 0}
- Template Category Chosen: ${templateCategory || 'Not set yet'}
- Goal: ${userGoal || 'Not set yet'}
- Learning Style: ${learningStyle || 'mixed'}

Rules:
- If recentProjects === 0 and currentPage === 'Dashboard', recommend going to Generator to create first app
- If templateCategory is set, tailor the task to that category (e.g. for 'ai' → explore Intelligence page)
- If userGoal is 'deploy_prod', prioritize Deploy/Pipelines pages
- If userGoal is 'explore_ai', prioritize CodeAI or Intelligence pages
- Do NOT recommend completing a step already in completedSteps
- task_title must be action-oriented (start with a verb)
- page_to_visit must be one of: Dashboard, Generator, Templates, Deploy, Pipelines, Editor, Intelligence, Collaboration, Scripts, CodeAI, AIAdmin — or null if they should stay
- category: one of 'setup', 'explore', 'deploy', 'learn', 'collaborate'`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          task_title: { type: "string" },
          task_description: { type: "string" },
          page_to_visit: { type: "string" },
          why_important: { type: "string" },
          estimated_minutes: { type: "number" },
          category: { type: "string" }
        }
      }
    });

    return Response.json({ success: true, recommendation: aiResponse });

  } catch (error) {
    console.error('Task recommendation error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});