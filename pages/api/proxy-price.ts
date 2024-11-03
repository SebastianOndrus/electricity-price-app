// import type { NextApiRequest, NextApiResponse } from 'next';
// import axios from 'axios';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { bzn, start, end } = req.query; // Get region code and date range from query parameters

//   try {
//     // Forward the request to the external API with date parameters
//     const response = await axios.get(`https://api.energy-charts.info/price`, {
//       params: {
//         bzn,    // Region code
//         start,  // Start date
//         end,    // End date
//       },
//     });

//     // Send the response data back to the client
//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error("Error fetching data from energy-charts API:", error);
//     res.status(500).json({ message: 'Failed to fetch region data' });
//   }
// }
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { bzn, start, end } = req.query;

  try {
    const response = await axios.get(`https://api.energy-charts.info/price`, {
      params: { bzn, start, end },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }), // Disable SSL verification because the API had an expired certificate at the time of writing
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching data from energy-charts API:", error);
    res.status(500).json({ message: 'Failed to fetch region data' });
  }
}
