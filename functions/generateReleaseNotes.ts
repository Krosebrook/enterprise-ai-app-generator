import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateName, currentVersion, changes } = await req.json();

    // Analyze changes and suggest version
    const changeTypes = changes.map(c => c.type);
    const hasBreaking = changeTypes.includes('breaking');
    const hasFeature = changeTypes.includes('feature');
    const hasFix = changeTypes.includes('fix');

    // Parse current version
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    // Suggest next version based on semantic versioning
    let suggestedVersion;
    if (hasBreaking) {
      suggestedVersion = `${major + 1}.0.0`;
    } else if (hasFeature) {
      suggestedVersion = `${major}.${minor + 1}.0`;
    } else {
      suggestedVersion = `${major}.${minor}.${patch + 1}`;
    }

    // Generate AI release notes
    const prompt = `Generate professional release notes for a template update.

Template: ${templateName}
Version: ${currentVersion} → ${suggestedVersion}

Changes:
${changes.map(c => `- [${c.type.toUpperCase()}] ${c.description}`).join('\n')}

Format as markdown with:
1. Brief summary (1 sentence)
2. What's New section
3. Bug Fixes (if any)
4. Breaking Changes (if any)
5. Migration notes (if breaking changes)

Keep it concise and professional.`;

    const releaseNotes = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false
    });

    return Response.json({
      success: true,
      suggested_version: suggestedVersion,
      release_notes: releaseNotes,
      version_strategy: hasBreaking ? 'major' : hasFeature ? 'minor' : 'patch'
    });

  } catch (error) {
    console.error('Release notes generation error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});