'use strict';

const Hapi = require('hapi');
const fs = require('fs');
const util = require('util');

// Convert fs.readFile, fs.writeFile into Promise version of same
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/books',
    options: {
        handler: async (request, h) => {
            const books = await readFile('./books.json', 'utf8');
            return h.response(JSON.parse(books));
        }
    }
});

server.route({
    method: 'POST',
    path: '/books',
    options: {
        handler: async (request, h) => {
            const book = JSON.parse(request.payload);
            let books = await readFile('./books.json', 'utf8');
            books = JSON.parse(books);
            // setting id
            book.id = books.length + 1;
            books.push(book);
            await writeFile('./books.json', JSON.stringify(books, null, 2), 'utf8');
            return h.response(books).code(200);
        }
    }
});

server.route({
    method: 'PUT',
    path: '/books/{id}',
    options: {
        handler: async (request, h) => {
            const updBook = JSON.parse(request.payload);
            const id = request.params.id;
            let books = await readFile('./books.json', 'utf8');
            books = JSON.parse(books);
            // finding book by id and rewriting
            books.forEach((book) => {
                if (book.id == id) {
                    book.title = updBook.title;
                    book.author = updBook.author;
                }
            });
            await writeFile('./books.json', JSON.stringify(books, null, 2), 'utf8');
            return h.response(books).code(200);
        }
    }
});

server.route({
    method: 'DELETE',
    path: '/books/{id}',
    options: {
        handler: async (request, h) => {
            const updBook = JSON.parse(request.payload);
            const id = request.params.id;
            let books = await readFile('./books.json', 'utf8');
            books = JSON.parse(books);
            // rewriting the books array
            books = books.filter(book => book.id != id);
            await writeFile('./books.json', JSON.stringify(books, null, 2), 'utf8');
            return h.response(books).code(200);
        }
    }
});

const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();