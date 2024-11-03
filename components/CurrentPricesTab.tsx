"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchRegionDetails } from "../utils/api";
import { useToast } from "@/hooks/use-toast"
type CurrentPricesTabProps = {
  regionCode: string;
  unit: string;
};

export const CurrentPricesTab = ({ regionCode, unit }: CurrentPricesTabProps) => {
  const today = new Date();
  const { toast } = useToast(); 
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [prices, setPrices] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const chartConfig: ChartConfig = {
    price: {
      label: `Price (${unit})`,
      color: "hsl(var(--chart-1))",
    },
  };

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const data = await fetchRegionDetails(regionCode, formattedDate, formattedDate);
        setPrices(data.price || []);
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate <= today) {
      fetchPrices();
    }
  }, [selectedDate, regionCode]);

  const chartData = prices.map((price, index) => ({
    hour: `${index}:00`,
    price,
  }));

  const handleDateChange = (date: Date | undefined) => {
    if (date && date <= today) {
      setSelectedDate(date);
    } else if (date) {
      // Show a toast notification
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a date that is today or earlier.",
      });
    }
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">

      {/* Date Picker */}
    <div className="mb-4 flex justify-center">
      <Popover>
        <PopoverTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} initialFocus />
        </PopoverContent>
      </Popover>
    </div>

      {/* Chart or Loading Skeleton */}
      {loading ? (
        <Skeleton className="h-80 w-full bg-blue-30 animate-pulse" />
      ) : (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full ">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            <Line dataKey="price" type="linear" stroke="blue" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      )}
    </div>
  );
};
