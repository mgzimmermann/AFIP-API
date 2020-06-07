
# AFIP API simplificada  

La función principal de este API es simplificar el acceso a los WebServices de AFIP y principalmente Factura Electrónica.

Una vez configurado el servicio con los certificados correspondientes del usuario contribuyente, este API expone los servicios y métodos de la AFIP, gestionando el token de acceso y su regeneración. El sistema que consuma este API lo hace con JSON con el mismo schema que los servicios de la AFIP.

[Documentacion de WebService de facturacion](https://www.afip.gob.ar/ws/documentacion/ws-factura-electronica.asp)

### Pasos para hacer funcionar el API  
0) Para generar los certificados y darse de alta en el Servicio de Homologación (Pruebas) usar esta web: [AFIP WS](http://www.afip.gob.ar/ws)  
1) Desde el root ```npm install```  
2) Desde el root correr ```./tools/keygen.sh /C=AR/O=Nombre Desarrollador/CN=Nombre Desarrollador/serialNumber=CUIT 00000000000```  
3) Correr la app  
3a) Para Homologación: ```HOMO=true node server.js```  
3b) Para Producción: ```node server.js```    


### Ejemplos via POSTMAN  
> Para probar los endpoints que genera el API se proveen ejemplos con el API WSFEv1 mediante postman (Descarga: https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop )  

1) Luego de descargar Postman importar el archivo que se encuentra en la carpeta "postman"  
2) Para aquellos Endpoints que requiren CUIT Revisar los parametros Body y cambiar CUIT  

### Ejemplos via CURL y JSON

> Ejemplos utilizando parametros escritos en JSON:

```curl -H "Content-Type: application/json" --data '{"auth":{"key": "Auth"}, "params":{"Auth": {"Cuit": "00000000000"}}}' http://localhost:3000/api/wsfev1/FEDummy```

devuelve:
```{"AppServer":"OK","DbServer":"OK","AuthServer":"OK"}```

Un llamado más interesante (reemplazando el Cuit con el cuit correspondiente
  al certificado):

```
curl -H "Content-Type: application/json" --data \
  '{"auth":{"key": "Auth", "token":"Token", "sign":"Sign"},
  "params":{"Auth": {"Cuit": "00000000000"}, "CbteTipo":1, "PtoVta": "0002"}}' \
  http://localhost:3000/api/wsfev1/FECompUltimoAutorizado
```

Si da error de validacion de token:
```
"Err": [
            {
                "Code": 600,
                "Msg": "ValidacionDeToken: No validaron las fechas del token GenTime, ExpTime, NowUTC: 1591443148 (6/6/2020 11:31:58 AM), 1591486408 (6/6/2020 11:33:28 PM), 6/7/2020 12:44:12 AM"
            }
        ]
```

se puede acceder al endpoint "api/wsfev1/refresh/token" via POST para regenerar el token:
```
curl --data "" http://localhost:3000/api/wsfev1/refresh/token
```

Ejemplos con node se puede encontrar en la carpeta /examples.



 ### Cómo funcionan los endpoints  
 > La idea del API es hacer genéricas las llamadas y preservar la autenticación obtenida  

 1) Describir todos los metodos del endpoint: ```/api/aqui_servicio/describe```. Ej. de Servicio: ```wsfev1```  
 2) Para realizar llamado ```/api/aqui_servicio/aqui_metodo```  
 2a) Servicio: ```wsfev1```  
 2b) Método: ```FEDummy```. Puede ser cualquiera de los obtenidos mediante describe.


Versiones:

__0.7.0:__  
- Se elimina Express y se lo reemplaza por Restana para mayor performance.
- Se agrega un handler para poder ser usado en ambientes serverless ( Requiere cambiar el servicio de Cache en estos ambientes )
- La cache se basa en archivos y no librerias externas.
- Se elimina Lodash.
- El cambio a Restana permite utilizar HTTPS y HTTP/2
- Mejoras en algunos métodos basadas en NodeJS 10+.
- Se cambia la versión de Node a 10 como mínimo.
- Se elimina la necesidad de Node-GYP
