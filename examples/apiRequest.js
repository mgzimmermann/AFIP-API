var http = require('http');

const apiRequest = (service, method, params) => {
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
          const jj = data ? JSON.parse(data) : {};

          const {Errors} = jj;
          if (Errors) {
            reject( Errors )
          }

          resolve( jj )

        } catch (e) {

          console.error(`[${service}/${method}] JSON parser problems: ${data} ${e.message}`);
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

module.exports = apiRequest
