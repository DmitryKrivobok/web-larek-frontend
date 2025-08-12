import { IProduct } from './Card';
import { IOrder } from '../types';
import { IAppState } from '../types';
import { Model } from './base/Model';
import { FormErrors } from '../types';
import _ from 'lodash';
import { IEvents } from './base/events';

export class CardItem extends Model<IProduct> {
	id: string;
	title: string;
	description?: string | string[];
	image: string;
	category: string;
	price: number | null;
	events: IEvents; 
    emitChanges: () => void;
}

export class AppState extends Model<IAppState> {
	basket: string[];
	catalog: CardItem[];
	loading: boolean;
	order: IOrder = {
		email: '',
		phone: '',
		address: '',
		items: [],
		payment: '',
	};
	preview: string | null;
	formErrors: FormErrors = {};

	setCatalog(items: CardItem[]) {
		this.catalog = items.map((item) => new CardItem(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setPreview(item: CardItem) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	getBasketCount(): number {
		return this.order.items.length;
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		if (!this.order.address) {
			errors.phone = 'Необходимо указать адрес';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	toggleOrderedItem(id: string, isIncluded: boolean) {
		if (isIncluded) {
			this.order.items = _.uniq([...this.order.items, id]);
		} else {
			this.order.items = _.without(this.order.items, id);
		}
	}

	removeItemFromBasket(id: string) {
		this.toggleOrderedItem(id, false);
	}

    clearBasket() {
        this.order.items = [];
    }
}
