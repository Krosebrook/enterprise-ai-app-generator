import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userEmail } = await req.json();

    // Gather user activity metrics
    const projects = await base44.asServiceRole.entities.AppProject.filter({ 
      created_by: userEmail 
    });
    
    const codeReviews = await base44.asServiceRole.entities.CodeReview.filter({
      'issues_found.0': { $exists: true }
    }).catch(() => []);
    
    const deployments = await base44.asServiceRole.entities.Deployment.filter({}).catch(() => []);
    
    const activities = await base44.asServiceRole.entities.UserActivity.filter({ 
      user_email: userEmail 
    });

    const metrics = {
      projects_created: projects.length,
      code_reviews: codeReviews.filter(r => r.project_id && 
        projects.some(p => p.id === r.project_id)).length,
      deployments: deployments.filter(d => 
        projects.some(p => p.id === d.project_id)).length,
      collaboration_events: activities.filter(a => 
        a.activity_type === 'feature_use').length
    };

    // AI role suggestion
    const prompt = `Based on user activity metrics, suggest the most appropriate role and permissions.

User Metrics:
- Projects Created: ${metrics.projects_created}
- Code Reviews: ${metrics.code_reviews}
- Deployments: ${metrics.deployments}
- Collaboration Events: ${metrics.collaboration_events}

Available Roles:
- project_manager: Oversees projects, assigns tasks, manages timelines
- lead_developer: Technical leadership, code reviews, architecture decisions
- contributor: Develops features, submits code, participates in reviews
- reviewer: Reviews code, provides feedback, ensures quality
- admin: Full system access and management

Return JSON with:
{
  "suggested_role": "role_name",
  "confidence_score": number (0-100),
  "reasoning": "brief explanation",
  "suggested_permissions": ["permission1", "permission2"]
}`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          suggested_role: { type: "string" },
          confidence_score: { type: "number" },
          reasoning: { type: "string" },
          suggested_permissions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      suggestion: {
        ...aiResponse,
        activity_metrics: metrics
      }
    });

  } catch (error) {
    console.error('Role suggestion error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});