/// Ejemplo FACTURA A

var http = require('http');
var moment = require('moment');

const getRequest = (service, method, params) => {
  return new Promise((resolve, reject) => {
    const data = {
        "auth": {
        "key": "Auth",
        "token": "Token",
        "sign": "Sign"
      }
    }
    data['params'] = params

    const postData = JSON.stringify(data)
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/${service}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`[${service}/${method}] STATUS: ${res.statusCode}`);
      //console.log(`[${service}/${method}] HEADERS: ${JSON.stringify(res.headers)}`);
      let data = ""
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`[${service}/${method}] BODY: ${chunk}`);
        data += chunk
      });
      res.on('end', () => {
        console.log(`[${service}/${method}] No more data in response.`);
        try {
          const jj = JSON.parse(data);

          const {Errors} = jj;
          if (Errors) {
            reject( Errors )
          }

          resolve( jj )

        } catch (e) {

          console.error(`[${service}/${method}] DATA problems: ${e.message}`);
          reject( e )

        }
      });
    });

    req.on('error', (e) => {
      console.error(`[${service}/${method}] problem with request: ${e.message}`);
      reject(e)
    });

    // Write data to request body
    req.write(postData);
    req.end();
  })
}

/////////////////////////////////////////////////////////////////////
// Busca el ultimo comprobante para tipo 1 (FACTURA A) y PTO DE VENTA
const UltimoComprobante = async (cuit) => {
  const params = {
    "Auth": {
      "Cuit": cuit
    },
    "CbteTipo": 1,
    "PtoVta": "0002"
  }
  return await getRequest('wsfev1', 'FECompUltimoAutorizado', params)
}
//////////////////////////////////////////////////////////////////
// Genera factura
const FacturaA = (cuit, cbteNro) => {
  return new Promise((resolve, reject) => {
    const params = {
      "Auth": {
        "Cuit": cuit
      },

      "FeCAEReq": {

        "FeCabReq": {
           'CantReg' 		  : 1, // Cantidad de comprobantes a registrar
           'PtoVta' 		  : 2, // Punto de venta
           'CbteTipo' 		: 1, // Tipo de comprobante (ver tipos disponibles)
        },

        "FeDetReq": {
            "FECAEDetRequest": [
              {
              'Concepto' 		: 1, // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
              'DocTipo' 		: 80, // Tipo de documento del comprador (ver tipos disponibles)
              'DocNro' 		  : '20111111112', // Numero de documento del comprador
              'CbteDesde' 	: cbteNro, // Numero de comprobante o numero del primer comprobante en caso de ser mas de uno
              'CbteHasta' 	: cbteNro, // Numero de comprobante o numero del ultimo comprobante en caso de ser mas de uno
              'CbteFch' 		: moment().format('YYYYMMDD'), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
              'ImpTotal' 		: 189.3, // Importe total del comprobante
              'ImpTotConc' 	: 0,      // Importe neto no gravado
              'ImpNeto' 		: 150,    // Importe neto gravado
              'ImpOpEx' 		: 0,      // Importe exento de IVA
              'ImpIVA' 		  : 31.50,  //Importe total de IVA
              'ImpTrib' 		: 7.8,    //Importe total de tributos
              'FchServDesde' 	: null, // (Opcional) Fecha de inicio del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
              'FchServHasta' 	: null, // (Opcional) Fecha de fin del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
              'FchVtoPago' 	: null,   // (Opcional) Fecha de vencimiento del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
              'MonId' 		  : 'PES',  //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
              'MonCotiz' 		: 1,      // Cotización de la moneda usada (1 para pesos argentinos)
              'Tributos' 		: {
                'Tributo':[ // (Opcional) Tributos asociados al comprobante
                  {
                    'Id' 		  :  99, // Id del tipo de tributo (ver tipos disponibles)
                    'Desc' 		: 'Ingresos Brutos', // (Opcional) Descripcion
                    'BaseImp' : 150, // Base imponible para el tributo
                    'Alic' 		: 5.2, // Alícuota
                    'Importe' : 7.8 // Importe del tributo
                  }
                ],
              },
              'Iva' 			  : { // (Opcional) Alícuotas asociadas al comprobante
                'AlicIva': [
                  {
                    'Id' 		  : 5, // Id del tipo de IVA (ver tipos disponibles)
                    'BaseImp' : 150, // Base imponible
                    'Importe' : 31.5 // Importe
                  }
                ]
              },
            }
          ]
        }
      }
    };

    getRequest('wsfev1', 'FECAESolicitar', params).then(res => {
      const {FeDetResp: {FECAEDetResponse}} = res
      //console.log('en', FECAEDetResponse)
      if (FECAEDetResponse) {
        resolve(FECAEDetResponse)
      }
    }).catch( err => reject(err) )
  })
}

// ejecuta inmediato
(async () => {
  const cuit = '20205400703'

  UltimoComprobante(cuit).then( ultimo => {
    console.log('OTRO', ultimo)
    const {CbteNro} = ultimo;
    FacturaA(cuit, CbteNro + 1).then( factA => {
      console.log('FIN', factA)
      factA.forEach( fact => {
        if (fact['CAE'] && fact['CAEFchVto']) {
          console.log('CAE', fact['CbteDesde'], fact['CbteHasta'], fact['CAE'], fact['CAEFchVto'])
        }
        if (fact['Resultado'] && fact['Observaciones']) {
          console.log('OBS', fact['Observaciones'])
        }
      })

    }).catch( err => {
      console.error(err)
    });
  }).catch( err => {
    console.error(err)
  })

})()
