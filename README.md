# BACKEND SINAN

## Sobre o Projeto

O Sistema de Informação de Agravos de Notificação (SINAN) é uma plataforma essencial para a vigilância epidemiológica no Brasil, permitindo o registro e o monitoramento sistemático de doenças e agravos de notificação compulsória.

Este projeto entrega um backend robusto e escalável com **Typescript** e **Express**, focado em garantir a integridade histórica dos dados de saúde pública.

## Características principais

- **Integridade Histórica:** Captura dos dados do paciente (CPF, endereço, escolaridade, etc.) no momento do registro da notificação através de classes de `Notification`, garantindo um "snapshot" histórico imutável.
- **Segurança de Dados:** Protege a notificação epidemiológica original mesmo quando o cadastro mestre do paciente é atualizado posteriormente, preservando a fotografia dos dados conforme estavam no momento do atendimento.
- **API REST:** Desenvolvido como uma API RESTful para integração com frontend em TypeScript, com comunicação via JSON e endpoints bem definidos.
- 
## Tecnologias 

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![postgresql](https://img.shields.io/badge/postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white) ![Json](https://img.shields.io/badge/json-000000?style=for-the-badge&logo=json&logoColor=white)

## Como começar

### Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
* **Docker & Docker Compose**

### Configuração do Ambiente
1. **Clone o repositório:**
   ```powershell
   git clone https://github.com/SINAN-UFSM/sinan-backend
   cd backend-sinan
   ```
2. **Configure o as variáveis de ambiente**
O projeto utiliza variáveis de ambiente para configuração sensível. Crie um arquivo `.env` na raiz do projeto seguindo o modelo abaixo:

    ```env
    # --- DATABASE CONFIG ---
    POSTGRES_DB=sinan_web
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_PORT=5433
    POSTGRES_HOST=db

    # --- PGADMIN CONFIG ---
    PGADMIN_DEFAULT_EMAIL=admin@sinan.com
    PGADMIN_DEFAULT_PASSWORD=admin
    PGADMIN_PORT=5050

    # --- JWT CONFIG ---
    JWT_SECRET=your_jwt_secret_key

    # --- ADMIN USER CONFIG ---
    ADMIN_EMAIL=admin@sinan.com.br
    ADMIN_PASSWORD=Admin@1234

    # --- NODE CONFIG ---
    NODE_ENV=production
    ```

### Executando
- **Execute o docker compose**
    ```powershell
    docker compose up --build
    ```
- **Derrubar os containers**
    ```powershell
    docker compose down
    ```
    > ⚠️ **Atenção:** Se tiver problemas persistentes com o banco de dados, use `docker compose down -v` para remover também os volumes e reiniciar os dados do zero. *(Aviso: isso apagará os dados salvos no banco).*
## Modelos de Dados

O projeto implementa uma arquitetura que preserva dados históricos:

- **Unit** - Unidades de saúde
- **User** - Usuários do sistema
- **Patient** - Cadastro mestre de pacientes
- **Notification** - Notificações gerais (status, datas, observações)
- **NotificationAids**, **NotificationBotulism**, **NotificationEpizootia**, etc. - Notificações específicas por tipo de agravo

## Contribuição

Para contribuir com melhorias, protocole um Pull Request descrevendo bem as alterações propostas.