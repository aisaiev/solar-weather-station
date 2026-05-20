import { useEffect, useMemo, useState } from 'react';
import { SensorDataPeriod } from './models/sensor-data-period.model';
import { SensorType } from './models/sensor-type.model';
import { ChartPoint } from './models/chart-point.model';
import SensorsDataService from '../../services/sensors-data/sensors-data.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, Brush, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const chartConfig: ChartConfig = {
  avg: { label: 'Average', color: 'var(--color-chart-1)' },
  min: { label: 'Min', color: 'var(--color-chart-1)' },
  max: { label: 'Max', color: 'var(--color-chart-1)' },
  spread: { label: 'Range', color: 'var(--color-chart-1)' },
};

function formatBucketDate(dateStr: string, period: SensorDataPeriod): string {
  const date = new Date(dateStr);
  switch (period) {
    case SensorDataPeriod.Day:
      return date.toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    case SensorDataPeriod.Week:
      return date.toLocaleString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    case SensorDataPeriod.Month:
      return date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        hour12: false,
      });
  }
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
      <p className="font-medium mb-1">{label}</p>
      <div className="space-y-0.5">
        <p className="text-muted-foreground">
          Avg: <span className="font-medium text-foreground">{d.avg}</span>
        </p>
        <p className="text-muted-foreground">
          Min: <span className="font-medium text-foreground">{d.min}</span>
        </p>
        <p className="text-muted-foreground">
          Max: <span className="font-medium text-foreground">{d.max}</span>
        </p>
      </div>
    </div>
  );
}

function SensorsDataChart() {
  const [sensorType, setSensorType] = useState<SensorType>(
    SensorType.Temperature,
  );
  const [sensorDataPeriod, setSensorDataPeriod] = useState<SensorDataPeriod>(
    SensorDataPeriod.Day,
  );
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  const { yDomain, bandBase } = useMemo(() => {
    if (!chartData.length) return { yDomain: [0, 1] as [number, number], bandBase: 0 };
    const allMin = Math.min(...chartData.map((d) => d.min));
    const allMax = Math.max(...chartData.map((d) => d.max));
    const range = allMax - allMin;
    const padding = Math.max(range * 0.1, 0.5);
    const domainMin = parseFloat((allMin - padding).toFixed(2));
    const domainMax = parseFloat((allMax + padding).toFixed(2));
    return {
      yDomain: [domainMin, domainMax] as [number, number],
      bandBase: domainMin,
    };
  }, [chartData]);

  useEffect(() => {
    const getSensorsData = async () => {
      setIsDataLoading(true);
      try {
        const { data } = await SensorsDataService.getAggregatedData(
          sensorDataPeriod,
          sensorType,
        );
        const formatted = data
          .filter((item) => item.avg != null)
          .map((item) => ({
            date: formatBucketDate(item.bucket, sensorDataPeriod),
            avg: Number(item.avg),
            min: Number(item.min),
            max: Number(item.max),
            spread: Number((item.max - item.min).toFixed(2)),
          }));
        setChartData(formatted);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    getSensorsData();
  }, [sensorType, sensorDataPeriod]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Tabs
                value={sensorType}
                onValueChange={(value) => setSensorType(value as SensorType)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                  {Object.values(SensorType).map((type) => (
                    <TabsTrigger key={type} value={type} className="text-xs sm:text-sm">
                      {type}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div>
              <Tabs
                value={sensorDataPeriod}
                onValueChange={(value) =>
                  setSensorDataPeriod(value as SensorDataPeriod)
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 h-auto">
                  {Object.values(SensorDataPeriod).map((period) => (
                    <TabsTrigger key={period} value={period} className="text-xs sm:text-sm">
                      {period}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className={isDataLoading ? 'opacity-50 select-none' : 'select-none'}>
            {chartData.length === 0 && !isDataLoading ? (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                No data available for this period
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillBand" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-chart-1)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-chart-1)"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={80}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={yDomain}
                    width={65}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {/* Shaded band from domain floor to max */}
                  <Area
                    type="monotone"
                    dataKey="max"
                    stroke="none"
                    fill="url(#fillBand)"
                    baseValue={bandBase}
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    isAnimationActive={false}
                  />
                  {/* Average line */}
                  <Area
                    type="monotone"
                    dataKey="avg"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    fill="none"
                    dot={false}
                    isAnimationActive={false}
                  />
                  {sensorDataPeriod !== SensorDataPeriod.Day && (
                    <Brush
                      dataKey="date"
                      height={24}
                      stroke="var(--color-chart-1)"
                      fill="hsl(var(--background))"
                      travellerWidth={6}
                      startIndex={0}
                    />
                  )}
                </AreaChart>
              </ChartContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SensorsDataChart;

