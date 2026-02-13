import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Users, Sparkles, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function RoleSuggestionsPanel() {
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await base44.entities.User.list();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const analyzUser = async (userEmail) => {
    try {
      setLoading({ ...loading, [userEmail]: true });
      const response = await base44.functions.invoke('suggestUserRole', { userEmail });

      if (response.data.success) {
        setSuggestions({ ...suggestions, [userEmail]: response.data.suggestion });
        toast.success('Role suggestion generated!');
      }
    } catch (error) {
      toast.error('Failed to analyze user');
    } finally {
      setLoading({ ...loading, [userEmail]: false });
    }
  };

  const roleColors = {
    project_manager: 'bg-purple-500/20 text-purple-300',
    lead_developer: 'bg-blue-500/20 text-blue-300',
    contributor: 'bg-green-500/20 text-green-300',
    reviewer: 'bg-yellow-500/20 text-yellow-300',
    admin: 'bg-red-500/20 text-red-300'
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          AI Role Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map(user => {
          const suggestion = suggestions[user.email];
          const isLoading = loading[user.email];

          return (
            <div key={user.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{user.full_name}</h4>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <Badge className="mt-1 bg-slate-700 text-slate-300 text-xs">
                    Current: {user.role}
                  </Badge>
                </div>
                <Button
                  onClick={() => analyzUser(user.email)}
                  disabled={isLoading}
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-1" /> Analyze</>
                  )}
                </Button>
              </div>

              {suggestion && (
                <div className="space-y-2 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <Badge className={roleColors[suggestion.suggested_role]}>
                      Suggested: {suggestion.suggested_role.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {suggestion.confidence_score}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{suggestion.reasoning}</p>
                  
                  {suggestion.activity_metrics && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-slate-400">
                        Projects: {suggestion.activity_metrics.projects_created}
                      </div>
                      <div className="text-slate-400">
                        Reviews: {suggestion.activity_metrics.code_reviews}
                      </div>
                      <div className="text-slate-400">
                        Deploys: {suggestion.activity_metrics.deployments}
                      </div>
                      <div className="text-slate-400">
                        Collabs: {suggestion.activity_metrics.collaboration_events}
                      </div>
                    </div>
                  )}

                  {suggestion.suggested_permissions && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.suggested_permissions.map((perm, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}