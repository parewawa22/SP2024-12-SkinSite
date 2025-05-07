import mysql from 'mysql2/promise';
import { dbConfig } from '../account/api_account';

export default async function handler(req, res) {
    const { accId } = req.query;
    
    console.log('Received accId:', accId);

    if (!accId || accId === 'null') {
        return res.status(400).json({ 
            success: false, 
            error: 'Valid account ID is required' 
        });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            `SELECT ac.sktid, st.sktName 
             FROM account_skin ac
             JOIN SkinType st ON ac.sktid = st.skt_id
             WHERE ac.acc_id = ?
             OR ac.acc_id = ?`, 
            [accId, accId.replace('ACC', '')]
        );

        console.log('Query results:', rows); 

        if (rows.length === 0) {
            console.warn(`No skin type found for account ID: ${accId}`);
            return res.status(200).json({
                success: true,
                skinType: 'Normal',  
                skinTypeId: null,
                accountId: accId
            });
        }

        res.status(200).json({
            success: true,
            skinType: rows[0].sktName,
            skinTypeId: rows[0].sktid,
            accountId: accId
        });

    } catch (error) {
        console.error('Error fetching skin type:', error);
        res.status(500).json({ 
            success: false, 
            error: `Failed to fetch skin type: ${error.message}` 
        });
    } finally {
        if (connection) await connection.end();
    }
}