const http = require('http');
// const path = require('path');
const url = require('url');
const fs = require('fs');

let jokesDB = [];

const PORT = 3000;
const HOSTNAME = 'localhost';

// const parsedUrl = url.parse(req.url, true);
const requestHandler = function (req, res) {
  const parsedUrl = url.parse(req.url, true);
  res.setHeader('Content-Type', 'application/json');

  if (parsedUrl.pathname  === '/' && req.method === 'GET') {
    getAllJokes(req, res);
  } else if (parsedUrl.pathname  === '/' && req.method === 'POST') {
    addJoke(req, res);
  } else if (parsedUrl.pathname  === '/joke' && req.method === 'PUT') {
    updateJoke(req, res);
  } else if (parsedUrl.pathname .startsWith('/joke') && req.method === 'DELETE') {
    deleteJoke(req, res);
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({
      message: 'Invalid request method ' 
    }));
  }
};

// Retrieves all Jokes ===> GET /
const getAllJokes = function (req, res) {
  fs.readFile(parsedUrl.pathname , "utf-8", function (err, jokes) {
    if (err) {
      console.log(err)
      req.writeHead(400)
      res.end('An error has occurred')
    }

    res.end(jokes);
  });
};


// Create a Joke ==> POST: /jokes
const addJoke = function (req, res) {
  const jokes = [];

  req.on('data', (chunk) => {
    jokes.push(chunk);
  });

  req.on('end', () => {
    const parsedJoke = Buffer.concat(jokes).toString();
    const newJoke = JSON.parse(parsedJoke);

    const lastJoke = jokesDB[jokesDB.length - 1];
    const lastJokeId = lastJoke.id;
    newJoke.id = lastJokeId + 1;

     //save to db
     jokesDB.push(newJoke);
     fs.writeFile(parsedUrl.pathname , JSON.stringify(jokesDB), (err) => {
         if (err) {
             console.log(err);
             res.writeHead(500);
             res.end(JSON.stringify({
                 message: 'Internal Server Error. Could not save joke to database.'
             }));
         }

         res.end(JSON.stringify(newJoke));
     });
  
  });

}

  // UPDATE A BOOK ==> PUT: /books
  const updateJoke = function (req, res) {
    const jokes = [];
  
    req.on('data', (chunk) => { // data event is fired when the server receives data from the client
        joke.push(chunk); // push each data received to the joke array
    });
  
    req.on('end', () => {
      const parsedJoke = Buffer.concat(jokes).toString(); // concatenate raw data into a single buffer string
      
        const jokeToUpdate = JSON.parse(parsedJoke); 
  
        // find the book in the database
        const jokeIndex = jokesDB.findIndex((joke) => {
            return joke.id === jokeToUpdate.id;
        });
  
        // Return 404 if book not found
        if (jokeIndex === -1) {
            res.writeHead(404);
            res.end(JSON.stringify({
                message: 'joke not found'
            }));
            return;
        }
  
        // update the book in the database
        jokesDB[jokeIndex] = {...jokesDB[jokeIndex], ...jokeToUpdate}; 
  
        // save to db
        fs.writeFile(parsedUrl.pathname , JSON.stringify(jokesDB), (err) => {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end(JSON.stringify({
                    message: 'Internal Server Error. Could not update joke in database.'
                }));
            }
  
            res.end(JSON.stringify(jokeToUpdate));
        });
    });
  }
  
  
// DELETE A JOKE ==> DELETE: /jokes
const deleteJoke = function (req, res) {
  const jokeId = parsedUrl.pathname .split('/')[2];
  
  // Remove book from database
  const jokeIndex = jokesDB.findIndex((joke) => {
      return joke.id === parseInt(jokeId);
  })

  if (jokeIndex === -1) {
      res.writeHead(404);
      res.end(JSON.stringify({
          message: 'Joke not found'
      }));

      return;
  }

  jokesDB.splice(jokeIndex, 1); // remove the joke from the database using the index

  // update the db
  fs.writeFile(parsedUrl.pathname , JSON.stringify(jokesDB), (err) => {
      if (err) {
          console.log(err);
          res.writeHead(500);
          res.end(JSON.stringify({
              message: 'Internal Server Error. Could not delete joke from database.'
          }));
      }

      res.end(JSON.stringify({
          message: 'Joke deleted'
      }));
  });

}

// Create server
const server = http.createServer(requestHandler)

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server is listening on ${HOSTNAME}:${PORT}`)
})