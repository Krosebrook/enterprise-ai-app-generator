import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's recent activity
        const userActivities = await base44.entities.UserActivity.filter({ user_email: user.email });
        
        // Get all activities for trending calculation
        const allActivities = await base44.entities.UserActivity.list();
        const templates = await base44.entities.Template.list();

        // Calculate trending scores
        const templateScores = {};
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        allActivities.forEach(activity => {
            if (activity.template_name && new Date(activity.created_date) > sevenDaysAgo) {
                const weight = activity.activity_type === 'template_use' ? 3 : 1;
                templateScores[activity.template_name] = (templateScores[activity.template_name] || 0) + weight;
            }
        });

        // Get user's interests
        const userInterests = userActivities
            .filter(a => a.template_name)
            .map(a => a.template_name);

        // Use AI to suggest relevant templates
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Based on user activity and trending data, recommend templates.

User's viewed/used templates: ${userInterests.join(', ') || 'None yet'}

Available templates with trending scores:
${templates.map(t => `- ${t.name} (${t.category}): ${t.description}
  Features: ${t.features?.join(', ')}
  Trending score: ${templateScores[t.name] || 0}`).join('\n')}

Recommend 6 templates that:
1. Are currently trending (high scores)
2. Match user's interests
3. Complement what they've already used
4. Cover diverse use cases`,
            response_json_schema: {
                type: "object",
                properties: {
                    recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                template_name: { type: "string" },
                                reason: { type: "string" },
                                relevance_score: { type: "number" }
                            }
                        }
                    }
                }
            }
        });

        // Build final recommendations
        const trending = response.recommendations
            .map(rec => {
                const template = templates.find(t => t.name === rec.template_name);
                return template ? {
                    ...template,
                    trending_score: templateScores[template.name] || 0,
                    recommendation_reason: rec.reason,
                    relevance_score: rec.relevance_score
                } : null;
            })
            .filter(t => t !== null)
            .slice(0, 6);

        return Response.json({ trending });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});