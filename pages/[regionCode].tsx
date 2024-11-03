"use client";

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { fetchRegionDetails } from '../utils/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrentPricesTab } from '@/components/CurrentPricesTab';
import { MaxLowAverageTab } from '@/components/MaxLowAverageTab';
import { HourlyAveragesTab } from '@/components/HourlyAveragesTab';
import { LineChart, BadgeInfo, CalendarSearch } from "lucide-react";
import { Button } from '@/components/ui/button';
import { format } from "date-fns";


type HeaderProps = {
  title: string; // Title of the tab
  description: string; // Description of the tab
  icon: React.ReactNode; // Icon for the tab
};

// Component for the header of each tab
const TabHeader: React.FC<HeaderProps> = ({ title, description, icon }) => (
  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg shadow-md mb-4">
    <div className="text-blue-600">{icon}</div>
    <div>
      <h2 className="text-2xl font-semibold text-blue-800">{title}</h2>
      <p className="text-sm text-blue-500">{description}</p>
    </div>
  </div>
);

// Page component for the region detail page
const RegionDetailPage = () => {
  const router = useRouter();
  const { regionCode } = router.query;
  const currentDate = format(new Date(), 'yyyy-MM-dd'); // Current date in 'yyyy-MM-dd' format

  const { data, isLoading, error } = useQuery({
    queryKey: ['regionDetails', regionCode],
    queryFn: () => fetchRegionDetails(regionCode as string, currentDate, currentDate),
    enabled: !!regionCode,
  });

  // Display loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
        {/* Back Button */}
        <div className="w-full max-w-3xl flex justify-start mb-4">
          <Button variant="outline" onClick={() => router.push('/')} className="text-blue-500 font-medium shadow-md hover:bg-blue-50">
            &larr; Back to Main Page
          </Button>
        </div>
        <h1 className="text-4xl font-bold text-blue-800 mb-4">... - Detailed prices</h1>
        <p className="text-blue-500 mb-4">Loading region details...</p>
        <Skeleton className="h-20 w-full max-w-3xl p-4 bg-blue-100 animate-pulse rounded-lg shadow-md mb-4" />
      </div>
    );
  }

  // Display error message if data fetching fails
  if (error) {
    return <p className="text-red-500">Error loading region details. Please try again later.</p>;
  }

  // Display error message if region details not found
  if (!data) {
    return <p className="text-red-500">Region details not found.</p>;
  }

  // Display region details if data is available
  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      {/* Back Button */}
      <div className="w-full max-w-3xl flex justify-start mb-4">
        <Button variant="outline" onClick={() => router.push('/')} className="text-sm text-blue-500 font-small shadow-md hover:bg-blue-50">
          &larr; Back to Main Page
        </Button>
      </div>

      <h1 className="text-4xl font-bold text-blue-800 mb-4">{data.regionName} - Detailed prices</h1>

      <div className="w-full flex justify-center">
        <Tabs defaultValue="currentPrices" className="w-full max-w-3xl">
          <div className="flex justify-center">
            <TabsList className="shadow-md bg-white">
              <TabsTrigger value="currentPrices">Daily Prices</TabsTrigger>
              <TabsTrigger value="dailyHighLowAvg">High/Low/Average</TabsTrigger>
              <TabsTrigger value="hourlyAverages">Hourly Averages</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="currentPrices">
            <TabHeader title="Daily Prices" description="Hourly prices for the selected date." icon={<CalendarSearch size={24} />} />
            <CurrentPricesTab regionCode={regionCode as string} unit={data.unit} />
          </TabsContent>

          <TabsContent value="dailyHighLowAvg">
            <TabHeader title="Highs/Lows/Averages" description="View high, low, and average prices over a custom date range." icon={<LineChart size={24} />} />
            <MaxLowAverageTab regionCode={regionCode as string} unit={data.unit} />
          </TabsContent>

          <TabsContent value="hourlyAverages">
            <TabHeader title="Hourly Averages" description="Average prices by hour over a custom date range." icon={<LineChart size={24} />} />
            <HourlyAveragesTab regionCode={regionCode as string} unit={data.unit} />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default RegionDetailPage;
