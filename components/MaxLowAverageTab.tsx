"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchRegionDetails } from "../utils/api";
import { useToast } from "@/hooks/use-toast";

type MaxLowAverageTabProps = {
  regionCode: string;
  unit: string;
};

export const MaxLowAverageTab = ({ regionCode, unit }: MaxLowAverageTabProps) => {
  const today = new Date();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>(new Date(today.setDate(today.getDate() - 10))); // Default to 10 days ago
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<{ date: string; max: number; min: number; avg: number }[]>([]);

  const chartConfig: ChartConfig = {
    max: { label: `Max Price (${unit})`, color: "hsl(var(--chart-1))" },
    min: { label: `Min Price (${unit})`, color: "hsl(var(--chart-2))" },
    avg: { label: `Average Price (${unit})`, color: "hsl(var(--chart-3))" },
  };

  useEffect(() => {
    const fetchPricesForRange = async () => {
      setLoading(true);
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");
  
      try {
        const data = await fetchRegionDetails(regionCode, formattedStartDate, formattedEndDate);
  
        // Calculate daily max, min, and avg prices
        const tempChartData = [];
        let currentDate = new Date(startDate);
  
        while (currentDate <= endDate) {
          const dayIndex = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const dailyPrices = data.price.slice(dayIndex * 24, (dayIndex + 1) * 24);
          const validPrices = dailyPrices.filter((price: number) => typeof price === 'number' && !isNaN(price));
  
          if (validPrices.length > 0) {
            const max = Math.max(...validPrices);
            const min = Math.min(...validPrices);
            const avg = validPrices.reduce((sum: number, price: number) => sum + price, 0) / validPrices.length;
  
            tempChartData.push({
              date: format(new Date(currentDate), "yyyy-MM-dd"),
              max,
              min,
              avg,
            });
          }
  
          // Move to the next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
  
        setChartData(tempChartData);
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };
  
    if (startDate <= endDate) {
      fetchPricesForRange();
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
        console.log("Trying set day to: ", date, "today is: ", today);
 
      toast({
        variant: "destructive",
        title: "Invalid End Date",
        description: "End date must be today or earlier and after the start date.",
      });
    }
  };

  return (
    <div className="flex justify-center mt-4 p-4 bg-blue-50 rounded-lg">
      <div className="w-full max-w-4xl">
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
        ) : chartData.length === 0 ? (
          <p className="text-center text-gray-500">No data available for the selected date range.</p>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <LineChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line dataKey="max" type="monotone" stroke="blue" strokeWidth={2} dot={false} />
              <Line dataKey="min" type="monotone" stroke="red" strokeWidth={2} dot={false} />
              <Line dataKey="avg" type="monotone" stroke="black" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
};
