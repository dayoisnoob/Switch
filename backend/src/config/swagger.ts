import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Switch API',
    description: 'The core backend API for the Switch Kanban application.',
  },
  host: 'localhost:7000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const routes = ['./src/app.ts'];

swaggerAutogen()(outputFile, routes, doc);
