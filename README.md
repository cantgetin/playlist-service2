# Тестовое задание для GoCloudCamp
🟢 UPD сервиса:
- Написал docker-compose (сервис, база, админер)
- Починил валидацию запросов
- Postgres вместо SQLite
- Вынес конфигурацию сервиса в .env файл
- Добавил метод Status

## Часть 1. Разработка основного модуля работы с плейлистом

- Для разработки решения выбрал TypeScript.
- Описал интерфейс IPlaylist для взаимодействия с плейлистом.
- Написал класс Playlist реализующий интерфейс IPlaylist.
- Для реализации описал интерфейсы ISong для трека и ISongNode для ноды двусвязного списка.

### В реализованном классе есть следующие свойства:
1. **head**: ISongNode - начало двусвязного списка.
2. **tail**: ISongNode - конец двусвязного списка.
3. **currentSong**: ISongNode - нода двусвязного списка, содержащая текущий трек.
4. **currentSongStartTime**: Date - время старта текущего трека.
5. **playTimer**: NodeJS.Timer - таймер, который отвечает за проигрывание текущего трека.
6. **remainingTime**: number - оставшееся время проигрывания (в секундах), убавляемое таймером.

- В head и tail складываю первую и последнюю ноды списка, для удобного добавления трека и навигации по списку.
- В currentSong складываю ноду списка, содержащую текущий трек.
- Для отсчета времени и не блокирующего доступа использовую setInterval и clearInterval.

Изначально написанный модуль плейлиста в отрыве от сервиса находится в папке **playlist-module**, внутри есть несколько скриптов для теста работоспособности и скрипт с CLI.

## Часть 2. Построение API для музыкального плейлиста

- Для разработки сервиса выбрал TypeScript и фреймворк NestJS.
- В качестве протокола взаимодействия использовал gRPC.
- Для хранения данных и работы с данными использовал Postgres и Sequelize. 
- Для генерации TypeScript интерфейсов из proto файла использовал библиотеку ts-proto-gen.
- Для валидации gRPC запросов использовал библиотеку Joi.
- Описал кастомные ошибки для плейлиста, например SongNotFoundException.
- Для логирования запросов к сервису реализовал LoggingInterceptor.
- Для фильтрации ошибок реализовал ExceptionFilter.
- Написал Dockerfile для создания image и контейнеризации сервиса.

### Сервис содержит несколько модулей

#### Модуль Playlist
1. playlist.controller.ts - контроллер, который принимает gRPC запросы, обращается к сервису, отдает ответ.
2. playlist.interface.ts - интерфейс для сервиса, описывающий необходимые для реализации методы - play, pause, next, prev, addSong, addSongs, GetSong, getAllSongs, updateSong, deleteSong, clear, status.
3. playlist.service.errors.ts - кастомные ошибки для сервиса playlist.
4. playlist.service.ts - сервис, реализующий интерфейс и содержащий в себе логику по работе с плейлистом, логику сохранения и загрузки данных.
5. song.interface.ts - интерфейс для трека.
6. songNode.interface.ts - интерфейс для ноды двусвязного списка.
7. validation.pipe.ts - класс содержащий логику валидации данных.
8. validation.schemas-ts - схемы валидации данных поступающих в контроллер.
#### Модуль Database
1. database.models.ts - Модели данных для ORM Sequelize: Song, PlaylistPropsKeyValue.
2. database.providers.ts - Провайдер настроенного экземпляра Sequelize для работы с ним.
#### Модуль Repository
1. repository.interface.ts - интерфейс для сервиса Repository описывающий нобходимые методы по работе с данными.
2. repository.providers.ts - Провайдер сущностей Sequelize для сервиса.
3. repository.service.ts - сервис, реализующий необходимые методы по работе с данными.

Также есть папки interfaces и utils, в interfaces хранится генерируемый интерфейс proto файла, а в utils содержатся LoggingInterceptor и ExceptionFilter.   

### Хранение данных
Для хранение данных используется Postgres.\
Когда обновляется данные сервиса он обращается к репозиторию, который обновляет данные в базе. При перезапуске сервис обращается к репозиторию, чтобы восстановить данные.\
Данные хранятся в двух таблицах: Songs и PlaylistPropKeyValue.
В Songs хранятся непосредственно треки, а в PlaylistPropKeyValue хранятся пары ключ-значение для некоторых свойств плейлиста, таких как: remainingTime, currentSongId, isPlaying.

### Методы
* Play - начать воспроизведение плейлиста.
* Pause - остановить воспроизведение.
* Next - переключить на следующий трек и начинает его воспроизведение.
* Prev - переключить на предыдущий трек и начинает его воспроизведение.
* AddSong - добавить трек в плейлист.
* AddSongs - добавить массив треков в плейлист.
* GetSong - получить трек с указанным ID.
* GetAllSongs - получить все треки.
* UpdateSong - обновить информацию о треке (title, duration) с указанным ID.
* DeleteSong - удалить трек с указанным ID из плейлиста.
* Clear - очистить плейлист (удалить все треки).
* Status - получить статус плейлиста.

При успешном выполнении GetSong возвращаются структура SongResponse { int32 id = 1; string title = 2; int32 duration = 3; }\
При успешном выполнении GetAllSongs возвращается структура SongsResponse { repeated SongResponse songs = 1; }\
При успешном выполнении Status возвращается структура StatusResponse { SongResponse currentSong = 1; bool isPlaying = 2; int32 remainingTime = 3;}\
При успешном выполнении операций возвращается структура PlaylistResponse { string status = 1; } со значеникм "OK"

#### При ошибках сервис возвращает значимые статус коды gRPC, например:
1) FAILED_PRECONDITION - При запуске Play, когда в плейлисте нету треков, При попытке удаления трека который играет в данный момент.
2) NOT_FOUND - При удалении/модификации трека, если он не найден.
3) INVALID_ARGUMENT - При ошибке валидации запроса.
4) CANCELLED - При любой другой внутренней ошибке.

## Структура репозитория
- client - клиентская библиотека, пример использования и взаимодействия с сервисом в формате CLI.
- playlist-module - Изначально написанный голый модуль для работы с плейлистом, тесты его функционала и скрипт с CLI.
- playlist-service-nest - Сервис для работы с плейлистом.

## Запуск сервиса в Docker с docker-compose
Перед запуском установите параметры конфигурации в .env файл в корне папки playlist-service-nest.\
Например:
```dotenv
GRPC_HOST=0.0.0.0
GRPC_PORT=50051

DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=playlist
```
### Затем
```
cd playlist-service-nest
npm install
npm run build
npm run dockerCompose
```
Прокидывается на 0.0.0.0:50051 локально.\
Для общения с сервисом можно использовать Postman, импортировав в него .proto файл и указав url сервиса, или же запустить **клиент с CLI** из папки **client**, тоже указав url сервиса.\
Для запуска вне Docker нужно будет указать host, port, username, password, database для локальной Postgres в .env.

### Запуск клиента с CLI
```
cd client
npm install
npm run start
```
### Запуск playlist-module CLI 
Изначально написанный модуль плейлиста (Часть 1).
```
cd playlist-module
npm install
npm run start
```



