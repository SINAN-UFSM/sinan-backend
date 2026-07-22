import { app } from '#infra/http/server';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port${PORT}`);
});