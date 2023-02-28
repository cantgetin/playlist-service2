# Тестовое задание для GoCloudCamp

## Часть 1. Разработка основного модуля работы с плейлистом

- Для разработки решения выбрал TypeScript.
- Описал интерфейс IPlaylist для взаимодействия с плейлистом.
- Написал класс Playlist реализующий интерфейс IPlaylist.
- Для реализации описал интерфейсы ISong для трека и ISongNode для ноды двусвязного списка.
### В реализованном классе есть следующие свойства:
1. **head**: ISongNode - начало двусвязного списка
2. **tail**: ISongNode - конец двусвязного списка
3. **currentSong**: ISongNode - нода двусвязного списка, содержащая текущий трек
4. **currentSongStartTime**: Date - дата старта текущего трека
5. **playTimer**: NodeJS.Timer - таймер, который отвечает за проигрывание текущего трека.
6. **remainingTime**: number - оставшееся время проигрывания (в секундах), убавляемое таймером.

- В head и tail складываю первую и последнюю ноды списка, для удобного добавления трека и навигации по списку.
- В currentSong складываю ноду списка, содержащую текущий трек.
- Для отсчета времени и не блокирующего доступа использованы setInterval и clearInterval.

### Изначально написанный модуль плейлиста в отрыве от сервиса находится в папке **playlist-module**, там написаны несколько скриптов для теста работоспособности и скрипт с CLI для комманд.

## Часть 2. Построение API для музыкального плейлиста

- Для разработки сервиса выбрал TypeScript и фреймворк NestJS.
- В качестве протокола взаимодействия используется gRPC.
- Для хранения данных и работы с данными используется sqlite3 и Sequelize. 
- Для генерации TypeScript интерфейсов из proto файла используется библиотека ts-proto-gen.
- Для валидации gRPC запросов используется библиотека Joi.
- Написан Dockerfile для создания image и контейнеризации приложения.
- Описаны кастомные ошибки для плейлиста, например SongNotFoundException.
- Для логирования запросов к сервису реализован LoggingInterceptor.
- Для фильтрации ошибок реализован ExceptionFilter.

### Микросервис содержит несколько модулей

#### Модуль Playlist
1. playlist.controller.ts - контроллер, который принимает gRPC запросы, обращается к сервису, отдает ответ.
2. playlist.interface.ts - интерфейс для сервиса, описывающий необходимые для реализации методы - play, pause, next, prev, addSong, addSongs, getSongById, getAllSongs, updateSong, deleteSong, clear.
3. playlist.service.errors.ts - кастомные ошибки для сервиса playlist
4. playlist.service.ts - сервис, реализующий интерфейс и содержащий в себе логику по работе с плейлистом, логику сохранения и загрузки данных.
5. song.interface.ts - интерфейс для трека
6. songNode.interface.ts - интерфейс для ноды двусвязного списка
7. validation.pipe.ts - класс содержащий логику валидации данных.
8. validation.schemas-ts - схемы валидации данных поступающих в контроллер.
#### Модуль Database
1. database.models.ts - Модели данных для ORM Sequelize: Song, PlaylistPropsKeyValue
2. database.providers.ts - Провайдер настроенного экземпляра Sequelize для работы с ним
#### Модуль Repository
1. repository.interface.ts - интерфейс для сервиса Repository описывающий нобходимые методы по работе с данными.
2. repository.providers.ts - Провайдер сущностей Sequelize для сервиса
3. repository.service.ts - сервис, реализующий необходимые методы по работе с данными.

Также есть папки interfaces и utils, в interfaces хранится генерируемый интерфейс proto файла, а в utils содержатся LoggingInterceptor и ExceptionFilter.   

### При ошибках сервис возвращает значимые статус коды gRPC, например:
1) FAILED_PRECONDITION - При запуске Play, когда в плейлисте нету треков, При попытке удаления трека который играет в данный момент
2) NOT_FOUND - При удалении/модификации трека, если он не найден
3) INVALID_ARGUMENT - При ошибке валидации запроса
4) CANCELLED - При любой другой внутренней ошибке

При успешном выполнении запроса возвращается объект вида {status: "OK"}.

## Структура репозитория
- /client - клиентская библиотека, пример использования и взаимодействия с сервисом в формате CLI.
- /playlist-module - Изначально написанный голый модуль для работы с плейлистом, тесты его функционала.
- /playlist-service-nest - Сервис для работы с плейлистом.

## Запуск
### Запуск сервиса
```
cd playlist-service-nest
npm install
npm run start:dev
```
Запускается на порту 0.0.0.0:50051
### Запуск сервиса в Docker
Вместо 3005 можно указать любой другой порт localhost на который будет осуществляться прокид.
```
cd playlist-service-nest
docker build -t playlist-svc .
docker run -dp 3005:50051 playlist-svc   
```
Для общения с сервисом можно использовать Postman, импортировав в него proto файл, или же запустить **example_cli** из папки **client**, указав url сервиса. Мне было удобнее все делать через Postman.

### Запуск клиента с CLI
```
cd client
npm install
npm run start
```
### Запуск CLI playlist-module
```
cd playlist-module
npm install
npm run start
```


