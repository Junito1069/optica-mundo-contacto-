const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
