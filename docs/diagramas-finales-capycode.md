# CapyCode - Codigos de diagramas finales

Fecha de generacion: 2026-04-30

Este archivo contiene los codigos Mermaid propuestos para los diagramas finales de CapyCode. Estan separados para mantener claridad visual y evitar diagramas demasiado saturados.

Notas generales:

- `current_level_id` es un puntero entero de progreso, no una FK estricta, porque puede tomar el valor `totalLevels + 1` cuando el juego esta completado.
- `routes.name` representa el tema de la ruta. No existe `routes.topic`.
- `levels.content` es texto breve fijo guardado en base de datos.
- `exercises.content_data` y `exercises.answer_data` pueden ser columnas `JSON` o `TEXT` con JSON valido.
- Los popups, audio, temporizadores, aleatorizacion y efectos visuales son frontend puro.

## 1. Diagramas de estados

### 1.1. Estado de autenticacion y sesion

```mermaid
stateDiagram-v2
    direction LR

    [*] --> Anonymous

    Anonymous --> Registering: enviar registro
    Registering --> Authenticated: datos validos / crear usuario y sesion
    Registering --> Anonymous: error de registro

    Anonymous --> LoggingIn: enviar login
    LoggingIn --> Authenticated: credenciales validas / crear sesion
    LoggingIn --> Anonymous: credenciales invalidas

    Authenticated --> Anonymous: logout / borrar sesion
    Authenticated --> SessionExpired: token expirado
    SessionExpired --> Anonymous: limpiar cookie
```

### 1.2. Estado de partida de nivel

```mermaid
stateDiagram-v2
    direction TB

    [*] --> Map

    Map --> BlockedLevel: seleccionar nivel futuro
    BlockedLevel --> Map: mostrar bloqueo

    Map --> LevelLoading: seleccionar nivel actual o practica
    LevelLoading --> AttemptStarted: cargar 5 ejercicios

    state AttemptStarted {
        direction TB

        [*] --> ShuffleAttempt
        ShuffleAttempt --> ExerciseActive: aleatorizar ejercicios y opciones

        ExerciseActive --> CorrectAnswer: respuesta correcta
        ExerciseActive --> IncorrectAnswer: respuesta incorrecta
        ExerciseActive --> Timeout: tiempo agotado

        IncorrectAnswer --> ExerciseActive: reintentar mismo ejercicio

        CorrectAnswer --> ExerciseActive: siguiente ejercicio
        CorrectAnswer --> ReadyToComplete: quinto ejercicio correcto

        Timeout --> ResetAttempt: fallar intento completo
        ResetAttempt --> ShuffleAttempt: reiniciar nivel y reordenar

        ReadyToComplete --> [*]
    }

    AttemptStarted --> CompletingLevel: 5 respuestas correctas

    CompletingLevel --> PracticeCompleted: levelId menor que current_level_id
    CompletingLevel --> ProgressUpdated: levelId igual a current_level_id
    CompletingLevel --> Rejected: solicitud invalida o nivel futuro

    PracticeCompleted --> Map: sin XP ni racha
    Rejected --> Map

    ProgressUpdated --> Map: nivel normal completado
    ProgressUpdated --> RouteClosePopup: nivel integrador completado
    ProgressUpdated --> GameCompletedPopup: ultimo nivel global completado

    RouteClosePopup --> Map: mostrar siguiente ruta
    GameCompletedPopup --> Map: mostrar juego completado
```

### 1.3. Estado de progreso global

```mermaid
stateDiagram-v2
    direction LR

    [*] --> NewUser
    NewUser --> CurrentLevel: current_level_id = 1

    CurrentLevel --> CurrentLevel: respuesta incorrecta / sin avanzar
    CurrentLevel --> CurrentLevel: tiempo agotado / reinicio frontend
    CurrentLevel --> PracticePrevious: seleccionar nivel anterior
    PracticePrevious --> CurrentLevel: terminar practica / sin recompensa

    CurrentLevel --> NextLevelUnlocked: completar nivel actual
    NextLevelUnlocked --> CurrentLevel: current_level_id <= totalLevels
    NextLevelUnlocked --> GameCompleted: current_level_id = totalLevels + 1

    GameCompleted --> PracticeAllLevels: todos los niveles son practica
    PracticeAllLevels --> PracticeAllLevels: repetir cualquier nivel
```

### 1.4. Estado de tienda y vestuarios

```mermaid
stateDiagram-v2
    direction LR

    [*] --> StoreOpened

    StoreOpened --> LockedOutfit: seleccionar outfit bloqueado
    LockedOutfit --> InsufficientXP: xp menor que cost
    InsufficientXP --> StoreOpened: mostrar falta de XP

    LockedOutfit --> Unlocking: xp suficiente / comprar
    Unlocking --> OutfitUnlocked: descontar XP e insertar user_outfits
    OutfitUnlocked --> StoreOpened: queda desbloqueado, no equipado

    StoreOpened --> OwnedOutfit: seleccionar outfit desbloqueado
    OwnedOutfit --> Equipping: presionar equipar
    Equipping --> OutfitEquipped: actualizar current_outfit_id
    OutfitEquipped --> StoreOpened
```

## 2. Diagramas de clases

### 2.1. Diagrama de clases de dominio

```mermaid
classDiagram
    direction TB

    class User {
        +int id
        +string username
        +string passwordHash
        +int currentLevelId
        +int streak
        +int xp
        +datetime lastCompletionAt
        +int currentOutfitId
        +canAccessLevel(levelId, totalLevels) bool
        +isGameCompleted(totalLevels) bool
    }

    class Route {
        +int id
        +string name
        +int orderIndex
        +string backgroundImage
    }

    class Level {
        +int id
        +int routeId
        +int routeOrder
        +string name
        +string difficulty
        +string content
        +isCurrentFor(user) bool
        +isPracticeFor(user) bool
        +isLockedFor(user) bool
    }

    class Exercise {
        <<abstract>>
        +int id
        +int levelId
        +string type
        +string prompt
        +object contentData
        +object answerData
        +int orderIndex
        +validateAnswer(answer) bool
        +getFeedback(answer) string
    }

    class MultipleChoiceExercise {
        +array options
        +array correctOptionIds
        +validateAnswer(answer) bool
    }

    class NumericAnswerExercise {
        +number expectedValue
        +validateAnswer(answer) bool
    }

    class LineSelectionExercise {
        +array lines
        +array correctLineIds
        +validateAnswer(answer) bool
    }

    class LineOrderingExercise {
        +array lines
        +array correctOrder
        +validateAnswer(answer) bool
    }

    class FillBlanksExercise {
        +array template
        +array wordBank
        +object blanks
        +validateAnswer(answer) bool
    }

    class Outfit {
        +int id
        +string name
        +string description
        +string tagline
        +int cost
        +string image
    }

    Route "1" *-- "7" Level : contiene
    Level "1" *-- "5" Exercise : contiene

    Exercise <|-- MultipleChoiceExercise
    Exercise <|-- NumericAnswerExercise
    Exercise <|-- LineSelectionExercise
    Exercise <|-- LineOrderingExercise
    Exercise <|-- FillBlanksExercise

    User "0..*" --> "1" Outfit : currentOutfit
    User "0..*" -- "0..*" Outfit : unlockedOutfits
```

Nota: `Session` no se incluye en este diagrama principal porque es una entidad tecnica de autenticacion, no una clase del dominio jugable. Si se necesita mostrarla, aparece en el ER o en el diagrama tecnico de servicios backend.

### 2.2. Diagrama de clases de servicios backend

```mermaid
classDiagram
    direction LR

    class AuthService {
        +registerUser(username, password) User
        +loginUser(username, password) Session
        +logoutUser(sessionToken) void
        +hashPassword(password) string
        +verifyPassword(password, hash) bool
    }

    class CatalogService {
        +getRoutes() Route[]
        +getLevelsByRoute(routeId) Level[]
        +getExercisesByLevel(levelId) Exercise[]
        +getTotalLevels() int
    }

    class ExerciseService {
        +validateExerciseAnswer(exercise, answer) bool
        +validateLevelAnswers(levelId, answers) bool
        +mapExerciseType(type) string
    }

    class ProgressService {
        +completeLevel(userId, levelId, answers, completedAt) User
        +getXpReward(difficulty) int
        +calculateStreak(currentStreak, lastCompletionAt, completedAt) int
        +getVisibleStreak(streak, lastCompletionAt, now) int
    }

    class OutfitService {
        +getOutfits() Outfit[]
        +unlockOutfit(userId, outfitId) User
        +equipOutfit(userId, outfitId) User
    }

    class SessionService {
        +createSession(userId) Session
        +getUserFromSession(token) User
        +deleteSession(token) void
        +hashToken(token) string
    }

    class Database {
        +query(sql, params)
        +transaction(callback)
    }

    AuthService ..> SessionService
    AuthService ..> Database
    CatalogService ..> Database
    ExerciseService ..> CatalogService
    ProgressService ..> ExerciseService
    ProgressService ..> CatalogService
    ProgressService ..> Database
    OutfitService ..> Database
    SessionService ..> Database
```

## 3. Diagramas de componentes

### 3.1. Diagrama de componentes general

```mermaid
flowchart LR
    User([Usuario]) --> Browser[Navegador]

    subgraph Frontend["Frontend estatico"]
        Pages[Paginas HTML]
        Styles[CSS]
        JS[Modulos JS]
        Assets[Imagenes, audio y fuentes]
        Config[API_BASE_URL]
    end

    subgraph JSModules["Modulos frontend"]
        AuthJS[auth.js]
        CommonJS[common.js]
        MapJS[map.js]
        GameJS[game.js]
        ShopJS[shop.js]
        ProfileJS[profile.js]
    end

    subgraph Backend["Backend API PHP en servidor/iMac"]
        AuthAPI[Auth API]
        CatalogAPI[Routes and Levels API]
        ExerciseAPI[Exercises API]
        ProgressAPI[Progress API]
        OutfitAPI[Outfits API]
        SessionAPI[Session Middleware]
    end

    subgraph Database["Base de datos"]
        DB[(MySQL / MariaDB)]
        Users[(users)]
        Sessions[(sessions)]
        Routes[(routes)]
        Levels[(levels)]
        Exercises[(exercises)]
        Outfits[(outfits)]
        UserOutfits[(user_outfits)]
    end

    subgraph Import["Proceso local de importacion"]
        FinalJSON[JSON final de preguntas]
        ImportScript[Script local o SQL generado]
    end

    Browser --> Pages
    Pages --> Styles
    Pages --> JS
    Pages --> Assets

    JS --> AuthJS
    JS --> CommonJS
    JS --> MapJS
    JS --> GameJS
    JS --> ShopJS
    JS --> ProfileJS
    JS --> Config

    AuthJS -->|fetch con cookie HttpOnly| AuthAPI
    CommonJS -->|GET /api/me| SessionAPI
    MapJS -->|GET routes/levels| CatalogAPI
    GameJS -->|GET exercises| ExerciseAPI
    GameJS -->|POST complete| ProgressAPI
    ShopJS -->|GET/POST outfits| OutfitAPI
    ProfileJS -->|PATCH profile| AuthAPI

    AuthAPI --> SessionAPI
    ProgressAPI --> ExerciseAPI
    ProgressAPI --> CatalogAPI

    AuthAPI --> DB
    CatalogAPI --> DB
    ExerciseAPI --> DB
    ProgressAPI --> DB
    OutfitAPI --> DB
    SessionAPI --> DB

    DB --> Users
    DB --> Sessions
    DB --> Routes
    DB --> Levels
    DB --> Exercises
    DB --> Outfits
    DB --> UserOutfits

    FinalJSON --> ImportScript
    ImportScript --> Routes
    ImportScript --> Levels
    ImportScript --> Exercises
```

### 3.2. Diagrama de componentes de juego y progreso

```mermaid
flowchart TB
    subgraph Client["Cliente / navegador"]
        LevelPage[Pantalla de ejercicios]
        Timer[Temporizador por dificultad]
        Randomizer[Aleatorizador de ejercicios/opciones]
        LocalValidation[Validacion inmediata frontend]
        Feedback[Popups correcto/incorrecto]
        RoutePopup[Popup cierre de ruta]
        FinalPopup[Popup final del juego]
    end

    subgraph API["API PHP"]
        GetExercises["GET /api/levels/{id}/exercises"]
        CompleteLevel["POST /api/levels/{id}/complete"]
        ValidateAnswers[validateLevelAnswers]
        CompleteService[completeLevel]
        XpReward[getXpReward]
        Streak[calculateStreak]
    end

    subgraph Data["Base de datos"]
        Users[(users)]
        Levels[(levels)]
        Exercises[(exercises)]
    end

    LevelPage --> GetExercises
    GetExercises --> Exercises
    GetExercises --> LevelPage

    LevelPage --> Randomizer
    LevelPage --> Timer
    LevelPage --> LocalValidation
    LocalValidation --> Feedback

    Timer -->|tiempo agotado| Randomizer
    Timer -->|reinicia intento completo| LevelPage

    LocalValidation -->|5 correctas| CompleteLevel
    CompleteLevel --> ValidateAnswers
    ValidateAnswers --> Exercises
    CompleteLevel --> CompleteService
    CompleteService --> Levels
    CompleteService --> Users
    CompleteService --> XpReward
    CompleteService --> Streak

    CompleteService -->|nivel integrador| RoutePopup
    CompleteService -->|current_level_id = totalLevels + 1| FinalPopup
```

## 4. Base de datos

### 4.1. Diagrama ER

```mermaid
erDiagram
    USERS {
        int id PK
        string username UK
        string password_hash
        int current_level_id
        int streak
        int xp
        datetime last_completion_at
        int current_outfit_id FK
    }

    SESSIONS {
        int id PK
        int user_id FK
        string token_hash
        datetime created_at
        datetime expires_at
    }

    ROUTES {
        int id PK
        string name
        int order_index
        string background_image
    }

    LEVELS {
        int id PK
        int route_id FK
        int route_order
        string name
        string difficulty
        string content
    }

    EXERCISES {
        int id PK
        int level_id FK
        string type
        string prompt
        json content_data
        json answer_data
        int order_index
    }

    OUTFITS {
        int id PK
        string name
        string description
        string tagline
        int cost
        string image
    }

    USER_OUTFITS {
        int user_id PK,FK
        int outfit_id PK,FK
        datetime unlocked_at
    }

    USERS ||--o{ SESSIONS : has
    OUTFITS ||--o{ USERS : equipped_by
    USERS ||--o{ USER_OUTFITS : unlocks
    OUTFITS ||--o{ USER_OUTFITS : unlocked_as
    ROUTES ||--|{ LEVELS : contains_7
    LEVELS ||--|{ EXERCISES : contains_5
```

Nota para el ER:

- `users.current_level_id` no se dibuja como relacion FK estricta hacia `levels.id`, porque el valor `totalLevels + 1` representa juego completado y no existe como fila en `levels`.
- `users.current_outfit_id` si referencia a `outfits.id`.

### 4.2. Diagrama relacional

```mermaid
classDiagram
    direction LR

    class users {
        <<table>>
        id PK
        username UK
        password_hash
        current_level_id
        streak
        xp
        last_completion_at
        current_outfit_id FK
    }

    class sessions {
        <<table>>
        id PK
        user_id FK
        token_hash
        created_at
        expires_at
    }

    class routes {
        <<table>>
        id PK
        name
        order_index
        background_image
    }

    class levels {
        <<table>>
        id PK
        route_id FK
        route_order
        name
        difficulty
        content
    }

    class exercises {
        <<table>>
        id PK
        level_id FK
        type
        prompt
        content_data
        answer_data
        order_index
    }

    class outfits {
        <<table>>
        id PK
        name
        description
        tagline
        cost
        image
    }

    class user_outfits {
        <<table>>
        user_id PK,FK
        outfit_id PK,FK
        unlocked_at
    }

    users "1" <-- "0..*" sessions : user_id
    outfits "1" <-- "0..*" users : current_outfit_id
    users "1" <-- "0..*" user_outfits : user_id
    outfits "1" <-- "0..*" user_outfits : outfit_id
    routes "1" <-- "7" levels : route_id
    levels "1" <-- "5" exercises : level_id
```

Restricciones relacionales recomendadas:

```sql
users.username UNIQUE
users.current_level_id CHECK (current_level_id >= 1)
users.streak CHECK (streak >= 0)
users.xp CHECK (xp >= 0)
routes.order_index UNIQUE
levels.route_id REFERENCES routes(id)
levels UNIQUE(route_id, route_order)
levels CHECK(route_order BETWEEN 1 AND 7)
levels CHECK(difficulty IN ('easy', 'medium', 'hard', 'integrative'))
exercises.level_id REFERENCES levels(id)
exercises UNIQUE(level_id, order_index)
exercises CHECK(order_index BETWEEN 1 AND 5)
outfits.cost CHECK(cost >= 0)
users.current_outfit_id REFERENCES outfits(id)
sessions.user_id REFERENCES users(id)
user_outfits PRIMARY KEY(user_id, outfit_id)
user_outfits.user_id REFERENCES users(id)
user_outfits.outfit_id REFERENCES outfits(id)
```

Nota:

- El limite superior de `users.current_level_id` debe validarse en backend contra `totalLevels + 1`, porque depende del catalogo importado.
- Si la base de datos permite `CHECK` con subconsultas o triggers, se puede reforzar ahi; para mantenerlo simple, basta con validarlo en PHP.
