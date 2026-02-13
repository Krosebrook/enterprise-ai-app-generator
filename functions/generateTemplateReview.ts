import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { template_name } = await req.json();

        // Get template details
        const templates = await base44.entities.Template.filter({ name: template_name });
        if (templates.length === 0) {
            return Response.json({ error: 'Template not found' }, { status: 404 });
        }

        const template = templates[0];

        // Check if review already exists
        const existingReviews = await base44.entities.TemplateReview.filter({ template_name });
        if (existingReviews.length > 0) {
            return Response.json({ review: existingReviews[0] });
        }

        // Generate AI review
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `You are an expert software architect reviewing a project template.

Template: ${template.name}
Category: ${template.category}
Description: ${template.description}
Features: ${template.features?.join(', ')}

Generate a comprehensive, professional review including:
- A compelling summary (2-3 sentences)
- 3-5 key strengths (pros)
- 2-4 potential drawbacks or limitations (cons)
- 3-5 ideal use cases
- An overall rating (0-5, can include decimals)

Be honest, balanced, and focus on practical insights.`,
            response_json_schema: {
                type: "object",
                properties: {
                    summary: { type: "string" },
                    pros: {
                        type: "array",
                        items: { type: "string" }
                    },
                    cons: {
                        type: "array",
                        items: { type: "string" }
                    },
                    use_cases: {
                        type: "array",
                        items: { type: "string" }
                    },
                    rating: { type: "number" }
                }
            }
        });

        // Save the review
        const review = await base44.entities.TemplateReview.create({
            template_name,
            ai_generated_summary: response.summary,
            pros: response.pros,
            cons: response.cons,
            use_cases: response.use_cases,
            rating: response.rating
        });

        return Response.json({ review });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});