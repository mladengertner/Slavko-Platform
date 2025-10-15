
import React from 'react';
import { SkeletonCard } from './SkeletonCard';
import { MetricCard } from './MetricCard';
import { ClockIcon, AlertTriangleIcon, ActivityIcon, ZapIcon, BarChart2Icon, CheckCircle2Icon } from './icons';
import type { Metrics, MetricStatus } from '../types';

interface DeploymentMonitorProps {
  metrics: Metrics;
  status: MetricStatus;
  loading: boolean;
}

const DeploymentMonitor: React.FC<DeploymentMonitorProps> = ({ metrics, status, loading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          <MetricCard
            title="API Latency"
            value={`${metrics.latency.toFixed(0)}ms`}
            icon={<ClockIcon />}
            status={status.latency}
            description="API response time"
            progress={Math.min((metrics.latency / 1200) * 100, 100)}
            threshold="< 1000ms"
          />
          <MetricCard
            title="Error Rate"
            value={`${(metrics.errorRate * 100).toFixed(2)}%`}
            icon={<AlertTriangleIcon />}
            status={status.errorRate}
            description="Errors in last minute"
            progress={Math.min(metrics.errorRate * 10000, 100)}
            threshold="< 1%"
          />
          <MetricCard
            title="Request Rate"
            value={`${metrics.requestRate.toFixed(0)}/s`}
            icon={<ActivityIcon />}
            status="normal"
            description="Requests per second"
          />
          <MetricCard
            title="CPU Usage"
            value={`${metrics.cpuUsage.toFixed(0)}%`}
            icon={<ZapIcon />}
            status={status.cpuUsage}
            description="Total CPU load"
            progress={Math.min(metrics.cpuUsage, 100)}
            threshold="< 80%"
          />
          <MetricCard
            title="Memory Usage"
            value={`${metrics.memoryUsage.toFixed(0)}%`}
            icon={<BarChart2Icon />}
            status={status.memoryUsage}
            description="Total memory usage"
            progress={Math.min(metrics.memoryUsage, 100)}
            threshold="< 80%"
          />
          <MetricCard
            title="Active Alerts"
            value={metrics.activeAlerts.toString()}
            icon={
              metrics.activeAlerts > 0
                ? <AlertTriangleIcon />
                : <CheckCircle2Icon />
            }
            status={status.activeAlerts}
            description={
              metrics.activeAlerts === 0
                ? "All systems operational"
                : "Attention needed"
            }
          />
        </>
      )}
    </div>
  );
};

export default DeploymentMonitor;
