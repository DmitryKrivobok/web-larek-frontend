# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/style.scss— корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build

```
## Данные и типы данных используемые в приожении

Продукт
```
export interface IProduct {
    id: string;
    title: string;
    description: string | string[];
    image: string;
    category: string;
    price: number|null;
}
```
Форма заказа
```
export interface IOrderForm {
    email: string;
    phone: string;
    address: string;
    payment: string;
}
```
Интерфейс состояния формы
```
interface IFormState {
    valid: boolean;
    errors: string;
}
```
Состояние приложения
```
export interface IAppState {
    catalog: IProduct[];
    basket: string[];
    preview: string | null;
    order: IOrder | null;
    loading: boolean;
}
```
Расширение формы заказа полем Items[]
```
export interface IOrder extends IOrderForm {
    items: string[]
}
```
Карточка товара с ограниченными полями
```
export type CardUpdate = Pick<IProduct, 'title' | 'price'>;
```
Форма для модалки с адресом и спсобом оплаты
```
export type PaymentModal = Pick<IOrderForm, 'address' | 'payment'>;
```
Форма для модалки с контактами
```

export type ContactsModal = Pick<IOrderForm, 'phone' | 'email'>;
```
Хранение ошибок формы заказа
```
export type FormErrors = Partial<Record<keyof IOrder, string>>;
```
Результат операции с заказом
```
export interface IOrderResult {
    id: string;
}
```
Контент модального окна
```
interface IModalData {
    content: HTMLElement;
}
```
Тип обьекта произощедшего события
```
export type EventData = {
    event: Event,
    element?: PartialElement,
    block?: PartialElement
}
```
Функция-обработчик события
```
export type EventHandler = (args: EventData) => void;
```
Обьединеие HTML елемента и обьекта с частью свойств
```
export type PartialElement = HTMLElement | Partial<any, any, any, any>;
```
Интерфейс методов для Api каталога и заказа
```
export interface IAppAPI {
    getProductList: () => Promise<CardItem[]>;
    getProductItem: (id: string) => Promise<CardItem>;
    getProductUpdate: (id: string) => Promise<CardUpdate>
    orderProducts: (order: IOrder) => Promise<IOrderResult>;
}
```
Интерфейс изменения каталога
```
export type CatalogChangeEvent = {
    catalog: CardItem[]
};
```
Интерфейс отображения корзины товаров
```
interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: string[];
}
```
Интерфейс обьекта с обработчиком события на карточке
```
export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}
```
Интерфейс состояния страницы
```
interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}
```
Интерфейс состояния успеха
```

interface ISuccess {
    total: number;
}
```
Интерфейс объекта с обработчиком события успеха
```
interface ISuccessActions {
    onClick: () => void;
}
```
## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- слой представления, отвечает за отображение данных на странице,
- слой данных, отвечает за храгнение и изменение данных,
- презентер, отвечает за связь представления и данных.

Сам презентер не вынесен в отдельный класс и реализован прямо в файле `src/index.ts`. 

### Базовый код

####  Класс Api

Содержит в себе базовую логику отправки запросов. В консруктор передается базовый адрес сервера и опциональный обьект с заголовками запросов.
Методы:
- 'get' - выполняет GET запрос на переданный эндпоинт и возвращает промис с обьектом, которым отетил сервер
- 'post' - принимает обьект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на эндпоинт, переданный как параметр при вызове метода. по умолчанию выполняется 'POST' запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter

Бокер событий позволяющий отправлять и подписываться на события, происходящие в системе. Класс испрльзуется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом прописаны в интерфейсе 'IEvents':
- 'on' - установка обработчика на событие
- 'emit' - инициализация события с данными
- 'trigger' - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие.

### Слой данных

#### Класс AppState

Класс представляет собой модель состояния приложения, предназначенную для управления данными, связанными с каталогом товаров, корзиной, заказом и формами.
Также он использует события для оповещения других частей системы об изменениях состояния.

Cвойства класса:
- basket: массив товаров в корзине
- catalog: массив товаров
- loading: указывает на состояние загрузки данных.
- order: объект IOrder — содержит информацию о текущем заказе (email, телефон, адрес, список товаров и способ оплаты)
- preview: строка или null — идентификатор товара для предварительного просмотра
- formErrors: объект ошибок формы (FormErrors) — хранит ошибки валидации формы заказа.

Методы класса:
- setCatalog(items: CardItem[]) - обновляет каталог товаров, создавая новые экземпляры CardItem из переданных данных

- setPreview(item: CardItem) - устанавливает текущий товар для предварительного просмотра по его id

- getBasketCount() - возвращает количество товаров в заказе

- validateOrder() - проверяет обязательные поля заказа

- validateContacts(): boolean - валидируют поля почты и телефона

- setOrderField(field: keyof IOrderForm, value: string) - обновление конкретного поля формы и последующей проверки валидности всей формы

- toggleOrderedItem(id: string, isIncluded: boolean) - обавляет или удаляет товар из заказа по его id

- removeItemFromBasket(id: string) - удаляет товар из заказа по его id

- clearBasket() - очищает список товаров в корзине

- getTotal() - считает сумму товаров в корзине

- getBasketItems(): CardItem[] - получает элемент корзины 

- isInBasket(id: string): boolean - находится ли элемент в корзине

#### Класс CardItem

Класс представляет собой модель карточки товара, хранящий в себе свойства для ее создания и метод 
'emitChanges'.

Свойства:
- id: string; — идентификатор товара
- title: string; — название товара
- description?: string | string[]; — описание товара
- image: string; — ссылка на изображение товара
- category: string; — категория товара
- price: number | null; — цена товара
- events: Ievents - экземпляр класса 'EventEmitter' для инициации событий при изменении данных

Методы:
- emitChanges: () => void; — cсообщает об изменениях в объекте.

#### Класс CatalogApi

Класс обеспечивает доступ к данным о товарах и заказу через API-запросы к серверу, расширяет базовый класс Api, что позволяет использовать общие методы для HTTP-запросов.

Методы:

- getProductItem(id: string): Promise<CardItem> - получает данные о товаре по id

- getProductUpdate(id: string): Promise<CardUpdate> - получает обновленные данные о товаре по id

- getProductList(): Promise<CardItem[]> - получает список товаров

- orderProducts(order: IOrder): Promise<IOrderResult> - отправляет заказ на сервер, возвращает результат заказа

### Слой представления
 
#### Класс Modal

Класс представляет собой компонент модального окна, который управляет его отображением, содержимым и событиями открытия/закрытия. Так же генерирует события при открытии/закрытии

Методы:
- set content(value: HTMLElement)- устанавливает содержимое модального окна, заменяя текущие дочерние элементы

- open()- добавляет класс modal_active, чтобы показать окно

- close()- удаляет класс modal_active, чтобы скрыть окно

- render(data: IModalData): HTMLElement - вызывает базовый метод render, открывает окно, возвращает DOM-элемент контейнера

#### Класс Basket

Класс  представляет собой компонент корзины покупок в пользовательском интерфейсе. Он управляет отображением списка товаров, общей ценой и состоянием кнопки оформления заказа.

Свойства:
- items: HTMLElement[] — список элементов товаров, отображаемых в корзине

- selected: string[] — массив id выбранных товаров, влияет на состояние кнопки _button, делая её активной или неактивной

- total: number — общая сумма стоимости товаров

Методы:

- set items(items: HTMLElement[])- обновляет список товаров в корзине

- set selected(items: string[])- включает или отключает кнопку оформления заказа в зависимости от наличия выбранных товаров

- set total(total: number)- обновляет отображение общей стоимости

#### Класс Card

Класс представляет собой компонент карточки товара в пользовательском интерфейсе.
Инициализирует элементы DOM, такие как заголовок, изображение, описание, категория и цена. Обрабатывает событие клика.

Свойства:
- id — идентификатор товара
- title — название товара
- image — URL изображения
- category — категория товара
- price — цена
- description — описание 

Методы:

- set id(value: string)- сеттер id

- get id(): string - геттер id

- set title(value: string) - сеттер названия продукта

- get title(): string - геттер названия продукта

- set image(value: string) - сеттер изображения

- set category(value: string) - сеттер категории

- set price(value: number) - сеттер цены

- set description(value: string | string[]) - сеттер описания

#### Класс Page

Класс  представляет собой компонент страницы в пользовательском интерфейсе. Он управляет отображением счетчика, каталога товаров, состоянием блокировки страницы и обработкой событий.

Свойства:
- counter: number - отображение количества товаров в корзине

- catalog: HTMLElement[] - отображение каталога товаров

- locked: boolean- блокировка/разблокировка взаимодействия с страницей при загрузке

Методы: 

- set counter(value: number)

- set catalog(items: HTMLElement[]) 

- set locked(value: boolean) 
 
 Выполняют аналогичные свойствам действия.

 #### Класс Order

 Класс представляет собой компонент формы заказа, который управляет вводом данных и состоянием элементов формы.

 Методы:

- set phone(value: string) - сеттер номера телефона

- set email(value: string) - сеттер электронной почты

- set address(value: string) - сеттер адреса

- set togglePayment(value: boolean) - выбор формы оплаты

#### Класс Form 

Класс управляет формой в пользовательском интерфейсе. Он обеспечивает обработку пользовательского ввода, валидацию, отображение ошибок и отправку данных.

Свойства: 

- _submit: HTMLButtonElement - ссылка на кнопку отправки формы

- _errors: HTMLElement - элемент для отображения сообщений об ошибках

- container: HTMLFormElement - элемент формы

- events: Ievents - экземпляр класса 'EventEmitter' для инициации событий при изменении данных

Методы

- onInputChange(field: keyof T, value: string) - вызывается при вводе в поле ввода и эмитирует событие вида ${container.name}.${field}:change с данными о поле и значении.

- set valid(value: boolean) - включает или отключает кнопку отправки формы

- set errors(value: string) -  отображает сообщение об ошибке

- render(state: Partial<T> & IFormState): HTMLElement - обновляет состояние формы на основе переданных данных

#### Класс Success
 
Класс отображает состояние успеха (успешное офрмление заказа) в пользовательском интерфейсе. В контейнере находится элемент закрытия и на него вещается обработчик по клику.

Свойство:
- total: number - показывает итоговую сумму заказа

Конструктор:

- container: HTMLElement — DOM-элемент, в который будет вставляться компонент

- actions: ISuccessActions — объект с обработчиками событий

#### Класс Component 

 Базовый (абстрактный) класс для создания UI-компонентов в вашем приложении. Предназначен для общего управления DOM-элементами и предоставляет набор методов, которые могут использоваться в дочерних классах для реализации конкретных компонентов.

 Методы:

- toggleClass(element: HTMLElement, className: string, force?: boolean) - переключить класс
    
- setText(element: HTMLElement, value: unknown) - установить текстовое содержимое

    
- setDisabled(element: HTMLElement, state: boolean) - сменить статус блокировки

- setHidden(element: HTMLElement) - скрыть элемент

- setVisible(element: HTMLElement) - показать элемент

- setImage(element: HTMLImageElement, src: string, alt?: string) - установить изображение с алтернативным текстом

#### Класс Partial

Универсальный базовый компонент для работы с DOM-элементами в вашем приложении. Он предназначен для создания, управления и взаимодействия с HTML-элементами, а также для организации событийной модели внутри компонента.

Основные назначения и функции:

- Обертка над DOM-элементом

Хранит ссылку на корневой элемент (node) и управляет им.
Обеспечивает удобные методы для поиска вложенных элементов (element, select, ensure).

- Работа с классами и содержимым

Методы для добавления, удаления, переключения классов (addClass, removeClass, toggleClass).
Методы для установки текста (text) и ссылок (link).
Методы для очистки содержимого (clear) и добавления новых элементов (append).

- Работа с событиями

Связывает события DOM с внутренней системой событий (bindEvent, trigger, on).
Использует внутренний EventEmitter для обработки событий внутри компонента.

- Создание и монтирование компонентов

Статические методы factory, clone, mount позволяют создавать экземпляры компонента из DOM или шаблонов.

- Работа с элементами внутри компонента

Методы element, select позволяют находить или создавать вложенные компоненты или элементы по селектору.
Хранит найденные элементы в объекте elements.
       

    





