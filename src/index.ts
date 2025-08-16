import './scss/styles.scss';

import { CatalogAPI } from './components/AppApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppState, CardItem, CatalogChangeEvent } from './components/AppData';
import { Page } from './components/Page';
import { Card, IProduct } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/base/Modal';
import { Basket, IBasketView } from './components/Basket';
import { CardUpdate, IOrderForm } from './types';
import { Order } from './components/Order';
import { Success } from './components/Success';
import { identity } from 'lodash';

const events = new EventEmitter();
const api = new CatalogAPI(CDN_URL, API_URL);

//мониторинг всех событий, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

//Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

//Модель данных приложения
const appData = new AppState({}, events);

//Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

//Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Order(cloneTemplate(contactsTemplate),events);

//Бизнес логика
//Обработка событий

//Получаем товары с сервера
api.getProductList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});

//Изменение элементов каталога
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card<IProduct>(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			category: item.category,
			price: item.price,
		});
	});
	page.counter = appData.getBasketCount();
});

//Открыть карточку товара
events.on('card:select', (item: CardItem) => {
	appData.setPreview(item);
});

//Открыть превью товара
events.on('preview:changed', (item: CardItem) => {
	const showItem = (item: CardItem) => {
		const card = new Card<IProduct>(cloneTemplate(cardPreviewTemplate), {
			onClick: () => {
				appData.addItemToBasket(item.id);
				events.emit('basket:updated');
			},
		});
		modal.render({
			content: card.render({
				title: item.title,
				image: item.image,
				description: item.description,
				category: item.category,
				price: item.price,
			}),
		});
	};
	if (item) {
		api
			.getProductItem(item.id)
			.then((result) => {
				showItem(result);
			})
			.catch((err) => {
				console.error(err);
			});
	} else {
		modal.close();
	}
});

//Добавление товара в корзину
events.on('basket:updated', () => {
	page.counter = appData.getBasketCount();
	page.render(page);
	modal.close();
});

//Удаление товара из корзины
events.on('basket:delete', () => {
	const itemsInBasket = appData.getBasketItems();
	const itemElements = itemsInBasket.map((item) => {
		const card = new Card<CardUpdate>(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				appData.removeItemFromBasket(item.id);
				events.emit('basket:delete');
			},
		});
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	basket.items = itemElements;
	basket.total = appData.getTotal();
	basket.selected = appData.order.items;

	page.counter = appData.getBasketCount();
	page.render(page);

	modal.render({
		content: basket.render(),
	});
});

//Открыть корзину
events.on('basket:open', () => {
	const itemsInBasket = appData.getBasketItems();
	const itemElements = itemsInBasket.map((item) => {
		const card = new Card<CardUpdate>(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				appData.removeItemFromBasket(item.id);
				events.emit('basket:delete');
				basket.total = appData.getTotal();
				basket.selected = appData.order.items;
			},
		});
		return card.render({
			title: item.title,
			price: item.price,
		});
	});

	basket.items = itemElements;
	basket.selected = appData.order.items;
	basket.total = appData.getTotal();

	modal.render({
		content: basket.render(),
	});
});


//Открыть форму заказа
events.on('order:open', () => {
	appData.formErrors = {};
	modal.render({
		content: order.render({
			email: '',
			phone: '',
			address: '',
			errors: '',
			valid: false
		}),
	});
});

events.on('order:ready', () => {
    appData.formErrors = {};
  // Обновляем состояние формы
  order.errors = '';
  order.valid = true;
    modal.render({
        content: contacts.render(contacts),
    });
});


// Обработчик изменения ошибок формы
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone, address } = errors;
	order.valid = !email && !phone && !address;
	order.errors = Object.values({ email, phone, address })
		.filter((i) => !!i)
		.join(';');
});

//Изменилось одно из полей
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Обработка изменения полей формы

//Отправлена форма заказа
events.on('order:submit', () => {
	api.orderProducts(appData.order)
		.then((result) => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					appData.clearBasket();
					events.emit('');
				},
			});
			modal.render({
				content: success.render({}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});
