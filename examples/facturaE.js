/// Ejemplo FACTURA A

var moment = require('moment');
var apiRequest = require('./apiRequest');

/////////////////////////////////////////////////////////////////////
// Busca el ultimo comprobante para tipo 1 (FACTURA A) y PTO DE VENTA
const UltimoComprobante = async (cuit) => {
  const params = {
    "Auth": {
      "Cuit": cuit
    },
    "CbteTipo": 1,
    "PtoVta": "0003"
  }
  return await apiRequest('wsfexv1', 'FEXGetLast_CMP', params)
}

//////////////////////////////////////////////////////////////////
// Genera factura
const FacturaE = (cuit, cbteNro) => {
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

    apiRequest('wsfev1', 'FECAESolicitar', params).then(res => {
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
  const cuit = '20111111112'

  UltimoComprobante(cuit).then( ultimo => {
    console.log('OTRO', ultimo)
    const {CbteNro} = ultimo;
  }).catch( err => {
    console.error(err)
  })

})()
