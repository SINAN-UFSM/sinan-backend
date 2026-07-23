import { app } from '#shared/infra/http/server';

const PORT = Number(process.env.PORT) || 3000;

if (PORT <= 0 || PORT > 65535) {
    throw new Error('Invalid port number. Please provide a valid port between 1 and 65535.');
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});