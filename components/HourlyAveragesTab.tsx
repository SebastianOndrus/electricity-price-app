"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchRegionDetails } from "../utils/api";
import { useToast } from "@/hooks/use-toast";

type HourlyAveragesTabProps = {
  regionCode: string;
  unit: string;
};

export const HourlyAveragesTab = ({ regionCode, unit }: HourlyAveragesTabProps) => {
  const today = new Date();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>(new Date(today.setDate(today.getDate() - 10)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [hourlyAverages, setHourlyAverages] = useState<{ hour: string; avgPrice: number }[]>([]);

  const chartConfig: ChartConfig = {
    avgPrice: { label: `Avg Price (${unit})`, color: "hsl(var(--chart-3))" },
  };

  useEffect(() => {
    const fetchHourlyAverages = async () => {
      setLoading(true);
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      try {
        const data = await fetchRegionDetails(regionCode, formattedStartDate, formattedEndDate);
        
        const hourlyData = Array(24).fill(0).map(() => ({ sum: 0, count: 0 }));
        
        data.price.forEach((price: number, idx: number) => {
          const hour = idx % 24;
          hourlyData[hour].sum += price;
          hourlyData[hour].count += 1;
        });
        
        const avgHourlyData = hourlyData.map((hourData, hour) => ({
          hour: `${hour}:00`,
          avgPrice: hourData.count ? Math.round((hourData.sum / hourData.count) * 100) / 100 : 0,
        }));

        setHourlyAverages(avgHourlyData);
      } catch (error) {
        console.error("Error fetching hourly averages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (startDate <= endDate) {
      fetchHourlyAverages();
    }
  }, [startDate, endDate, regionCode]);

  const handleStartDateChange = (date: Date | undefined) => {
    if (date && date <= endDate && date <= new Date()) {
      setStartDate(date);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Start Date",
        description: "Start date must be today or earlier and before the end date.",
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date && date >= startDate && date <= new Date()) {
      setEndDate(date);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid End Date",
        description: "End date must be today or earlier and after the start date.",
      });
    }
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      {/* Date Pickers */}
      <div className="flex flex-wrap gap-4 mb-4 justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2" />
              {startDate ? format(startDate, "PPP") : <span>Select Start Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2" />
              {endDate ? format(endDate, "PPP") : <span>Select End Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={endDate} onSelect={handleEndDateChange} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      {/* Chart or Loading Skeleton */}
      {loading ? (
        <Skeleton className="h-80 w-full bg-blue-30 animate-pulse" />
      ) : hourlyAverages.length === 0 ? (
        <p className="text-center text-blue-30">No data available for the selected date range.</p>
      ) : (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={hourlyAverages} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="avgPrice" fill="blue" radius={8}>
            <LabelList
              position="top"
              offset={10}
              fontSize={12}
              formatter={(value: number) => value.toFixed(2)} // Explicitly typing value as number
            />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
};
