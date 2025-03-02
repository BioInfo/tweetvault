import React from 'react';
import { BarChart as BarChartIcon, TrendingUp, Hash, Users, MessageCircle } from 'lucide-react';
import { Tweet } from '../types';

interface InsightsDashboardProps {
  tweets: Tweet[];
}

export default function InsightsDashboard({ tweets }: InsightsDashboardProps) {
  // Calculate engagement metrics
  const totalEngagement = tweets.reduce((total, tweet) => {
    return total + (tweet.metrics?.likes || 0) + (tweet.metrics?.retweets || 0) + (tweet.metrics?.replies || 0);
  }, 0);

  // Get unique topics and their counts
  const topicCounts = tweets.reduce((acc, tweet) => {
    tweet.aiTopics?.forEach(topic => {
      acc[topic] = (acc[topic] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Sort topics by frequency
  const sortedTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate engagement by day
  const engagementByDay = tweets.reduce((acc, tweet) => {
    const date = new Date(tweet.createdAt).toLocaleDateString();
    const engagement = (tweet.metrics?.likes || 0) + (tweet.metrics?.retweets || 0);
    acc[date] = (acc[date] || 0) + engagement;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<MessageCircle className="w-5 h-5 text-purple-600" />}
          label="Total Tweets"
          value={tweets.length}
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={<Hash className="w-5 h-5 text-blue-600" />}
          label="Unique Topics"
          value={Object.keys(topicCounts).length}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-green-600" />}
          label="Total Engagement"
          value={totalEngagement}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
          label="Avg. Engagement"
          value={Math.round(totalEngagement / tweets.length)}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Topics Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Top Topics</h3>
          <BarChartIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {sortedTopics.map(([topic, count]) => (
            <div key={topic}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{topic}</span>
                <span className="text-gray-500">{count} tweets</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{
                    width: `${(count / tweets.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Engagement Timeline</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-48 flex items-end justify-between gap-2">
          {Object.entries(engagementByDay).map(([date, count]) => {
            const height = `${(count / Math.max(...Object.values(engagementByDay))) * 100}%`;
            return (
              <div key={date} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-indigo-100 rounded-t-lg relative group"
                  style={{ height }}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {count} engagements
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
}

function StatCard({ icon, label, value, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-xl font-semibold text-gray-900">{value.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}