const  swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
      openapi: "3.1.0",
      info: {
        title: "Prueba Node JS Express API with Swagger",
        version: "0.1.0",
        description:
          "Prueba Node JS, documentación de los servicios Rest para la prueba.",
        license: {
          name: "Test Soaint",
        },
        contact: {
          name: "Jiclavijo",
          email: "ingismaclavijo@gmail.com",
        },
      },
      servers: [
        {
          url: "https://app-test-bww7o2265q-uc.a.run.app",
          //url: "http://localhost:80",
        },
      ],
    },
    apis: ["./index.js"],
  };
  
  const specs = swaggerJsdoc(options);
  
  const swaggerDocs = (app,port)=>{
    app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(specs));
    console.log(`Version 1 Docs are available at https://app-test-bww7o2265q-uc.a.run.app/api-docs`);
  };

  module.exports = swaggerDocs;