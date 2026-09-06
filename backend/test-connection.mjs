// Test if TLS handshake completes independently of MongoDB auth
import tls from 'tls';

const host = 'ac-xqq0uov-shard-00-00.z2jyqo1.mongodb.net';
const port = 27017;

console.log(`Testing TLS handshake to ${host}:${port}...`);

const socket = tls.connect({ host, port, rejectUnauthorized: false }, () => {
  console.log('✅ TLS handshake SUCCEEDED');
  console.log('  Authorized:', socket.authorized);
  console.log('  Cipher:', socket.getCipher()?.name);
  const cert = socket.getPeerCertificate();
  console.log('  Cert Subject:', cert?.subject?.CN);
  socket.destroy();
  process.exit(0);
});

socket.on('error', (e) => {
  console.error('❌ TLS/TCP error:', e.message);
  process.exit(1);
});

socket.setTimeout(10000, () => {
  console.error('❌ TLS handshake TIMED OUT after 10s');
  socket.destroy();
  process.exit(1);
});
