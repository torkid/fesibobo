// api/pay.js - Vercel Serverless Function
const axios = require('axios');

const API_KEY = "sv5YWe1oG-UtuxHtlTaC5ilIai9CWQufO3uwtoZtqpwwmZUWncric2JICY9diemFiue1XRNaiPnDgQtjxTqEFg";
const GROUP_PRICE = 1000;
const API_URL = "https://zenoapi.com/api/payments/mobile_money_tanzania";

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone } = req.body;

    // Basic validation for the phone number
    if (!phone || !(phone.startsWith('07') || phone.startsWith('06')) || phone.length !== 10) {
        return res.status(400).json({
            message_title: "Namba si sahihi",
            message_body: "Tafadhali rudi mwanzo uweke namba sahihi ya simu, mfano: 07xxxxxxxx.",
            status: "Error",
            reference: "N/A"
        });
    }

    const transaction_reference = `WPGRP-${Date.now()}`;

    // Payload for the ZenoPay API
    const payload = {
        "order_id": transaction_reference,
        "buyer_name": "Mteja Wa Penzi",
        "buyer_email": "malipo@penzishata.com",
        "buyer_phone": phone,
        "amount": GROUP_PRICE
    };

    // Headers for authentication
    const headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    };

    try {
        // Send the request to ZenoPay
        const response = await axios.post(API_URL, payload, { headers });

        console.log("ZenoPay API Response:", response.data);

        // Check the response from ZenoPay
        if (response.data && response.data.status === 'success') {
            res.json({
                message_title: "Angalia Simu Yako!",
                message_body: "Tumekutumia ombi la malipo. Tafadhali weka namba yako ya siri kuthibitisha.",
                status: "Inasubiri uthibitisho",
                reference: transaction_reference
            });
        } else {
            res.status(400).json({
                message_title: "Ombi la Malipo Halikufanikiwa",
                message_body: response.data.message || "Hatukuweza kutuma ombi la malipo.",
                status: "Imeshindwa",
                reference: transaction_reference
            });
        }
    } catch (error) {
        console.error("An error occurred:", error.response ? error.response.data : error.message);
        res.status(500).json({
            message_title: "Hitilafu ya Mfumo",
            message_body: "Samahani, kumetokea tatizo la kimfumo. Tafadhali jaribu tena baadae.",
            status: "Error",
            reference: transaction_reference
        });
    }
}
