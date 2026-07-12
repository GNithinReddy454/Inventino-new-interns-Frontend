const fs = require('fs');
fetch('http://localhost:8080/api/products/69c5178fc05d538bc0ae1715').then(res => res.json()).then(data => fs.writeFileSync('product_test.json', JSON.stringify(data, null, 2)));
