const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 메모리 내 도서 데이터 (초기 샘플)
let books = [
  { id: 1, title: 'Node.js 교과서', author: '조현영' },
  { id: 2, title: '모던 자바스크립트 Deep Dive', author: '이웅모' }
];
let nextId = 3;

// 기본 페이지 (브라우저 접속 시 API 테스트 화면 제공)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <title>도서관리 프로그램</title>
      <style>
        body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 0 16px; }
        input { padding: 6px; margin-right: 6px; }
        button { padding: 6px 10px; cursor: pointer; }
        li { margin: 8px 0; }
      </style>
    </head>
    <body>
      <h1>도서관리 프로그램 API</h1>
      <form id="bookForm">
        <input type="text" id="title" placeholder="책 제목" required />
        <input type="text" id="author" placeholder="저자" required />
        <button type="submit">도서 추가</button>
      </form>
      <ul id="bookList"></ul>

      <script>
        async function loadBooks() {
          const res = await fetch('/books');
          const data = await res.json();
          const list = document.getElementById('bookList');
          list.innerHTML = data.map(b => \`
            <li>
              <strong>[\${b.id}] \${b.title}</strong> - \${b.author}
              <button onclick="deleteBook(\${b.id})">삭제</button>
            </li>
          \`).join('');
        }

        document.getElementById('bookForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const title = document.getElementById('title').value;
          const author = document.getElementById('author').value;
          await fetch('/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author })
          });
          e.target.reset();
          loadBooks();
        });

        async function deleteBook(id) {
          await fetch('/books/' + id, { method: 'DELETE' });
          loadBooks();
        }

        loadBooks();
      </script>
    </body>
    </html>
  `);
});

// 1. 전체 도서 조회 (GET /books)
app.get('/books', (req, res) => {
  res.json(books);
});

// 2. 특정 도서 조회 (GET /books/:id)
app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ message: '도서를 찾을 수 없습니다.' });
  res.json(book);
});

// 3. 도서 추가 (POST /books)
app.post('/books', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: '제목과 저자를 모두 입력하세요.' });
  }
  const newBook = { id: nextId++, title, author };
  books.push(newBook);
  res.status(201).json(newBook);
});

// 4. 도서 수정 (PUT /books/:id)
app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ message: '도서를 찾을 수 없습니다.' });

  const { title, author } = req.body;
  books.splice(index, 1, {
    id,
    title: title || books[index].title,
    author: author || books[index].author
  });
  res.json(books[index]);
});

// 5. 도서 삭제 (DELETE /books/:id)
app.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ message: '도서를 찾을 수 없습니다.' });

  const deleted = books.splice(index, 1);
  res.json(deleted[0]);
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});