import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id } = await req.json();

        const project = await base44.entities.AppProject.get(project_id);
        if (!project) {
            return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        // Analyze security with AI
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Perform a security analysis for this application project.

Project: ${project.name}
Template: ${project.template}
Features: ${project.features?.join(', ')}

Analyze:
1. Overall security score (0-100)
2. Identify 5-10 potential vulnerabilities with:
   - Type (SQL Injection, XSS, CSRF, Auth issues, etc.)
   - Severity (low/medium/high/critical)
   - Location (where in the app)
   - Description
   - Fix suggestion
3. Compliance status for GDPR, OWASP Top 10, PCI-DSS
4. 5-7 security recommendations

Be thorough but realistic based on the template and features.`,
            response_json_schema: {
                type: "object",
                properties: {
                    overall_score: { type: "number" },
                    vulnerabilities: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                type: { type: "string" },
                                severity: { type: "string" },
                                location: { type: "string" },
                                description: { type: "string" },
                                fix_suggestion: { type: "string" }
                            }
                        }
                    },
                    compliance_status: {
                        type: "object",
                        properties: {
                            gdpr: { type: "boolean" },
                            owasp_top_10: { type: "boolean" },
                            pci_dss: { type: "boolean" }
                        }
                    },
                    recommendations: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        // Save analysis
        const analysis = await base44.entities.SecurityAnalysis.create({
            project_id,
            overall_score: response.overall_score,
            vulnerabilities: response.vulnerabilities,
            compliance_status: response.compliance_status,
            recommendations: response.recommendations
        });

        return Response.json({ analysis });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});