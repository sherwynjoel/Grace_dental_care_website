const http = require('http');

http.get('http://localhost:7788/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const idx = data.indexOf('dhs__ring');
    if (idx !== -1) {
      console.log('FOUND ON SERVER:');
      console.log(data.substring(idx - 50, idx + 250));
    } else {
      console.log('NOT FOUND ON SERVER');
    }
  });
}).on('error', err => {
  console.error('Error fetching: ', err);
});
