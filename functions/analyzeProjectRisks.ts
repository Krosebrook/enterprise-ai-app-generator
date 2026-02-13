import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id } = await req.json();

        // Get project details
        const project = await base44.entities.AppProject.get(project_id);
        if (!project) {
            return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        // Get existing risks
        const existingRisks = await base44.entities.ProjectRisk.filter({ project_id });

        // Analyze with AI
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a project risk analyst. Analyze this project for potential risks.

Project: ${project.name}
Template: ${project.template}
Features: ${project.features?.join(', ')}
Status: ${project.status}
AI Model: ${project.ai_model}

Identify 5-8 key risks across these categories:
- Technical (architecture, dependencies, scalability)
- Timeline (deadlines, scope creep, resource availability)
- Resource (team capacity, skill gaps)
- Security (vulnerabilities, compliance)
- Scope (feature complexity, unclear requirements)

For each risk provide:
- Category
- Severity (low/medium/high/critical)
- Probability (0-100)
- Description (clear, specific)
- Mitigation plan (actionable steps)
- Impact score (1-10)`,
            response_json_schema: {
                type: "object",
                properties: {
                    risks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                category: { type: "string" },
                                severity: { type: "string" },
                                probability: { type: "number" },
                                description: { type: "string" },
                                mitigation_plan: { type: "string" },
                                impact_score: { type: "number" }
                            }
                        }
                    }
                }
            }
        });

        // Save new risks
        const savedRisks = [];
        for (const risk of response.risks) {
            const saved = await base44.entities.ProjectRisk.create({
                project_id,
                risk_category: risk.category,
                severity: risk.severity,
                probability: risk.probability,
                description: risk.description,
                mitigation_plan: risk.mitigation_plan,
                impact_score: risk.impact_score,
                status: 'identified'
            });
            savedRisks.push(saved);
        }

        return Response.json({ risks: savedRisks });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});