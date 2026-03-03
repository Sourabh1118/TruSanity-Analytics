"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@trusanity/ui';
import { Sparkles, TrendingUp, AlertTriangle, Info } from 'lucide-react';

interface Insight {
    id: string;
    type: 'positive' | 'warning' | 'neutral';
    title: string;
    description: string;
    actionableAdvice: string;
}

import { fetchAiInsights } from '@/actions/ai';

export default function AiInsights() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadInsights = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchAiInsights();
            setInsights(data);
        } catch (err: any) {
            setError(err.message || 'Could not connect to the AI analysis engine.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, []);

    return (
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white overflow-hidden shadow-sm">
            <CardHeader className="pb-3 border-b border-indigo-50 bg-white/50">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            AI Insights
                        </CardTitle>
                        <CardDescription className="text-indigo-600/70">
                            Predictive analysis based on your recent traffic patterns.
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadInsights}
                        disabled={loading}
                        className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                        {loading ? 'Analyzing...' : 'Refresh'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="p-8 text-center text-indigo-400 animate-pulse flex flex-col items-center">
                        <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Generating intelligent insights...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 text-sm text-red-500 max-w-sm">{error}</div>
                ) : insights.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500">Not enough data to generate insights yet.</div>
                ) : (
                    <div className="divide-y divide-indigo-50">
                        {insights.map((insight) => (
                            <div key={insight.id} className="p-5 hover:bg-white/60 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-0.5 p-2 rounded-full ${insight.type === 'positive' ? 'bg-emerald-100 text-emerald-600' :
                                        insight.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                        {insight.type === 'positive' && <TrendingUp className="w-4 h-4" />}
                                        {insight.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                                        {insight.type === 'neutral' && <Info className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h4 className="text-sm font-semibold text-gray-900">{insight.title}</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
                                        <div className="mt-3 inline-block bg-white border border-indigo-100 px-3 py-2 rounded-md text-xs text-indigo-800 shadow-sm w-full">
                                            <span className="font-semibold mr-1">💡 Suggestion:</span>
                                            {insight.actionableAdvice}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
