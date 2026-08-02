# Documentação de Arquitetura - SINAN Backend

Este projeto adota a **Arquitetura Hexagonal (Ports and Adapters)**. O objetivo principal desta escolha é desacoplar a lógica de negócios (domínio) das tecnologias externas (bancos de dados, frameworks HTTP, ORMs, etc.).

## Motivação

Considerando que este sistema foi desenvolvido em um contexto acadêmico para o Sistema de Informação de Agravos de Notificação (SINAN), enfrentamos dois desafios:

- **Alta rotatividade de alunos:** Novos desenvolvedores entram no projeto com frequência. Com uma arquitetura limpa e delimitada, a curva de aprendizado diminui, pois as regras de negócio ficam isoladas e fáceis de se encontrar, sem misturar com detalhes de infraestrutura.
- **Independência de Tecnologia:** Se futuramente houver a necessidade de trocar componentes de infraestrutura, o impacto será mínimo, exigindo apenas a criação de um novo Adapter, sem tocar nas regras de negócio da aplicação.

## Visão Geral

A imagem abaixo ilustra o fluxo de uma Arquitetura Hexagonal.

<div style="text-align: center; margin: 20px 0;">
    <img style="max-width: 100%; height: auto; display: inline-block;" src="/docs/assets/hexagonal.png" alt="Arquitetura Hexagonal">
</div>

- **Core (Domínio / Casos de Uso):** Contém as regras de negócio puras do SINAN.
- **Ports (Portas):** Interfaces que definem como o Core se comunica com o mundo exterior.
- **Adapters (Adaptadores):** Implementações concretas das portas.
  - **Driving/Inbound Adapters:** Onde entram as requisições (ex: rotas do Express, controllers).
  - **Driven/Outbound Adapters:** Onde saem as requisições para o mundo externo (ex: Drizzle).

## Estrutura de Pastas

```text
src/
└── modules/
    └── users/
        ├── entities/         # Entidades puras
        ├── services/         # Casos de Uso
        ├── repositories/     # Contém o adapter do ORM
        ├── ports/            # Interfaces (Driven/Driving ports)
        ├── factories/        # Composição de dependências
        └── controllers/      # Implementação dos adapters HTTP
```

## Modelo C2(Container)
Abaixo está o diagrama de Nível 2 (Containers) do sistema SINAN. O ambiente é composto pelo NGINX, que atua como proxy reverso e gerencia os certificados SSL; uma API em Node.js, responsável pela lógica de negócios; e o banco de dados relacional PostgreSQL. A administração do banco é facilitada pelo PgAdmin, enquanto o Certbot interage com a Autoridade Certificadora Let's Encrypt para a renovação automática dos certificados.

<div style="text-align: center; margin: 20px 0;">
    <img style="max-width: 100%; height: auto; display: inline-block;" src="/docs/assets/c2_model.png" alt="Modelo C2">
</div>
