import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query } = await req.json();

        // Get all templates
        const templates = await base44.entities.Template.list();

        // Use AI to understand the query and match templates
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Analyze this search query: "${query}"

Available templates:
${templates.map(t => `- ${t.name} (${t.category}): ${t.description}\n  Features: ${t.features?.join(', ')}`).join('\n')}

Task: Return the template names that best match the user's intent, ranked by relevance.
Consider semantic meaning, use cases, features, and category.`,
            response_json_schema: {
                type: "object",
                properties: {
                    matches: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                template_name: { type: "string" },
                                relevance_score: { type: "number" },
                                match_reason: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        // Filter and sort templates based on AI analysis
        const rankedTemplates = response.matches
            .map(match => {
                const template = templates.find(t => t.name === match.template_name);
                return template ? { ...template, relevance_score: match.relevance_score, match_reason: match.match_reason } : null;
            })
            .filter(t => t !== null)
            .sort((a, b) => b.relevance_score - a.relevance_score);

        // Track user activity
        await base44.entities.UserActivity.create({
            user_email: user.email,
            activity_type: 'template_view',
            metadata: { search_query: query }
        });

        return Response.json({ results: rankedTemplates });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});