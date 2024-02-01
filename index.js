const http = require('http');
const https = require('https');
const { parse } = require('url');
const { StringDecoder } = require('string_decoder');

const server = http.createServer((req, res) => {
  const { pathname } = parse(req.url, true);

  if (pathname === '/getTimeStories' && req.method === 'GET') {
    const options = {
      hostname: 'time.com',
      path: '/',
      method: 'GET',
    };

    const request = https.request(options, (response) => {
      const decoder = new StringDecoder('utf-8');
      let htmlDocument = '';

      response.on('data', (element) => {
        htmlDocument += decoder.write(element);
      });
      
      response.on('end', () => {
        htmlDocument += decoder.end();

        const Regex = /<li class="latest-stories__item">.*?<a href="(.*?)">.*?<h3 class="latest-stories__item-headline">(.*?)<\/h3>.*?<\/a>.*?<\/li>/gs;

        const items = [];
        let matchedContent;
        while ((matchedContent = Regex.exec(htmlDocument)) !== null) {
          const link = matchedContent[1];
          const title = matchedContent[2];
          //console.log(matchedContent[0]);
          items.push({ title, link });
        }

        const latestStories = items.slice(0, 6);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(latestStories));
      });
    });
    
    request.on('error', (error) => {
      console.error('Error while fetching latest stories:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server Error' }));
    });

    request.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Page Not Found' }));
  }
});

const port = 3100;
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/getTimeStories`);
});

