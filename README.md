# Coopers Todo API

## Endpoints / Contrato de Datos

**BASE_URL**: `https://www.todo-api.jotape.tech/api/`

### Autenticação

`POST` auth/login

O Login pode ser realizado tanto com o e-mail `contato@jotape.tech` quanto com o nome de usuário `jotape`

**payload**

```json
{
  "username": "jotape",
  "password": "123456"
}
```

**responses**

`200 OK`

```json
{
  "user": {
    "id": 1,
    "username": "jotape",
    "email": "contato@jotape.tech",
    "remember_me_token": null,
    "created_at": "2022-07-18T01:15:41.000+00:00",
    "updated_at": "2022-07-18T01:15:41.000+00:00"
  },
  "token": {
    "type": "bearer",
    "token": "Y2w1cXZhcDJuMDAwMTcxcnUyamYyZGN5OQ.qfMaWdOnAq88AD1nXWVGWPH6f01qT-T1uHkBijXTkTU1ws7muBpgTphXvwIg",
    "expires_at": "2022-07-18T15:54:05.422+00:00"
  }
}
```

`400 Bad Request` Quando as credenciais estão incorretas, ou os campos não são enviados na requisição. Por uma questão de segurança não é informado qual dos dados está incorreto.

```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "invalid credentials",
  "status": 401
}
```

`POST` auth/logout

**responses**

`204 No Content`

```json

```

`401 Unauthorized` Quando o usuário não está autenticado

```json
{
  "code": "UNAUTHORIZED_ACCESS",
  "message": "Unauthorized Access",
  "status": 401
}
```

### Tasks CRUD

`GET` /tasks - Lista todas as tasks do usuário logado

**responses**

`200 OK`

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Send a gift to the client",
      "order": 1,
      "status": "DONE"
    },
    {
      "id": 2,
      "title": "Create a Google Drive folder",
      "order": 2,
      "status": "DONE"
    },
    {
      "id": 3,
      "title": "E-mail John about the deadline",
      "order": 3,
      "status": "DONE"
    },
    {
      "id": 4,
      "title": "Home Page Design ",
      "order": 4,
      "status": "DONE"
    },
    {
      "id": 5,
      "title": "Get FTP credentials",
      "order": 5,
      "status": "DONE"
    },
    {
      "id": 6,
      "title": "This item label may be edited",
      "order": 1,
      "status": "TODO"
    }
  ]
}
```

`401 Unauthorized` Quando o usuário não está autenticado

```json
{
  "code": "UNAUTHORIZED_ACCESS",
  "message": "Unauthorized Access",
  "status": 401
}
```

`POST` /tasks - Cria uma nova task para o usuário como STATUS de TODO

**payload**

```json
{
  "title": "Test Task"
}
```

**responses**

`201 Created`

```json
{
  "code": "TASK_CREATED",
  "message": "task created successfully",
  "task": {
    "id": 13,
    "title": "Test Task",
    "order": 8,
    "status": "TODO"
  }
}
```

`422 Unprocessable Entity`

Quando o campo do payload não é fornecido

```json
{
  "code": "VALIDATION_FAILURE",
  "message": "Validation Failure",
  "status": 422,
  "errors": [
    {
      "rule": "required",
      "field": "title",
      "message": "The title field is required to create a new task"
    }
  ]
}
```

Quando o campo do payload está vazio ou possuí menos de 2 caracteres

```json
{
  "code": "VALIDATION_FAILURE",
  "message": "Validation Failure",
  "status": 422,
  "errors": [
    {
      "rule": "minLength",
      "field": "title",
      "message": "minLength validation failed",
      "args": {
        "minLength": 2
      }
    }
  ]
}
```

`401 Unauthorized` Quando o usuário não está autenticado

```json
{
  "code": "UNAUTHORIZED_ACCESS",
  "message": "Unauthorized Access",
  "status": 401
}
```

`PUT` /tasks/:id - Edita as informações de uma task

**payload**

Podemos editar o `título` da task, seu `status` para `TODO` ou `DONE` e sua `ordem` na lista, porém essas informações só podem ser editadas separadamente, se as 3 forem fornecidas no payload ele só editará o título, de forem fornecidas somente a ordem e status ele editará somente a ordem.

Isso se deve à como o layout está desenhado no figma, aonde não faria sentido permitir que essas 3 informações sejam editadas de uma vez só. Sendo que no layout, a ordem é editada quando fazemos o drag and drop na lista, o título quando passamos o mouse sobre o título da task, e o status quando selecionamos a checkbox da tarefa.

- Ao alterar o `título`:
  - Somente o título da task é alterado.
- Ao alterar o `status`:
  - O status da task é alterado para `TODO` ou `DONE`
  - Quando o status é alterado para `DONE` a task vai para o primeiro lugar `order: 1` da lista de tasks com status `DONE`
  - Quando o stuatus é alterado para `TODO` a task vai para último lugar `order: todoTasks.length + 1` da lista com status `TODO`
- Ao alterar a `ordem`:
  - A ordem é alterada em relação ao status da task, então se alteramos a ordem de uma task para `1` e ela está na lista de `TODOs` ela vai para a primeira posição dos `TODOs` e não para a primeira posição de toda as tasks.

```json
{
  "title": "Test Task",
  "stauts": "DONE",
  "order": 1
}
```

**responses**

`204 No Content` Quando a edição de qualquer um dos atributos é realizada

```json

```

`422 Unprocessable Entity` Quando é fornecido um `status` diferente de `TODO` ou `DONE`

```json
{
  "code": "VALIDATION_FAILURE",
  "message": "Validation Failure",
  "status": 422,
  "errors": [
    {
      "rule": "regex",
      "field": "status",
      "message": "The status must be TODO or DONE"
    }
  ]
}
```

`422 Unprocessable Entity` Quando é fornecido um `título` vazio ou com menos de 2 caracteres

```json
{
  "code": "VALIDATION_FAILURE",
  "message": "Validation Failure",
  "status": 422,
  "errors": [
    {
      "rule": "minLength",
      "field": "title",
      "message": "The title field must be at least 2 characters long",
      "args": {
        "minLength": 2
      }
    }
  ]
}
```

`422 Unprocessable Entity` Quando é fornecido uma `ordem` negativa

```json
{
  "code": "VALIDATION_FAILURE",
  "message": "Validation Failure",
  "status": 422,
  "errors": [
    {
      "rule": "unsigned",
      "field": "order",
      "message": "the number cannot be negative"
    }
  ]
}
```

`401 Unauthorized` Quando o usuário não está autenticado

```json
{
  "code": "UNAUTHORIZED_ACCESS",
  "message": "Unauthorized Access",
  "status": 401
}
```

`403 Forbidden` Quando o usuário tenta editar uma task de outro usuário

```json
{
  "code": "ACCESS_DENIED",
  "message": "Access Denied",
  "status": 403
}
```

`404 Not Found` Quando é fornecido um id de uma task inexistente

```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "Resource Not Found",
  "status": 404
}
```

`DELETE` /tasks/:id - Deleta uma task especifica

Ao deletarmos um ítem, todos os ítens de sua lista são novamente reordeanos para que não haja problemas na ordenação ao adicionar novos itens ou mudar a ordem de um item já existente.

**responses**

`204 No Content` Quando o ítem é deletado

```json

```

`401 Unauthorized` Quando o usuário não está autenticado

```json
{
  "code": "UNAUTHORIZED_ACCESS",
  "message": "Unauthorized Access",
  "status": 401
}
```

`403 Forbidden` Quando o usuário tenta deletar uma task de outro usuário

```json
{
  "code": "ACCESS_DENIED",
  "message": "Access Denied",
  "status": 403
}
```

`404 Not Found` Quando é fornecido um id de uma task inexistente

```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "Resource Not Found",
  "status": 404
}
```

`DELETE` /tasks - Deleta todas as tasks por status

Ele não deletará todas as tasks da tabela, e sim as tasks do usuário atual

**payload**

Conforme está desenhado no figma, podemos limpar todas as tasks em `TODO` ou em `DONE`, mas não podemos limpar todas as tasks de uma vez, então devemos fornecer no payload o status da task que iremos limpar.

```json
{
  "stauts": "DONE"
}
```

**responses**

`204 No Content` Quando o ítem é deletado

```json

```

`422 Unprocessable Entity`

Quando o status não é fornecido

```json
{
  "code": "VALIDATION_FAILURE",
  "message": "Validation Failure",
  "status": 422,
  "errors": [
    {
      "rule": "required",
      "field": "status",
      "message": "required validation failed"
    }
  ]
}
```

`401 Unauthorized` Quando o usuário não está autenticado

```json
{
  "code": "UNAUTHORIZED_ACCESS",
  "message": "Unauthorized Access",
  "status": 401
}
```
