const { google } = require('googleapis');

// Configuración
const SHEET_ID = '1AZsOGPn9la37_Pqq6zRy3f9E8gaFFlkMl4djKnqGij4';
const SHEET_NAME = 'Tarjetas';
const TOTAL_ROW = 47;

// Mapeo de tarjetas a columnas
const columnMap = {
  'BBVA': 'B',
  'Liverpool': 'C',
  'MP': 'D',
  'PDH': 'E',
  'Efectivo': 'F'
};

// Crear cliente de autenticación
function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// Leer datos desde Google Sheets
async function readFromSheets() {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const range = `${SHEET_NAME}!B${TOTAL_ROW}:F${TOTAL_ROW}`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: range,
    });

    const values = response.data.values[0] || [];

    return {
      success: true,
      BBVA: parseFloat(values[0]) || 0,
      Liverpool: parseFloat(values[1]) || 0,
      MP: parseFloat(values[2]) || 0,
      PDH: parseFloat(values[3]) || 0,
      Efectivo: parseFloat(values[4]) || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error leyendo desde Google Sheets:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Escribir datos en Google Sheets
async function writeToSheets(data) {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      [
        data.BBVA || 0,
        data.Liverpool || 0,
        data.MP || 0,
        data.PDH || 0,
        data.Efectivo || 0
      ]
    ];

    const range = `${SHEET_NAME}!B${TOTAL_ROW}:F${TOTAL_ROW}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: { values },
    });

    return {
      success: true,
      message: 'Datos sincronizados correctamente',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error escribiendo en Google Sheets:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handler de Netlify Function
exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Manejar OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // GET: Leer datos desde Google Sheets
    if (event.httpMethod === 'GET') {
      const result = await readFromSheets();
      return {
        statusCode: result.success ? 200 : 400,
        headers,
        body: JSON.stringify(result)
      };
    }

    // POST: Escribir datos a Google Sheets
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const result = await writeToSheets(data);

      return {
        statusCode: result.success ? 200 : 400,
        headers,
        body: JSON.stringify(result)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};