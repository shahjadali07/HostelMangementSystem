const http = require('http');

const data = JSON.stringify({
  email: 'test@gmail.com',
  otp: '123456'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/verify-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let responseData = '';
  res.on('data', d => {
    responseData += d;
  });
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
