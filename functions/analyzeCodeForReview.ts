import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id, file_path, code_content } = await req.json();

        // AI code review
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Perform a comprehensive code review for this file.

File: ${file_path}

Code:
\`\`\`
${code_content}
\`\`\`

Provide:
1. 5-10 specific issues found (line number, type, severity, message, suggestion)
   - Types: bug, performance, security, style, best-practice
   - Severity: info, warning, error, critical
2. 3-5 improvement suggestions (category, suggestion, impact)
   - Categories: performance, readability, maintainability, security, testing
   - Impact: low, medium, high
3. Summary (2-3 sentences)
4. Overall quality rating (poor/fair/good/excellent)

Be constructive and specific. Focus on meaningful improvements.`,
            response_json_schema: {
                type: "object",
                properties: {
                    issues_found: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                line: { type: "number" },
                                type: { type: "string" },
                                severity: { type: "string" },
                                message: { type: "string" },
                                suggestion: { type: "string" }
                            }
                        }
                    },
                    improvements: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                category: { type: "string" },
                                suggestion: { type: "string" },
                                impact: { type: "string" }
                            }
                        }
                    },
                    summary: { type: "string" },
                    overall_quality: { type: "string" }
                }
            }
        });

        // Save review
        const review = await base44.entities.CodeReview.create({
            project_id,
            file_path,
            reviewer_type: 'ai',
            issues_found: response.issues_found,
            improvements: response.improvements,
            summary: response.summary,
            overall_quality: response.overall_quality
        });

        return Response.json({ review });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});