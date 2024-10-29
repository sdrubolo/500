const express = require('express');
const bodyParser = require('body-parser');
const bunyan = require('bunyan');
const logger = bunyan.createLogger({ name: 'ncco server' });
const axios = require('axios');


const app = express()
const port = 9000

app.use(bodyParser.json())

app.listen(port, () => {

    app.all("/proxy", async (req, res) => {
        try {

          const { query, baseUrl, originalUrl, method, statusCode, body } = req

          logger.info({ query, baseUrl, originalUrl, url: req.url, method, statusCode, body }, "Request Logger::proxy")

          const { url, ...rest } = query;

          if (!url) {
            return res.status(400).send("Missing 'url' query parameter.");
          }
      
          // Set up the Axios configuration
          const axiosConfig = {
            method: req.method,
            url: `${url}`,
            headers: req.headers,
           // data: req.body,
            params: rest,
          };
          if (method !== "GET") {
            axiosConfig.data = req.body
          }

          logger.info({ axiosConfig }, "Request Logger::axiosConfig")
      
          // Make the request
          const response = await axios(axiosConfig);
      
          // Send the response data back to the client
          res.status(response.status).send(response.data);
        } catch (error) {
          // Handle errors, e.g., 404, 500, etc.
          res
            .status(error.response ? error.response.status : 500)
            .send(error.message || "Error processing proxy request");
        }
      });

    app.use((req, res, next) => {
        const { query, baseUrl, originalUrl, url, method, statusCode, body } = req
        logger.info({ query, baseUrl, originalUrl, url, method, statusCode, body }, "Request Logger:: ")
        next()
    })

    app.get('/error', (req,res) => {
        res.status(500)
        res.json({})
    }) 

    app.get('/error/:app_id', (req, res) => {
        res.status(500)
        res.json({})
    })
        
})