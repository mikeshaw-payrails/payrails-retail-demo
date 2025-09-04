import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const payrailsApiUrl = 'https://demo-api.staging.payrails.io';

app.use(express.json());

const allowedOrigins = ['http://localhost:8080']; // Add other origins as needed

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const getAccessToken = async () => {
  try {
    const response = await axios.post(`${payrailsApiUrl}/auth/token/${process.env.CLIENT_ID}`, {}, {
      headers: {
        'x-api-key': `${process.env.API_KEY}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
};

// Endpoint to initialize the Payrails client SDK
app.post('/api/initialize', async (req, res) => {
  try {

    // Get an access token to be able to call the Payrails API
    const accessToken = await getAccessToken();

    // Create a the payload to generate the Payrails DropIn Component for the UI
    const payrailsPayload = {
        type: "dropIn", 
        holderReference: "customer_123456789", // Fake the Customer ID as this is a demo
        workflowCode: "payment-acceptance",
        merchantReference: "order_123456789", // Fake the Merchant Reference as this is a demo
        amount: {
            value: req.body.value,
            currency: req.body.currency
        }, 
        workspaceId: process.env.PAYRAILS_WORKSPACE_ID
    }

    console.log("Access Token:", accessToken);

    // Call the Payrails API to initialize the DropIn component
    const response = await axios.post(`${payrailsApiUrl}/merchant/client/init`, JSON.stringify(payrailsPayload), {
      headers: {
        'Content-Type': 'application/json',
        'x-idempotency-key': uuidv4(),
        'Authorization': `Bearer ${accessToken}`
      },
    });

    // Return the Client Configuration
    res.status(response.status).json(response.data);
    
  } catch (error: any) {
    console.error('Error fetching access token:', error);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || null,
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// axios.interceptors.request.use(request => {
//   console.log('Starting Request:', request);
//   return request;
// });

// axios.interceptors.response.use(response => {
//   console.log('Response:', response);
//   return response;
// }, error => {
//   console.error('Error Response:', error.response);
//   return Promise.reject(error);
// });
