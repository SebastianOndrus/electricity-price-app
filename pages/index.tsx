import Link from 'next/link';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRegionsPrices } from '../utils/api';
import { Input } from '@/components/ui/input';
import { Table, TableRow, TableHead, TableBody, TableCell, TableHeader } from '@/components/ui/table';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Defines the structure for each region price entry
type RegionPrice = {
  code: string;   // The code representing the region (e.g., 'AT' for Austria)
  name: string;   // Full name of the region (e.g., 'Austria')
  price: number;  // The current electricity price for the region
  unit: string;   // Unit of measurement for the price, typically 'EUR/MWh'
};

const Home: NextPage = () => {
  const router = useRouter(); // Used to programmatically navigate between pages
  const [searchTerm, setSearchTerm] = useState(''); // State for managing the search input
  const [minPrice, setMinPrice] = useState<number | ''>(''); // Minimum price filter
  const [maxPrice, setMaxPrice] = useState<number | ''>(''); // Maximum price filter
  const [sortOption, setSortOption] = useState<string>('name-asc'); // Default sorting option

  // Using React Query to fetch the prices of regions
  const { data, isLoading, error } = useQuery<RegionPrice[]>({
    queryKey: ['regionsPrices'],
    queryFn: fetchRegionsPrices,
    retry: 2, // Retries the request twice if it fails
  });
  
  // Filter the data based on the search term and price range
  const filteredData = data?.filter((entry) => {
    const matchesSearchTerm = entry.code.toLowerCase().includes(searchTerm.toLowerCase()) || entry.name.toLowerCase().includes(searchTerm.toLowerCase());
    const withinMinPrice = minPrice === '' || entry.price >= minPrice;
    const withinMaxPrice = maxPrice === '' || entry.price <= maxPrice;
    return matchesSearchTerm && withinMinPrice && withinMaxPrice;
  });

  // Sort the filtered data based on the selected option
  const sortedData = filteredData?.sort((a, b) => {
    if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
    if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-blue-800 mb-6 mt-8">Electricity Prices by Region</h1>

      {/* Filter and Search Section */}
      <div className="w-full max-w-3xl mb-6 flex flex-col items-center gap-4 ">
        
        {/* Search Field */}
        <Input
          placeholder="Search by region code or name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 px-4 border rounded-lg shadow-md"
        />

        {/* Price Range and Sort Options Row */}
        <div className="flex flex-wrap justify-center gap-8">
          
          {/* Price Range with Labels */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Set Price Range</span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-24 py-2 px-4 border rounded-lg text-sm shadow-md"
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-24 py-2 px-4 border rounded-lg text-sm shadow-md"
              />
            </div>
          </div>

          {/* Sorting with Label */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Sort By</span>
            <Select onValueChange={(value) => setSortOption(value)} defaultValue="name-desc">
              <SelectTrigger className="w-40 py-2 px-4 border rounded-lg text-sm shadow-md">
                <span>
                  {sortOption === 'name-asc' ? 'Name (A-Z)' : 
                   sortOption === 'name-desc' ? 'Name (Z-A)' :
                   sortOption === 'price-asc' ? 'Price (Low to High)' :
                   'Price (High to Low)'
                  }
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Separator between filters and table */}
      <Separator className="w-full max-w-3xl my-4" />

      {/* Loading and Error States */}
      {isLoading && (
        <div className="w-full max-w-3xl text-center"> {/* Centering container */}
          <p className="text-blue-500 mb-4">Loading data, please wait...</p> {/* Centered loading message */}
          
          {/* Header Skeleton */}
          <Skeleton className="h-8 mb-2 w-full bg-gray-300 animate-pulse" />
          
          {/* Row Skeletons */}
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-6 w-full mb-2 bg-gray-300 animate-pulse" />
          ))}
        </div>
      )}
      {error && (
        <p className="text-red-500">Error loading data. Please try again later.</p>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <div className="w-full max-w-3xl overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Region Name</TableHead>
                <TableHead className="w-[150px]">Region Code</TableHead>
                <TableHead className="text-right">Current Price (EUR/MWh)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData && sortedData.map((entry) => (
                <TableRow
                  key={entry.code}
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => router.push(`/${entry.code}`)} // Navigate on row click
                >
                  <TableCell className="font-medium">
                    <Link href={`/${entry.code}`} className="block w-full h-full">{entry.name}</Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/${entry.code}`} className="block w-full h-full">{entry.code}</Link>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <Link href={`/${entry.code}`} className="block w-full h-full">{entry.price.toFixed(2)}</Link>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Home;
