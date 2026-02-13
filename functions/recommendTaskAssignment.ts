import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id, task_description, required_skills, estimated_hours, priority } = await req.json();

        // Get team members
        const teamMembers = await base44.entities.TeamMember.list();

        if (teamMembers.length === 0) {
            return Response.json({ error: 'No team members found' }, { status: 404 });
        }

        // AI recommendation
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Recommend the best team member for this task.

Task: ${task_description}
Required Skills: ${required_skills?.join(', ') || 'General'}
Estimated Hours: ${estimated_hours || 'Unknown'}
Priority: ${priority || 'medium'}

Team Members:
${teamMembers.map(m => `- ${m.name} (${m.user_email})
  Specialization: ${m.specialization}
  Skills: ${m.skills?.join(', ')}
  Current Workload: ${m.current_workload}%
  Availability: ${m.availability}
  Performance Score: ${m.performance_score}/10`).join('\n')}

Recommend:
1. Best assignee (email)
2. Confidence score (0-100)
3. Reasoning
4. 2-3 alternative assignees with match scores (0-100)`,
            response_json_schema: {
                type: "object",
                properties: {
                    recommended_assignee: { type: "string" },
                    confidence: { type: "number" },
                    reasoning: { type: "string" },
                    alternatives: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                email: { type: "string" },
                                match_score: { type: "number" },
                                reason: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        // Create task assignment
        const assignment = await base44.entities.TaskAssignment.create({
            project_id,
            task_description,
            required_skills,
            estimated_hours,
            priority,
            recommended_assignee: response.recommended_assignee,
            recommendation_confidence: response.confidence,
            alternative_assignees: response.alternatives.map(a => ({
                email: a.email,
                match_score: a.match_score
            })),
            status: 'pending'
        });

        return Response.json({ 
            assignment,
            reasoning: response.reasoning,
            alternatives: response.alternatives
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});