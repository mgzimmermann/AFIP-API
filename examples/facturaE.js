/// Ejemplo FACTURA A

var moment = require('moment');
var apiRequest = require('./apiRequest');
var random = require('random')

/////////////////////////////////////////////////////////////////////
// Busca el ultimo comprobante para tipo 1 (FACTURA A) y PTO DE VENTA
const UltimoComprobante = async (cuit) => {
  const params = {
    "Auth": {
      "Cuit": cuit,
      "Cbte_Tipo": 19,
      "Pto_venta": 3
    },
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

      "Cmp": {
         'Id' 		      : random.int(0,10000),    // Id de registro. OBS si existe va a traer el registro viejo de AFIP
         'Fecha_cbte'   : moment().format('YYYYMMDD'), // Fecha comprobante
         'Punto_vta' 		: 3,    // Punto de venta
         'Cbte_Tipo' 		: 19,   // Tipo de comprobante (19, 20 o 21)
         'Cbte_nro'     : cbteNro, // Nro de comprobante
         'Tipo_expo'    : 2,    // Tipo de expo (1 bienes, 2 servicios, 4 otro)
         'Dst_cmp'      : 225,  // Pais destino
         'Cliente'      : "JILO SRL",  // Apellido nombre o razon social
         'Cuit_pais_cliente': '55000000018', // CUIT pais destino
         'Domicilio_cliente': "Jerbacion 123, Montevideo",
         'Id_impositivo': '4123123', // Id impositivo. No obligatorio
         'Moneda_Id'    : 'DOL',
         'Moneda_ctz'   : 70.1570,  // Cotizacion de moneda
         'Imp_total'    : 100.0, // Importe total de operacion
         'Forma_pago'   : "CONTADO",
         'Fecha_pago'   : moment().add(5,'days').format('YYYYMMDD'),
         'Incoterms'    : "FOB",
         'Idioma_cbte'  : 1,  // Idioma (1 espanol 2 ingles 3 portugues)
         'Permiso_existente': '', // puede ser S, N o vacio
         'Items': [
           {
             'Item': {
               "Pro_codigo":'a123',
               "Pro_ds": "Servicio de informatica",
               //"Pro_qty": ,
               "Pro_umed": 0,
               "Pro_total_item": 99.0
             }
           },
           {
             'Item': {
               "Pro_codigo":'b123',
               "Pro_ds": "Servicio de informatica",
               //"Pro_qty": ,
               "Pro_umed": 0,
               "Pro_total_item": 100.0
             }
           }
         ]
      },
    }

    apiRequest('wsfexv1', 'FEXAuthorize', params).then(res => {
      console.log('FEX', res)
      const {FEXResultAuth, FEXErr} = res
      if (FEXErr['ErrMsg'] != 'OK') {
        reject(FEXErr)
      } else {
        resolve(FEXResultAuth)
      }
        //resolve(FECAEDetResponse)
      //}
    }).catch( err => reject(err) )
  })
}

// ejecuta inmediato
(async () => {
  const cuit = '20111111112'

  UltimoComprobante(cuit).then( ultimo => {
    console.log('OTRO', ultimo)
    const {FEXResult_LastCMP: {Cbte_nro}} = ultimo;
    const siguiente = Number(Cbte_nro) + 1;
    console.log('sig', siguiente)
    FacturaE(cuit, siguiente).then( res => {
      console.log('FAC', res)
    }).catch( err => {
      console.error('err', err)
    })

  }).catch( err => {
    console.error('err', err)
  })

})()
