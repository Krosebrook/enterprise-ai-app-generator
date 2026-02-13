import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { page, timeRange = 7 } = await req.json();

    // Get analytics data
    const analytics = await base44.asServiceRole.entities.UXAnalytics.filter(
      page ? { page } : {}
    );

    // Calculate aggregate metrics
    const totalSessions = analytics.length;
    const avgSessionDuration = analytics.reduce((sum, a) => 
      sum + (a.session_duration || 0), 0) / totalSessions;

    // Identify common navigation paths
    const pathFrequency = {};
    analytics.forEach(a => {
      const path = (a.navigation_path || []).join(' → ');
      pathFrequency[path] = (pathFrequency[path] || 0) + 1;
    });

    // Collect friction points
    const allFrictionPoints = analytics.flatMap(a => a.friction_points || []);
    const frictionByLocation = {};
    allFrictionPoints.forEach(fp => {
      if (!frictionByLocation[fp.location]) {
        frictionByLocation[fp.location] = [];
      }
      frictionByLocation[fp.location].push(fp);
    });

    // AI analysis
    const prompt = `Analyze UX patterns and provide actionable improvements.

Metrics:
- Total Sessions: ${totalSessions}
- Avg Session Duration: ${avgSessionDuration.toFixed(1)}s
- Page: ${page || 'All Pages'}

Common Navigation Paths:
${Object.entries(pathFrequency).slice(0, 5).map(([path, count]) => 
  `- ${path} (${count} times)`).join('\n')}

Friction Points Detected:
${Object.entries(frictionByLocation).map(([loc, points]) => 
  `- ${loc}: ${points.length} issues (${points.filter(p => p.severity === 'high').length} high severity)`).join('\n')}

Provide:
1. Usability score (0-100)
2. Top 3 friction areas to address
3. Specific UI/UX improvement recommendations
4. Quick wins for immediate impact

Return JSON.`;

    const aiInsights = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          usability_score: { type: "number" },
          friction_analysis: { type: "string" },
          recommendations: {
            type: "array",
            items: { type: "string" }
          },
          quick_wins: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      insights: aiInsights,
      metrics: {
        total_sessions: totalSessions,
        avg_session_duration: avgSessionDuration,
        top_paths: Object.entries(pathFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        friction_summary: Object.keys(frictionByLocation).map(loc => ({
          location: loc,
          count: frictionByLocation[loc].length,
          high_severity: frictionByLocation[loc].filter(p => p.severity === 'high').length
        }))
      }
    });

  } catch (error) {
    console.error('UX analysis error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});