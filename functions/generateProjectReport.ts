import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id, report_type = 'on-demand' } = await req.json();

        // Get project data
        const project = await base44.entities.AppProject.get(project_id);
        if (!project) {
            return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        const risks = await base44.entities.ProjectRisk.filter({ project_id });
        const deployments = await base44.entities.Deployment.filter({ project_id });

        // Generate comprehensive report with AI
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Generate a comprehensive project status report.

Project: ${project.name}
Template: ${project.template}
Status: ${project.status}
Features: ${project.features?.join(', ')}
Last Deployed: ${project.last_deployed || 'Never'}

Active Risks: ${risks.length}
High/Critical Risks: ${risks.filter(r => r.severity === 'high' || r.severity === 'critical').length}

Deployments: ${deployments.length}
Latest Deployment: ${deployments[0]?.status || 'None'}

Generate:
1. Executive summary (2-3 sentences)
2. Progress percentage (0-100, estimated)
3. 3-5 key achievements
4. 3-5 current roadblocks with severity and suggested actions
5. Predicted completion date (YYYY-MM-DD format)
6. Feature development timelines (3-5 major features with estimated days and confidence %)`,
            response_json_schema: {
                type: "object",
                properties: {
                    summary: { type: "string" },
                    progress_percentage: { type: "number" },
                    key_achievements: {
                        type: "array",
                        items: { type: "string" }
                    },
                    roadblocks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                issue: { type: "string" },
                                severity: { type: "string" },
                                suggested_action: { type: "string" }
                            }
                        }
                    },
                    predicted_completion: { type: "string" },
                    feature_timelines: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                feature: { type: "string" },
                                estimated_days: { type: "number" },
                                confidence: { type: "number" }
                            }
                        }
                    }
                }
            }
        });

        // Save report
        const report = await base44.entities.ProjectReport.create({
            project_id,
            report_type,
            summary: response.summary,
            progress_percentage: response.progress_percentage,
            key_achievements: response.key_achievements,
            roadblocks: response.roadblocks,
            predicted_completion: response.predicted_completion,
            feature_timelines: response.feature_timelines
        });

        return Response.json({ report });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});