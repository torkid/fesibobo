// api/check-status.js - Vercel Serverless Function
const axios = require('axios');

const API_KEY = "sv5YWe1oG-UtuxHtlTaC5ilIai9CWQufO3uwtoZtqpwwmZUWncric2JICY9diemFiue1XRNaiPnDgQtjxTqEFg";

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { order_id } = req.query;

    if (!order_id) {
        return res.status(400).json({ status: 'ERROR', message: 'Order ID is required' });
    }

    const statusUrl = `https://zenoapi.com/api/payments/order-status?order_id=${order_id}`;

    // Headers for authentication
    const headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    };

    try {
        const response = await axios.get(statusUrl, { headers });
        console.log("ZenoPay Status Response:", JSON.stringify(response.data));

        // Parse the response to find the status
        let status = 'PENDING';

        if (response.data && response.data.data && response.data.data.length > 0) {
            const paymentStatus = response.data.data[0].payment_status;
            if (paymentStatus === 'COMPLETED') {
                status = 'COMPLETED';
            } else if (paymentStatus === 'FAILED') {
                status = 'FAILED';
            }
        }

        res.json({ status });

    } catch (error) {
        console.error("Error checking status:", error.response ? error.response.data : error.message);
        res.json({ status: 'PENDING' });
    }
}
