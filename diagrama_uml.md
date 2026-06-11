# 📊 Diagrama UML — Agenda Quick

Este documento apresenta a modelagem de classes (UML) do projeto **Agenda Quick**, demonstrando a divisão de responsabilidades conforme a **Clean Architecture** (Arquitetura Limpa), dividida entre **Domain (Domínio)**, **Application (Aplicação)** e **Infrastructure (Infraestrutura)**.

```mermaid
classDiagram
    %% Estilos de Grupos (Clean Architecture Layers)
    direction TB
    
    %% --- LAYER: DOMAIN ---
    namespace Domain_Layer {
        class Appointment {
            +Optional~int~ id
            +AppointmentKey key
            +str service_name
            +str patient_name
            +str room_name
            +str surgeon_name
            +AppointmentStatus status
            +Optional~str~ notes
            +update_status(new_status: AppointmentStatus)
        }
        
        class AppointmentRepository {
            <<interface>>
            +get_all() List~Appointment~
            +get_by_key(date: str, time: str) Optional~Appointment~
            +save(appointment: Appointment) Appointment
            +delete(appointment_id: int)
            +resolve_ids(service: str, patient: str, room: str, surgeon: str) dict
        }
        
        class AppointmentStatus {
            <<enum>>
            AGENDADO = "agendado"
            CONFIRMADO = "confirmado"
            REALIZADO = "realizado"
            CANCELADO = "cancelado"
            NO_SHOW = "no_show"
            +from_frontend(color: str) AppointmentStatus
            +to_frontend() str
        }
        
        class AppointmentKey {
            +AppointmentDate date
            +AppointmentTime time
            +value: str
            +from_string(key: str) AppointmentKey
        }
        
        class AppointmentDate {
            +str value
        }
        
        class AppointmentTime {
            +str value
        }
    }

    %% --- LAYER: APPLICATION ---
    namespace Application_Layer {
        class CreateAppointmentUseCase {
            +AppointmentRepository repository
            +execute(key_str: str, data: dict) Appointment
        }
        
        class GetAppointmentsUseCase {
            +AppointmentRepository repository
            +execute() List~Appointment~
        }
        
        class UpdateAppointmentUseCase {
            +AppointmentRepository repository
            +execute(key_str: str, new_status: str) Appointment
        }
        
        class DeleteAppointmentUseCase {
            +AppointmentRepository repository
            +execute(key_str: str)
        }
    }

    %% --- LAYER: INFRASTRUCTURE (Models & DB Repo) ---
    namespace Infrastructure_Layer {
        class SQLAppointmentRepository {
            +Session db
            +get_all() List~Appointment~
            +get_by_key(date: str, time: str) Optional~Appointment~
            +save(appointment: Appointment) Appointment
            +delete(appointment_id: int)
            +resolve_ids(service: str, patient: str, room: str, surgeon: str) dict
            -_to_entity(db_item: Agendamento) Appointment
        }
        
        class Agendamento {
            +Integer id
            +Integer paciente_id
            +Integer medico_id
            +Integer sala_id
            +Integer tipo_servico_id
            +DateTime inicio
            +DateTime fim
            +Enum status
            +Text observacoes
        }
        
        class Paciente {
            +Integer id
            +String nome
            +Integer filial_id
            +String cpf
            +String telefone
        }
        
        class Usuario {
            +Integer id
            +Integer filial_id
            +String nome
            +String email
            +String senha_hash
            +String crm
            +Enum tipo
            +Boolean ativo
        }
        
        class Sala {
            +Integer id
            +String nome
            +Integer centro_id
            +Integer capacidade
            +Integer ativo
        }
        
        class TipoServico {
            +Integer id
            +String nome
        }
    }

    %% Relacionamentos do Domínio
    Appointment --> AppointmentKey : possui
    Appointment --> AppointmentStatus : possui
    AppointmentKey --> AppointmentDate : possui
    AppointmentKey --> AppointmentTime : possui
    AppointmentRepository ..> Appointment : gerencia

    %% Dependências e Implementações
    SQLAppointmentRepository ..|> AppointmentRepository : implementa
    SQLAppointmentRepository --> Agendamento : mapeia para/de
    
    %% Uso de Repositório pelas Regras de Aplicação (Dependency Inversion)
    CreateAppointmentUseCase --> AppointmentRepository : depende
    GetAppointmentsUseCase --> AppointmentRepository : depende
    UpdateAppointmentUseCase --> AppointmentRepository : depende
    DeleteAppointmentUseCase --> AppointmentRepository : depende

    %% Relacionamentos entre Modelos DB (Relacional)
    Agendamento --> Paciente : N para 1
    Agendamento --> Usuario : N para 1 (Médico)
    Agendamento --> Sala : N para 1
    Agendamento --> TipoServico : N para 1
```

## Detalhes de Arquitetura

1. **Inversão de Dependência (D do SOLID)**: Os casos de uso (`CreateAppointmentUseCase`, etc.) dependem exclusivamente da abstração `AppointmentRepository` (definida na camada de **Domain**), e não da implementação de banco de dados (`SQLAppointmentRepository`).
2. **Separação de Modelos**: A entidade de domínio `Appointment` é separada do modelo persistido no banco de dados (`Agendamento`). A conversão ocorre de forma isolada dentro do método privado `_to_entity` do repositório da infraestrutura.
3. **Imutabilidade**: Chaves e dados de data/hora (`AppointmentKey`, `AppointmentDate`, `AppointmentTime`) são representados como objetos de valor (`value objects`) congelados (`frozen=True`) para evitar modificações indesejadas no fluxo da aplicação.
