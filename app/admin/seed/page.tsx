'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to seed database: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      if (data.success) {
        fetchStatus();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during seeding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Database Seeding</h1>
          <p className="text-slate-400">Populate your database with realistic civic issue demo data</p>
        </div>

        {/* Status Card */}
        {status && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-cyan-400">Current Database Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Issues:</span>
                <span className="font-mono text-white">{status.totalIssues}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seed Data Available:</span>
                <span className="font-mono text-white">{status.seedDataAvailable}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Database Seeded:</span>
                <span className={status.isSeeded ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                  {status.isSeeded ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">Seed Database</CardTitle>
            <CardDescription className="text-slate-400">
              Click the button below to add 15 realistic civic issues to your database. This operation runs only once
              to prevent duplicate entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSeed}
              disabled={loading || (result?.success === false && result?.reason === 'Database already seeded')}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Seeding in progress...' : 'Populate Database with Demo Data'}
            </Button>

            <Button
              onClick={fetchStatus}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Check Status
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className={result.success ? 'bg-green-900/20 border-green-700' : 'bg-yellow-900/20 border-yellow-700'}>
            <CardHeader>
              <CardTitle className={result.success ? 'text-green-400' : 'text-yellow-400'}>
                {result.success ? '✓ Seeding Successful' : '⚠ Database Already Seeded'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-300">{result.message || result.reason}</p>
              {result.addedCount && (
                <div className="bg-slate-900/50 rounded p-3 font-mono text-sm text-cyan-400">
                  Added: <span className="font-bold">{result.addedCount}</span> issues
                </div>
              )}
              {result.existingIssueCount && (
                <div className="bg-slate-900/50 rounded p-3 font-mono text-sm text-yellow-400">
                  Existing issues: <span className="font-bold">{result.existingIssueCount}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="bg-red-900/20 border-red-700">
            <CardHeader>
              <CardTitle className="text-red-400">✗ Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Data Preview */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">What Will Be Added</CardTitle>
            <CardDescription className="text-slate-400">15 realistic civic issues including:</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ Pothole near Model Town Road causing traffic</li>
              <li>✓ Garbage pile near bus stand not collected</li>
              <li>✓ Water leakage near hospital gate</li>
              <li>✓ Streetlight not working near school road</li>
              <li>✓ Sewage overflow in residential area</li>
              <li>✓ Loose electric wire near market area</li>
              <li>✓ Stray dogs causing disturbance near park</li>
              <li>✓ + 8 more realistic civic issues</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                All issues are distributed across Jalandhar with various priority levels (low→emergency) and realistic
                upvote counts (2→8).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
