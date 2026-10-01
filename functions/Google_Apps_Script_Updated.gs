// Nombre del archivo: Code.gs
// Este es el script actualizado con soporte para leer datos (doGet) y escribir datos (doPost)

function doPost(e) {
  try {
    // Obtener los datos del POST
    const data = JSON.parse(e.postData.contents);

    // ID de tu Google Sheet (obtén de la URL)
    const SHEET_ID = '1AZsOGPn9la37_Pqq6zRy3f9E8gaFFlkMl4djKnqGij4';
    const SHEET_NAME = 'Tarjetas'; // Nombre de la pestaña

    // Abrir el sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    // Fila donde están los TOTALES (ajusta el número según tu hoja)
    const TOTAL_ROW = 47; // Cambiar si es diferente

    // Mapeo de tarjetas a columnas (ajusta según tu hoja)
    const columnMap = {
      'BBVA': 2,        // Columna B
      'Liverpool': 3,   // Columna C
      'MP': 4,          // Columna D
      'PDH': 5,         // Columna E
      'Efectivo': 6     // Columna F
    };

    // Actualizar cada tarjeta en la fila TOTAL
    for (const [tarjeta, columna] of Object.entries(columnMap)) {
      if (data[tarjeta] !== undefined) {
        sheet.getRange(TOTAL_ROW, columna).setValue(data[tarjeta]);
      }
    }

    // Retornar respuesta de éxito
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Datos sincronizados correctamente',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error en doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // ID de tu Google Sheet
    const SHEET_ID = '1AZsOGPn9la37_Pqq6zRy3f9E8gaFFlkMl4djKnqGij4';
    const SHEET_NAME = 'Tarjetas';

    // Abrir el sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    // Fila donde están los TOTALES
    const TOTAL_ROW = 47;

    // Mapeo de tarjetas a columnas
    const columnMap = {
      'BBVA': 2,
      'Liverpool': 3,
      'MP': 4,
      'PDH': 5,
      'Efectivo': 6
    };

    // Leer los valores actuales
    const datos = {
      success: true,
      timestamp: new Date().toISOString()
    };

    for (const [tarjeta, columna] of Object.entries(columnMap)) {
      const valor = sheet.getRange(TOTAL_ROW, columna).getValue();
      datos[tarjeta] = typeof valor === 'number' ? valor : parseFloat(valor) || 0;
    }

    // JSONP callback
    const callback = e.parameter.callback || 'callback';
    const jsonp = callback + '(' + JSON.stringify(datos) + ')';

    // Retornar JSONP
    return ContentService.createTextOutput(jsonp)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    Logger.log('Error en doGet: ' + error);
    const callback = e.parameter.callback || 'callback';
    const errorData = JSON.stringify({
      success: false,
      error: error.toString()
    });
    return ContentService.createTextOutput(callback + '(' + errorData + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Prueba de doGet (ejecuta esto en el editor para verificar)
function testDoGet() {
  const resultado = doGet({});
  Logger.log(resultado.getContent());
}

// Prueba de doPost (ejecuta esto en el editor para verificar)
function testDoPost() {
  const datosTest = {
    BBVA: 50000,
    PDH: 15000,
    MP: 8000,
    Liverpool: 1500,
    Efectivo: 5000
  };

  const evento = {
    postData: {
      contents: JSON.stringify(datosTest)
    }
  };

  const resultado = doPost(evento);
  Logger.log(resultado.getContent());
}
